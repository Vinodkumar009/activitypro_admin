import { convertToMinutes } from "../functions/holidaycamp_utility";
import { IFirebaseCreateCamp, ICampSessionConfig } from "./firebase_create_camp.dto";

export class camp_id_fields {
    parentclub_id: string;
    venue_id: string; //schools
    club_id: string; //clubs/venues
    activity_ids: string[];
    coach_ids: string[];
    camp_id: string;
}

export class HolidayCampDTO {
    camp_postgre_fields: camp_id_fields;
    camp_firebase_fields: camp_id_fields;
    holidaycamp_name: string;
    camp_type: string;
    venue_address: string;
    venue_name: string;
    venue_post_code: string;
    venue_type: string;
    clubname: string;
    moderator: string;
    is_multi_sports: boolean;
    start_date: string; // activity code
    end_date: string; // activity code
    pay_by_date: string; // activity code
    days: string;
    per_day_amount_for_member: string;
    per_day_amount_for_non_member: string;
    full_amount_for_member: string;
    full_amount_for_non_member: string;
    early_drop_fee: string;
    early_drop_non_member_fee: string;
    late_pickup_fee: string;
    late_pickup_non_member_fee: string;
    early_drop_time: string;
    late_pickup_time: string;
    is_allow_cash_payment: boolean;
    is_lunch_allow: boolean;
    is_snacks_allow: boolean;
    lunch_price: string;
    lunch_price_non_member:string;
    snacks_price: string;
    snack_price_non_member:string;
    is_allow_childcare_voucher: boolean;
    is_allow_member_enrolment: boolean;
    is_promotion_pushflag: boolean;
    image_url: string;
    instructions: string;
    squad_size: number;
    duration_per_day: string;
    apply_squad_restriction: boolean;
    is_early_drop_allowed:boolean;
    is_early_late_pickup_allowed: boolean;
    holidaycamp_description: string;
    member_enrolment_text: string;
    minumum_session_booking: number;
    age_group: string;
    lunch_text: string;
    age_restriction: boolean; //send boolean in string
    age_from: number;
    age_to: number; // in the 
    minimum_hours_for_lunch_and_snacks: string;
    authorize_child_to_move_back_home: boolean;
    is_agree_terms_conditions: boolean;
    show_additional_info: boolean;
    updated_by: string;

}

export class SessionConfigDetails {
    session_name: string;
    duration: string;
    start_time: string;
    amount_for_member: string;
    amount_for_non_member: string;
    is_lunch_allowed: boolean;
    is_snacks_allowed: boolean;
    capacity: number;
    //firebase_sessionkey:string;
}



export class CreateHolidayCampDTO {
    
