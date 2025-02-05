import * as yup from "yup";

export const GetShoppingCartTotal = yup.object({
  items: yup
    .array(
      yup.object({
        sku: yup
          .string() //
          .length(6)
          .uppercase()
          .test((value) => !!value?.match(/^[a-z0-9]+$/gi))
          .required(),
        quantity: yup //
          .number()
          .min(1)
          .max(9999)
          .required(),
      })
    )
    .min(1)
    .max(100)
    .required(),
});

export type IShopItemsDto = yup.InferType<typeof GetShoppingCartTotal>;
