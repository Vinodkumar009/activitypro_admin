export class MonthlySessionEnrolInput{
    session_postgre_fields: {
        monthly_session_id: string;
    }
    user_device_metadata:{ UserActionType:number,UserAppType?:number,UserDeviceType?:number } //1
    enroll_users:enrol_info[]
    updated_by:string
}

export class enrol_info{
    member_id: string
    //enroll_start_month: string
    enrolled_days: string
    enrolled_date: string // //"Januray-2024" not required for enrol
    subscription_status?: number //1 not required for enrol
    subscription_date?: string
    is_active: true
}

export class MonthlySessionMoveMember extends MonthlySessionEnrolInput{
    old_enrolment_id: string;
}