import { IActivityDetails } from "../../../../../shared/model/activity.model";
import { Activity } from "../../../../../shared/model/club.model";
import { ICoachDetails } from "../../../../../shared/model/coach.model";
import { IClubDetails } from "../../../../../shared/model/league.model";
// import { MonthlySession } from "../../../session/monthlysession/model/monthly_session.model";
// import { GroupSession } from "../../../session/sessions.model";
// import { WeeklySessionDays, WeeklySessionList } from "../../../session/weekly/weekly.model";


// below is term session booking model
export interface ITermBookingModel {
  amount_due: string,
  total_amount: string,
  paid_amount: string,
  total_discount: string,
  paid_on: string,
  amount_pay_status: number,

  member: Member,

  session: SessionDetails,

  transaction: TransactionHistory

  // session_member: SessionMember_V3;
  // amount_paid: string;
  // total_discount: number;
  // paidby: number; //payment mode: online, cash, bacs, childcare, wallet
  // is_verified: boolean; //(when paid through bacs,cash)
  // cash_pay_to: string;
  // transaction_no: string; //(orderID)
  // transaction_date: string;
  // total_fee_amt: number; //t(check after edit session which prop is updating)
  // user_comments: string;
  // admin_comments: string;
  // order_id: string;
}

export class IMonthlyBookingModel {
  amount_pay_status: number
  amount_paid: number
  paidby: number; //payment mode: online, cash, bacs, childcare, wallet
  total_discount: number
  paid_month: string
  order_id: string
  session_member: SessionMember_V3;
  is_verified: boolean; //(when paid through bacs,cash)
  cash_pay_to: string;
  transaction_no: string; //(orderID)
  transaction_date: string;
  total_fee_amt: number; //t(check after edit session which prop is updating)
  user_comments: string;
  admin_comments: string;

}

export class IHolidayCampBookingModel {
  amount_pay_status: number
  amount_paid: string
  total_discount: string
  paidby: number
  is_verified: boolean
  cash_pay_to: string
  transaction_no: string
  transaction_date: string
  total_fee_amt: string
  order_id: string

  enrollments: EnrolMents[]

}

export class EnrolMents {
  holidaycamp: CampDetails
  user: PostGresUser
}

export class CampDetails {
  id: string
  camp_name: string
  days: string
  club: ClubDetails
  camp_coach: CampCoach[]
}

export class CampCoach {
  coach: Coach;
}

export class Member {
  Id: string

  FirstName: string
  LastName: string
  Gender: string
  DOB: string
  member_type: number
  FirebaseKey: string
  media_consent: true
  profile_status: string
}

export class SessionDetails {
  id: string
  session_name: string
  start_date: string
  end_date: string
  isfreesession: boolean
  start_time: string
  duration: string
  days: string
  session_date: string
  group_size: number
  capacity_left: number

  comments: string
  group_category: string
  session_type: string
  group_status: number
  term_key: string
  term_name: string
  is_exist_activitycategory: boolean
  is_exist_activity_subcategory: boolean
  paybydate: string
  halfterm: boolean
  is_allow_paylater: boolean
  session_fee: string
  session_fee_for_nonmember: string
  no_of_weeks: number
  fees_perday_for_member: string
  fees_perDay_for_nonMember: string
  payment_option: number
  allow_amend_fee: boolean
  is_allow_groupchat: boolean
  show_in_apkids: boolean
  member_visibility: boolean
  is_loyalty_allowed: boolean
  is_fixedloyalty_allowed: boolean
  fixed_loyalty_points: string
  allow_childcare: boolean
  allow_waitinglist: false
  waitinglist_capacity: number
  ClubDetails: ClubDetails
  coach: Coach[]
}

export class TransactionHistory {

  id: string

  amount_pay_status: number
  amount_paid: string
  total_discount: string
  paidby: number
  is_verified: boolean
  cash_pay_to: string
  transaction_no: string
  transaction_date: string
  total_fee_amt: string
  paidby_text: string
  order_id: string

}
export class SessionMember_V3 {
  member: PostGresUser;
  amount_due: string;
  total_amount: string;
  session: GroupSession;
  //payment: SessionPayment;
  is_paid: string;
}

// below is term session booking model
// export interface IMonthlyBookingModel {
//   amount_pay_status_text: string
//   paidby_text: string
//   paid_month: string
//   session_member: MonthlySessionMember;
//   amount_pay_status: number;
//   amount_paid: string;
//   total_discount: number;
//   paidby: number; //payment mode: online, cash, bacs, childcare, wallet
//   is_verified: boolean; //(when paid through bacs,cash)
//   cash_pay_to: string;
//   transaction_no: string; //(orderID)
//   transaction_date: string;
//   total_fee_amt: number; //t(check after edit session which prop is updating)
//   user_comments: string;
//   admin_comments: string;
//   order_id: string;
// }

