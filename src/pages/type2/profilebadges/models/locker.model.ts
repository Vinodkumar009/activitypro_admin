export class ProductVariantModel {
  id: string;
  productCategory: ProductCategoryModel;
  variant_type: number;
  variant_size: string;
  variant_color: string;
  variant_price: string;
  variant_description: string;
  paymentType: number;
  variant_shortname: string;
  quantity: number;
  images: VariantImageModel[];
}

export class ProductCategoryModel {
  id: string;
}

export class VariantImageModel {
  image_url: string;
}
