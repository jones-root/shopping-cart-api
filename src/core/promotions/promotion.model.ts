export interface IPromotion {
  buy: {
    sku: string;
    eq?: number; // equal (quantity to activate promotion)
    gte?: number; // greater than or equal (quantity to activate promotion)
  };
  for?: number;
  free?: { sku: string };
  discount?: { sku?: string; percentage: number };
  description?: string;
}
