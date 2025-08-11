export class MonthlyAtteandanceDates{
    days:MonthlyAtteandanceDays[]
    pending_count:number
    total_count:number
    attendance_status:string
    attendance_status_text:string
    is_future_day:boolean
    present_count:number
    cancelled_count:number     
}

export class MonthlyAtteandanceDays{
    day:{
        day:string
        status?:number
      }
}

//response
export class MonthlyDayAtteandance{
    id:string
    attendance_id:string
    session_id:string
    comments:string
    cancel_reason:string
    attendance_status:number
    attendance_status_text:string
    user:AttendedUsers;
    star_of_the_week:boolean
    leaderboard_points:number
    isSelect?:boolean
}

export class AttendedUsers{
  Id:string
  FirstName:string
  LastName:string
  DOB:string
  Age:number
  isSelect?:boolean
}


export class AttendeesInfo{
  attendance_id: string
  member_id: string
  session_id: string
  comments: string
  cancel_reason: string
  star_of_the_week: boolean
  leaderboard_points:number
  attendance_status: number //1-CheckIn, 2-Update, 3-Cancellation
}

//input
export class MonthlySessionAttendanceInput{
    session_postgre_fields: {
        monthly_session_id: string
    }
    date: string
    user_device_metadata: { UserActionType: number }
    attendance_users: AttendeesInfo[]     
}