import { EIDRM } from "constants"
import { convertToMinutes } from "../functions/holidaycamp_utility"
import { HolidayCamp, HolidayCampSessionConfigDto } from "./holiday_camp.model"

export class UpdateHolidayCampDTO {
    ParentClubKey: string
    MemberKey: string
    AppType: number
    ActionType: number
    holidaycamp_details: EditHolidayCampDetails
    session_config_details: EditSessionConfigDetails[]
}


export class EditHolidayCampDetails {
    holidaycampId: string
    holidaycamp_name: string
    additional_moderator:string;
    pay_by_date: string
    per_day_amount_for_member: string
    per_day_amount_for_non_member: string
    full_amount_for_member: string
    full_amount_for_non_member: string
    early_drop_fee: string
    early_drop_non_member_fee: string
    late_pickup_fee: string
    late_pickup_non_member_fee: string
    early_drop_time: string
    late_pickup_time: string
    is_late_pickup_allowed: boolean
    is_early_drop_allowed: boolean
    is_allow_cash_payment: boolean
    is_lunch_allow: boolean = false
    is_snacks_allow: boolean = false
    lunch_price: string = "0.00"
    snack_price_non_member = "0.00"
    lunch_price_non_member = "0.00"
    snacks_price: string = "0.00"
    is_agree_terms_conditions: boolean
    is_allow_childcare_voucher: boolean
    is_allow_member_enrolment: boolean
    is_promotion_pushflag: boolean
    image_url: string
    instructions: string
    squad_size: number
    duration_per_day: string
    apply_squad_restriction: boolean
    is_early_late_pickup_allowed: boolean = false
    holidaycamp_description: string
    member_enrolment_text: string
    minumum_session_booking: number
    age_group: string
    lunch_text: string
    age_restriction: boolean
    age_from: number
    age_to: number
    minimum_hours_for_lunch_and_snacks: string
    authorize_child_to_move_back_home: boolean
    show_additional_info: boolean

}

export class EditSessionConfigDetails {
    id: string
    session_name: string
    duration: string
    start_time: string
    amount_for_member: string
    amount_for_non_member: string
    is_lunch_allowed: Boolean = false
    is_snacks_allowed: Boolean = false
    capacity: number
}

export class UpadteHolidayCampDTO {
    // constructor() { }
    //updatecampsessions
    static updateCampDetails(campDet: HolidayCamp): EditHolidayCampDetails {
        const edit_Holidaycamp = new EditHolidayCampDetails();

        edit_Holidaycamp.holidaycampId = campDet.id;
        edit_Holidaycamp.holidaycamp_name = campDet.camp_name;
        edit_Holidaycamp.additional_moderator = campDet.moderator;
        edit_Holidaycamp.pay_by_date = campDet.pay_by_date; // activity code
        edit_Holidaycamp.per_day_amount_for_member = campDet.per_day_amount_for_member;
        edit_Holidaycamp.per_day_amount_for_non_member = campDet.per_day_amount_for_non_member;
        edit_Holidaycamp.full_amount_for_member = campDet.full_amount_for_member;
        edit_Holidaycamp.full_amount_for_non_member = campDet.full_amount_for_non_member;
        edit_Holidaycamp.is_lunch_allow = campDet.is_lunch_allowed;
        edit_Holidaycamp.is_snacks_allow = campDet.is_snacks_allowed;
        edit_Holidaycamp.lunch_price = campDet.lunch_price || "0.00";
        edit_Holidaycamp.snacks_price = campDet.snack_price || "0.00";
        edit_Holidaycamp.lunch_price_non_member = campDet.lunch_price_non_member || "0.00"
        edit_Holidaycamp.snack_price_non_member = campDet.snack_price_non_member || "0.00"
        edit_Holidaycamp.early_drop_fee = campDet.early_drop_fees_member || "0.00";
        edit_Holidaycamp.early_drop_non_member_fee = campDet.early_drop_fees_non_member || "0.00"; 
        edit_Holidaycamp.late_pickup_fee = campDet.late_pickup_fees_member || "0.00";
        edit_Holidaycamp.late_pickup_non_member_fee = campDet.late_pickup_fees_non_member || "0.00";
        edit_Holidaycamp.early_drop_time = campDet.early_drop_time || null;
        edit_Holidaycamp.late_pickup_time = campDet.late_pick_up_time || null;
        edit_Holidaycamp.is_early_drop_allowed = campDet.is_early_drop_allowed;
        edit_Holidaycamp.is_late_pickup_allowed = campDet.is_late_pickup_allowed;
        edit_Holidaycamp.is_allow_cash_payment = campDet.is_allow_cash_payment;
        edit_Holidaycamp.is_agree_terms_conditions = true;
        edit_Holidaycamp.is_allow_childcare_voucher = campDet.is_child_care_voucher_accepted;
        edit_Holidaycamp.is_allow_member_enrolment = campDet.IsAllowMemberEnrollement;
        edit_Holidaycamp.is_promotion_pushflag = false;
        edit_Holidaycamp.is_early_drop_allowed = campDet.is_early_drop_allowed;
        edit_Holidaycamp.image_url = campDet.ImageUrl || "";
        edit_Holidaycamp.instructions = "";
        edit_Holidaycamp.squad_size = Number(campDet.capacity);
        edit_Holidaycamp.duration_per_day = campDet.duration_per_day;
        edit_Holidaycamp.apply_squad_restriction = campDet.is_restricted_squad_size;
        edit_Holidaycamp.is_early_late_pickup_allowed = false;//as of now no interface
        edit_Holidaycamp.holidaycamp_description = campDet.holidaycamp_information || "";
        edit_Holidaycamp.member_enrolment_text = "Enrol";
        // edit_Holidaycamp.member_enrolment_text = edit_Holidaycamp.MemberAllowmentText;
        edit_Holidaycamp.minumum_session_booking = Number(campDet.minimum_sessioncount) || 1;
        edit_Holidaycamp.age_group = campDet.age_group;
        edit_Holidaycamp.lunch_text = campDet.lunch_text || "";//as of now no interface
        edit_Holidaycamp.age_restriction = false,// as of now no interface; //send boolean in string
        edit_Holidaycamp.age_from = 0;// as of now no interface
        edit_Holidaycamp.age_to = 0; // as of now no interface
        //minimum_hours_for_lunch_and_snacks = edit_Holidaycamp.;
        //authorize_child_to_move_back_home = edit_Holidaycamp.;
        edit_Holidaycamp.is_agree_terms_conditions = false;// as of now no interface
        edit_Holidaycamp.show_additional_info = campDet.show_additional_info;// as of now no interface

        return edit_Holidaycamp;
    }
    static updateSessionDetails(sessionConfig: HolidayCampSessionConfigDto[]): EditSessionConfigDetails[] {
        const session_config_details: EditSessionConfigDetails[] = []; // Initialize as an array

        for (let s of sessionConfig) {
            const session_config = new EditSessionConfigDetails();
            session_config.id = s.id;
            session_config.session_name = s.session_name;
            session_config.duration = convertToMinutes(s.duration);
            session_config.start_time = s.start_time;
            session_config.amount_for_member = s.amount_for_member;
            session_config.amount_for_non_member = s.amount_for_non_member;
            session_config.is_lunch_allowed = false; // Assuming no interface yet
            session_config.is_snacks_allowed = false;
            session_config.capacity = Number(s.capacity);
            session_config_details.push(session_config); // Add session_config to the array
        }

        return session_config_details;
    }


}
