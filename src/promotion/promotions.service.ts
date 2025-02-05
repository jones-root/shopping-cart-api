import { IShoppingCartItem } from "../shopping_cart/shopping_cart.js";
import { ShoppingCartRepository } from "../shopping_cart/shopping_cart.repository.js";
import {
  IPromotion,
  PromotionFunction,
  PromotionTypeEnum,
} from "./promotion.model.js";
import { PromotionRepository } from "./promotion.repository.js";

export class PromotionService {
  constructor(
    private readonly promotionRepository: PromotionRepository,
    private readonly shoppingCartRepository: ShoppingCartRepository
  ) {}

  async interpret(items: IShoppingCartItem[]) {
    let appliedPromotions = 0;
    const resultingCart = items; // Might have new free items due to a promotion
    const appliedPromotionDescriptions: string[] = [];

    const itemsToSync: string[] = [];

    const promotions = await this.promotionRepository.findAll();
    promotions.forEach((promotion) => {
      items.forEach((item) => {
        const { didApply, needsSync } = this._callPromotionFunction(
          item,
          resultingCart,
          promotion
        );
        if (didApply) {
          appliedPromotions++;

          if (promotion.description) {
            appliedPromotionDescriptions.push(promotion.description);
          }
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

    const totalPrice = resultingCart.reduce(
      (sum, { promotionPrice, totalPrice }) =>
        sum + (promotionPrice ?? totalPrice),
      0
    );

    return {
      totalPrice,
      appliedPromotions,
      appliedPromotionDescriptions,
      resultingCart,
    };
  }

  private _callPromotionFunction(
    item: IShoppingCartItem,
    resultingCart: IShoppingCartItem[],
    promotion: IPromotion
  ) {
    const applyPromotion = this._promotionFunctionPerType[promotion.type];

    switch (promotion.type) {
      case PromotionTypeEnum.BUY_X_FOR_Y: {
        return applyPromotion({
          item,
          resultingCart,
          sku: promotion.sku,
          targetQuantity: promotion.targetQuantity,
          forThePriceOf: promotion.forThePriceOf,
        });
      }
      case PromotionTypeEnum.EACH_SALE_OF_X_COMES_WITH_AN_Y: {
        return applyPromotion({
          item,
          resultingCart,
          sku: promotion.sku,
          freeSku: promotion.freeSku,
        });
      }
      case PromotionTypeEnum.BUY_X_OR_MORE_TO_GET_A_DISCOUNT_ON_ALL: {
        return applyPromotion({
          item,
          resultingCart,
          sku: promotion.sku,
          minQuantity: promotion.minQuantity,
          discount: promotion.discount,
        });
      }
      default:
        throw new Error(
          `'default' case not implemented for '_ensurePromotionsAreBuilt'`
        );
    }
  }

  private _promotionFunctionPerType: Record<
    PromotionTypeEnum,
    PromotionFunction
  > = {
    [PromotionTypeEnum.BUY_X_FOR_Y]: ({
      item,
      sku,
      targetQuantity,
      forThePriceOf,
    }) => {
      const isEligible = item.sku === sku && item.quantity >= targetQuantity!;

      if (isEligible) {
        const multiple = Math.floor(item.quantity / targetQuantity!);
        const rest = item.quantity % targetQuantity!;
        item.promotionPrice ??= 0;
        item.promotionPrice +=
          item.price * forThePriceOf! * multiple + item.price * rest;
      }

      return { didApply: isEligible };
    },
    [PromotionTypeEnum.EACH_SALE_OF_X_COMES_WITH_AN_Y]: ({
      item,
      resultingCart,
      sku,
      freeSku,
    }) => {
      const isEligible = item.sku === sku;
      let needsSync: string[] | undefined = undefined;
      if (isEligible) {
        const foundFreeItem = resultingCart.find(
          (cartItem) => cartItem.sku === freeSku
        );

        if (foundFreeItem) {
          if (item.quantity >= foundFreeItem.quantity) {
            foundFreeItem.quantity = item.quantity;
            foundFreeItem.totalPrice =
              foundFreeItem.quantity * foundFreeItem.price;
            foundFreeItem.promotionPrice = 0;
          } else {
            const quantityToPay = foundFreeItem.quantity - item.quantity;
            foundFreeItem.totalPrice =
              foundFreeItem.quantity * foundFreeItem.price;
            foundFreeItem.promotionPrice = quantityToPay * foundFreeItem.price;
          }
        } else {
          needsSync = [freeSku!];
          // The name and original price for this added cart item are fetched all at once at the end
          const partial: Partial<IShoppingCartItem> = {
            sku: freeSku,
            quantity: item.quantity,
            promotionPrice: 0,
          };
          resultingCart.push(<any>partial);
        }
      }

      return {
        didApply: isEligible,
        needsSync,
      };
    },
    [PromotionTypeEnum.BUY_X_OR_MORE_TO_GET_A_DISCOUNT_ON_ALL]: ({
      item,
      sku,
      minQuantity,
      discount,
    }) => {
      const isEligible = item.sku === sku && item.quantity >= minQuantity!;
      if (isEligible) {
        item.promotionPrice = item.totalPrice * (1 - discount! / 100);
      }

      return { didApply: isEligible };
    },
  };
}
