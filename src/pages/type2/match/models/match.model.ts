export class MatchModel {
  VenueKey: string;
  Id: string;
  Message: string;
  CreatedAt: any;
  UpdatedAt: string;
  CreatedBy: string;
  IsActive: boolean;
  IsEnable: boolean;
  MatchCreator: string; //APP Name
  Activity: ActivityModel; //Which activity it is inside the member App
  MatchVisibility: number;
  GameType: number;
  MatchType: number;
  PaymentType: number;
  ResultStatus: number;
  MatchStatus: number;
  VenueName: string;
  Details: string;
  MemberFees: number;
  NonMemberFees: number;
  MatchStartDate: any;
  Result: ResultModel;
  Capacity: number;
  MatchTitle: string;
  Teams: TeamModel[];
  Hosts: UserModel;
}

export class ActivityModel {
  Id: string
  ActivityKey: string;
  IsActive: boolean;
  IsEnable: boolean;
  ActivityCode: string;
  ActivityName: string;
  ActivityImageURL: string;
}

export class ResultModel {
  ResultDetails: string;
  ResultStatus: number;
  PublishedByApp: string;
  Winner: TeamModel;
}

export class TeamModel {
  Id: string;
  TeamName: string;
  ResultStatus: number;
  TeamPoint: number;
  Description: string;
  CoachName: string;
  Participants: ParticipantModel[];
}

export class ParticipantModel {
  ParticipationStatus: number;
  PaymentStatus: number;
  PaymentTracking: string;
  InviteStatus: number;
  TotalPoints: number;
  User: UserModel;
  CreatedAt: string;
  UpdatedAt: string;
  InviteType: number;
  TotalPonumbers: number;
  Team: TeamModel[];
  Match: MatchModel;
}

export class UserModel {
  Id: string;
  Name: string;

  Gender: string;
  DOB: string;
  FirebaseKey: string;
}

//ladder model

export class LadderModel {
  IsActive: boolean;
  IsEnable: boolean;
  FirstName: string;
  LastName: string;
  rank: number;
  Points: number;
  IsSelf?: Boolean;
}
//invite players
export class MembersModel {
  Id: string
  FirstName: string;
  LastName: string;
  Gender: string;
  DOB: string;
  FirebaseKey?: string;
  isSelected?: boolean; // Add the 'selected' property
  isAlreadyExisted?: boolean; // Add the 'isAlreadyExisted' property
}
//matchdetails

//create match
// export class MatchModel {
//    VenueKey:string;
//    Id:string;
//    Message:string;
//    CreatedAt:string;
//    UpdatedAt:string;
//    CreatedBy: string;
//    IsActive:boolean;
//    IsEnable :boolean;
//    MatchCreator: string; //APP Name
//   ActivityModel Activity; //Which activity it is inside the member App
//   int MatchVisibility: string;
//   int GameType: string;
//   int MatchType: string;
//   int PaymentType: string;
//    ResultStatus:number;
//    MatchStatus: number;
//    VenueName :string;
//    Details: string;
//    MemberFees:number; //
//    NonMemberFees:number; //
//    MatchStartDate:string;
//   ResultModel Result;
//    Capacity:number;
//    MatchTitle;
//   List<TeamModel> Teams;
//   UserModel Host;

//   }

export class UpdateLeagueCoachData {
  id: string;
  coach_id: string;
  first_name: string;
  last_name: string;
  profile_image: string;
}

export class UpdateLeagueCoachResponse {
  status: number;
  message: string;
  data: UpdateLeagueCoachData[];
  type: string;
  isArray: boolean;
}

export class MatchCoachData {
  id: string;
  coach: {
    Id: string;
    first_name: string;
    last_name: string;
    profile_image: string;
  };
}

export class MatchCoachResponse {
  status: number;
  message: string;
  data: MatchCoachData[];
  type: string;
  isArray: boolean;
}

export class FetchAllMatchesInput {
  parentclubId: string; // 🏢 Parent club ID
  clubId: string; // 🏢 Club ID
  activityId: string; // ⚽ Activity ID
  memberId: string; // 🧑‍ User/Member ID
  action_type: number; // ⚙️ Type of action
  device_type: number; // 📱 Type of device
  app_type: number; // 📱 Type of application
  device_id: string; // 🆔 Device identifier
  updated_by: string; // 🧑‍ Identifier of the updater
  created_by: string | null; // 🧑‍ Identifier of the creator (can be null)
  FetchType: number; // 🔍 Type of fetch operation
}
