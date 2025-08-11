import { AppType } from "../../../../shared/constants/module.constants";
import { CommonOutputTypeDefs, CommonRestApiDto } from "../../../../shared/model/common.model";

export class CreateMembership extends CommonRestApiDto {
  parentclub_id: string;
  club_id: string;
  membership_name: string;
  min_member: number;
  max_member: number
  membership_disclaimer: string;
  membership_setup_id: string;
  monthly: boolean;
  yearly: boolean;
  monthly_price: string;
  yearly_price: string;
  description: string;
  status: number;
  created_by: string;
  tier_category_id: string;
  tier_subcategory_id: string;
  tier_activity_id?: string;
  tier_time_id: string;
  tier_name: string;
  yearly_discount_absolute:string;
  yearly_discount_percentage:string;
  activity_ids:string[];
  device_type?: number;
  app_type?: number;
  device_id?: string;
  membership_templates:Array<{title:string,header:string,message:string}>;
  constructor(membershipDto:any){
    super();
    this.parentclubId = "",
    this.clubId = "",
    this.membership_name = membershipDto.membership_name,
    this.min_member = Number(membershipDto.min_member),
    this.max_member = Number(membershipDto.max_member),
    this.membership_disclaimer = membershipDto.membership_disclaimer,
    this.monthly = membershipDto.monthly,
    this.monthly_price = membershipDto.monthly_price,
    this.yearly = membershipDto.yearly,
    this.yearly_price = membershipDto.yearly_price,
    this.description = membershipDto.description,
    this.status = 1,
    this.created_by = "",
    this.tier_category_id = membershipDto.tier_category_id,
    this.tier_subcategory_id = membershipDto.tier_subcategory_id,
    this.tier_activity_id = membershipDto.tier_activity_id,
    this.tier_time_id = membershipDto.tier_time_id,
    this.tier_name = membershipDto.tier_name,
    this.membership_setup_id = membershipDto.membership_setup_id,
    this.yearly_discount_absolute = membershipDto.yearly_discount_absolute,
    this.yearly_discount_percentage = membershipDto.yearly_discount_percentage,
    this.device_id = "",
    this.device_type = 1;
    this.app_type = 1;
    this.activity_ids = membershipDto.selected_activities;
    this.membership_templates = [];
  }

}
// const membership_create = {
      //   parentclubId:this.postgre_parentclub_id,
      //   clubId:this.Venues.find(venue => venue.FirebaseId === this.selectedClubKey).Id,
      //   app_type:1,
      //   membership_name:this.MembershipObj.membership_name,
      //   min_member:this.MembershipObj.min_member,
      //   max_member:this.MembershipObj.max_member,
      //   tier_category_id:this.MembershipObj.tier_category_id,
      //   tier_subcategory_id:this.MembershipObj.tier_subcategory_id,
      //   tier_activity_id:this.MembershipObj.tier_activity_id,
      //   tier_time_id:this.MembershipObj.tier_time_id,
      //   tier_name:this.MembershipObj.tier_name,
      //   device_id:this.sharedservice.getDeviceId(),
      //   device_type:this.sharedservice.getPlatform() == "android" ? 1:2
      // }


export class Membership extends CommonOutputTypeDefs{
  membership_name: string;
  min_member: number;
  max_member: number;
  membership_disclaimer: string;
  monthly: boolean;
  monthly_price: string;
  yearly: boolean;
  yearly_price: string;
  description: string;
  stripe_product_id: string;
  stripe_monthly_plan_id: string;
  stripe_yearly_plan_id: string;
  membership_member_count?:number;
  yearly_discount_percentage:string;
  yearly_discount_absolute:string;
  membership_template:[];
  club:{
    Id:string;
  }
}

export class MembershipSetupList{
  id:string;
  is_active: boolean;
  setup_type:number;  
  start_date: Date;
  end_date: Date;
  admin_fees: string;
  apply_admin_fees_on_renewal: boolean;
  membership_disclaimer?: string;
  add_card: boolean;
  allow_cash: boolean;
  allow_bacs: boolean;
  allow_online: boolean;
}

