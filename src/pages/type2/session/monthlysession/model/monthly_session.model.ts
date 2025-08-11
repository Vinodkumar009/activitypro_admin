import { IActivityDetails } from "../../../../../shared/model/activity.model"
import { IClubDetails } from "../../../../../shared/model/club.model"
import { ICoachDetails } from "../../../../../shared/model/coach.model";
import { CommonInputTypeDefs_V3 } from "../../../../../shared/model/common.model";
import { IParentClubDetails } from "../../../../../shared/model/parentclub.model";


export interface user_status_update{
  ParentClubKey:string;
  ClubKey:string;
  CoachKey:string
  session_id: string; //can be firebase until we completely migrate
  enrol_users:MonthlyEnrolUsers[];
  ActionType: number; // 1 for enrol, 0 for unenrol
  AppType:number;
  DeviceType:number;
  // type:Array<string>;
  //invoke_call:number;
  updated_by:string;
}

export interface MonthlyEnrolUsers{
    member_id: string; //can be firebase until we completely migrate
    //Let’s say member have to pay £50 but first paid £30. So due is £20. Initially the value
    enrol_start_month: string;
    enrol_end_month: string;
    enrolled_days:string;
    month_amount:string;
    subscription_status:number;
    //cancelled_date:string; //enrol time no need
    planid:string;
    is_active: boolean; // to check in that session member is active or not
}

export class update_session_payment{
  parentclub_key:string;
  session_club_key:string;
  coach_key:string
  session_id: string; //can be firebase until we completely migrate
  enrol_users:MonthlyEnrolUsers[];
  action_type: number; // 1 for enrol, 0 for unenrol
  //type:Array<string>;
  //invoke_call:number;
  updated_by:string;
  paymentgatewaykey:string;
  paid_by:string;
  comments:string;
  amountpay_status:string;
  channel:string;
}




export class MonthlySession {
  id:string;
  firebase_activitykey: string;
  firebasepath: string;
  can_delete:boolean;
  ActivityDetails:IActivityDetails
  firebase_activity_categorykey: string;
  firebase_activity_subcategorykey: string;
  financial_year_key: string;
  session_name: string;
  start_date: string;
  end_date: string;
  start_time: string;
  end_time:string;
  duration: string;
  days: string;
  group_size: string;
  comments: string;
  productid: string;
  group_category: string;
  group_status: string;
  term_key: string;
  is_exist_activitycategory: boolean;
  is_exist_activity_subcategory: boolean;
  paybydate: string;
  halfterm: string;
  is_allow_paylater: boolean;
  no_of_weeks: string;
  free_months: string;
  payment_option: string;
  allow_amend_fee: boolean;
  is_allow_groupchat: boolean;
  show_in_apkids: boolean;
  is_loyalty_allowed: boolean;
  is_fixedloyalty_allowed: boolean;
  fixed_loyalty_points: string;
  allow_childcare: boolean;
  allow_auto_subscriptions: boolean;
  allow_waitinglist: boolean;
  member_visibility: boolean;
  postgre_activityid: string;
  postgre_clubid: string;
  postgre_parentclubid: string;
  isfreesession: boolean;
  waitinglist_capacity: string;
  must_pay_months: string;
  image_url: string;
  activity_category_name: string;
  activity_subcategory_name:string;
  coaches: ICoachDetails[];
  coach_names: string;
  coach_image: string;
  one_day_price:string;
  can_enroll:boolean;
  Day?:[]
  payplans:SessionPayplans[];
  active_payplans:SessionPayplans[];
  ClubDetails?:IClubDetails;
}

export class SessionPayplans{
  id_member:string
  id_non_member: string
  plan_id_member:string
  plan_id_non_member:string
  plan_amount_member:string
  plan_amount_non_member:string
  days_for:number
  status: number              
}


export class MonthlySessionDets extends MonthlySession {
  ParentClubDetails?:IParentClubDetails;
  ClubDetails?:IClubDetails;
  Months?:SessionMonths[];
  Days?:SessionDays[];
  session_stats:{
    capacity:number
    capacity_left:number,
    enrolled_member_count:number
    pendingpayment_member_count:number
    subscribed_member_count:number
  }
}

export class MonthlySessionPayPlans{

}

export class SessionMonths{
  monthId:string
  month:string
  status:number
  year:string
  monthName:string
  is_selected?:boolean
}

export class SessionDays{
  status:number
  day:string
}
  

export class MonthlySessionMember{
  id:string;
  is_paid: boolean;
  is_cancelled: boolean;
  payment_date: string;
  cancellation_date: string;
  month: string;
  year: number;
  plan_id:string;
  plan_days:number;
  enrolled_id:string;
  amount_paid: string;
  amount_due: string;
  subscription_status: number;
  pay_status: number;
  subscription_status_name: string;
  pay_status_name: string;
  start_date: string;
  end_date:string;
  latest_payment_date: string;
  comments:string;
  user :{
    Id:string
    ParentId:string
    FirstName:string
    LastName:string
    IsEnable:boolean
    EmailID:string
    Gender:string
    ParentEmailID:string
    PhoneNumber:string
    ParentPhoneNumber:string
    DOB:string;
    Age:number
    MedicalCondition:string
    IsChild:boolean        
  }
                          
}






  

  
  