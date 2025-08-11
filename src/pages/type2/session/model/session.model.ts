import { CommonIdFields, UserDeviceMetadata } from "../../../../shared/model/common.model";
import { SessionDets } from "./session_details.model";
import * as moment from "moment";

export class CreateTermSessionModel extends UserDeviceMetadata{
  session_postgre_fields:CommonIdFields;
  session_firebase_fields:CommonIdFields
  Firebase_SessionKey:string;
  ActivityCategoryKey:string; //firebase
  ActivitySubCategoryKey:string; //firebase
  FinancialYearKey:string;
  SessionName:string;
  StartDate:string;
  EndDate:string;
  StartTime:string;
  Duration:string;
  Days:string;
  GroupSize:number;
  IsTerm:boolean;
  Comments:string;
  GroupCategory:string; //term,weekly,monthly
  SessionType:string; //term,monthly,weekly
  //@Field(type => Number,{defaultValue:1}) //public or draft
  GroupStatus:number;
  TermKey:string;
  IsExistActivityCategory:boolean;
  IsExistActivitySubCategory:boolean
  PayByDate:string;
  HalfTerm:boolean;
  MemberVisibility:boolean;
  IsAllowPayLater:boolean;
  FeesPerDayForMember:number;
  FeesPerDayForNonMember:number;
  NoOfWeeks:number;
  SessionFee:number;
  SessionFeeForNonMember:number;
  PaymentOption:number;
  IsAllMembertoEditAmendsFees:boolean;
  IsAllowGroupChat:boolean;
  ShowInAPKids:boolean;
  IsLoyaltyAllowed:boolean;
  IsFixedLoyaltyAllowed:boolean;
  FixedLoyaltyPoints:number;
  AllowChildCare:boolean;
  AllowWaitingList:boolean;
  updated_by:string;
  ActivityCategoryName:string;
  ActivitySubCategoryName:string;
  Term_Name:string;
  constructor(sessionObj:any){
          super();
          this.user_device_metadata = {
            UserAppType:0,
            UserDeviceType:0,
          }
          this.session_firebase_fields = {
            parentclub_id:sessionObj.ParentClubKey,
            club_id:sessionObj.ClubKey,
            coach_ids:[sessionObj.CoachKey],
            activity_id:sessionObj.ActivityKey,
          }
          this.session_postgre_fields = {
            parentclub_id:"",
            club_id:"",
            coach_ids:[],
            activity_id:"",
          }
          this.user_postgre_metadata = {
            UserMemberId:"",
          };
          this.ActivityCategoryKey = sessionObj.ActivityCategoryKey;
          this.ActivitySubCategoryKey = sessionObj.ActivitySubCategoryKey;
          this.FinancialYearKey = sessionObj.FinancialYearKey;
          this.SessionName = sessionObj.SessionName;
          this.StartDate = sessionObj.StartDate;
          this.EndDate = sessionObj.EndDate;
          this.StartTime = sessionObj.StartTime;
          this.Duration = sessionObj.Duration;
          this.Days = sessionObj.Days;
          this.GroupSize = Number(sessionObj.GroupSize);
          this.IsTerm = sessionObj.IsTerm;
          this.Comments = sessionObj.Comments || "";
          this.GroupCategory = sessionObj.GroupCategory; //term,weekly,monthly
          this.SessionType = sessionObj.SessionType; //term,monthly,weekly
          this.GroupStatus = Number(sessionObj.GroupStatus);
          this.TermKey = sessionObj.TermKey;
          this.IsExistActivityCategory = sessionObj.IsExistActivityCategory;
          this.IsExistActivitySubCategory = sessionObj.IsExistActivitySubCategory;
          this.PayByDate = sessionObj.PayByDate;
          this.HalfTerm = sessionObj.HalfTerm;
          this.MemberVisibility = sessionObj.MemberVisibility;
          this.IsAllowPayLater = sessionObj.IsAllowPayLater;
          this.FeesPerDayForMember = Number(sessionObj.FeesPerDayForMember);
          this.FeesPerDayForNonMember = Number(sessionObj.FeesPerDayForNonMember);
          this.NoOfWeeks = Number(sessionObj.NoOfWeeks);
          this.SessionFee = Number(sessionObj.SessionFee);
          this.SessionFeeForNonMember = Number(sessionObj.SessionFeeForNonMember);
          this.PaymentOption = Number(sessionObj.PaymentOption);
          this.IsAllMembertoEditAmendsFees = sessionObj.IsAllMembertoEditAmendsFees;
          this.IsAllowGroupChat = sessionObj.IsAllowGroupChat ? sessionObj.IsAllowGroupChat : false;
          this.ShowInAPKids = sessionObj.ShowInAPKids;
          this.IsLoyaltyAllowed = sessionObj.IsLoyaltyAllowed;
          this.IsFixedLoyaltyAllowed = sessionObj.IsFixedLoyaltyAllowed;
          this.FixedLoyaltyPoints = sessionObj.FixedLoyaltyPoints;
          this.AllowChildCare = sessionObj.AllowChildCare;
          this.AllowWaitingList = sessionObj.AllowWaitingList;
          this.Term_Name = "";
      
  }
}

