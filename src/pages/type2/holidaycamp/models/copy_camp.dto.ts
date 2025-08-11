import { convertToMinutes } from "../functions/holidaycamp_utility";
import { HolidayCampDTO, SessionConfigDetails } from "./create_camp.dto";
import { HolidayCamp, HolidayCampSessionConfigDto, HolidayCampSessions } from "./holiday_camp.model";

export class CopyHolidayCampDTO {
    
    holidaycamp_details: HolidayCampDTO;
    session_config_details: SessionConfigDetails[];
    constructor(holidaycamp: HolidayCamp, session_configs: HolidayCampSessionConfigDto[]) {
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
        this.holidaycamp_details.camp_firebase_fields.venue_id = holidaycamp.venuekey;
        this.holidaycamp_details.camp_postgre_fields.activity_ids = [];
        this.holidaycamp_details.camp_postgre_fields.coach_ids = [];
        this.holidaycamp_details.camp_postgre_fields.parentclub_id = "";
        this.holidaycamp_details.camp_postgre_fields.venue_id = "";
        this.holidaycamp_details.camp_postgre_fields.club_id = "";
        this.holidaycamp_details.holidaycamp_name = holidaycamp.camp_name;
        this.holidaycamp_details.camp_type = holidaycamp.camp_type.toString();
        this.holidaycamp_details.venue_address = holidaycamp.venue_address;
        this.holidaycamp_details.venue_name = holidaycamp.venue_name;
        this.holidaycamp_details.venue_post_code = holidaycamp.venue_postcode;
        this.holidaycamp_details.venue_type = holidaycamp.venue_type;
        this.holidaycamp_details.clubname = holidaycamp.ClubName;
        this.holidaycamp_details.moderator = holidaycamp.moderator;
        this.holidaycamp_details.is_multi_sports = holidaycamp.is_multi_sport;
        this.holidaycamp_details.start_date = holidaycamp.start_date; // activity code
        this.holidaycamp_details.end_date = holidaycamp.end_date; // activity code
        this.holidaycamp_details.pay_by_date = holidaycamp.pay_by_date; // activity code
        this.holidaycamp_details.days = holidaycamp.days;
        this.holidaycamp_details.per_day_amount_for_member = holidaycamp.per_day_amount_for_member;
        this.holidaycamp_details.per_day_amount_for_non_member = holidaycamp.per_day_amount_for_non_member;
        this.holidaycamp_details.full_amount_for_member = holidaycamp.full_amount_for_member;
        this.holidaycamp_details.full_amount_for_non_member = holidaycamp.full_amount_for_non_member;
        this.holidaycamp_details.early_drop_fee = holidaycamp.early_drop_fees_member || "0.00";
        this.holidaycamp_details.early_drop_non_member_fee = holidaycamp.early_drop_fees_non_member || "0.00"; //as of now no interface
        this.holidaycamp_details.late_pickup_fee = holidaycamp.late_pickup_fees_member || "0.00";
        this.holidaycamp_details.late_pickup_non_member_fee = holidaycamp.late_pickup_fees_non_member || "0.00"; //as of now no interface
        this.holidaycamp_details.early_drop_time = holidaycamp.early_drop_time || null;//as of now no interface
        this.holidaycamp_details.late_pickup_time = holidaycamp.late_pick_up_time || null;//as of now no interface
        this.holidaycamp_details.is_allow_cash_payment = holidaycamp.is_allow_cash_payment;
        this.holidaycamp_details.is_lunch_allow = holidaycamp.is_lunch_allowed;//as of now no interface
        this.holidaycamp_details.is_snacks_allow = holidaycamp.is_snacks_allowed;
        this.holidaycamp_details.lunch_price = holidaycamp.lunch_price || "0.00";//as of now no interface
        this.holidaycamp_details.lunch_price_non_member = holidaycamp.lunch_price_non_member || "0.00"
        this.holidaycamp_details.snacks_price =  holidaycamp.snack_price || "0.00";//as of now no interface
        this.holidaycamp_details.snack_price_non_member = holidaycamp.snack_price_non_member || "0.00"
        this.holidaycamp_details.is_allow_childcare_voucher = holidaycamp.is_child_care_voucher_accepted;
        this.holidaycamp_details.is_allow_member_enrolment = true;
        this.holidaycamp_details.is_promotion_pushflag = false;
        // this.holidaycamp_details.is_promotion_pushflag = holidaycamp.IsPromotionPushFlag;
        this.holidaycamp_details.image_url = holidaycamp.ImageUrl || "";
        // this.holidaycamp_details.instructions = holidaycamp.Instruction || "";
        this.holidaycamp_details.squad_size = holidaycamp.capacity;
        this.holidaycamp_details.duration_per_day = holidaycamp.duration_per_day;
        this.holidaycamp_details.apply_squad_restriction = holidaycamp.is_restricted_squad_size;
        this.holidaycamp_details.is_early_late_pickup_allowed = false;//as of now no interface
        this.holidaycamp_details.holidaycamp_description = holidaycamp.holidaycamp_information || "";
        this.holidaycamp_details.member_enrolment_text = "Enrol";
        // this.holidaycamp_details.member_enrolment_text = holidaycamp.MemberAllowmentText;
        this.holidaycamp_details.minumum_session_booking = Number(holidaycamp.minimum_sessioncount) || 1;
        this.holidaycamp_details.age_group = holidaycamp.age_group || "";
        this.holidaycamp_details.lunch_text = holidaycamp.lunch_text || "";//as of now no interface
        this.holidaycamp_details.age_restriction = false,// as of now no interface; //send boolean in string
        this.holidaycamp_details.age_from = 0;// as of now no interface
        this.holidaycamp_details.age_to = 0; // as of now no interface
        //this.minimum_hours_for_lunch_and_snacks = holidaycamp.;
        //this.authorize_child_to_move_back_home = holidaycamp.;
        this.holidaycamp_details.is_agree_terms_conditions = false;// as of now no interface
        this.holidaycamp_details.show_additional_info = holidaycamp.show_additional_info || false;// as of now no interface

        for (let session of session_configs) {
            const session_config = new SessionConfigDetails();
            session_config.session_name = session.session_name;
            session_config.duration = convertToMinutes(session.duration);
            session_config.start_time = session.start_time;
            session_config.amount_for_member = session.amount_for_member;
            session_config.amount_for_non_member = session.amount_for_non_member;
            session_config.is_lunch_allowed = holidaycamp.is_lunch_allowed;//as of now no interface
            session_config.is_snacks_allowed = holidaycamp.is_snacks_allowed;
            session_config.capacity = Number(holidaycamp.capacity);
            this.session_config_details.push(session_config); // Add session_config to session_config_details array
        }

    }

}




