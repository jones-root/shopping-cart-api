import { IShoppingCartItem } from "../shopping_cart/shopping_cart.js";
import { ShoppingCartRepository } from "../shopping_cart/shopping_cart.repository.js";
import { IPromotionFunction, PromotionTypeEnum } from "./promotion.model.js";
import { PromotionRepository } from "./promotion.repository.js";

export class PromotionService {
  constructor(
    private readonly promotionRepository: PromotionRepository,
    private readonly shoppingCartRepository: ShoppingCartRepository
  ) {}

  allPromotions:
    | {
        apply: ReturnType<IPromotionFunction["create"]>;
        description?: string;
      }[]
    | null = null;

  async interpret(items: IShoppingCartItem[]) {
    await this._ensurePromotionsAreBuilt();

    let totalPrice = 0;
    let appliedPromotions = 0;
    const resultingCart = items; // Might have new free items due to a promotion

    const appliedPromotionDescriptions: string[] = [];

    const itemsToSync: string[] = [];

    this.allPromotions!.forEach((promotion) => {
      items.forEach((item) => {
        const { didApply, needsSync } = promotion.apply(item, resultingCart);
        if (didApply) {
          appliedPromotions++;
          totalPrice += item.promotionPrice!;

          if (promotion.description) {
            appliedPromotionDescriptions.push(promotion.description);
          }
        } else {
          totalPrice += item.price * item.quantity;
        }

        if (needsSync) {
          itemsToSync.push(...needsSync);
        }
      });
    });

    if (itemsToSync.length) {
      const databaseItems = await this.shoppingCartRepository.findItemsBySkus(
        itemsToSync
      );
      databaseItems.forEach((databaseItem) => {
        const cartItem = resultingCart.find(
          (item) => item.sku === databaseItem.sku
        )!;
        Object.assign(cartItem, {
          ...databaseItem,
          totalPrice: cartItem.quantity * databaseItem.price,
        });
      });
    }

    return {
      totalPrice,
      appliedPromotions,
      appliedPromotionDescriptions,
      resultingCart,
    };
  }

  private async _ensurePromotionsAreBuilt() {
    if (!this.allPromotions) {
      this.allPromotions = [];

      const promotions = await this.promotionRepository.findAll();
      promotions.forEach((promotion) => {
        const baseFunction = this._promotionFunctionPerType[promotion.type];
        let parametrizedFunction: ReturnType<IPromotionFunction["create"]>;

        switch (promotion.type) {
          case PromotionTypeEnum.BUY_X_FOR_Y: {
            parametrizedFunction = baseFunction.create(
              promotion.sku,
              promotion.targetQuantity,
              promotion.forThePriceOf
            );
            break;
          }
          case PromotionTypeEnum.EACH_SALE_OF_X_COMES_WITH_AN_Y: {
            parametrizedFunction = baseFunction.create(
              promotion.sku,
              promotion.freeSku
            );
            break;
          }
          default:
            throw new Error(
              `'default' case not implemented for '_ensurePromotionsAreBuilt'`
            );
        }
        this.allPromotions!.push({
          apply: parametrizedFunction!,
          description: promotion.description,
        });
      });
    }
  }

  private _promotionFunctionPerType: Record<
    PromotionTypeEnum,
    IPromotionFunction
  > = {
    [PromotionTypeEnum.BUY_X_FOR_Y]: {
      create(sku: string, targetQuantity: number, forThePriceOf: number) {
        return (item: IShoppingCartItem) => {
          const isEligible =
            item.sku === sku && item.quantity >= targetQuantity;

          if (isEligible) {
            const multiple = Math.floor(item.quantity / targetQuantity);
            const rest = item.quantity % targetQuantity;
            item.promotionPrice ??= 0;
            item.promotionPrice +=
              item.price * forThePriceOf * multiple + item.price * rest;
          }

          return { didApply: isEligible };
        };
      },
    },
    [PromotionTypeEnum.EACH_SALE_OF_X_COMES_WITH_AN_Y]: {
      create(eachOfSku: string, freeSku: string) {
        return (
          item: IShoppingCartItem,
          resultingCart: IShoppingCartItem[]
        ) => {
          const isEligible = item.sku === eachOfSku;
          if (isEligible) {
            item.promotionPrice ??= 0;

            // The name and original price for this added cart item are fetched all at once at the end
            const partial: Partial<IShoppingCartItem> = {
              sku: freeSku,
              quantity: item.quantity,
              promotionPrice: 0,
            };
            resultingCart.push(<any>partial);
          }

          return { didApply: isEligible, needsSync: [freeSku] };
        };
      },
    },
    [PromotionTypeEnum.BUY_MORE_THAN_X_TO_GET_A_DISCOUNT_ON_ALL]: {
      create(...args) {
        return (item: IShoppingCartItem) => {
          return { didApply: false };
        };
      },
    },
  };
}
