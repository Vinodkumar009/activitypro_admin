export class SessionAttendanceDates {
    attendance_dates:AttendanceDatesInfo[];
    active_member_count: number;
}

export class AttendanceDatesInfo {
  attendance_date: string;
  pending_count: number;
  present_count: number;
  cancelled_count: number;
  //cancel_reason: string;
  is_future_day:boolean;
}