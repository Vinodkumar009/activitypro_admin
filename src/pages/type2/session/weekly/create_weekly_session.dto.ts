


export class weekly_session_id_fields {
  parentclub_id: string
  venue_id: string
  club_id: string
  activity_id: string
  primary_coach_ids: string[]
  secondary_coach_ids: string[]
  weekly_session_id: string
}

export class CreateWeeklySession {

  AppType: number
  ActionType: number
  DeviceType: number
  camp_postgre_fields: weekly_session_id_fields
//  camp_firebase_fields: weekly_session_id_fields
  session_name: string
  start_date: string
  start_time: string
  end_date: string
  duration: string
  days: string[]
  catagory: string
  subCatagory: string
  age_group: string
  session_status: number
  show_in_apkids: boolean
  description: string
  number_of_weeks: number
  is_paid:boolean
  contact_email: string
  contact_phone: string
  apply_capacity_restriction: boolean
  capacity: number
  advance_booking_weeks: number
  advance_bookable_count: number
  advance_visible_sessions: number
  minimum_booking_count: number
  approve_first_booking: boolean
  first_booking_message: string
  fee_for_member: number
  fee_for_nonmember: number
  cancel_button_text: string
  advance_booking_availability: boolean
  allow_bacs_payment: boolean
  allow_cash_payment: boolean
  allow_pay_later: boolean
  allow_reward_loyality: boolean
  loyalty_mode: string
  is_fixed_loyalty_allowed: boolean
  fixed_loyalty_points: number
  payment_instructions: string
  firebase_categorykey: string
  firebase_subcategorykey: string
  pay_button_text: string
  discounts: CreateWeeklySessionDiscountDto[]
 
}



export class CreateWeeklySessionDiscountDto {
  discount_amount: string
  discount_percentage: string
  discount_name: string
  discount_type: number
  discount_session_count: number
  advance_no_of_days: number
  no_of_session: number
  include_advance_booking_discount: boolean
}

//all-->