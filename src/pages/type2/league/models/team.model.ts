// import { ActivityModel } from "../leagueinvite/creatematchforleague";

import { ActivityModel } from "../../match/models/match.model";

export class TeamsForParentClubModel {
  isSelected?: boolean; // Add the 'selected' property
  isAlreadyExisted?: boolean;
  id: string;
  message: string;
  created_at: string;
  created_by: string;
  updated_at: string;
  is_active: boolean;
  activity: ActivityModel;
  venueKey: string;
  venueType: string;
  ageGroup: string;
  teamName: string;
  short_name: string;
  teamStatus: string;
  teamVisiility: string;
  teamDescription: string;
  teamVisibility: string;
  parentClub: {
    FireBaseId: string;
    ParentClubName: string;
  }
  venue: {
    VenueName: string;
    LocationType: number;
    ParentClubKey: string;
    ClubKey: string;
  }
  isSelect: boolean;
  logo_url: string;
  is_club_team: boolean;

}

export interface TeamDetail {
  TeamName: string;
  Id: string;
  logo_url: string;
  teams_primary_color: string | null;
  activityId: string;
  ageGroup: string;
  teamStatus: number;
  venueType: number;
  team_type: number;
  teamDescription: string;
  club_id: string;
  NoOfPlayers: string;
  ActivityName: string;
  ActivityImageURL: string;
  UpcomingMatchesCount: string;
  parentClubId: string;
  processed_video_count: string;
  teamVisibility: number;
  is_club_team: boolean;
  club: {
    Id: string;
    ClubName: string;
    ClubShortName: string;
    FirebaseId: string;
    City: string;
    PostCode: string;
    MapLatitude: string;
    MapLongitude: string;
  };
}

export class EditTeamsForParentClubModel {
  id: string;
  message: string;
  created_at: string;
  created_by: string;
  updated_at: string;
  is_active: boolean;
  activity: ActivityModel;
  venue: VenueModel;
  ageGroup: string;
  teamName: string;
  teamStatus: string;
  teamVisiility: string;
  teamDescription: string;
  teamVisibility: string;


}

export class VenueModel {
  VenueName: string;
  venueKey: string;
  venueType: number;
}