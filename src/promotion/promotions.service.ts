import { IShoppingCartItem } from "../shopping_cart/shopping_cart.js";
import { IPromotionFunction, PromotionTypeEnum } from "./promotion.model.js";
import { PromotionRepository } from "./promotion.repository.js";

export class PromotionService {
  constructor(private readonly promotionRepository: PromotionRepository) {}

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

    this.allPromotions!.forEach((promotion) => {
      items.forEach((item) => {
        const { didApply } = promotion.apply(item);
        if (didApply) {
          appliedPromotions++;
          totalPrice += item.promotionPrice!;

          if (promotion.description) {
            appliedPromotionDescriptions.push(promotion.description);
          }
        } else {
          totalPrice += item.price * item.quantity;
        }
      });
    });

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
        const parametrizedFunction = this._promotionFunctionPerType[
          promotion.type
        ].create(
          promotion.sku,
          promotion.targetQuantity,
          promotion.forThePriceOf
        );
        this.allPromotions!.push({
          apply: parametrizedFunction,
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
      create(...args) {
        return (item: IShoppingCartItem) => {
          return { didApply: false };
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
