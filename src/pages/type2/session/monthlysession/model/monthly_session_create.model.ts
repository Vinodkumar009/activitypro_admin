import { MonthlySessionDets } from "./monthly_session.model";
import * as moment from 'moment';

export class monthly_session_id_fields{
    parentclub_id: string;
    venue_id: string; //schools
    club_id: string; //clubs/venues
    activity_id: string;
    coach_ids: string[];
    monthly_session_id: string;
}

export class PricingPlans {
    noOfdays: number;
    member_price: string;
    non_member_price: string;
    //show_in_applus: boolean;
}



export class MonthlySessionCreate{
    session_postgre_fields:monthly_session_id_fields
    session_firebase_fields:monthly_session_id_fields
    user_postgre_metadata: {
        UserMemberId: string;
    }
    session_name: string;
    activity_category_name: string
    activity_subCategory_name: string;
    activity_category_key: string;
    activity_subCategory_key: string;
    // is_exist_activitycategory:boolean;
    // is_exist_activity_subcategory:boolean;
    capacity: number; //default 15
    group_status: number;
    days: string[];
    start_time: string;
    duration: string;
    start_date: string;
    end_date: string;
    number_of_weeks: number;
    description: string;
    pricing_plans: PricingPlans[];
    pay_by_date: string;
    comments: string;
    is_allow_pay_later: boolean;
    free_months: number;
    allow_amend_fee: boolean;
    group_chat_allowed: boolean;
    is_loyalty_allowed: boolean;
    is_fixed_loyalty_allowed: boolean;
    allow_childcare: boolean;
    fixed_loyalty_points: number;
    allow_auto_subscription: boolean;
    allow_waiting_list: boolean;
    allow_member_visibility: boolean;
    is_free_session: boolean;
    waiting_list_capacity: number;
    must_pay_months: number;
    show_in_apkids: boolean;
    allow_auto_subscriptions: boolean;
    image_url: string;

    constructor(session_obj:IMonthlySessionMainDets){
        this.session_postgre_fields = {
            parentclub_id: "",
            club_id:session_obj.club_id,
            coach_ids:[],
            activity_id:"",
            monthly_session_id:"",
            venue_id:session_obj.club_id
        } 
        this.user_postgre_metadata = {
            UserMemberId: ""
        }
        this.session_name = session_obj.session_name;
        this.activity_category_name = session_obj.activity_category_name;
        this.activity_subCategory_name = session_obj.activity_subCategory_name;
        this.activity_category_key=session_obj.activity_category_key;
        this.activity_subCategory_key=session_obj.activity_subCategory_key;
        this.capacity = Number(session_obj.groupsize); //default 15
        this.group_status = session_obj.group_status || 1;
        this.days = session_obj.days.split(",");
        this.start_time = session_obj.start_time;
        this.duration = session_obj.duration.toString();
        this.start_date = session_obj.start_date;
        this.end_date = session_obj.end_date;
        this.number_of_weeks = session_obj.no_of_weeks
        this.description = session_obj.comments;
        this.pricing_plans = [];
        this.pay_by_date = session_obj.PayByDate;
        this.comments = session_obj.comments;
        this.is_allow_pay_later = false; //as this is a monthly no paylater
        this.free_months = Number(session_obj.free_sesion_interms_of_month);
        this.allow_amend_fee = false; //as this is a monthly no paylater
        this.group_chat_allowed = false
        this.is_loyalty_allowed = false
        this.is_fixed_loyalty_allowed = false;
        this.allow_childcare = false;
        this.fixed_loyalty_points = 0;
        this.allow_auto_subscription = false;
        this.allow_waiting_list = true;
        this.allow_member_visibility = true;
        this.is_free_session = false;
        this.waiting_list_capacity = 10;
        this.must_pay_months = 1;
        this.show_in_apkids = false;
        this.allow_auto_subscriptions = false;
        this.image_url= ""
    }

}

export class SessionUpdatePricePlansInput{
    noOfdays:number
    member_price:string;
    non_member_price:string
}

export class MonthlySessionEdit{
    session_postgre_fields:monthly_session_id_fields
    session_firebase_fields:monthly_session_id_fields
    user_postgre_metadata: {
        UserMemberId: string;
    }
    user_device_metadata:{
        UserAppType: number;
        UserDeviceType:number
    }
    category_id: string;
    category_name: string;
    sub_category_id: string;
    sub_category_name: string;
    Firebase_SessionKey:string;
    CoachKey:string;
    SessionName: string;
    GroupStatus: number;
    Days: string;
    StartTime: string;
    Duration: string;
    StartDate: string;
    GroupSize:number;
    EndDate: string;
    NoOfWeeks: number;
    Comments: string;
    ShowInAPKids: boolean;
    IsAllowGroupChat:boolean;
    PayPlans:SessionUpdatePricePlansInput[]
    FixedLoyaltyPoints:number;
    PayByDate:string;
    
