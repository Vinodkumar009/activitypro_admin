
// ===== EXISTING MODELS (unchanged) =====

import { ActivityModel } from "../../match/models/match.model";

export class LeaguesForParentClubModel {
  id: string;
  message: string;
  created_at: string;
  created_by: string;
  updated_at: string;
  is_active: boolean;
  league_name: string;
  activity: ActivityModel;
  league_type_text: string;
  league_category_text: string;
  league_type: number;
  league_category: number;
  league_age_group: string;
  league_logo_url: string;
  league_description: string;
  start_date: string;
  end_date: string;
  venueKey: string;
  league_visibility: number;
  club: ClubModel;
  coach: Coach;
  location: Location;
  location_id: string;
  location_type: number;
  last_enrollment_date: string;
  last_withdrawal_date: string;
  early_arrival_time: string;
  start_time: string;
  end_time: string;
  capacity: number;
  capacity_left: number;
  referee_type: number;
  referee_name: string;
  season: string;
  grade: string;
  rating_group: string;
  contact_email: string;
  contact_phone: string;
  secondary_contact_email: string;
  secondary_contact_phone: string;
  is_paid: boolean;
  member_price: string;
  non_member_price: string;
  is_pay_later: boolean;
  allow_bacs: boolean;
  allow_cash: boolean;
  show_participants: boolean;
}

export class Location {
  id: string;
  name: string;
}

export class Coach {
  Id: string;
  first_name: string;
  last_name: string;
  email_id: string;
}

export class Venue {
  VenueId: string;
  PostCode: string;
  VenueName: string;
}

export class CreateLeagueModel {
  id: string;
  message: string;
  created_at: string;
  created_by: string;
  updated_at: string;
  is_active: boolean;
  league_name: string;
  activity: ActivityModel;
  league_type: number;
  league_category: number;
  league_ageGroup: string;
  league_logoURL: string;
  league_description: string;
  start_date: string;
  end_date: string;
  venueKey: string;
}

export class LeagueStandingModel {
  id: string;
  parentclubteam: {
    teamName: string;
    id: string;
    ageGroup: string;
    teamVisibility: string;
    teamDescription: string;
  };
  wins: string;
  loss: string;
  rank: string;
  total_points: string;
  draw: string;
}

export class LeagueParticipantModel {
  id: string;
  participant_name: string;
  participant_id: string;
  matches: number;
  wins: number;
  loss: number;
  draw: number;
  rank: number;
  points: number;
  amount_pay_status: number;
  amount_pay_status_text: string;
  paidby: number;
  paidby_text: string;
  paid_amount: string;
  amount_due: string;
  paid_on: string;
  participant_status_text: string;
  participant_details: UserAndDetail;
  isSelected?: boolean;
}

export class ClubModel {
  Id: string;
  ClubName: string;
  FirebaseId: string;
}

export class UserAndDetail {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  parent_phone_number: string;
  parent_id: string;
  is_child: boolean;
  is_enable: boolean;
  parent_email: string;
  contact_email: string;
}

export class LeagueParticipationForMatchModel {
  id: string;
  participation_type: number;
  parentclubteam: ParentClubTeam;
}

export class ParentClubTeam {
  id: string;
  logo_url?: string;
  teamName: string;
  teamDescription: string;
}

export class User {
  selected?: boolean;
  Id: string;
  CreatedAt: string;
  CreatedBy: string;
  UpdatedAt: string;
  DeletedAt: string | null;
  UpdatedBy: string;
  IsActive: boolean;
  IsEnable: boolean;
  FirstName: string;
  LastName: string;
  Gender: string;
  DOB: string;
  member_type: number;
  FirebaseKey: string;
  media_consent: boolean;
  profile_status: string;
  MedicalCondition: "none";
}

export class Team {
  id: string;
  logo_url?: string;
  created_at: string;
  created_by: string;
  updated_at: string;
  deleted_at: string | null;
  updated_by: string;
  is_active: boolean;
  venueKey: string;
  club_id: string;
  venueType: number;
  ageGroup: string;
  teamName: string;
  teamStatus: number;
  teamVisibility: number;
  teamDescription: string;
}

export class Match {
  Id: string;
  CreatedAt: string;
  CreatedBy: string;
  UpdatedAt: string;
  DeletedAt: string | null;
  UpdatedBy: string;
  IsActive: boolean;
  IsEnable: boolean;
  MatchCreator: number;
  MatchVisibility: number;
  GameType: number;
  MatchType: number;
  PaymentType: number;
  ResultStatus: number;
  MatchStatus: number;
  RefreeFirebaseKey: string | null;
  RefreeName: string | null;
  VenueName: string;
  VenueFirebaseKey: string;
  Details: string;
  MemberFees: number;
  NonMemberFees: number;
  MatchStartDate: string;
  MatchEndDate: string;
  MatchDuration: string | null;
  Capacity: number;
  MatchTitle: string;
}

export class TeamRole {
  id: string;
  role_type: number;
  role_name: string;
  role_description: string | null;
}

export class SelectedPlayerScorersModel {
  playerId?: string;
  time?: string;
  playerObj: LeagueMatchParticipantModel;
}

export class LeagueMatchParticipantModel {
  disabled?: boolean;
  id: string;
  created_at: string;
  created_by: string;
  updated_at: string;
  deleted_at: string | null;
  updated_by: string;
  is_active: boolean;
  participation_status: number | null;
  invite_status: number;
  total_points: number;
  payment_status: number;
  payment_tracking: string | null;
  invite_type: number;
  initiator: string;
  amount_pay_status: number;
  paid_amount: string;
  paidby: number;
  cash_pay_to: string;
  payment_type: number;
  paid_on: string;
  participant_status: number;
  amount_due: string;
  total_amount: string;
  user: User;
  Team: Team;
  Match: Match;
  teamrole: TeamRole;
  amount_pay_status_text: string;
}

export interface ResultStatusModel {
  id: number;
  status: string;
}