export class UpdateTermSessionModel extends UserDeviceMetadata{
  session_postgre_fields:CommonIdFields;
  session_firebase_fields:CommonIdFields;
  Firebase_SessionKey:string;
  SessionName:string;
  StartDate:string;
  EndDate:string;
  StartTime:string;
  Duration:string;
  Days:string;
  GroupSize:number;
  Comments:string;
  isFreeSession:boolean;
  GroupStatus:number;
  PayByDate:string;
  IsAllowPayLater:boolean;
  NoOfWeeks:number;
  SessionFee:number; //total fee per member
  SessionFeeForNonMember:number; //total fee per non-member
  IsAllMembertoEditAmendsFees:boolean;
  IsAllowGroupChat:boolean;
  ShowInAPKids:boolean;
  IsLoyaltyAllowed:boolean;
  IsFixedLoyaltyAllowed:boolean;
  FixedLoyaltyPoints:string;
  AllowChildCare:boolean;
  AllowWaitingList:boolean;
  ActivityCategory:string;
  ActivitySubCategory:string;
  ActivityCategoryName:string;
  ActivitySubCategoryName:string;
  updated_by:string;
  Term_Name:string;
  HalfTerm:boolean
  constructor(){
    super();
  }


    static getTermSessionForEdit(session:SessionDets){
      const term_session = new UpdateTermSessionModel();
      term_session.user_device_metadata = {
        UserAppType:0,
        UserDeviceType:0,
      }
      term_session.user_postgre_metadata = {
        UserMemberId:""
      }
      term_session.session_firebase_fields = {
        parentclub_id:session.ParentClubDetails.FireBaseId,
        club_id:session.ClubDetails.FirebaseId,
        coach_ids:session.CoachDetails.map(coach=>coach.coach_firebase_id),
        activity_id:session.ActivityDetails.FirebaseActivityKey,
      },
      term_session.session_postgre_fields = {
        parentclub_id:session.ParentClubDetails.Id,
        club_id:session.ClubDetails.Id,
        coach_ids:[],
        activity_id:session.ActivityDetails.Id,
      }
      term_session.GroupStatus = Number(session.group_status);
      term_session.HalfTerm = session.halfterm;
      term_session.SessionFee = Number(session.session_fee);
      term_session.SessionFeeForNonMember = Number(session.session_fee_for_nonmember);
      term_session.IsAllMembertoEditAmendsFees = session.allow_amend_fee;
      term_session.Days = session.days;
      term_session.IsAllowPayLater = session.is_allow_paylater;
      term_session.SessionName = session.session_name; 
      term_session.StartDate = moment(session.start_date,"DD-MMM-YYYY").format("YYYY-MM-DD");
      term_session.EndDate = moment(session.end_date,"DD-MMM-YYYY").format("YYYY-MM-DD");
      term_session.PayByDate = session.paybydate;
      term_session.StartTime = session.start_time;
      term_session.Duration = session.duration;
      term_session.GroupSize = session.group_size;
      term_session.NoOfWeeks = session.no_of_weeks;
      //term_session.GroupStatus = session.group_status.toString();
      term_session.Comments = session.comments;
      term_session.AllowChildCare = session.allow_childcare;
      term_session.IsAllowGroupChat = session.is_allow_groupchat
      term_session.ShowInAPKids = session.show_in_apkids;
      term_session.IsLoyaltyAllowed = session.is_loyalty_allowed;
      term_session.IsFixedLoyaltyAllowed = session.is_fixedloyalty_allowed
      term_session.FixedLoyaltyPoints = session.fixed_loyalty_points.toString()
      term_session.ActivityCategory = session.firebase_activity_categorykey;
      term_session.ActivitySubCategory = session.firebase_activity_subcategorykey;
      term_session.ActivityCategoryName = session.activity_category_name;
      term_session.ActivitySubCategoryName = session.activity_subcategory_name;
      return term_session;
  }
}

