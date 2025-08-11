import { Extension } from "typescript";
import { IActivityDetails } from "../../../../shared/model/activity.model";
import { IClubDetails } from "../../../../shared/model/club.model";
import { ICoachDetails } from "../../../../shared/model/coach.model";
import { IParentClubDetails } from "../../../../shared/model/parentclub.model";
import { GroupSession } from "../sessions.model";

export class TermSessionDets {
    session:SessionDets
    session_members:TermSessionMembers[];               
}

  export class SessionDets extends GroupSession{
    ParentClubDetails:IParentClubDetails;
    ActivityDetails:IActivityDetails;
    ClubDetails:IClubDetails;
    CoachDetails:ICoachDetails[];
    session_member:TermSessionEnrols[]
    payment:UserPayment
    tot_enrol_count:number
    paid_count:number
    tot_amount:string
    tot_paid_amount:string
    tot_unpaid_amount:string 
    comments:string
    group_category:string
    is_allow_paylater:boolean
    allow_amend_fee:boolean
    is_allmember_to_edit_amendfees:boolean
    capacity_left:number;
    //waitinglist_capacity:number
    is_allow_groupchat:boolean
    allow_childcare:boolean
    show_in_apkids:boolean
    firebase_activity_categorykey:string
    firebase_activity_subcategorykey:string
    is_exist_activitycategory:boolean
    is_exist_activity_subcategory:boolean
    is_loyalty_allowed: boolean;
    is_fixedloyalty_allowed: boolean;
    fixed_loyalty_points: number;
    coach_names:string
    paybydate:string
    term_key:string
    group_status:string;
    halfterm:boolean;
  }

  export class TermSessionMembers{
    session_member_id:string
    user_id:string
    session_id:string
    firebaseid:string
    first_name:string
    last_name:string
    is_enable:boolean
    is_child:boolean	
    medical_condition:string
    gender:string
    dob:string
    media_consent:string
    email:string
    phone_number:string
    parent_id:string
    parent_email:string
    parent_phone_number:string
    member_payment_status:string
    amount_pay_status:number
    amount_pay_status_text:string
    amount_due:string
    amount_paid:string
    paidby:string
    paidby_text:string
    transaction_no:string
    transaction_date:string
    admin_comments:string
    user_comments:string
  }



  export class TermSessionEnrols{
    id:string;
    member:TermSessionMember
    amount_due:string
    amount_pay_status:string                 
  }


  export class TermSessionMember{
    Id:string 
    FirstName:string 
    LastName:string 
    Gender:string 
    DOB:string 
    FirebaseKey:string 
  }

  export class UserPayment{
    order_id:string
    paidby:string
    total_discount:string
    amount_pay_status:string
    amount_paid:string
    extra_charges:string
    transaction_no:string
    transaction_date:string    
  }