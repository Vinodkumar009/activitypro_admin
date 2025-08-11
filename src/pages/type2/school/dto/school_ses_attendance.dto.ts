import { CommonIdFields } from "../../../../shared/model/common.model";




export class SchoolSessionAttendees {
  user_id: string;
  first_name: string;
  last_name: string;
  dob: string;
  session_id: string;
  session_member_id: string;
  attendance_id: string;
  attendance_date_for: string;
  check_in_comments: string;
  check_out_comments: string;
  checked_in: number;
  check_in_time: string;
  cancel_reason: string;
  leaderboard_points: number;
  star_of_the_week: boolean;
  isSelected?:boolean;
  isCancelled?:boolean;
}


export class AttendanceUpdate{
  session_id: string; //might
  check_in_details:string;
  attedance_date:string;
  attendees: AttendeesInfo[];
  ActionType: number; // 0 for insert, 1 for update, 2 for cancel
  cancel_reason?: string; // Reason for cancellation if ActionType is 2
}
export class SchoolUpdateAttendanceInput extends CommonIdFields{
  session_postgre_fields?: CommonIdFields;
  session_firebase_fields?: CommonIdFields;
  attendance_users: AttendeesInfo[];
  attendance_date: string;
  cancel_reason: string;
}

export class AttendeesInfo{
  session_member_id: string;
  checked_in: number;
  check_in_comments:string; 
  check_in_time: string;
  check_in_details:string; 
  check_in_device_id:string; 
  check_in_by:string;
  check_in_apptype:number;
  check_in_location:string;
  check_in_platform:string;
  leaderboard_points:number;
  star_of_the_week:boolean;
  cancel_reason:string;
}