export class MonthlySessionMember {
  session: MonthlySession;
  user: PostGresUser;
  month_amount: string;
  start_month: string;
  end_month: string;
  enrolled_date: string;
  enrolled_days: string;
  scheduled_payment_date: string;
  subscription_status: number;
  cancelled_date: string;
  subscribed_date: string;
  subscription_id: string;
  trial_days: number;
  last_payment_day: number;
}

// below is school session booking model
export interface ISchoolSessionBooking {
  id: string
  amount_pay_status_text: string;
  paidby_text: string;
  school_session_member: SchoolSessionMember[];
  amount_pay_status: number;
  amount_paid: string;
  total_discount: string;
  paidby: number; //payment mode: online, cash, bacs, childcare, wallet
  is_verified: boolean; //(when paid through bacs,cash)
  cash_pay_to: string;
  transaction_no: string; //(orderID)
  transaction_date: string;
  total_fee_amt: number; //t(check after edit session which prop is updating)
  user_comments: string;
  admin_comments: string;
  order_id: string;
  receipt_url: string;
}


export class SchoolSessionMember {
  member: PostGresUser;
  amount_due: string;
  total_amount: string;
  school_session: SchoolSessions;
}



// below is weekly session booking model
export interface IWeeklyBooking {
  amount_paid: number,
  total_discount: number,
  total_amount: string
  payment_method: number

  is_verified: boolean
  cash_paid_to: string,
  transaction_no: string
  order_id: string
  transaction_date: string


  user_comments: string;
  admin_comments: string;
  transaction_type: number;
  weeklySessionTransactionItems: WeeklyTransactionsHistoryItems[];
  amount_pay_status: number;
  user: PostGresUser;
}

export class WeeklyTransactionsHistoryItems {
  amount: string;
  discount: string;
  total_payed: string;
  sessionMember: WeeklySessionMember;
}

export class WeeklySessionMember {
  member: PostGresUser;
  weeklySession: WeeklySessionList;
  weeklySessionDate: WeeklySessionDays
  amount_pay_status: number;
  paid_amount: string;
  amount_due: string;
  total_amount: string;
  admin_comments: string;
  user_comments: string;
  transaction_date: string;
  is_discount_applied: boolean;
}

export class PostGresUser {
  FirstName: string;
  LastName: string;
  Gender: string;
  DOB: string;
  FirebaseKey: string;
}

export class ClubDetails {
  ClubName: string
}

export class Coach {
  first_name: string
  last_name: string
  middle_name: string
}

export class ICourtBooking {
  Id: string
  name: string
  table_capacity: string
  surface: string
  floor: string
  court_type: string
  member_comments: string
  phone_number: string
  booked_member_key: string
  booking_date: string
  ActivityName: string
  courtname: string
  booking_transaction_time: string
  slot_start_time: string
  slot_end_time: string
  price: string
  booking_type: string
  purpose: string
  activitykey: string
  clubkey: string
  courtkey: string
  order_id: string
  paymentsource: string
}

/////////////////////////////////////////////////////

export interface SchoolSessions {
  id: string
  enrolled_count: number
  school_session_name: string
  start_date: string
  end_date: string
  start_time: string
  end_time: string
  duration: string
  days: string
  group_size: number
  member_fee: string
  non_member_fee: string
  capacity_left: number
  comments: string
  activity_category_name: string
  activity_subcategory_name: string
  coach_names: string;
  ActivityDetails: IActivityDetails;
  ClubDetails: {
    Id: string
    FirebaseId: string
    ClubName: string
  }
  Images: {
    id: string
    image_url: string
  }
  CoachDetails: ICoachDetails[],
  ParentClubSchool: {
    parentclub: {
      Id: string
    }
    school: {
      id: string
      school_name: string
    }
  }
}
export class MonthlySession {
  id: string;
  firebase_activitykey: string;
  firebasepath: string;
  can_delete: boolean;
  ActivityDetails: IActivityDetails
  firebase_activity_categorykey: string;
  firebase_activity_subcategorykey: string;
  financial_year_key: string;
  session_name: string;
  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
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
  activity_subcategory_name: string;
  coaches: ICoachDetails[];
  coach_names: string;
  coach_image: string;
  one_day_price: string;
  can_enroll: boolean;
  Day?: []
  payplans: SessionPayplans[];
  active_payplans: SessionPayplans[];
  ClubDetails?: IClubDetails;
}

