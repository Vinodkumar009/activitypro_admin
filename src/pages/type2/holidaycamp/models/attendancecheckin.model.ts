export class UserAttendance {
  memberKey: string;
  attendanceStatus: number;
}
export class UserPasscode {
  firebaseKey: string;
  passcode: string;
  sessionKey:string;
  message:string;
}

export class AttendanceDetails {
  ParentClubKey: string;
  MemberKey: string;
  AppType: 0;
  ActionType: 0;
  holidayCampPostGresId: string;
  sessionPostGresId: string;
  attendance_type: number;
  holidayCampFirebaseKey: string;
  sessionFirebaseKey: string;
}

export class AttendanceCheckIn_Out{
  ParentClubKey: string;
  MemberKey: string;
  AppType: number;
  ActionType: number;
  deviceId:string;
  platform:string;
  members: UserAttendanceInput[];
  time: string;
  comments: string;
  attendance_type: number;
  holidayCampFirebaseKey: string;
  sessionFirebaseKey: string;
}

export class UserAttendanceInput {
  memberKey: string;
  comments: string;
  attendance_status: number;
  leaderboardpoints: number;
  star_of_the_session: number;
}