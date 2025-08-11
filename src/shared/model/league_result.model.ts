// ===== LEAGUE RESULT MODELS AND INTERFACES =====


// Main League Result Model
export class LeagueResultModel {
  Id: string;
  CreatedAt: string;
  CreatedBy: string;
  UpdatedAt: string;
  DeletedAt?: string | null;
  UpdatedBy: string;
  IsActive: boolean;
  IsEnable: boolean;
  ResultDetails: string;
  resultDescription: string;
  ResultStatus: number;
  PublishedByApp: string;
  result_json: string;
  league_fixtures: LeagueFixtureInfo;
  Match?: any;
  Winner?: any;
  winner_league_participation?: any;
  loser_league_participation?: any;
}

// League Fixture Info
export class LeagueFixtureInfo {
  id: string;
  created_at: string;
  created_by: string;
  updated_at: string;
  deleted_at?: string | null;
  updated_by: string;
  is_active: boolean;
  result?: any;
  round: number;
  location_type: number;
  location_id: string;
}

// ===== API INPUT INTERFACES =====

// Updated League Match Result Input
export interface LeagueMatchResultInput {
  parentclubId: string;
  clubId: string;
  activityId: string;
  ActivityCode: number;
  memberId: string;
  action_type: number;
  device_type: number;
  app_type: number;
  device_id: string;
  updated_by: string;
  created_by: string;
  MatchId: string;
}

// Updated Publish League Result For Activities Input
export interface PublishLeagueResultForActivitiesInput {
  parentclubId: string;
  clubId: string;
  activityId: string;
  memberId: string;
  action_type: number;
  device_type: number;
  app_type: number;
  device_id: string;
  updated_by: string;
  created_by: string;
  activityCode: string;
  leaguefixtureId: string;
  homeLeagueParticipationId: string;
  awayLeagueParticipationId: string;
  Football?: FootballSectionModel;
  Tennis?: TennisSectionModel;
  Cricket?: CricketSectionModel;
}

// League Match Participant Input (unchanged)
export interface LeagueMatchParticipantInput {
  parentclubId: string;
  clubId: string;
  activityId: string;
  memberId: string;
  action_type: number;
  device_type: number;
  app_type: number;
  device_id: string;
  updated_by: string;
  LeagueId: string;
  MatchId?: string;
  TeamId?: string;
  TeamId2?: string;
  leagueTeamPlayerStatusType?: number;
}

// ===== FOOTBALL MODELS =====

export interface FootballSectionModel {
  LEAGUE_FIXTURE_ID?: string;
  result_description?: string;
  POTM?: POTMDetailModel[];
  HOME_TEAM?: FootballTeamStatsModel;
  AWAY_TEAM?: FootballTeamStatsModel;
  RESULT?: FootballResultStatsModel;
}

export interface FootballTeamStatsModel {
  TEAM_NAME?: string;
  TEAM_ID?: string;
  GOAL?: string;
  SHOTS?: string;
  SHOTS_ON_GOAL?: string;
  CORNERS?: string;
  FOULS_COMMITTED?: string;
  OFFSIDES?: string;
  BALL_POSSESSION?: string;
  YELLOW_CARD?: string;
  RED_CARD?: string;
  SCORE?: FootballScoreDetailModel[];
}

export interface FootballScoreDetailModel {
  PLAYER?: string;
  PLAYER_ID?: string;
  TIME?: string;
}

export interface POTMDetailModel {
  PLAYER?: string;
  PLAYER_ID?: string;
  TEAM?: string;
  TEAM_ID?: string;
}

export interface FootballResultStatsModel {
  DESCRIPTION: string;
  WINNER_ID: string;
  RESULT_STATUS: string;
}

// Football Result Model (for API response)
export interface FootballResultModel {
  result_description?: string;
  POTM?: POTMDetailModel[];
  LEAGUE_FIXTURE_ID?: string;
  HOME_TEAM?: FootballTeamStatsModel;
  AWAY_TEAM?: FootballTeamStatsModel;
  RESULT?: FootballResultStatsModel;
}

// ===== TENNIS MODELS =====

export interface TennisSectionModel {
  LEAGUE_FIXTURE_ID?: string;
  result_description?: string;
  result_dets?: string;
  POTM?: POTMDetailModel[];
  HOME_TEAM?: TennisTeamStatsModel;
  AWAY_TEAM?: TennisTeamStatsModel;
  SET_SCORES?: TennisSetScoreModel[];
}

export interface TennisTeamStatsModel {
  IS_WINNER?: boolean;
  NAME?: string;
  TEAM_ID?: string;
  SETS_WON?: number;
  GAMES_WON?: number;
  ACES?: number;
  DOUBLE_FAULTS?: number;
  FIRST_SERVE_PERCENTAGE?: string;
  WINNERS?: number;
  UNFORCED_ERRORS?: number;
  BREAK_POINTS_WON?: number;
}

export interface TennisSetScoreModel {
  SET_NUMBER?: number;
  SCORE?: string;
  WINNER?: string;
}

// Tennis Result Model (for API response)
export interface TennisResultModel {
  LEAGUE_FIXTURE_ID?: string;
  POTM?: POTMDetailModel[];
  HOME_TEAM?: TennisTeamStatsModel;
  AWAY_TEAM?: TennisTeamStatsModel;
  SET_SCORES?: TennisSetScoreModel[];
}

// ===== CRICKET MODELS =====

export interface CricketSectionModel {
  result_description?: string;
  result_details?: string;
  POTM?: string[];
  Team1?: CricketTeamStatsModel;
  Team2?: CricketTeamStatsModel;
}

export interface CricketTeamStatsModel {
  RUNS?: string;
  WICKETS?: string;
  OVERS?: string;
  FOURS?: string;
  SIXES?: string;
  EXTRAS?: string;
  RUN_RATE?: string;
  HIGHEST_PARTNERSHIP?: string;
  BATTING_SCORECARD?: CricketPlayerDetailModel[];
  BOWLING_FIGURES?: CricketPlayerDetailModel[];
}

export interface CricketPlayerDetailModel {
  PLAYER?: string;
  PLAYER_ID?: string;
  TIME?: string;
}