//this is used while creation
export class MembershipSetupModal{
    parentclubId: string;
    clubId: string;
    start_date:string;
    end_date:string;
    setup_type: number;
    //activityId: string;
    memberId: string;
    action_type: number;
    device_type: number;
    app_type: number;
    created_by: string;
    admin_fees: string;
    apply_admin_fees_on_renewal: boolean;
    membership_disclaimer: string;
    allow_cash: boolean;
    allow_bacs: boolean;
    charge_prorata:number;
    auto_renewal:number
}

export const MembershipSetupTypeMap = {
  0: 'FIANANCIAL_YEAR',
  1: 'YEAR_MONTH_BEFORE',
  2: 'FULL_YEAR'
}

export enum MembershipSetupType {
  financial_year = 'FIANANCIAL_YEAR',
  year_month_before =  'YEAR_MONTH_BEFORE',
  full_year = 'FULL_YEAR',
}




//this is used while creation
export class MembershipTemplateMasterModal{
  parentclubId: string;
  clubId: string;
  action_type: number;
  device_type: number;
  app_type: number;
  created_by: string;
  templates:TemplatesDto[];
}

export class TemplatesDto{
  id?: string;
  title: string;
  description: string;
  header?: string;
  is_selected?:boolean;
}


//below modals for MembershipTiersSetup
export class MembershipTiersSetupDto {
  categories:MembershipTiersSetup[];
  subcategories:MembershipTiersSetup[];
  activities:MembershipTiersSetup[];
  times:MembershipTiersSetup[]
}

export class MembershipTiersSetup{
  id:string;
  option: number;
  label: string;
  is_selected?:boolean;
}

export class CreateMembershipDiscountMasterDto extends CommonRestApiDto{
  discount_name:string;
  type:number;
  absolute:string;
  percentage:string;
  start_date:string;
  end_date:string;
  parentclubId?: string;
  clubId?: string;
  constructor(discountObj){
    super();
    this.discount_name = discountObj.DiscountName;
    this.type = Number(discountObj.Type);
    this.absolute = discountObj.Discount;
    this.percentage = discountObj.DiscountPercent;
    this.start_date = new Date(discountObj.StartDate).toISOString();
    this.end_date = new Date(discountObj.EndDate).toISOString();
    this.device_type = 1;
    this.device_id = "";
    this.action_type = 1;
    this.app_type = AppType.ADMIN_NEW
  }
}

export class UpdateMembershipDiscountMasterDto extends CommonRestApiDto{
  discount_id:string;
  discount_name:string;
  type:number;
  absolute:string;
  percentage:string;
  start_date:string;
  end_date:string;
  parentclubId?: string;
  clubId?: string;
  constructor(discountObj){
    super();
    this.discount_name = discountObj.DiscountName;
    this.type = Number(discountObj.Type);
    this.absolute = discountObj.Discount;
    this.percentage = discountObj.DiscountPercent;
    this.start_date = new Date(discountObj.StartDate).toISOString();
    this.end_date = new Date(discountObj.EndDate).toISOString();
    this.device_type = 1;
    this.device_id = "";
    this.action_type = 1;
    this.app_type = AppType.ADMIN_NEW
  }
}

export class MembershipMasterDiscounts {
  id:string;
  discount_type_name?:string;
  parentclub: {Id:string};
  club: {Id:string};
  discount_name:string;
  type:number;
  absolute:string;
  percentage:string;
  start_date:string;
  end_date:string;
}


export class MembershipEnrolUsers{ 
  membership_id: string;
  first_name: string;
  last_name: string;
  enrollment_date:string;
  start_date:string
  renewal_date:string
  cancellation_date:string;
  family_group_id:string;
  user_id: string;
  is_enable: boolean;
  is_child: boolean;
  parent_key: string;
  membership_name: string;
  amount: string;
  latest_payment_date: string;
  membership_expiry_date:string;
  formatted_latest_payment_date:string;
  formatted_exp_date:string;
  subscription_status: number;
  membership_type: number;
  package_detail_id: string;
  package_id: string;
  membership_package_id: string;
}

