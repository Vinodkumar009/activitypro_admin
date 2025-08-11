export interface WeeklySessionDateDetailsInput {
    SessionDateId: string
}

interface Member {
    Id:string;
    ParentId:string;
    FirstName: string;
    LastName: string;
    DOB:string;
    Gender:string
    IsChild:boolean;
    IsEnable:boolean;
    ParentEmailID:string
    EmailID:string
    PhoneNumber:string
    ParentPhoneNumber:string
    MedicalCondition:string;
    FirebaseKey:string
}

export interface WeeklySession {
    id: string;
    session_name: string;
    start_date: string;
    end_date: string;
    duration: string;
    fee_for_member: string;
    fee_for_nonmember: string;
    coach_names: string | null;
    coach_images: string | null;
}

export interface WeeklySessionMember {
    id: string;
    capacity:number;
    passcode:string;
    capacity_left:number;
    amount_pay_status:number;
    paid_amount:string;
    amount_due:string;
    amount_pay_status_text:string
    admin_comments:string
    user_comments:string
    transaction_date:string
    paid_by:string
    paid_by_text:string
    total_amount:string;
    member: Member;
}

export interface GetWeeklySessionDateDetailsResponse {
        id:string;
        weeklySession: WeeklySession;
        session_name: string;
        bookingCount: number;
        totalPaid: number;
        totalPending: number;
        session_day: string;
        session_date: string;
        start_time: string;
        end_time: string;
        weeklySessionMember: WeeklySessionMember[];  
}
