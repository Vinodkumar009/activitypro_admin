
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
  enrol_count:number
  booking_count:number
  private_status:number
}

export interface WeeklySessionDetails {
  id: string
  days: string
  category_name:string
  sub_category_name:string
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
  is_paid:boolean
  firebase_categorykey: string
  firebase_subcategorykey: string
  ParentClub: ParentClub
  club: Club
  ActivityDetails: ActivityDetails
  allow_paylater: boolean;
  allow_bacs_payment: boolean;
  is_loyalty_allowed: boolean;
  is_fixed_loyalty_allowed:boolean
  fixed_loyalty_points:number;
  allow_cash_payment: boolean;
  apply_capacity_restriction: boolean;
  minimum_booking_count: number;
  payment_instructions:string;
  approve_first_booking: boolean;
  no_of_weeks: number;
  capacity:number;
  private_status: number;
  first_booking_message: string;
  contact_phone: string;
  contact_email: string;
  primaryCoaches: WeeklySessionCoachesDto[]
  secondaryCoaches: WeeklySessionCoachesDto[]
  advance_booking_weeks:number;
  advance_visible_sessions:number;
  weeklySessionDays: WeeklySessionDays[];
  discounts: WeeklySessionDiscountDto[]
}

interface ParentClub {
  Id: string
  ParentClubName: string
  FireBaseId: string
  ParentClubAdminEmailID: string
  ParentClubAppIconURL:string
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
  profile_image:string
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

interface ParentClub {
  ParentClubName: string;
}

interface Activity {
  ActivityName: string;
}

interface Club {
  ClubName: string;
  FirebaseId: string;
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
