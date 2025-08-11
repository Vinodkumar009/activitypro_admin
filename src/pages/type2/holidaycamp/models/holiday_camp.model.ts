import { Activity, IClubDetails } from "../../../../shared/model/club.model";

export class HolidayCampsList {
    id: string;
    message: string;
    created_at: string;
    created_by: string;
    updated_at: string;
    is_active: boolean;
    enrolment_count: number;
    holidaycamps: [HolidayCamp];
}

export class HolidayCamp {
    is_multi_sport: boolean;
    capacity: number;
    minimum_sessioncount: number
    is_allow_cash_payment: boolean
    is_child_care_voucher_accepted: boolean
    pay_by_date: string
    venuekey: string;
    is_restricted_squad_size: boolean
    days: string
    bookingCount: number;
    bookedSessionCount: string;
    session_count: string;
    enrolment_count: string;
    id: string
    dueAmount: number
    paidAmount: number
    message: string
    created_at: string
    created_by: string
    updated_at: string
    is_active: boolean
    camp_name: string
    age_group: string
    camp_type: number
    ClubKey: string
    club_id: string
    ClubName: string
    Coach: CoachDetail[]
    Activity?: Activity[]
    holidaycamp_information: string
    duration_per_day: string
    is_early_drop_allowed: boolean
    early_drop_fees_member: string
    early_drop_fees_non_member: string
    is_late_pickup_allowed: boolean
    late_pickup_fees_member: string
    late_pickup_fees_non_member: string
    is_lunch_allowed: boolean
    is_snacks_allowed: boolean
    lunch_price: string
    lunch_price_non_member:string
    snack_price: string
    snack_price_non_member:string
    lunch_text: string
    early_drop_time:string;
    late_pick_up_time:string;
    start_date: string
    end_date: string
    full_amount_for_member: string
    full_amount_for_non_member: string
    ImageUrl: string
    IsAllowMemberEnrollement: boolean
    is_promotion_push_flag: boolean
    member_allowment_text: string
    moderator: string
    per_day_amount_for_member: string
    per_day_amount_for_non_member: string
    venue_address: string
    VenueKey: string
    venue_name: string
    venue_postcode: string
    venue_type: string
    // parentclub: ParentClub
    club?: IClubDetails
    sessions: HolidayCampSessions[]
    // images: [HolidayCampImage]
    // additional_info: [TermsMasterSelectResult]
    parentclub_firebasekey: string
    club_firebasekey: string
    show_additional_info:boolean;
    session_configs: HolidayCampSessionConfigDto[]
}

export class HolidayCampSessionConfigDto {
    id: string
    message: string
    created_at: string
    created_by: string
    updated_at: string
    is_active: boolean
    template_firebasekey: string
    key: string
    session_name: string
    session_date: string
    session_id: string
    amount_for_member: string
    amount_for_non_member: string
    session_day: string
    duration: string
    start_time: string
    end_time: string
    capacity: string
    is_lunch_allowed: string
    is_snacks_allowed: string
}

export class HolidayCampSessions {
    id: string
    message: string
    created_at: string
    created_by: string
    updated_at: string
    is_active: boolean
    session_name: string
    holidaycamp_id: string
    session_id: string
    amount_for_member: string
    amount_for_non_member: string
    session_date: string
    start_time: string
    end_time: string
    session_day: string
    duration: string
    is_lunch_allowed: boolean
    is_snacks_allowed: boolean
    capacity: boolean
    capacity_left: number
    bookingCount: number
}

export class CoachDetail {
    Id: string
    coach_firebase_id: string
    first_name: string
    last_name: string
    middle_name: string
    gender: string
    email_id: string
    password: string
    dob: string
    phone_no: string
    profile_image: string
}

export class CampUserEnrols {
    // isSelectAll: boolean;
    isSelect?: boolean;
    id: string
    session: HolidayCampSessions
    user: CampUsers
    holidaycamp: HolidayCamp
    enrollement_firebasekey: string
    amount_due: string
    amount_paid: string
    amount_pay_status: string
    amount_to_show: string
    other_comments: string
    paid_by: string
    total_fees_amount: string
    passcode: string
    passcode_type: string
    is_earlydrop_applied: boolean
    is_latepickup_applied: boolean
    is_lunch_opted: boolean
    is_snacks_opted: boolean
    transaction: HolidayCampTransactionDto
    attendanceDetails: HolidayCampAttendance
    // term_accepatances: [TermsAcceptanceDto]
}

export class HolidayCampAttendance {
    isSelectAll: boolean;
    isSelect: boolean;
    id: string
    message: string
    created_at: string
    created_by: string
    updated_at: string
    is_active: boolean
    checked_in: number
    checked_out: number
    check_in_time: string
    check_in_by: string
    check_in_comments: string
    check_in_details: string
    check_in_device_id: string
    check_in_platform: string
    check_in_apptype: string
    check_out_time: string
    check_out_by: string
    check_out_comments: string
    check_out_details: string
    check_out_device_id: string
    check_out_platform: string
    check_out_apptype: string
    attendance_info: string
    star_of_the_session?: number
    leaderboard_points?: string
    status: string
    canCheckin: boolean
    isPresent: boolean
    checkInStatus: boolean
}

export class CampUsers {
    ParentEmailID: string
    ParentPhoneNumber: string
    amount_due: number;
    amount_paid: number;
    Id: string
    Message: string
    CreatedAt: string
    UpdatedAt: string
    ParentClubKey: string
    ClubKey: string
    EmailID: string
    FirstName: string
    LastName: string
    FirebaseKey: string
    Gender: string
    DOB: string
    IsChild: string
    ParentId:string;
    ParentKey: string
    PhoneNumber: string
    // FamilyMember: [Int]
    EmergencyContactName: string
    EmergencyNumber: string
    MedicalCondition: string
    NotificationEmailAllowed: string
    PromoEmailAllowed: string
    Source: string
    IsAcceptTermAndCondition: string
    IsTakenConcentForm: string
    MemberStatus: string
    // Session: [Int]
    // WeeklySession: [Int]
    // HolidayCamp: [Int]
    // Tournament: [Int]
    CreatedBy: string
    DeletedAt: string
    UpdatedBy: string
    IsActive: boolean
    IsEnable: boolean
    enrollments: [CampUserEnrols]
}

export class EnrolStatus {
    enrol_status: boolean
    cartItems: [CampUserEnrols]
    enrolled_ids: [EnrolledIdDets]
    paymentMethods: [PaymentMethod]
    paymentMetadata: PaymentMetadata
}

export class PaymentMethod {
    id: string
    message: string
    created_at: string
    created_by: string
    updated_at: string
    is_active: boolean
    name: string
    type: number
    isDefault: string
    channel: string
    icon: string
    description: string
    payment_url: string
    priority: number
}

export class EnrolledIdDets {
    session_id: string
    enrolled_id: string
}

export class PaymentMetadata {
    application_fees: String
    extra_charge: String
    payment_type: String
}

export class HolidayCampTransactionDto {
    id: string
    message: string
    created_at: string
    created_by: string
    updated_at: string
    is_active: boolean
    amount_pay_status: any
    amount_paid: number
    total_discount: number
    paidby: number
    is_verified: boolean
    cash_pay_to: string
    transaction_no: string
    transaction_date: string
    total_fee_amt: string
    user_comments: string
    admin_comments: string
    order_id: string
}

export class PendingUsers{
    id: string
    sessionid:string
    userid: string
    username: string
    campname: string
    sessionname:string
    enrolmentdate: string
    venue_name:string
    enrolmentid:string
    is_selected?:boolean
}