export class UserMembershipMonths{
  id: string
  created_at: string
  created_by: string
  updated_at: string
  deleted_at: string
  updated_by: string
  is_active: boolean
  payment_date: string
  cancellation_date: string
  year: number
  amount_paid: string
  amount_due: string
  pay_status: number
  subscription_status: number;
  month: number;
  monthly_fee: string
  // membership_package: {
  //   id: "c91f8321-d33c-4ce0-a5eb-aa23853b92c5",
  //   created_at: "2024-09-15T05:47:35.508Z",
  //   created_by: "system_user",
  //   updated_at: "2024-09-15T06:06:18.717Z",
  //   deleted_at: null,
  //   updated_by: "membershipPaymentUpdate",
  //   is_active: true,
  //   latest_payment_date: "2024-09-15T06:06:44.153Z",
  //   subscription_status: 1,
  //   membership_renewal_date: null,
  //   subscription_date: "2024-09-15T06:06:44.153Z",
  //   membership_type: 1,
  //   cancellation_date: null,
  //   stripe_subscription_id: "sub_1PzBbYCWFVaLysSyKeH3O7dG",
  //   stripe_plan_id: "price_1PsOdlCWFVaLysSyxsw4fHHl",
  //   amount: "3.50",
  //   trial_period_days: null,
  //   trial_end: null,
  //   application_fee_percentage: "2.83",
  //   stripe_connected_account: "acct_1FUTaBCWFVaLysSy",
  //   stripe_customer_id: "cus_QqtBrjfWtpERK6",
  //   next_payment_date: null,
  //   enrolled_count: 1,
  //   enrollment_date: "2024-09-15T05:47:35.263Z",
  //   start_date: "2024-08-01T18:30:00.000Z",
  //   membership_expiry_date: "2025-08-27T18:30:00.000Z",
  //   scheduled_payment_date: null,
  //   admin_fees: "0.00",
  //   one_time_discount: "0.00",
  //   membership_type_text: "Monthly"
  // },
  month_name: string
  payment_status_name: string
  subscription_status_name: string
  formatted_payment_date: string
  formatted_cancellation_date: string
}


/*  renewal dto's*/
export class CreateRenewalSetupDto extends CommonRestApiDto {
  setup_id:string;
  no_of_days:number;
  first_reminder:number;
  first_reminder_avail:boolean;
  second_reminder:number
  second_reminder_avail:boolean;
  third_reminder:number;
  third_reminder_avail:boolean;
  fourth_reminder:number;
  fourth_reminder_avail:boolean;
  notification_text:string;
  no_of_days_before:number;
  show_renewal_popup:boolean;
  auto_renewal_on:boolean
  pick_latest_price:boolean;
  updated_by:string   
  constructor(renewalObj){
    super();
    this.setup_id = renewalObj.setup_id || "";
    this.parentclubId = "";
    this.clubId = "";
    this.device_id = "",
    this.action_type = 0,
    this.device_type = 1,
    this.app_type = AppType.ADMIN_NEW,
    this.no_of_days = Number(renewalObj.NoOfDays);
    this.first_reminder = renewalObj.Email.firstReminder.no_of_days;
    this.first_reminder_avail = renewalObj.Email.firstReminder.is_avail;
    this.second_reminder = Number(renewalObj.Email.secondReminder.no_of_days);
    this.second_reminder_avail = renewalObj.Email.secondReminder.is_avail;
    this.third_reminder = Number(renewalObj.Email.thirdReminder.no_of_days);
    this.third_reminder_avail = renewalObj.Email.thirdReminder.is_avail;
    this.fourth_reminder = Number(renewalObj.Email.fourthRemainder.no_of_days);
    this.fourth_reminder_avail = renewalObj.Email.fourthRemainder.is_avail;
    this.notification_text = renewalObj.Notification.notificationText;
    this.no_of_days_before = Number(renewalObj.Notification.noOfDaysBefore);
    this.show_renewal_popup = renewalObj.Popup;
    // this.auto_renewal_on = renewalObj.auto_renewal_on;
    // this.pick_latest_price = renewalObj.pick_latest_price;
    this.updated_by = renewalObj.updated_by || "";
  }    
}

export class MembershipRenewalSetup{
  id:string
  no_of_days:number;
  first_reminder:number;
  second_reminder:number;
  third_reminder:number;
  fourth_reminder:number;
  notification_text:string;
  no_of_days_before:number;
  show_renewal_popup:boolean;
  auto_renewal_on:boolean;
  pick_latest_price:boolean;
  is_first_reminder_avail:boolean;
  is_second_reminder_avail:boolean;
  is_third_reminder_avail:boolean;
  is_fourth_reminder_avail:boolean;
}