export class SessionPayplans {
  id_member: string
  id_non_member: string
  plan_id_member: string
  plan_id_non_member: string
  plan_amount_member: string
  plan_amount_non_member: string
  days_for: number
  status: number
}
export class GroupSession {
  id: string;
  session_name: string;
  firebase_sessionkey: string;
  firebase_clubkey: string;
  ParentClubDetails: ParentClub;
  ActivityDetails: Activity;
  ClubDetails: Club;
  firebase_activitykey: string;
  activity_category_name: string;
  activity_subcategory_name: string;
  duration: string;
  term_name: string;
  group_category: string;
  days: string;
  no_of_weeks: number;
  Coach: Coach;
  group_size: number;
  session_fee: string
  session_fee_for_nonmember
  tot_enrol_count: number;
  pending_count: number;
  paid_count: number;
  start_time: string;
  end_time: string;
  start_date: string;
  end_date: string;
}

export interface WeeklySessionList {
  id: string
  discounts: WeeklySessionDiscountDto[]
  session_name: string
  category_name: string
  sub_category_name: string
  description: string
  age_group: string
  ClubKey: string
  club_id: string
  ClubName: string
  days: string
  ParentClub: ParentClub
  club: Club
  ActivityDetails: Activity
  start_date: string
  start_time: string
  end_time: string
  session_type: string
  end_date: string
  fee_for_member: string
  fee_for_nonmember: string
  firebase_categorykey: string
  firebase_subcategorykey: string
  coach_names: string
  coach_images: string
  allow_paylater: boolean
  enrol_count: number
  booking_count: number
  private_status: number
}

export interface WeeklySessionDetails {
  id: string
  days: string
  category_name: string
  sub_category_name: string
  age_group: string
  session_name: string
  start_date: string
  start_time: string
  end_time: string
  end_date: string
  session_type: string
  fee_for_member: string
  fee_for_nonmember: string
  coach_names: string
  coach_images: string
  description: string
  duration: string
  is_paid: boolean
  firebase_categorykey: string
  firebase_subcategorykey: string
  ParentClub: ParentClub
  club: Club
  ActivityDetails: ActivityDetails
  allow_paylater: boolean;
  allow_bacs_payment: boolean;
  is_loyalty_allowed: boolean;
  is_fixed_loyalty_allowed: boolean
  fixed_loyalty_points: number;
  allow_cash_payment: boolean;
  apply_capacity_restriction: boolean;
  minimum_booking_count: number;
  payment_instructions: string;
  approve_first_booking: boolean;
  no_of_weeks: number;
  capacity: number;
  private_status: number;
  first_booking_message: string;
  contact_phone: string;
  contact_email: string;
  primaryCoaches: WeeklySessionCoachesDto[]
  secondaryCoaches: WeeklySessionCoachesDto[]
  advance_booking_weeks: number;
  advance_visible_sessions: number;
  weeklySessionDays: WeeklySessionDays[];
  discounts: WeeklySessionDiscountDto[]
}

interface ParentClub {
  Id: string
  ParentClubName: string
  FireBaseId: string
  ParentClubAdminEmailID: string
  ParentClubAppIconURL: string
}

interface Club {
  ClubName: string
  Id: string
  FirebaseId: string
}

interface ActivityDetails {
  Id: string
  ActivityName: string
  ActivityCode: string
  FirebaseActivityKey: string
}

interface WeeklySessionCoachesDto {
  id: string
  coach_type: string
  coach: CoachDetail
}

interface CoachDetail {
  coach_firebase_id: string
  first_name: string
  last_name: string
  profile_image: string
}


export interface WeeklySessionDays {
  id: string
  session_name: string
  session_date: string
  session_day: string
  start_time: string
  end_time: string
  cancelled_date: string
  cancelled_by: string
  cancelled_reason: string
  is_cancelled: boolean
  capacity: string
  capacity_left: string
  bookingCount: number
  private_status: number;
  weeklySessionMember: WeeklyMemberDto[]
  weeklySession: WeeklySessionDetails;
}

interface WeeklyMemberDto {

  member: {
    Id: string
    FirstName: string
    LastName: string

  }
}

interface WeeklySessionDiscountDto {
  id: string,
  discount_name: string,
  discount_types: number,
  discount_percent: string,
  discount_amount: string,
  discount_session_count: number,
  advance_no_of_days: number,
  no_of_session: number,
  include_advance_booking_discount: boolean
}