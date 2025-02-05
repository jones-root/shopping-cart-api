import { sleep } from "../core/utils/index.js";
import { mockedPromotions } from "../mocks/promotions.js";

export class PromotionRepository {
  async findAll() {
    await sleep(100);

    // Cached promotions
    return mockedPromotions;
  }
}
