import { ActivityModel } from "../../match/models/match.model";

export class TeamsForParentClubModel {
  id: string;
  short_name?: string;
  created_at: string;
  created_by: string;
  updated_at: string;
  is_active: boolean;
  activity: ActivityModel;
  venueKey: string;
  venueType: string;
  ageGroup: string;
  teamName: string;
  teamStatus: string;
  teamVisibility: string;
  parentClub: {
    FireBaseId: string;
  };
  club: {
    Id: string;
    ClubName: string;
    FirebaseId: string;
  };
}

export class MembersModel {
  id: string;
  FirstName: string;
  LastName: string;
  Gender: string;
  DOB: string;
  FirebaseKey: string;
}

export class StaffModel {
  id: string;
  name: string;
  email: string;
  role: string;
  postgres_parentclubId: string;
  firebase_coachkey: string;
  firebaseKey: string;
}

export class GetStaffModel {
  id: string;
  postgres_user_id: string;
  role_id: string;
  role: {
    role_name: string;
  };
  user_type: number;
  postgres_parentclubId: string;
  StaffDetail: {
    name: string;
    email: string;
    firebaseKey: string;
    firebase_coachkey: string;
  }
}

export class GetPlayerModel {
  id: string;
  user: {
    Id: string,
    FirstName: string,
    LastName: string,
    Gender: string,
    DOB: string,
    FirebaseKey: string;
    EmailID: string;
    is_child: boolean;
    parent_key: string;
  }
  teamrole: {
    role_type: string,
    role_name: string,
    role_description: string,
  }

}

export class ChatModel {
  Title: String;
  Message: String;
  FromKey: String;
  FromName: String;
  IsActive: boolean;
  CreatedAt: String;
  MessageKey: String;
}