    // description: string;
    // pay_by_date: string;
    // is_allow_pay_later: boolean;
    // free_months: number;
    // allow_amend_fee: boolean;
    // is_loyalty_allowed: boolean;
    // is_fixed_loyalty_allowed: boolean;
    // allow_childcare: boolean;
    // fixed_loyalty_points: number;
    // allow_auto_subscription: boolean;
    // allow_waiting_list: boolean;
    // allow_member_visibility: boolean;
    // is_free_session: boolean;
    // waiting_list_capacity: number;
    // must_pay_months: number;
    // allow_auto_subscriptions: boolean;
    // image_url: string;
    

    constructor(session_obj:MonthlySessionDets){
        this.session_postgre_fields = {
            parentclub_id: session_obj.ParentClubDetails.Id,
            club_id:session_obj.ClubDetails.Id,
            coach_ids:[],
            activity_id:session_obj.ActivityDetails.Id,
            monthly_session_id:session_obj.id,
            venue_id:session_obj.ClubDetails.Id
        } 
        this.user_postgre_metadata = {
            UserMemberId: ""
        }
        this.Firebase_SessionKey = "";
        this.CoachKey = "";
        this.Days = session_obj.days;
        this.SessionName = session_obj.session_name;
        this.Duration = session_obj.duration.toString()
        this.GroupSize = Number(session_obj.group_size); //default 15
        this.PayByDate = session_obj.paybydate;
        this.GroupStatus = session_obj.group_status!==undefined ? Number(session_obj.group_status) : 1;
        this.StartTime = session_obj.start_time;
        this.StartDate = moment(session_obj.start_date,"DD-MMM-YYYY").format("YYYY-MM-DD");
        this.EndDate = moment(session_obj.end_date,"DD-MMM-YYYY").format("YYYY-MM-DD");
        this.NoOfWeeks = Number(session_obj.no_of_weeks)
        this.Comments = session_obj.comments;
        this.IsAllowGroupChat = session_obj.is_allow_groupchat
        //this.allow_childcare = session_obj.allow_childcare; //as this is a monthly no paylater;
        this.ShowInAPKids = session_obj.show_in_apkids;
        this.PayPlans = [];
        this.FixedLoyaltyPoints = Number(session_obj.fixed_loyalty_points) || 0
        //this.pricing_plans = [];
        //this.pay_by_date = session_obj.paybydate;
        //this.is_allow_pay_later = false; //as this is a monthly no paylater
        //this.allow_amend_fee = session_obj.allow_amend_fee; //as this is a monthly no paylater
        //this.comments = session_obj.comments;
         // this.activity_category_name = session_obj.activity_category_name;
        // this.activity_subCategory_name = session_obj.activity_subcategory_name;
        // this.activity_category_key=session_obj.firebase_activity_categorykey;
        // this.activity_subCategory_key=session_obj.firebase_activity_subcategorykey;
        //this.days = session_obj.days.split(",");
        //this.start_date = session_obj.start_date;
        // this.is_loyalty_allowed = false
        // this.is_fixed_loyalty_allowed = false;
        // this.fixed_loyalty_points = 0;
        // this.allow_auto_subscription = false;
        // this.allow_waiting_list = true;
        // this.allow_member_visibility = true;
        // this.is_free_session = false;
        // this.waiting_list_capacity = 10;
        // this.must_pay_months = 1;
        // this.allow_auto_subscriptions = false;
        // this.image_url= ""
    }

}


export interface IMonthlySessionMainDets{
    session_name:string,
    start_date: string,
    end_date: string,
    start_time: string,
    duration: number,
    days: string,
    groupsize: number,
    isterm: false,
    group_category:string,
    comments: string,
    PayByDate: string,
    group_status:number,
    coach_name: string,
    is_exist_activity_category: false,
    is_exist_activity_subcategory: false,
    activity_subCategory_key: string,
    activity_category_key: string,
    activity_category_name:string,
    activity_subCategory_name:string,
    term_id: string,
    financial_year_id: string,
    no_of_weeks: number,
    is_all_memberto_editamendsfees:boolean,
    is_allow_auto_subcriptions:boolean,
    free_sesion_interms_of_month: string,
    no_of_month_mustpay: string,
    imageurl: "",
    coach_id: string,
    club_id: string,
    activity_id: string,
  }




  