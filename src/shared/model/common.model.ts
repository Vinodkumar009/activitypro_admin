// /@InputType()
export abstract class CommonInputTypeDefs_V3 {
  ParentClubKey?: string; //ParentClub Key
  ClubKey?: string; //ParentClub Key
  MemberKey?: string; //ParentClub Ke
  AppType?: number; //Which app {0:Admin,1:Member,2:Applus}
  ActionType?: number;
  DeviceType?: number; //Which app {1:Android,2:IOS,3:Web,4:API}
}
export class CommonOutputTypeDefs {
  id: string;
  created_at: string;
  created_by: string;
  updated_at: string;
  is_active: boolean;
}


export class CommonIdFields {
  parentclub_id?: string;
  venue_id?: string; //schools
  club_id?: string; //clubs/venues
  activity_id?: string;
  coach_ids?: string[];
  module_id?: string; //using for camp_firebase_id, in future don't need
}

export class UserDeviceMetadata {
  user_device_metadata:{
    UserActionType?:number;
    UserAppType:number,
    UserDeviceType:number //this.sharedservice.getPlatform() == "android" ? 1:2
  }
  user_postgre_metadata:{
    UserParentClubId?: string; //ParentClub Key
    UserClubId?: string; //ParentClub Key
    UserMemberId?: string; //ParentClub Key
    UserActivityId?: string; 
  }
}

export class CommonRestApiDto {
  parentclubId?: string;
  clubId?: string;
  activityId?: string;
  memberId?: string;
  action_type?: number;
  device_type?: number;
  app_type?: number;
  device_id?: string;
}

export class CommonRestApiDtoV1 {
  parentclub_id?: string;
  club_id?: string;
  activity_id?: string;
  member_id?: string;
  action_type?: number;
  device_type?: number;
  app_type?: number;
  device_id?: string;
  updated_by?: string;
}
