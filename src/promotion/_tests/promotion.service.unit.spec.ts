import { mockedShopItems } from "../../mocks/items.js";
import { mockedPromotions } from "../../mocks/promotions.js";
import {
  IShopItem,
  IShoppingCartItem,
} from "../../shopping_cart/shopping_cart.js";
import { ShoppingCartRepository } from "../../shopping_cart/shopping_cart.repository.js";
import { IPromotion, PromotionTypeEnum } from "../promotion.model.js";
import { PromotionRepository } from "../promotion.repository.js";
import { PromotionService } from "../promotions.service.js";

jest.mock("../promotion.repository.js");
jest.mock("../../shopping_cart/shopping_cart.repository.js");

describe("PromotionService", () => {
  let promotionsService: PromotionService;
  let mockPromotionRepository: jest.Mocked<PromotionRepository>;
  let mockShoppingCartRepository: jest.Mocked<ShoppingCartRepository>;

  beforeEach(() => {
    mockPromotionRepository =
      new PromotionRepository() as jest.Mocked<PromotionRepository>;
    mockShoppingCartRepository =
      new ShoppingCartRepository() as jest.Mocked<ShoppingCartRepository>;

    // Instantiate the service with the mocked repositories
    promotionsService = new PromotionService(
      mockPromotionRepository,
      mockShoppingCartRepository
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("ensurePromotionsAreBuilt", () => {
    it("should build all promotion functions locally", async () => {
      const fakePromotions: IPromotion[] = [
        { type: PromotionTypeEnum.BUY_X_FOR_Y, sku: "XXX" },
        { type: PromotionTypeEnum.EACH_SALE_OF_X_COMES_WITH_AN_Y, sku: "YYY" },
      ];

      mockPromotionRepository.findAll.mockResolvedValue(fakePromotions);
      await promotionsService.ensurePromotionsAreBuilt();

      expect(promotionsService.allPromotions).toHaveLength(
        fakePromotions.length
      );
    });
  });

  describe("interpret", () => {
    it("should correctly apply promotions of type BUY_X_FOR_Y", async () => {
      const fakeCartItems: IShoppingCartItem[] = [
        {
          sku: "120P90",
          name: "Google Home",
          price: 49_99, // cents
          quantity: 3,
          totalPrice: 49_99 * 3,
        },
      ];

      mockShoppingCartRepository.findItemsBySkus.mockResolvedValue(
        mockedShopItems
      );
      mockPromotionRepository.findAll.mockResolvedValue(mockedPromotions);

      const result = await promotionsService.interpret(fakeCartItems);

      expect(result.appliedPromotions).toEqual(1);
      expect(result.appliedPromotionDescriptions).toHaveLength(1);
      expect(result.totalPrice).toEqual(49_99 * 2);
      expect(result.resultingCart).toHaveLength(1);
    });

    it("should correctly apply promotions of type BUY_X_OR_MORE_TO_GET_A_DISCOUNT_ON_ALL", async () => {
      const fakeCartItems: IShoppingCartItem[] = [
        {
          sku: "A304SD",
          name: "Alexa Speaker",
          price: 109_50,
          quantity: 3,
          totalPrice: 109_50 * 3,
        },
      ];

      mockShoppingCartRepository.findItemsBySkus.mockResolvedValue(
        mockedShopItems
      );
      mockPromotionRepository.findAll.mockResolvedValue(mockedPromotions);

      const result = await promotionsService.interpret(fakeCartItems);

      expect(result.appliedPromotions).toEqual(1);
      expect(result.appliedPromotionDescriptions).toHaveLength(1);
      expect(result.totalPrice).toEqual(109_50 * 3 * 0.9);
      expect(result.resultingCart).toHaveLength(1);
    });

    it("should correctly apply promotions of type EACH_SALE_OF_X_COMES_WITH_AN_Y when Y is not added in the cart", async () => {
      const originalItem: IShopItem = {
        sku: "43N23P",
        name: "Mac Pro",
        price: 5399_99,
      };

      const fakeCartItems: IShoppingCartItem[] = [
        {
          ...originalItem,
          quantity: 1,
          totalPrice: 5399_99,
        },
      ];

      const freeItemToBeAdded: IShopItem = {
        sku: "344222",
        name: "Raspberry Pi",
        price: 30_00,
      };

      // findItemsBySkus is first called to check if the skus exist and them to search for the added free item
      mockShoppingCartRepository.findItemsBySkus.mockResolvedValueOnce([
        originalItem,
      ]);
      mockShoppingCartRepository.findItemsBySkus.mockResolvedValueOnce([
        freeItemToBeAdded,
      ]);
      mockPromotionRepository.findAll.mockResolvedValue(mockedPromotions);

      const result = await promotionsService.interpret(fakeCartItems);

      expect(result.appliedPromotions).toEqual(1);
      expect(result.appliedPromotionDescriptions).toHaveLength(1);
      expect(result.totalPrice).toEqual(5399_99);
      expect(result.resultingCart).toHaveLength(2); // It should have been added automatically by the server
      expect(result.resultingCart[1]).toMatchObject({
        sku: freeItemToBeAdded.sku,
        promotionPrice: 0,
      });
    });

    it("should correctly apply promotions of type EACH_SALE_OF_X_COMES_WITH_AN_Y when Y is added in the cart already", async () => {
      const fakeCartItems: IShoppingCartItem[] = [
        {
          sku: "43N23P",
          quantity: 1,
          name: "Mac Pro",
          price: 5399_99,
          totalPrice: 5399_99,
        },
        {
          sku: "344222",
          quantity: 1,
          name: "Raspberry Pi",
          price: 30_00,
          totalPrice: 30_00,
        },
      ];

      mockShoppingCartRepository.findItemsBySkus.mockResolvedValue(
        mockedShopItems
      );
      mockPromotionRepository.findAll.mockResolvedValue(mockedPromotions);

      const result = await promotionsService.interpret(fakeCartItems);

      expect(result.appliedPromotions).toEqual(1);
      expect(result.appliedPromotionDescriptions).toHaveLength(1);
      expect(result.totalPrice).toEqual(5399_99);
      expect(result.resultingCart).toHaveLength(2);
    });

    it("should correctly apply multiple promotions: BUY_X_FOR_Y, EACH_SALE_OF_X_COMES_WITH_AN_Y, BUY_X_OR_MORE_TO_GET_A_DISCOUNT_ON_ALL", async () => {
      const fakeCartItems: IShoppingCartItem[] = [
        {
          sku: "120P90",
          name: "Google Home",
          price: 49_99, // cents
          quantity: 7,
          totalPrice: 49_99 * 7,
        },
        {
          sku: "43N23P",
          name: "Mac Pro",
          price: 5399_99, // cents
          quantity: 2,
          totalPrice: 5399_99 * 2,
        },
        {
          sku: "A304SD",
          name: "Alexa Speaker",
          price: 109_50,
          quantity: 5,
          totalPrice: 109_50 * 5,
        },
        {
          sku: "344222",
          name: "Raspberry Pi",
          price: 30_00,
          quantity: 1,
          totalPrice: 0,
        },
      ];

      const googleHomeExpectedTotal = 49_99 * 4 + 49_99; // get 3 for 2
      const macProExpectedTotal = 5399_99 * 2; // + 2 free raspberry pi + 1 already added on the cart
      const alexaSpeakerExpectedTotal = 109_50 * 5 * 0.9; // 10% discount

      mockShoppingCartRepository.findItemsBySkus.mockResolvedValue(
        mockedShopItems
      );
      mockPromotionRepository.findAll.mockResolvedValue(mockedPromotions);

      const result = await promotionsService.interpret(fakeCartItems);

      expect(result.appliedPromotions).toEqual(3);
      expect(result.appliedPromotionDescriptions).toHaveLength(3);
      expect(result.totalPrice).toEqual(
        googleHomeExpectedTotal +
          macProExpectedTotal +
          alexaSpeakerExpectedTotal
      );
      expect(result.resultingCart).toHaveLength(fakeCartItems.length);
      expect(
        result.resultingCart.find(({ sku }) => sku === "344222")?.quantity
      ).toBeGreaterThanOrEqual(2); // raspberry pi should have at least the same quantity of mac pros
    });
  });
});
