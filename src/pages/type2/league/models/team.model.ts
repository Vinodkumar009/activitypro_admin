// import { ActivityModel } from "../leagueinvite/creatematchforleague";

import { ActivityModel } from "../../match/models/match.model";

export class TeamsForParentClubModel {
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