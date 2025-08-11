import { IActivityDetails } from "../../../shared/model/activity.model"
import { IClubDetails } from "../../../shared/model/club.model"
import { ICoachDetails } from "../../../shared/model/coach.model"

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

export interface SchoolVenue {
    id: string
    school_name: string
    firebasekey: string
    firstline_address: string
    secondline_address: string
    email_id: string
    contact_no: string
    postcode: string
}


export interface SchoolDetails {
    id: string
    tot_enrol_count: number
    tot_amount: string
    paid_count: number
    pending_count: number
    tot_paid_amount: string
    tot_unpaid_amount: string
    school_session_name: string
    start_date: string
    end_date: string
    pay_by_date:string
    group_status:number;
    number_of_week:number;
    start_time: string
    end_time: string
    duration: string
    days: string;
    group_size: number
    member_fee: string
    non_member_fee: string
    capacity_left: number
    comments: string
    firebase_activitykey:string
    is_exist_activitycategory:boolean
    is_exist_activity_subcategory:boolean
    firebase_activity_categorykey:string;
    firebase_activity_subcategorykey:string;
    financial_yearkey:string;
    term_key:string;
    term_name:string;
    activity_category_name: string
    activity_subcategory_name: string
    coach_names: string
    auto_enrolment:boolean;
    allow_childcare:boolean;
    is_allow_paylater:boolean;
    is_allow_groupchat:boolean;
    show_in_apkids:boolean;
    member_visibility:boolean
    is_loyalty_allowed:boolean
    is_fixedloyalty_allowed:boolean
    fixed_loyalty_points:0.00
    allow_waitinglist:boolean
    is_allmember_to_edit_amendfees:boolean
    waitinglist_capacity:number

    button_text_for_booking:string;
    button_text_for_reserve:string;
    ClubDetails:IClubDetails;
    ActivityDetails:IActivityDetails;
    Images: {
        id: string
        image_url: string
    }
    CoachDetails: {
        Id: string
        coach_firebase_id:string
        first_name: string
        last_name: string
        profile_image:string
    }
    ParentClubSchool: {
        parentclub: {
            Id: string;
            FireBaseId:string
        }
        school: {
            id: string
            school_name: string
        }
    }
    additional_info?: {
        id: string
        title: string
        body: string
        buttonOneText: string
        buttonTwoText: string
        sequenceNo
        category
        term_action_type
        legalNotificationText
    }

    session_member:ISession_MemberEnrols[]
   
}

export interface ISession_MemberEnrols {
    id:string;
    passcode:string;
    member: ISessionMember;
    amount_due: string
    amount_pay_status: string;
    amount_pay_status_text:string;
    payment: ISessionMemberPayment
}

export interface ISessionMember{
    Id: string
    FirstName: string
    LastName: string
    DOB:string     
    FirebaseKey: string
    ParentEmailID: string
    ParentPhoneNumber:string
    EmailID:string
    PhoneNumber:string 
    ParentId:string 
    IsChild:boolean  
    Gender:string
    MedicalCondition:string       
}



export interface ISessionMemberPayment{
    order_id: string
    paidby: number;
    paidby_text: string;
    amount_pay_status: string
    amount_paid: string
    extra_charges: string
    transaction_no: string
    transaction_date: string
    admin_comments:string
    user_comments:string
}   