    holidaycamp_details: HolidayCampDTO;
    session_config_details: SessionConfigDetails[];
    constructor(holidaycamp: IFirebaseCreateCamp, session_configs: ICampSessionConfig[]) {
        this.holidaycamp_details = new HolidayCampDTO(); // Initialize HolidayCampDetails
        this.session_config_details = []; // Initialize session_config_details as an empty array
        this.holidaycamp_details.camp_postgre_fields = {
            parentclub_id: "",
            venue_id: "", // Initialize with appropriate values
            club_id: "", // Initialize with appropriate values
            activity_ids: [],
            coach_ids: [],
            camp_id: "", // Initialize with appropriate values
        };
        this.holidaycamp_details.camp_firebase_fields = {
            parentclub_id: "",
            venue_id: "", // Initialize with appropriate values
            club_id: "", // Initialize with appropriate values
            activity_ids: [],
            coach_ids: [],
            camp_id: ""
        };
        this.holidaycamp_details.camp_firebase_fields.venue_id = ''
        //this.holidaycamp_details.camp_firebase_fields.venue_id = holidaycamp.VenueKey;
        this.holidaycamp_details.camp_postgre_fields.activity_ids = [];
        this.holidaycamp_details.camp_postgre_fields.coach_ids = [];
        this.holidaycamp_details.camp_postgre_fields.parentclub_id = "";
        this.holidaycamp_details.camp_postgre_fields.venue_id = holidaycamp.VenueKey;
        this.holidaycamp_details.camp_postgre_fields.club_id = "";
        this.holidaycamp_details.holidaycamp_name = holidaycamp.CampName;
        this.holidaycamp_details.camp_type = holidaycamp.CampType.toString();
        this.holidaycamp_details.venue_address = holidaycamp.VenueAddress;
        this.holidaycamp_details.venue_name = holidaycamp.VenueName;
        this.holidaycamp_details.venue_post_code = holidaycamp.VenuePostCode;
        this.holidaycamp_details.venue_type = holidaycamp.VenueType;
        this.holidaycamp_details.clubname = holidaycamp.ClubName;
        this.holidaycamp_details.moderator = holidaycamp.Moderator;
        this.holidaycamp_details.is_multi_sports = holidaycamp.IsMultiSports;
        this.holidaycamp_details.start_date = holidaycamp.StartDate; // activity code
        this.holidaycamp_details.end_date = holidaycamp.EndDate; // activity code
        this.holidaycamp_details.pay_by_date = holidaycamp.PayByDate; // activity code
        this.holidaycamp_details.days = holidaycamp.Days;
        this.holidaycamp_details.per_day_amount_for_member = holidaycamp.PerDayAmountForMember;
        this.holidaycamp_details.per_day_amount_for_non_member = holidaycamp.PerDayAmountForNonMember;
        this.holidaycamp_details.full_amount_for_member = holidaycamp.FullAmountForMember;
        this.holidaycamp_details.full_amount_for_non_member = holidaycamp.FullAmountForNonMember;
        this.holidaycamp_details.is_allow_cash_payment = holidaycamp.IsAllowCashPayment;
        this.holidaycamp_details.is_lunch_allow = holidaycamp.IsAllowLunch;
        this.holidaycamp_details.is_snacks_allow = holidaycamp.IsAllowSnacks;
        this.holidaycamp_details.lunch_price = holidaycamp.Latepickup_MemberFee || "0.00";
        this.holidaycamp_details.lunch_price_non_member = holidaycamp.Latepickup_NonMemberFee || "0.00";
        this.holidaycamp_details.lunch_text = holidaycamp.LunchText || ""; 
        this.holidaycamp_details.snacks_price = holidaycamp.SnacksPrice_Member || "0.00";
        this.holidaycamp_details.snack_price_non_member = holidaycamp.SnacksPrice_NonMember || "0.00";
        this.holidaycamp_details.is_allow_childcare_voucher = holidaycamp.AllowChildCare;
        this.holidaycamp_details.is_allow_member_enrolment = holidaycamp.IsAllowMemberEnrollment;
        this.holidaycamp_details.is_promotion_pushflag = false;
        // this.holidaycamp_details.is_promotion_pushflag = holidaycamp.IsPromotionPushFlag;
        this.holidaycamp_details.image_url = holidaycamp.ImageUrl || "";
        this.holidaycamp_details.instructions = holidaycamp.Instruction || "";
        this.holidaycamp_details.squad_size = holidaycamp.SquadSize;
        this.holidaycamp_details.duration_per_day = holidaycamp.DurationPerDay;
        this.holidaycamp_details.apply_squad_restriction = holidaycamp.IsrestrictedSquadSize;
        this.holidaycamp_details.is_early_drop_allowed = holidaycamp.IsAllowEarlyDrop;//
        this.holidaycamp_details.is_early_late_pickup_allowed = holidaycamp.IsAllowLatePickUp;
        this.holidaycamp_details.early_drop_fee = holidaycamp.Earlydrop_MemberFee ;
        this.holidaycamp_details.early_drop_non_member_fee = holidaycamp.Earlydrop_NonMemberFee ; 
        this.holidaycamp_details.late_pickup_fee = holidaycamp.Latepickup_MemberFee ;
        this.holidaycamp_details.late_pickup_non_member_fee = holidaycamp.Latepickup_NonMemberFee; 
        this.holidaycamp_details.early_drop_time = holidaycamp.Earlydrop_Time || "0:00";//as of now no interface
        this.holidaycamp_details.late_pickup_time = holidaycamp.Latepickup_Time || "0:00";//as of now no interface
        this.holidaycamp_details.holidaycamp_description = holidaycamp.Description || "";
        this.holidaycamp_details.member_enrolment_text = "Enrol";
        // this.holidaycamp_details.member_enrolment_text = holidaycamp.MemberAllowmentText;
        this.holidaycamp_details.minumum_session_booking = holidaycamp.MinSessionBooking || 1;
        this.holidaycamp_details.age_group = holidaycamp.AgeGroup;
        this.holidaycamp_details.age_restriction = false,// as of now no interface; //send boolean in string
        this.holidaycamp_details.age_from = 0;// as of now no interface
        this.holidaycamp_details.age_to = 0; // as of now no interface
        //this.minimum_hours_for_lunch_and_snacks = holidaycamp.;
        //this.authorize_child_to_move_back_home = holidaycamp.;
        this.holidaycamp_details.is_agree_terms_conditions = false;// as of now no interface
        this.holidaycamp_details.show_additional_info = true;// as of now no interface

        for (let session of session_configs) {
            const session_config = new SessionConfigDetails();
            session_config.session_name = session.SessionName;
            session_config.duration = convertToMinutes(session.Duration);
            session_config.start_time = session.StartTime;
            session_config.amount_for_member = session.AmountForMember;
            session_config.amount_for_non_member = session.AmountForNonMember;
            session_config.is_lunch_allowed = holidaycamp.IsAllowLunch || false;//as of now no interface
            session_config.is_snacks_allowed = holidaycamp.IsAllowSnacks || false;
            session_config.capacity = Number(holidaycamp.SquadSize);
            this.session_config_details.push(session_config); // Add session_config to session_config_details array
        }

    }

}




