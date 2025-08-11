import { UserDeviceMetadata } from "../../../../shared/model/common.model";
import { SchoolDetails } from "../schoolsession.model"
import * as moment from "moment";

export class EditSchoolSession extends UserDeviceMetadata{
  school_session_id: string; 
  member_fee: string;
  non_member_fee: string;
  coach_id: string; //can be postgre or firebase, Can decide by req_type
  days: string;
  school_session_name: string;
  start_date: string;
  end_date: string;
  pay_by_date: string;
  group_status: string;
  start_time: string;
  duration: string;
  group_size: number;
  no_of_weeks:number;
  comments: string;
  auto_enrolment: boolean;
  allow_childcare: boolean;
  button_text_for_booking: string;
  button_text_for_reserve: string;
  // school_id:string;
  // club_id:string;
  updated_by?: string;

    constructor(){
      super();
    }

    static getSchoolSessionForEdit(school_session:SchoolDetails){
        const schoolSession = new EditSchoolSession();
        schoolSession.user_device_metadata = {
          UserAppType:0,
          UserDeviceType:0,
        }
        schoolSession.user_postgre_metadata = {
          UserMemberId:""
        }
        schoolSession.school_session_id = school_session.id;
        // schoolSession.school_id = school_session.ParentClubSchool.school.id;
        // schoolSession.club_id = school_session.ClubDetails.Id;
        schoolSession.member_fee = school_session.member_fee;
        schoolSession.non_member_fee = school_session.non_member_fee;
        schoolSession.days = school_session.days;
        schoolSession.school_session_name = school_session.school_session_name; 
        schoolSession.start_date = moment(school_session.start_date,"DD-MMM-YYYY").format("YYYY-MM-DD");
        schoolSession.end_date = moment(school_session.end_date,"DD-MMM-YYYY").format("YYYY-MM-DD");
        schoolSession.pay_by_date = school_session.pay_by_date;
        schoolSession.group_status = school_session.group_status.toString();
        schoolSession.start_time = school_session.start_time;
        schoolSession.duration = school_session.duration;
        schoolSession.group_size = school_session.group_size;
        schoolSession.comments = school_session.comments;
        schoolSession.no_of_weeks = school_session.number_of_week;
        schoolSession.auto_enrolment = school_session.auto_enrolment;
        schoolSession.allow_childcare = school_session.allow_childcare;
        schoolSession.button_text_for_booking = school_session.button_text_for_booking;
        schoolSession.button_text_for_reserve = school_session.button_text_for_reserve;
        return schoolSession;
    }

}