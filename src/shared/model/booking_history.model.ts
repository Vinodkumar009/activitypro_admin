export interface TermPendingPaymentSessions {
    enrol_id: string;
    amount_due: string;
    amount_pay_status: number;
    user_id: string;
    user_first_name: string;
    user_last_name: string;
    user_firebase_key: string | null;
    session_id: string;
    session_firebase_key: string | null;
    session_fee: string;
    session_fee_for_nonmember: string;
    session_name: string;
    session_start_date: string;
    session_end_date: string;
    session_start_time: string;
    session_duration: string;
    session_days: string;
    term_name: string;
    activity_category_name: string;
    activity_subcategory_name: string;
    club_id: string;
    club_details_firebase_id: string | null;
    club_name: string;
    coach_id: string;
    coach_firebase_id: string | null;
    coach_first_name: string;
    coach_last_name: string;
    activity_id: string;
    activity_firebase_id: string | null;
    activity_name: string;
    formatted_start_date: string;
    formatted_end_date: string;
    calculated_end_time: string;
}

export interface TermPendingPaymentsModel {
    totalCount: string;
    totalDueAmountSum: string;
    pending_sessions: TermPendingPaymentSessions[];
}

export interface WeeklyPendingPaymentSessions {
    id: string;
    amount_pay_status: number;
    paid_amount: number;
    amount_due: number;
    total_amount: number;
    passcode: string;
    user_id: string;
    FirstName: string;
    LastName: string;
    session_name: string;
    start_time: string;
    start_date: string;
    end_date: string;
    duration: string;
    days: string;
    no_of_weeks: number;
    description: string;
    fee_for_member: number;
    fee_for_nonmember: number;
    coach_first_name: string,
    coach_last_name: string,
    ParentClubName: string
}

export interface WeeklyPendingPaymentModel {
    totalCount: string;
    totalDueAmountSum: string;
    pending_sessions: WeeklyPendingPaymentSessions[];
}

export interface MonthlyPendingPaymentSessions {
    id: string;
    month: string;
    year: number;
    amount_due: string;
    amount_paid: string;
    month_value: number;
    monthly_session_member_id: string;
    end_month: string;
    enrolled_date: string;
    latest_payment_date: string | null;
    month_amount: string;
    next_payment_date: string | null;
    paused_for_months: number | null;
    paused_on: string | null;
    scheduled_payment_day: number;
    start_month: string;
    trial_days: number;
    activity_category_name: string;
    activity_subcategory_name: string;
    days: string;
    duration: string;
    free_months: number;
    session_name: string;
    session_type: string;
    user_id: string;
    FirstName: string;
    LastName: string;
}

export interface MonthlyPendingPaymentModel {
    totalCount: string;
    totalDueAmountSum: string;
    pending_sessions: MonthlyPendingPaymentSessions[];
}

export interface HoldiayCampPendingSessions {
    id: string;
    userid: string;
    username: string;
    campname: string;
    sessionid: string;
    sessionname: string;
    sessiondate: string;
    venuename: string;
    enrolmentdate: string;
    enrolmentid: string;
}

export interface HoldiayCampPendingPaymentModel {
    totalCount: string;
    totalDueAmountSum: string;
    pending_sessions: HoldiayCampPendingSessions[];
}


// 📚 Interface for a single School Session Pending Payment entry
export interface SchoolSessionPendingSessions {
    id: string;
    amount_due: string;
    amount_pay_status: number;
    paid_amount: string;
    paid_on: string | null;
    total_amount: string;
    user_id: string;
    FirstName: string;
    LastName: string;
    activity_category_name: string;
    capacity_left: number;
    days: string;
    start_time: string; // ⏰ Added start_time
    duration: string;
    end_date: string;
    member_fee: string;
    non_member_fee: string;
    start_date: string;
    school_name: string;
    school_session_name: string;
    group_size: number;
    group_status: number;
    coach_first_name: string; // 🧑‍🏫 Added coach_first_name
    coach_last_name: string; // 🧑‍🏫 Added coach_last_name
    ClubName: string; // 🏢 Added ClubName
}

// 📦 Interface for the full School Session Pending Payments API response
export interface SchoolSessionPendingPaymentModel {
    pending_sessions: SchoolSessionPendingSessions[]; // Array of the session models
    totalCount: string; // Total count as a string
    totalDueAmountSum: string; // Total amount sum as a string
}