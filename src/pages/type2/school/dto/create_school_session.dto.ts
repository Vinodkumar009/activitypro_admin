import { SchoolDetails } from "../schoolsession.model";
import * as moment from "moment";
export interface IFirebaseSchoolSessionDTO{
    CreatedDate: any,
    UpdatedDate: any,
    CreatedBy: string,
    UpdatedBy: string,
    SessionName: string;
    StartTime: string;
    IsActive: boolean;
    SchoolKey: string;
    SchoolName: string;
    ParentClubKey: string;
    ClubKey: string;
    FinancialYearKey: string;
    TermKey: string;
    Term: {},
    StartDate: string;
    EndDate: string;
    PayByDate: string;
    ActivityKey: string;
    ActivityCategoryKey:string;
    IsExistActivitySubCategory: boolean;
    ActivitySubCategoryKey: string;
    IsExistActivityCategory: boolean;
    SessionType: "School",
    Activity: {},
    CoachName: string;
    CoachKey: string;
    Days:string;
    Duration: string;
    GroupSize: string;
    Comments:string;
    SessionFee: string;
    BookingButtonText: 'Book Now',
    ReserveButtonText: 'Add to Waiting List',
    AutoEnrolment: boolean;//true
    NumberOfWeeks: number;
    PaymentType: string;
    IsAllMembertoEditAmendsFees: boolean,
    IsAllowGroupChat:boolean,
    ShowInAPKids:boolean,
    MemberVisibility:true,
    IsLoyaltyAllowed:boolean,
    IsFixedLoyaltyAllowed:boolean,
    FixedLoyaltyPoints:number,
    AllowChildCare:boolean,
    AllowWaitingList:boolean,     
    Waitinglist_Capacity:number;
}



export class school_session_ids{
    parentclub_id:string;
    school_id:string; //schools
    club_id: string; //clubs/venues
    activity_id:string;
    coach_id:string;
    //session_id: string;
}

export class SchoolSessionDTO{
    req_type:number;
    postgre_fields: school_session_ids;
    firebase_fields: school_session_ids;
    firebase_schoolsession_id: string;
    // coachkey: string;
    // activitykey: string;
    firebase_activity_categorykey: string; //firebase
    firebase_activity_subcategorykey: string; //firebase
    activity_category_name: string;
    activity_subcategory_name: string;
    financial_yearkey: string;
    school_name: string;
    start_date: string;
    end_date: string;
    start_time: string;
    duration: string;
    days: string;
    group_size: number;
    comments: string;
    term_key: string;
    is_exist_activity_category: boolean;
    is_exist_activity_subcategory: boolean;
    pay_by_date: string;
    number_of_weeks: number;
    session_fee: string;
    fee_for_nonmember:string;
    term_name: string;
    school_session_name: string;
    auto_enrolment: boolean;
    is_allow_groupchat:boolean
    show_in_apkids:boolean;
    is_fixed_loyalty_allowed:boolean;
    fixed_loyalty_points:string;
    allow_childcare: boolean;
    allow_waitinglist: boolean;
    allow_amend: boolean;
    waitinglist_capacity:number;
    button_text_for_booking: string;
    button_text_for_reserve: string
    updated_by?: string;
}



  

export class CreateSchoolSession{
    school_session:SchoolSessionDTO;
    constructor(school_session:IFirebaseSchoolSessionDTO){
        this.school_session = new SchoolSessionDTO(); // Initialize HolidayCampDetails
        this.school_session.postgre_fields = {
            parentclub_id: "",
            school_id: "", // Initialize with appropriate values
            club_id: "", // Initialize with appropriate values
            activity_id: "",
            coach_id: "",
            //session_id: "" // Initialize with appropriate values
        };
        this.school_session.firebase_fields = {
            parentclub_id: "",
            school_id: "", // Initialize with appropriate values
            club_id: "", // Initialize with appropriate values
            activity_id: "",
            coach_id: "",
            //session_id: "" // Initialize with appropriate values
        };
        

        //postgre fields
        this.school_session.postgre_fields.activity_id = "";
        this.school_session.postgre_fields.coach_id = "";
        this.school_session.postgre_fields.parentclub_id = "";
        //this.school_session.postgre_fields.school_id = school_session.;
        this.school_session.postgre_fields.club_id = "";

        //firebase fields
        this.school_session.firebase_fields.coach_id = school_session.CoachKey;
        this.school_session.firebase_fields.club_id = school_session.ClubKey;
        this.school_session.firebase_fields.parentclub_id = school_session.ParentClubKey;
        this.school_session.firebase_fields.activity_id = school_session.ActivityKey;
        this.school_session.postgre_fields.school_id = school_session.SchoolKey;
        this.school_session.school_session_name = school_session.SchoolName;
        this.school_session.req_type = 1;
        this.school_session.firebase_activity_categorykey = ""; //firebase
        this.school_session.firebase_activity_subcategorykey = ""; //firebase
        this.school_session.activity_category_name = "";
        this.school_session.activity_subcategory_name =  "";
        this.school_session.financial_yearkey = school_session.FinancialYearKey;
        this.school_session.school_name = school_session.SchoolName;
        this.school_session.start_date = school_session.StartDate;
        this.school_session.end_date = school_session.EndDate;
        this.school_session.start_time = school_session.StartTime;
        this.school_session.duration = school_session.Duration;
        this.school_session.days = school_session.Days;
        this.school_session.group_size = Number(school_session.GroupSize) || 20;
        this.school_session.comments = school_session.Comments;
        this.school_session.term_key = "";
        this.school_session.term_name = "";
        this.school_session.is_exist_activity_category = school_session.IsExistActivityCategory;
        this.school_session.is_exist_activity_subcategory = school_session.IsExistActivitySubCategory;
        this.school_session.pay_by_date = school_session.PayByDate;
        this.school_session.number_of_weeks = Number(school_session.NumberOfWeeks);
        this.school_session.session_fee = school_session.SessionFee;
        this.school_session.fee_for_nonmember = school_session.SessionFee;
        this.school_session.school_session_name = school_session.SessionName;
        this.school_session.auto_enrolment = school_session.AutoEnrolment || true;
        this.school_session.is_allow_groupchat = school_session.IsAllowGroupChat;
        this.school_session.show_in_apkids = school_session.ShowInAPKids;
        this.school_session.is_fixed_loyalty_allowed = school_session.IsFixedLoyaltyAllowed;
        this.school_session.fixed_loyalty_points = school_session.FixedLoyaltyPoints.toString() || "0.00";
        this.school_session.allow_childcare = school_session.AllowChildCare || false;
        this.school_session.allow_waitinglist = school_session.AllowWaitingList;
        this.school_session.allow_amend = school_session.IsAllMembertoEditAmendsFees;
        this.school_session.waitinglist_capacity = school_session.Waitinglist_Capacity;
        this.school_session.button_text_for_booking = school_session.BookingButtonText;
        this.school_session.button_text_for_reserve = school_session.ReserveButtonText;
        this.school_session.updated_by = "";
    }
   
}

