import { SrvRecord } from "dns"
import { CommonInputTypeDefs_V3, CommonRestApiDto, CommonRestApiDtoV1 } from "../../../../shared/model/common.model"

export interface CreateLeagueMatchInput {
    MatchName: string
    CreatedBy: string
    LeagueId: string
    GroupId: string
    EndDate: string
    Stage: number
    Round:number
    MatchVisibility: number
    MatchDetails: string
    StartDate: string
    MatchPaymentType: number
    primary_participant_id: string
    secondary_participant_id: string
    location_id: string
    location_type: number
    user_postgre_metadata: UserPostgreMetadataField
    user_device_metadata: UserDeviceMetadataField
    Member_Fee: '0.00',
    Non_Member_Fee: '0.00';
}

export class CreateLeagueMatchInputV1 extends CommonRestApiDtoV1 {
  league_id: string;
  participant_ids: string[];
  round: number;
  match_status: number;
  match_name: string;
  group_id: string;
  stage: number;
  match_details: string;
  start_date: string;
  start_time: string;
  location_id: string;
  location_type: string;
  end_date: string;
  match_payment_type: number;
  member_fees: number;
  non_member_fees: number;
}

export class UserPostgreMetadataField {
    UserParentClubId: string
}

export class UserDeviceMetadataField {
    UserAppType: number
    UserActionType: number
    UserDeviceType: number
}

export interface LeagueGroup {
    id: string
    created_at: string
    created_by: string
    updated_at: string
    is_active: boolean

    name: string
    description: string
}

export interface LeagueGroupInput {
    ParentClubKey: string
    ParentClubId: string
    ClubKey: string
    ClubId: string
    MemberKey: string
    MemberId: string
    AppType: number
    ActionType: number
    DeviceType: number
    leagueId: string
    }

export interface CoachList{
    Id:string
    first_name:string
    last_name:string
    phone_no:string
    email_id:string
}

export interface SchoolList{
    id:string
    school_name:string
}