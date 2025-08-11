export class CampDiscountsDTO{
    camp_id: string;
    discounts: CampDiscounts[];
  }
  
  export class CampDiscounts{
    id:string;
    discount_firebasekey: string;
    absolute_value: string;
    discount_code: number;
    discount_name: string;
    is_active: boolean;
    percentage_value: string;
    is_apply_to_all:boolean
    no_of_sessions:number;
    pre_order_type:number;
    threshold_days:number;
  }