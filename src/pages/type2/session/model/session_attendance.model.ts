import { CommonIdFields, UserDeviceMetadata } from "../../../../shared/model/common.model";

export class TermSesAttendanceModifyDTO extends UserDeviceMetadata{
    session_postgre_fields:CommonIdFields;
    attendance_users: TermAttendanceUpdateUser[];
    date: string;
    cancel_reason: string;
  }


  
  export class TermAttendanceUpdateUser {
    attendance_id: string;
    member_id: string;
    session_id: string;
    comments: string;
    cancel_reason: string;
    star_of_the_week: boolean;
    leaderboard_points: number;
    attendance_status: number; // cancelled or attended
}


export class TermSessionAttendees {
  user_id: string;
  first_name: string;
  last_name: string;
  dob: string;
  session_id: string;
  attendance_id: string;
  attendance_date: string;
  attendance_status: number; // cancelled or attended
  // check_in_comments: string;
  // check_out_comments: string;
  // checked_in: number;
  // check_in_time: string;
  cancel_reason: string;
  leaderboard_points: number;
  star_of_the_week: boolean;
  isSelect?:boolean;
  isCancelled?:boolean;
}