export interface SessionCopyModel{
  parentclub_key:string;
  session_club_key:string;
  term_key:string;
  session_other_dets:copySessionUsers[];
  type:Array<string>;
  invoke_call:number;
  //updated_by:string;
}

export interface copySessionUsers{
  session_key:string;
  coach_key:string;
}

export interface user_status_update{
  parentclub_key:string;
  session_club_key:string;
  coach_key:string
  session_id: string; //can be firebase until we completely migrate
  enrol_users:TermEnrolUsers[];
  action_type: number; // 1 for enrol, 0 for unenrol
  type:Array<string>;
  invoke_call:number;
  updated_by:string;
}

export interface user_status_update_v1 extends UserDeviceMetadata{
  postgre_fields?: CommonIdFields; 
  firebase_fields?: CommonIdFields; //can be firebase until we completely migrate
  session_id: string; //can be firebase until we completely migrate
  enrol_users: TermEnrolUsersV1[];
  action_type: number; // 1 for enrol, 0 for unenrol
  updated_by: string;
  parent_fireabse_id?:string;
  get_payments: boolean;
}

export interface TermEnrolUsersV1{
  member_id: string; 
  is_amended:boolean; //this required for member app only
  amount_due: string; //this required for member app only
}

export interface TermEnrolUsers{
  member_id: string; //can be firebase until we completely migrate
  //Let’s say member have to pay £50 but first paid £30. So due is £20. Initially the value
  amount_due: string;
  total_amount: string;
  is_active: boolean; // to check in that session member is active or not
}

export class update_session_payment{
  parentclub_key:string;
  session_club_key:string;
  coach_key:string
  session_id: string; //can be firebase until we completely migrate
  enrol_users:TermEnrolUsers[];
  action_type: number; // 1 for enrol, 0 for unenrol
  type:Array<string>;
  invoke_call:number;
  updated_by:string;
  paymentgatewaykey:string;
  paid_by:string;
  comments:string;
  amountpay_status:string;
  channel:string;
}


export class CopySessionInput extends UserDeviceMetadata {
  term_id:string;
  term_name:string;
  term_start_date:string;
  term_end_date:string;
  pay_by_date:string;
  financial_year_id:string;
  session_dets:CopySessionInfo[];
}

export class CopySessionInfo {
  session_id:string;
  enrol_members:boolean;
  member_fee:string;
  non_member_fee:string;
  group_status:number;
}




export class PendingTermSessionResDto {
  enrol_id: number;
  amount_due: number;
  amount_pay_status: string;
  // User Information
  user_id?: string;
  user_first_name?: string;
  user_last_name?: string;
  user_firebase_key?: string;
  // Session Informaion
  session_id: string;
  session_firebase_key: string;
  session_fee: number;
  session_fee_for_nonmember: number;
  session_name: string;
  session_start_date: string;
  session_end_date: string;
  session_start_time: string;
  session_duration: number;
  session_days: string;
  formatted_start_date: string;
  formatted_end_date: string;
  calculated_end_time: string;
  // Club Details
  club_id?: number;
  club_details_firebase_id?: string;
  club_name?: string;
  // Coach Information
  coach_id?: number;
  coach_firebase_id?: string;
  coach_first_name?: string;
  coach_last_name?: string;
  activity_id:string
  activity_firebase_id:string;
  activity_name:string;
  term_name:string;
  activity_category_name:string;
  activity_subcategory_name:string;
}