export class CopySchoolSession{
    
    constructor(school_session:SchoolDetails){
        
    }


    static getSchoolSessionForCopy(schoolSession:SchoolDetails):SchoolSessionDTO{
        const school_session = new SchoolSessionDTO();
        school_session.postgre_fields = {
            parentclub_id:schoolSession.ParentClubSchool.parentclub.Id,
            school_id:schoolSession.ParentClubSchool.school.id, // Initialize with appropriate values
            club_id: schoolSession.ClubDetails.Id, // Initialize with appropriate values
            activity_id: schoolSession.ActivityDetails.Id,
            coach_id: schoolSession.CoachDetails[0].Id,
            //session_id: "" // Initialize with appropriate values
        };
        school_session.firebase_fields = {
            parentclub_id: schoolSession.ParentClubSchool.parentclub.FireBaseId,
            school_id: schoolSession.ParentClubSchool.school.id, // Initialize with appropriate values
            club_id: schoolSession.ClubDetails.FirebaseId, // Initialize with appropriate values
            activity_id: schoolSession.ActivityDetails.FirebaseActivityKey,
            coach_id: schoolSession.CoachDetails[0].coach_firebase_id,
            //session_id: "" // Initialize with appropriate values
        };
       
        //firebase fields
        // school_session.scl_session_firebase_fields.coach_id = school_session.CoachKey;
        // school_session.scl_session_firebase_fields.club_id = school_session.ClubKey;
        // school_session.scl_session_firebase_fields.parentclub_id = school_session.ParentClubKey;
        // school_session.scl_session_firebase_fields.activity_id = school_session.ActivityKey;
        // school_session.scl_session_postgre_fields.school_id = school_session.SchoolKey;

        school_session.firebase_activity_categorykey = schoolSession.firebase_activity_categorykey;
        school_session.firebase_activity_subcategorykey = schoolSession.firebase_activity_subcategorykey;
        school_session.school_session_name = schoolSession.school_session_name;
        school_session.activity_category_name = schoolSession.activity_category_name;
        school_session.activity_subcategory_name =  schoolSession.activity_subcategory_name;
        school_session.financial_yearkey = schoolSession.financial_yearkey;
        school_session.school_name = schoolSession.ParentClubSchool.school.school_name;
        school_session.start_date = moment(schoolSession.start_date,"DD-MMM-YYYY").format("YYYY-MM-DD")
        school_session.end_date = moment(schoolSession.end_date,"DD-MMM-YYYY").format("YYYY-MM-DD");
        school_session.start_time = schoolSession.start_time;
        school_session.duration = schoolSession.duration;
        school_session.days = schoolSession.days;
        school_session.group_size = Number(schoolSession.group_size) || 20;
        school_session.comments = schoolSession.comments;
        school_session.term_key = schoolSession.term_key;
        school_session.is_exist_activity_category = schoolSession.is_exist_activitycategory;
        school_session.is_exist_activity_subcategory = schoolSession.is_exist_activity_subcategory;
        school_session.pay_by_date = schoolSession.pay_by_date;
        school_session.number_of_weeks = schoolSession.number_of_week;
        school_session.session_fee = schoolSession.member_fee;
        school_session.fee_for_nonmember = schoolSession.non_member_fee;
        school_session.term_name = schoolSession.term_name || "";
        school_session.auto_enrolment = schoolSession.auto_enrolment || true;
        school_session.is_allow_groupchat = schoolSession.is_allow_groupchat || false;
        school_session.show_in_apkids = schoolSession.show_in_apkids || false;
        school_session.is_fixed_loyalty_allowed = schoolSession.is_fixedloyalty_allowed || false;
        school_session.fixed_loyalty_points = schoolSession.fixed_loyalty_points.toString() || "0.00";
        school_session.allow_childcare = schoolSession.allow_childcare || true;
        school_session.allow_waitinglist = schoolSession.allow_waitinglist || true;
        school_session.allow_amend = schoolSession.is_allmember_to_edit_amendfees || false;
        school_session.waitinglist_capacity = schoolSession.waitinglist_capacity || 10;
        school_session.button_text_for_booking = schoolSession.button_text_for_booking || "Book Now";
        school_session.button_text_for_reserve = schoolSession.button_text_for_reserve || "Add to Waiting List";
        school_session.updated_by = "";
        return school_session;
    }
   
}


