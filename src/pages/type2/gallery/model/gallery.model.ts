export class GalleryModel{
    id:string;
    productCategory:{id:string};
    parentClubId:string;
    variant_type:number;
    variant_size:string;
    variant_color:string;
    variant_price:string;
    variant_description:string;
    paymentType:number;
    variant_shortname:string;   
    quantity:number;  
    images:ImageUrls[] 
  }
  
  export class ImageUrls{
    id?:any;
    image_url:string;
    image_sequence?:any;
  }
  
  export class GalleryCategories{
    id:string;
    category_name:boolean;
    category_description:string;
    category_image:string;
  }

  export class GalleryItemModel{
    ParentClubKey: string; //ParentClub Key
    //@Field(type => String, { nullable: true })
    MemberKey: string; //ParentClub Key
    //@Field(type => Int, { nullable: true })
    AppType: number; //Which app {0:Admin,1:Member,2:Applus}
    ActionType: number;
    ProductCategoryId: string;
    Variant_ShortName: string;
    Variant_Size: string;
    Variant_Price: string;
    Variant_Description: string;
    //@Field(type => Int, { nullable: true })
    Variant_Quantity: number;
    Variant_Visibility:number;
    images:product_images[]
  }

  export class product_images{
    ProductVariantId:string;
    ImageUrl:string;
    ImageSequence:number
  }


  //addNewimages[]:porduct_images

  //deleteImages["string"]