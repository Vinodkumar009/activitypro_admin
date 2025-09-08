import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { IonicPage, ModalController, NavController, NavParams } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { CommonService, ToastMessageType, ToastPlacement } from '../../../../services/common.service';
import { AlertController } from 'ionic-angular/components/alert/alert-controller';
import { LeagueMatch } from '../models/location.model';
import { LeagueMatchParticipantModel, LeagueParticipationForMatchModel, SelectedPlayerScorersModel } from '../models/league.model';
import { HttpService } from '../../../../services/http.service';
import { API } from '../../../../shared/constants/api_constants';
import { LeagueTeamPlayerStatusType, LeagueMatchActionType } from '../../../../shared/utility/enums';
import { SharedServices } from '../../../services/sharedservice';
import { AppType } from '../../../../shared/constants/module.constants';
import { first } from 'rxjs/operators';
import {
  CricketSectionModel,
  FootballResultModel,
  FootballScoreDetailModel,
  FootballSectionModel,
  TennisSectionModel,
  LeagueResultModel,
  LeagueMatchResultInput,
  PublishLeagueResultForActivitiesInput,
  LeagueMatchParticipantInput,
  POTMDetailModel,
  FootballTeamStatsModel,
  FootballResultStatsModel
} from '../../../../shared/model/league_result.model';
import { AllMatchData, GetIndividualMatchParticipantModel } from '../../../../shared/model/match.model';
import { TeamsForParentClubModel } from '../models/team.model';

@IonicPage()
@Component({
  selector: 'page-summary_football',
  templateUrl: 'summary_football.html',
  providers: [HttpService]
})
export class SummaryFootballPage implements AfterViewInit {
  @ViewChild('doughnutCanvas', { read: ElementRef }) doughnutCanvas: ElementRef;

  // Component properties
  homeScore: string = '0';
  awayScore: string = '0';
  potmList: any;

  // League flow properties
  matchObj: LeagueMatch;
  homeTeamObj: LeagueParticipationForMatchModel;
  awayTeamObj: LeagueParticipationForMatchModel;

  // Match flow properties
  matchTeamObj: AllMatchData;
  hometeamMatchObj: TeamsForParentClubModel;
  awayteamMatchObj: TeamsForParentClubModel;

  // Common properties
  leagueId: string;
  activityId: string;
  activityCode: number;
  isLeague: boolean = false;
  selectedPlayersPotm: LeagueMatchParticipantModel[] = [];
  selectedPlayerhomeScorers: SelectedPlayerScorersModel[] = [];
  selectedPlayersawayScorers: SelectedPlayerScorersModel[] = [];
  selectedPOTMs: any[] = [];
  potmDisabled: boolean = false;
  leagueMatchParticipantRes: LeagueMatchParticipantModel[] = [];
  getIndividualMatchParticipantRes: GetIndividualMatchParticipantModel[] = [];
  getLeagueMatchResultRes: LeagueResultModel | null = null;
  publishLeagueResultForActivitiesRes: any;
  // result_json: FootballResultModel = {};
  result_json: FootballResultModel = {
    POTM: [],
    // POTM_PLAYERS: '',
    HOME_TEAM: {
      TEAM_NAME: '',
      TEAM_ID: '',
      GOAL: '0',
      SHOTS: '0',
      SHOTS_ON_GOAL: '0',
      CORNERS: '0',
      FOULS_COMMITTED: '0',
      OFFSIDES: '0',
      BALL_POSSESSION: '0.00',
      YELLOW_CARD: '0',
      RED_CARD: '0',
      SCORE: []
    },
    AWAY_TEAM: {
      TEAM_NAME: '',
      TEAM_ID: '',
      GOAL: '0',
      SHOTS: '0',
      SHOTS_ON_GOAL: '0',
      CORNERS: '0',
      FOULS_COMMITTED: '0',
      OFFSIDES: '0',
      BALL_POSSESSION: '0.00',
      YELLOW_CARD: '0',
      RED_CARD: '0',
      SCORE: []
    }
  };
  ishome: boolean = true;
  selectedTab: string = 'Stats';
  homePoss: string = '0.00';
  awayPoss: string = '0.00';
  rmaShotAttempts: string = '0.0';
  awayShotAttempts: string = '0.0';
  rmaFouls: string = '0.0';
  awayFouls: string = '0.0';
  isHomeStatsPopupVisible: boolean = false;
  isAwayStatsPopupVisible: boolean = false;

  // API Input Objects
  leagueMatchParticipantInput: LeagueMatchParticipantInput = {
    parentclubId: '',
    clubId: '',
    activityId: '',
    memberId: '',
    action_type: 0,
    device_type: 0,
    app_type: 0,
    device_id: '',
    updated_by: '',
    LeagueId: '',
    MatchId: '',
    TeamId: '',
    TeamId2: '',
    leagueTeamPlayerStatusType: 0
  };

  getIndividualMatchParticipantInput: GetIndividualMatchParticipantInput = {
    parentclubId: '',
    clubId: '',
    activityId: '',
    memberId: '',
    action_type: 0,
    device_type: 0,
    app_type: 0,
    device_id: '',
    updated_by: '',
    MatchId: '',
    TeamId: '',
    leagueTeamPlayerStatusType: 0
  };

  leagueMatchResultInput: LeagueMatchResultInput = {
    parentclubId: '',
    clubId: '',
    activityId: '',
    memberId: '',
    action_type: 0,
    device_type: 0,
    app_type: 0,
    device_id: '',
    updated_by: '',
    created_by: '',
    MatchId: '',
    ActivityCode: 0
  };

  publishLeagueResultForActivitiesInput: PublishLeagueResultForActivitiesInput = {
    parentclubId: '',
    clubId: '',
    activityId: '',
    memberId: '',
    action_type: 0,
    device_type: 0,
    app_type: 0,
    device_id: '',
    updated_by: '',
    created_by: '',
    activityCode: 0,
    leaguefixtureId: '',
    homeLeagueParticipationId: '',
    awayLeagueParticipationId: '',
    Football: {
      LEAGUE_FIXTURE_ID: '',
      result_description: '',
      POTM: [],
      HOME_TEAM: {
        TEAM_NAME: '',
        TEAM_ID: '',
        GOAL: '0',
        SHOTS: '0',
        SHOTS_ON_GOAL: '0',
        CORNERS: '0',
        FOULS_COMMITTED: '0',
        OFFSIDES: '0',
        BALL_POSSESSION: '0.00',
        YELLOW_CARD: '0',
        RED_CARD: '0',
        SCORE: [],

      },
      AWAY_TEAM: {
        TEAM_NAME: '',
        TEAM_ID: '',
        GOAL: '0',
        SHOTS: '0',
        SHOTS_ON_GOAL: '0',
        CORNERS: '0',
        FOULS_COMMITTED: '0',
        OFFSIDES: '0',
        BALL_POSSESSION: '0.00',
        YELLOW_CARD: '0',
        RED_CARD: '0',
        SCORE: []
      }
    }
  };

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public storage: Storage,
    public commonService: CommonService,
    public alertCtrl: AlertController,
    private httpService: HttpService,
    public sharedservice: SharedServices,
    public modalCtrl: ModalController
  ) {
    this.initializeComponent();
  }

  private initializeComponent(): void {
    try {
      // Get navigation parameters
      this.isLeague = this.navParams.get("isLeague") || false;

      // Initialize parameters based on flow type
      if (this.isLeague) {
        // League flow initialization
        this.matchObj = this.navParams.get("match");
        this.homeTeamObj = this.navParams.get("homeTeam");
        this.awayTeamObj = this.navParams.get("awayTeam");
        this.leagueId = this.navParams.get("leagueId");
      } else {
        // Match flow initialization
        this.matchTeamObj = this.navParams.get("match");
        this.hometeamMatchObj = this.navParams.get("homeTeam");
        this.awayteamMatchObj = this.navParams.get("awayTeam");
        this.leagueId = ""; // Empty string for match flow as per requirements
      }

      // Common parameters for both flows
      this.activityId = this.navParams.get("activityId");
      this.activityCode = this.navParams.get("activityCode");



      // Initialize API inputs
      this.initializeApiInputs();

      // Load data
      this.getMatchParticipants();
      this.getLeagueMatchResult();

    } catch (error) {
      console.error("Error initializing component:", error);
      this.commonService.toastMessage("Error initializing page", 3000, ToastMessageType.Error);
    }
  }







  private initializeApiInputs(): void {
    const baseInput = this.createBaseApiInput();

    // Initialize league match participant input with conditional data access
    this.leagueMatchParticipantInput = {
      ...baseInput,
      LeagueId: this.getLeagueId(),
      MatchId: this.getMatchId(),
      TeamId: this.getHomeTeamId(),
      TeamId2: this.getAwayTeamId(),
      leagueTeamPlayerStatusType: LeagueTeamPlayerStatusType.PLAYINGPLUSBENCH,
      ActivityCode: this.activityCode || 0
    };

    // Initialize individual match participant input for match flow
    this.getIndividualMatchParticipantInput = {
      ...baseInput,
      MatchId: this.getMatchId(),
      TeamId: this.getHomeTeamId(),
      leagueTeamPlayerStatusType: LeagueTeamPlayerStatusType.PLAYINGPLUSBENCH
    };

    // Initialize league match result input with conditional data access
    this.leagueMatchResultInput = {
      ...baseInput,
      MatchId: this.getMatchId(),
      ActivityCode: this.activityCode || 0
    };

    // Initialize publish league result input with conditional data access
    this.publishLeagueResultForActivitiesInput = {
      ...baseInput,
      activityCode: this.activityCode.toString() || '',
      leaguefixtureId: this.getLeagueFixtureId(),
      homeLeagueParticipationId: this.getHomeLeagueParticipationId(),
      awayLeagueParticipationId: this.getAwayLeagueParticipationId(),
      Football: {
        LEAGUE_FIXTURE_ID: this.getLeagueFixtureId(),
        result_description: '',
        POTM: [],
        HOME_TEAM: {
          TEAM_NAME: this.getHomeTeamName(),
          TEAM_ID: this.getHomeTeamId(),
          GOAL: '0',
          SHOTS: '0',
          SHOTS_ON_GOAL: '0',
          CORNERS: '0',
          FOULS_COMMITTED: '0',
          OFFSIDES: '0',
          BALL_POSSESSION: '0.00',
          YELLOW_CARD: '0',
          RED_CARD: '0',
          SCORE: []
        },
        AWAY_TEAM: {
          TEAM_NAME: this.getAwayTeamName(),
          TEAM_ID: this.getAwayTeamId(),
          GOAL: '0',
          SHOTS: '0',
          SHOTS_ON_GOAL: '0',
          CORNERS: '0',
          FOULS_COMMITTED: '0',
          OFFSIDES: '0',
          BALL_POSSESSION: '0.00',
          YELLOW_CARD: '0',
          RED_CARD: '0',
          SCORE: []
        }
      }
    };
  }

  // Helper methods for conditional data access with error handling
  private getMatchId(): string {
    try {
      if (this.isLeague) {
        return (this.matchObj && this.matchObj.match_id) ? this.matchObj.match_id : '';
      } else {
        return (this.matchTeamObj && this.matchTeamObj.MatchId) ? this.matchTeamObj.MatchId : '';
      }
    } catch (error) {
      console.error("Error getting match ID:", error);
      return '';
    }
  }

  private getLeagueId(): string {
    try {
      return this.isLeague ? (this.leagueId || '') : "";
    } catch (error) {
      console.error("Error getting league ID:", error);
      return '';
    }
  }

  private getHomeTeamId(): string {
    try {
      if (this.isLeague) {
        return (this.homeTeamObj && this.homeTeamObj.parentclubteam && this.homeTeamObj.parentclubteam.id)
          ? this.homeTeamObj.parentclubteam.id : '';
      } else {
        return (this.hometeamMatchObj && this.hometeamMatchObj.id)
          ? this.hometeamMatchObj.id : '';
      }
    } catch (error) {
      console.error("Error getting home team ID:", error);
      return '';
    }
  }

  private getAwayTeamId(): string {
    try {
      if (this.isLeague) {
        return (this.awayTeamObj && this.awayTeamObj.parentclubteam && this.awayTeamObj.parentclubteam.id)
          ? this.awayTeamObj.parentclubteam.id : '';
      } else {
        return (this.awayteamMatchObj && this.awayteamMatchObj.id)
          ? this.awayteamMatchObj.id : '';
      }
    } catch (error) {
      console.error("Error getting away team ID:", error);
      return '';
    }
  }

  private getHomeTeamName(): string {
    try {
      if (this.isLeague) {
        return (this.homeTeamObj && this.homeTeamObj.parentclubteam && this.homeTeamObj.parentclubteam.teamName)
          ? this.homeTeamObj.parentclubteam.teamName : 'Home Team';
      } else {
        return (this.hometeamMatchObj && this.hometeamMatchObj.teamName)
          ? this.hometeamMatchObj.teamName : 'Home Team';
      }
    } catch (error) {
      console.error("Error getting home team name:", error);
      return 'Home Team';
    }
  }

  private getAwayTeamName(): string {
    try {
      if (this.isLeague) {
        return (this.awayTeamObj && this.awayTeamObj.parentclubteam && this.awayTeamObj.parentclubteam.teamName)
          ? this.awayTeamObj.parentclubteam.teamName : 'Away Team';
      } else {
        return (this.awayteamMatchObj && this.awayteamMatchObj.teamName)
          ? this.awayteamMatchObj.teamName : 'Away Team';
      }
    } catch (error) {
      console.error("Error getting away team name:", error);
      return 'Away Team';
    }
  }

  private getLeagueFixtureId(): string {
    try {
      if (this.isLeague) {
        return (this.matchObj && this.matchObj.fixture_id) ? this.matchObj.fixture_id : '';
      } else {
        return (this.matchTeamObj && this.matchTeamObj.LeagueFixtureId) ? this.matchTeamObj.LeagueFixtureId : '';
      }
    } catch (error) {
      console.error("Error getting league fixture ID:", error);
      return '';
    }
  }

  private getHomeLeagueParticipationId(): string {
    try {
      if (this.isLeague) {
        return (this.homeTeamObj && this.homeTeamObj.id) ? this.homeTeamObj.id : '';
      } else {
        return (this.hometeamMatchObj && this.hometeamMatchObj.id) ? this.hometeamMatchObj.id : '';
      }
    } catch (error) {
      console.error("Error getting home league participation ID:", error);
      return '';
    }
  }

  private getAwayLeagueParticipationId(): string {
    try {
      if (this.isLeague) {
        return (this.awayTeamObj && this.awayTeamObj.id) ? this.awayTeamObj.id : '';
      } else {
        return (this.awayteamMatchObj && this.awayteamMatchObj.id) ? this.awayteamMatchObj.id : '';
      }
    } catch (error) {
      console.error("Error getting away league participation ID:", error);
      return '';
    }
  }

  private createBaseApiInput(): any {
    return {
      parentclubId: this.sharedservice.getPostgreParentClubId() || '',
      clubId: '',
      activityId: this.activityId || '',
      memberId: this.sharedservice.getLoggedInId() || '',
      action_type: this.isLeague ? 0 : LeagueMatchActionType.MATCH,
      device_type: this.sharedservice.getPlatform() === "android" ? 1 : 2,
      app_type: AppType.ADMIN_NEW,
      device_id: this.sharedservice.getDeviceId() || '',
      updated_by: '',
      created_by: ''
    };
  }



  get potmDisplayNames(): POTMDetailModel[] {
    if (!this.result_json || !this.getLeagueMatchResultRes) {
      return [];
    }
    let potm: POTMDetailModel[] = [];

    if (this.selectedPlayersPotm.length && this.selectedPlayersPotm[0].user) {
      potm = this.selectedPlayersPotm
        .map(s => ({
          PLAYER: `${s.user.FirstName} ${s.user.LastName}`.trim(),
          PLAYER_ID: s.user.Id,
          TEAM: s.Team.teamName,
          TEAM_ID: s.Team.id
        }))
        .filter(p => p.PLAYER.length > 0);

      // this.result_json.POTM_PLAYERS = potm.map(p => p.PLAYER).join(', ');
      return potm; // ✅ Return the new data
    }

    // Return existing data if no new selections
    return this.result_json.POTM.map(p => ({
      PLAYER: p.PLAYER || '',
      PLAYER_ID: p.PLAYER_ID || '',
      TEAM: p.TEAM || '',
      TEAM_ID: p.TEAM_ID || ''
    })) || [];
  }

  get scorerObjectsHome(): FootballScoreDetailModel[] {
    if (!this.result_json || !this.getLeagueMatchResultRes) {
      return [];
    }

    if (this.selectedPlayerhomeScorers.length > 0) {
      return this.selectedPlayerhomeScorers
        .map(s => ({
          PLAYER: `${s.playerObj.user.FirstName} ${s.playerObj.user.LastName}`.trim(),
          PLAYER_ID: s.playerObj.user.Id,
          TIME: s.time
        }))
        .filter(scorer => scorer.PLAYER.length > 0);
    }

    // Handle both old (Team1) and new (HOME_TEAM) structure
    const homeTeam = this.result_json.HOME_TEAM;
    if (homeTeam && homeTeam.SCORE) {
      return homeTeam.SCORE.map(scorer => ({
        PLAYER: scorer.PLAYER || '',
        PLAYER_ID: scorer.PLAYER_ID || '',
        TIME: scorer.TIME || ''
      }));
    }
    return [];
  }

  get scorerObjectsAway(): FootballScoreDetailModel[] {
    if (!this.result_json || !this.getLeagueMatchResultRes) {
      return [];
    }

    if (this.selectedPlayersawayScorers.length > 0) {
      return this.selectedPlayersawayScorers
        .map(s => ({
          PLAYER: `${s.playerObj.user.FirstName || ''} ${s.playerObj.user.LastName || ''}`.trim(),
          PLAYER_ID: s.playerObj.user.Id || s.playerId || '',
          TIME: s.time || ''
        }))
        .filter(scorer => scorer.PLAYER.length > 0);
    }

    // Handle both old (Team2) and new (AWAY_TEAM) structure
    const awayTeam = this.result_json.AWAY_TEAM;
    if (awayTeam && awayTeam.SCORE) {
      return awayTeam.SCORE.map(scorer => ({
        PLAYER: scorer.PLAYER || '',
        PLAYER_ID: scorer.PLAYER_ID || '',
        TIME: scorer.TIME || ''
      }));
    }
    return [];
  }

  // API Methods
  getLeagueMatchResult(): void {
    try {
      // Check if we have the minimum required data
      if (!this.leagueMatchResultInput.MatchId || !this.leagueMatchResultInput.ActivityCode) {
        console.warn("Missing required data for match result fetch, using defaults");
        this.initializeDefaultValues();
        return;
      }

      this.httpService.post(`${API.Get_League_Match_Result}`, this.leagueMatchResultInput).subscribe(
        (res: any) => {
          try {
            if (res && res.data) {
              this.getLeagueMatchResultRes = res.data;

              this.processLeagueMatchResult(this.getLeagueMatchResultRes.result_json);
            } else {

              this.initializeDefaultValues();
            }
          } catch (error) {
            console.error("Error processing league match result:", error);
            this.commonService.toastMessage("Error processing match result data", 3000, ToastMessageType.Error);
            this.initializeDefaultValues();
          }
        },
        (error) => {
          console.error("Error fetching league match result:", error);
          this.initializeDefaultValues();
        }
      );
    } catch (error) {
      console.error("Error in getLeagueMatchResult:", error);
      this.commonService.toastMessage("Error initializing match result request", 3000, ToastMessageType.Error);
      this.initializeDefaultValues();
    }
  }

  private processLeagueMatchResult(rawResultJson: any): void {
    if (typeof rawResultJson === 'string') {
      try {
        this.result_json = JSON.parse(rawResultJson) as FootballResultModel;
      } catch (err) {
        console.warn("Failed to parse result_json string, initializing empty object");
        this.result_json = {};
      }
    } else if (typeof rawResultJson === 'object' && rawResultJson !== null) {
      this.result_json = rawResultJson as FootballResultModel;
    } else {
      console.warn("Invalid result_json format, initializing empty object");
      this.result_json = {};
    }

    // Ensure team data is populated even if API returns empty values
    this.ensureResultJsonHasTeamData();

    // Update component properties from result_json
    this.updateComponentFromResultJson();
  }

  private updateComponentFromResultJson(): void {
    if (this.result_json) {
      // Handle both old (Team1/Team2) and new (HOME_TEAM/AWAY_TEAM) structure
      const homeTeam = this.result_json.HOME_TEAM;
      const awayTeam = this.result_json.AWAY_TEAM;

      if (homeTeam && awayTeam) {
        this.homeScore = homeTeam.GOAL.toString() || "0";
        this.awayScore = awayTeam.GOAL.toString() || "0";
        this.homePoss = homeTeam.BALL_POSSESSION || "0.00";
        this.awayPoss = awayTeam.BALL_POSSESSION || "0.00";

        // Redraw chart when data updates
        setTimeout(() => {
          this.drawDoughnutChart();
        }, 100);
      }
    }
  }

  private initializeDefaultValues(): void {
    this.result_json = {};
    this.ensureResultJsonHasTeamData();
    this.homeScore = "0";
    this.awayScore = "0";
    this.homePoss = "0.00";
    this.awayPoss = "0.00";
  }

  PublishLeagueResult(result_input: Partial<PublishLeagueResultForActivitiesInput>): void {
    try {
      // Validate input before making API call
      if (!result_input) {
        console.error("Result input is null or undefined");
        this.commonService.toastMessage("Invalid result data", 3000, ToastMessageType.Error);
        return;
      }

      if (!result_input.parentclubId || !result_input.activityId || !result_input.memberId) {
        console.error("Required fields missing in result input:", {
          parentclubId: result_input.parentclubId,
          activityId: result_input.activityId,
          memberId: result_input.memberId
        });
        this.commonService.toastMessage("Required data is missing", 3000, ToastMessageType.Error);
        return;
      }

      if (!result_input.Football || !result_input.Football.LEAGUE_FIXTURE_ID) {
        console.error("Football data or fixture ID is missing");
        this.commonService.toastMessage("Match fixture data is missing", 3000, ToastMessageType.Error);
        return;
      }

      this.httpService.post(`${API.Publish_League_Result_For_Activities}`, result_input).subscribe(
        (res: any) => {
          try {
            if (res && res.data) {

              this.commonService.toastMessage("Result published successfully", 2500, ToastMessageType.Success);
              if (this.isHomeStatsPopupVisible) this.isHomeStatsPopupVisible = false;
              if (this.isAwayStatsPopupVisible) this.isAwayStatsPopupVisible = false;
              this.getLeagueMatchResult();
            } else {

              this.commonService.toastMessage("No response data received", 2500, ToastMessageType.Info);
            }
          } catch (error) {
            console.error("Error processing publish result response:", error);
            this.commonService.toastMessage("Error processing result response", 3000, ToastMessageType.Error);
          }
        },
        (error) => {
          console.error("Error publishing league result:", error);

          let errorMessage = "Error publishing result";
          if (error.status === 0) {
            errorMessage = "Network connection error. Please check your internet connection.";
          } else if (error.status >= 500) {
            errorMessage = "Server error. Please try again later.";
          } else if (error.status === 404) {
            errorMessage = "Match not found for result publishing.";
          } else if (error.status === 401) {
            errorMessage = "Authentication error. Please log in again.";
          } else if (error.status === 400) {
            errorMessage = "Invalid data provided. Please check your input.";
          }

          this.commonService.toastMessage(errorMessage, 3000, ToastMessageType.Error);
        }
      );
    } catch (error) {
      console.error("Error in PublishLeagueResult:", error);
      this.commonService.toastMessage("Error preparing result data", 3000, ToastMessageType.Error);
    }
  }

  publishLeagueResultForActivities(): void {
    try {
      // Update Football section with current data
      if (this.publishLeagueResultForActivitiesInput.Football) {
        this.publishLeagueResultForActivitiesInput.Football.HOME_TEAM!.SCORE = this.scorerObjectsHome;
        this.publishLeagueResultForActivitiesInput.Football.AWAY_TEAM!.SCORE = this.scorerObjectsAway;
        this.publishLeagueResultForActivitiesInput.Football.HOME_TEAM!.BALL_POSSESSION = this.homePoss;
        this.publishLeagueResultForActivitiesInput.Football.AWAY_TEAM!.BALL_POSSESSION = this.awayPoss;
      }

      this.httpService.post(`${API.Publish_League_Result_For_Activities}`, this.publishLeagueResultForActivitiesInput).subscribe(
        (res: any) => {
          if (res.data) {
            this.publishLeagueResultForActivitiesRes = res.data;

            this.getLeagueMatchResult();
          } else {

          }
        },
        (error) => {
          console.error("Error in publishLeagueResultForActivities:", error);
          this.commonService.toastMessage("Error publishing activities result", 3000, ToastMessageType.Error);
        }
      );
    } catch (error) {
      console.error("Error preparing data for publishLeagueResultForActivities:", error);
    }
  }

  // Possession validation methods
  private validatePossessionValues(updatingTeam: 'home' | 'away'): boolean {
    try {
      // Validate input parameters
      if (updatingTeam !== 'home' && updatingTeam !== 'away') {
        console.error("Invalid updating team parameter:", updatingTeam);
        this.commonService.toastMessage("Invalid team parameter", 3000, ToastMessageType.Error);
        return false;
      }

      // Validate possession value format
      const homeValue = parseFloat(this.homePoss);
      const awayValue = parseFloat(this.awayPoss);

      if (isNaN(homeValue) || isNaN(awayValue)) {
        console.error("Invalid possession values:", { homePoss: this.homePoss, awayPoss: this.awayPoss });
        this.commonService.toastMessage("Possession values must be valid numbers", 3000, ToastMessageType.Error);
        return false;
      }

      // Check if both values were initially populated from API (both > 0)
      const bothInitiallyPopulated = this.areBothPossessionValuesPopulated();

      if (bothInitiallyPopulated) {
        // If both values were initially populated, ensure sum doesn't exceed 100
        const total = homeValue + awayValue;
        if (total > 100.01) { // Allow small rounding errors
          this.commonService.toastMessage(
            `Possession values cannot exceed 100%. Current total: ${total.toFixed(2)}%`,
            3000,
            ToastMessageType.Error
          );
          return false;
        }
      } else {
        // If either value was initially 0, validate only when both have values
        if (homeValue > 0 && awayValue > 0) {
          const total = homeValue + awayValue;
          if (total > 100.01) { // Allow small rounding errors
            this.commonService.toastMessage(
              `Possession values cannot exceed 100%. Current total: ${total.toFixed(2)}%`,
              3000,
              ToastMessageType.Error
            );
            return false;
          }
        }
      }

      // Validate individual values are within range
      if (homeValue < 0 || homeValue > 100) {
        this.commonService.toastMessage(
          'Home possession must be between 0% and 100%',
          3000,
          ToastMessageType.Error
        );
        return false;
      }

      if (awayValue < 0 || awayValue > 100) {
        this.commonService.toastMessage(
          'Away possession must be between 0% and 100%',
          3000,
          ToastMessageType.Error
        );
        return false;
      }

      // Validate decimal precision (max 2 decimal places)
      const homeDecimalPlaces = (this.homePoss.split('.')[1] || '').length;
      const awayDecimalPlaces = (this.awayPoss.split('.')[1] || '').length;

      if (homeDecimalPlaces > 2 || awayDecimalPlaces > 2) {
        this.commonService.toastMessage(
          'Possession values can have maximum 2 decimal places',
          3000,
          ToastMessageType.Error
        );
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error validating possession values:", error);
      this.commonService.toastMessage("Error validating possession values", 3000, ToastMessageType.Error);
      return false;
    }
  }

  private areBothPossessionValuesPopulated(): boolean {
    // Check if both possession values were populated from the API response
    if (!this.result_json || !this.result_json.HOME_TEAM || !this.result_json.AWAY_TEAM) {
      return false;
    }

    const apiHomeValue = parseFloat(this.result_json.HOME_TEAM.BALL_POSSESSION || '0');
    const apiAwayValue = parseFloat(this.result_json.AWAY_TEAM.BALL_POSSESSION || '0');

    return apiHomeValue > 0 && apiAwayValue > 0;
  }

  getMatchParticipants(): void {
    if (this.isLeague) {
      this.getLeagueMatchParticipant();
    } else {
      this.getIndividualMatchParticipant();
    }
  }

  getLeagueMatchParticipant(): void {
    try {
      // Check if we have the minimum required data
      if (!this.leagueMatchParticipantInput.MatchId || !this.leagueMatchParticipantInput.activityId) {
        this.leagueMatchParticipantRes = [];
        return;
      }

      // Skip if team IDs are missing (they might not be set up yet)
      if (!this.leagueMatchParticipantInput.TeamId || !this.leagueMatchParticipantInput.TeamId2) {
        this.leagueMatchParticipantRes = [];
        return;
      }

      // Skip if team IDs are the same
      if (this.leagueMatchParticipantInput.TeamId === this.leagueMatchParticipantInput.TeamId2) {
        this.leagueMatchParticipantRes = [];
        return;
      }

      this.commonService.showLoader("Fetching participants...");

      this.httpService.post(`${API.Get_League_Match_Participant}`, this.leagueMatchParticipantInput).subscribe(
        (res: any) => {
          this.commonService.hideLoader();
          try {
            if (res && res.data) {
              this.leagueMatchParticipantRes = Array.isArray(res.data) ? res.data : [];

              // Validate participant data structure
              if (this.leagueMatchParticipantRes.length === 0) {
                this.commonService.toastMessage("No participants found for this match", 2500, ToastMessageType.Info);
              }
            } else {
              this.leagueMatchParticipantRes = [];
              this.commonService.toastMessage("No participant data available", 2500, ToastMessageType.Info);
            }
          } catch (error) {
            this.commonService.toastMessage("Error processing participant data", 3000, ToastMessageType.Error);
            this.leagueMatchParticipantRes = [];
          }
        },
        (error) => {
          this.commonService.hideLoader();

          let errorMessage = "Error fetching participants";
          if (error.status === 0) {
            errorMessage = "Network connection error. Please check your internet connection.";
          } else if (error.status >= 500) {
            errorMessage = "Server error. Please try again later.";
          } else if (error.status === 404) {
            errorMessage = "Match participants not found.";
          } else if (error.status === 401) {
            errorMessage = "Authentication error. Please log in again.";
          }

          this.commonService.toastMessage(errorMessage, 3000, ToastMessageType.Error);
          this.leagueMatchParticipantRes = [];
        }
      );
    } catch (error) {
      this.commonService.hideLoader();
      this.commonService.toastMessage("Error initializing participant request", 3000, ToastMessageType.Error);
      this.leagueMatchParticipantRes = [];
    }
  }

  getIndividualMatchParticipant(): void {
    try {
      // Check if we have the minimum required data
      if (!this.getIndividualMatchParticipantInput.MatchId || !this.getIndividualMatchParticipantInput.activityId) {
        this.getIndividualMatchParticipantRes = [];
        return;
      }

      const homeTeamId = this.getHomeTeamId();
      const awayTeamId = this.getAwayTeamId();

      // Skip if team IDs are missing
      if (!homeTeamId || !awayTeamId) {
        this.getIndividualMatchParticipantRes = [];
        return;
      }

      // Skip if team IDs are the same
      if (homeTeamId === awayTeamId) {
        this.getIndividualMatchParticipantRes = [];
        return;
      }

      this.commonService.showLoader("Fetching participants...");

      // Fetch participants for home team first
      const homeTeamInput = { ...this.getIndividualMatchParticipantInput, TeamId: homeTeamId };

      this.httpService.post(`${API.GetIndividualMatchParticipant}`, homeTeamInput).subscribe(
        (homeRes: any) => {
          // Fetch participants for away team
          const awayTeamInput = { ...this.getIndividualMatchParticipantInput, TeamId: awayTeamId };

          this.httpService.post(`${API.GetIndividualMatchParticipant}`, awayTeamInput).subscribe(
            (awayRes: any) => {
              this.commonService.hideLoader();
              try {
                const homeParticipants = (homeRes && homeRes.data && Array.isArray(homeRes.data)) ? homeRes.data : [];
                const awayParticipants = (awayRes && awayRes.data && Array.isArray(awayRes.data)) ? awayRes.data : [];

                // Combine both teams' participants
                this.getIndividualMatchParticipantRes = [...homeParticipants, ...awayParticipants];

                // Validate participant data structure
                if (this.getIndividualMatchParticipantRes.length === 0) {
                  this.commonService.toastMessage("No participants found for this match", 2500, ToastMessageType.Info);
                }
              } catch (error) {
                this.commonService.toastMessage("Error processing participant data", 3000, ToastMessageType.Error);
                this.getIndividualMatchParticipantRes = [];
              }
            },
            (error) => {
              this.commonService.hideLoader();
              this.handleParticipantError(error);
            }
          );
        },
        (error) => {
          this.commonService.hideLoader();
          this.handleParticipantError(error);
        }
      );
    } catch (error) {
      this.commonService.hideLoader();
      this.commonService.toastMessage("Error initializing participant request", 3000, ToastMessageType.Error);
      this.getIndividualMatchParticipantRes = [];
    }
  }

  private handleParticipantError(error: any): void {
    let errorMessage = "Error fetching participants";
    if (error.status === 0) {
      errorMessage = "Network connection error. Please check your internet connection.";
    } else if (error.status >= 500) {
      errorMessage = "Server error. Please try again later.";
    } else if (error.status === 404) {
      errorMessage = "Match participants not found.";
    } else if (error.status === 401) {
      errorMessage = "Authentication error. Please log in again.";
    }

    this.commonService.toastMessage(errorMessage, 3000, ToastMessageType.Error);
    this.getIndividualMatchParticipantRes = [];
  }

  async updateHomeTeamStats() {
    try {
      // Validate possession before updating
      if (!this.validatePossessionValues('home')) {
        return;
      }

      // Validate required data structures
      if (!this.result_json || !this.result_json.HOME_TEAM) {
        console.error("Home team result data is missing");
        this.commonService.toastMessage("Home team data is not available", 3000, ToastMessageType.Error);
        return;
      }

      // Validate team data access
      const homeTeamName = this.getHomeTeamName();
      const homeTeamId = this.getHomeTeamId();
      const fixtureId = this.getLeagueFixtureId();

      if (!homeTeamName || !homeTeamId || !fixtureId) {
        console.error("Required home team data is missing:", { homeTeamName, homeTeamId, fixtureId });
        this.commonService.toastMessage("Required home team information is missing", 3000, ToastMessageType.Error);
        return;
      }

      // Validate base result input
      const baseInput = this.createBaseResultInput();
      if (!baseInput.parentclubId || !baseInput.activityId || !baseInput.memberId) {
        console.error("Base result input validation failed");
        this.commonService.toastMessage("Required user information is missing", 3000, ToastMessageType.Error);
        return;
      }

      const result_input: Partial<PublishLeagueResultForActivitiesInput> = {
        ...baseInput,
        Football: {
          LEAGUE_FIXTURE_ID: fixtureId,
          HOME_TEAM: {
            TEAM_NAME: homeTeamName,
            TEAM_ID: homeTeamId,
            GOAL: (this.result_json.HOME_TEAM.GOAL || 0).toString(),
            SHOTS_ON_GOAL: (this.result_json.HOME_TEAM.SHOTS_ON_GOAL || 0).toString(),
            CORNERS: (this.result_json.HOME_TEAM.CORNERS || 0).toString(),
            FOULS_COMMITTED: (this.result_json.HOME_TEAM.FOULS_COMMITTED || 0).toString(),
            OFFSIDES: (this.result_json.HOME_TEAM.OFFSIDES || 0).toString(),
            BALL_POSSESSION: this.homePoss || '0.00',
            YELLOW_CARD: (this.result_json.HOME_TEAM.YELLOW_CARD || 0).toString(),
            RED_CARD: (this.result_json.HOME_TEAM.RED_CARD || 0).toString(),
            SHOTS: (this.result_json.HOME_TEAM.SHOTS || 0).toString(),
          }
        }
      };

      this.PublishLeagueResult(result_input);
    } catch (error) {
      console.error("Error updating home team stats:", error);
      this.commonService.toastMessage("Error updating home team statistics", 3000, ToastMessageType.Error);
    }
  }

  async updateAwayTeamStats() {
    try {
      // Validate possession before updating
      if (!this.validatePossessionValues('away')) {
        return;
      }

      // Validate required data structures
      if (!this.result_json || !this.result_json.AWAY_TEAM) {
        console.error("Away team result data is missing");
        this.commonService.toastMessage("Away team data is not available", 3000, ToastMessageType.Error);
        return;
      }

      // Validate team data access
      const awayTeamName = this.getAwayTeamName();
      const awayTeamId = this.getAwayTeamId();
      const fixtureId = this.getLeagueFixtureId();

      if (!awayTeamName || !awayTeamId || !fixtureId) {
        console.error("Required away team data is missing:", { awayTeamName, awayTeamId, fixtureId });
        this.commonService.toastMessage("Required away team information is missing", 3000, ToastMessageType.Error);
        return;
      }

      // Validate base result input
      const baseInput = this.createBaseResultInput();
      if (!baseInput.parentclubId || !baseInput.activityId || !baseInput.memberId) {
        console.error("Base result input validation failed");
        this.commonService.toastMessage("Required user information is missing", 3000, ToastMessageType.Error);
        return;
      }

      const result_input: Partial<PublishLeagueResultForActivitiesInput> = {
        ...baseInput,
        Football: {
          LEAGUE_FIXTURE_ID: fixtureId,
          AWAY_TEAM: {
            TEAM_NAME: awayTeamName,
            TEAM_ID: awayTeamId,
            GOAL: (this.result_json.AWAY_TEAM.GOAL || 0).toString(),
            SHOTS_ON_GOAL: (this.result_json.AWAY_TEAM.SHOTS_ON_GOAL || 0).toString(),
            CORNERS: (this.result_json.AWAY_TEAM.CORNERS || 0).toString(),
            FOULS_COMMITTED: (this.result_json.AWAY_TEAM.FOULS_COMMITTED || 0).toString(),
            OFFSIDES: (this.result_json.AWAY_TEAM.OFFSIDES || 0).toString(),
            BALL_POSSESSION: this.awayPoss || '0.00',
            YELLOW_CARD: (this.result_json.AWAY_TEAM.YELLOW_CARD || 0).toString(),
            RED_CARD: (this.result_json.AWAY_TEAM.RED_CARD || 0).toString(),
            SHOTS: (this.result_json.AWAY_TEAM.SHOTS || 0).toString()
          }
        }
      };

      this.PublishLeagueResult(result_input);
    } catch (error) {
      console.error("Error updating away team stats:", error);
      this.commonService.toastMessage("Error updating away team statistics", 3000, ToastMessageType.Error);
    }
  }

  async gotoScoreInputPage(ishome: boolean): Promise<void> {
    try {
      const score = ishome ? this.homeScore : this.awayScore;
      const teamObj = this.getTeamObjectForModal(ishome);

      // Check if we have the minimum required data
      if (!teamObj) {
        console.warn("Team object not available for score input");
        this.commonService.toastMessage("Team data not available yet", 3000, ToastMessageType.Info);
        return;
      }

      if (!score || parseInt(score) <= 0) {
        this.commonService.toastMessage("Please set the score first", 3000, ToastMessageType.Info);
        return;
      }

      // Get match object
      const matchObj = this.isLeague ? this.matchObj : this.matchTeamObj;
      if (!matchObj) {
        console.warn("Match object not available for score input modal");
        this.commonService.toastMessage("Match data not available yet", 3000, ToastMessageType.Info);
        return;
      }

      if (!this.activityId) {
        console.warn("Activity ID not available for score input modal");
        this.commonService.toastMessage("Activity data not available yet", 3000, ToastMessageType.Info);
        return;
      }

      const modal = this.modalCtrl.create("ScoreInputPage", {
        "matchObj": matchObj,
        "leagueId": this.getLeagueId(),
        "activityId": this.activityId,
        "teamObj": teamObj,
        "score": parseInt(score),
        "ishome": ishome,
        "resultObject": this.result_json,
        "isLeague": this.isLeague
      });

      modal.onDidDismiss(data => {
        try {
          console.log('ScoreInputPage modal dismissed');
          if (data && data.goalDetails && data.goalDetails.length > 0) {
            this.handleScoreInputResult(data.goalDetails, ishome);
          } else {
            console.log('No goal details received from modal or modal was closed');
          }
        } catch (error) {
          console.error("Error handling score input modal dismiss:", error);
          this.commonService.toastMessage("Error processing score input result", 3000, ToastMessageType.Error);
        }
      });

      modal.present();
    } catch (error) {
      console.error("Error opening score input page:", error);
      this.commonService.toastMessage("Error opening score input page", 3000, ToastMessageType.Error);
    }
  }

  private getTeamObjectForModal(ishome: boolean): any {
    try {
      if (this.isLeague) {
        const result = ishome ? this.homeTeamObj : this.awayTeamObj;
        console.log(`League flow - ${ishome ? 'Home' : 'Away'} team object:`, result);
        return result;
      } else {
        const result = ishome ? this.hometeamMatchObj : this.awayteamMatchObj;
        console.log(`Match flow - ${ishome ? 'Home' : 'Away'} team object:`, result);
        console.log('Match flow debug - hometeamMatchObj:', this.hometeamMatchObj);
        console.log('Match flow debug - awayteamMatchObj:', this.awayteamMatchObj);
        return result;
      }
    } catch (error) {
      console.error("Error getting team object for modal:", error);
      return null;
    }
  }

  private handleScoreInputResult(goalDetails: FootballScoreDetailModel[], ishome: boolean): void {
    try {
      const scoreData = goalDetails.map((goal: any) => ({
        PLAYER: `${goal.playerObj.user.FirstName || ''} ${goal.playerObj.user.LastName || ''}`.trim(),
        PLAYER_ID: goal.playerObj.user.Id || goal.playerObj.memberId || goal.PLAYER_ID || '',
        TIME: goal.time || ''
      })).filter(goal => goal.PLAYER.length > 0);

      const result_input: Partial<PublishLeagueResultForActivitiesInput> = {
        ...this.createBaseResultInput(),
        Football: {
          LEAGUE_FIXTURE_ID: this.getLeagueFixtureId(),
          ...(ishome ? {
            HOME_TEAM: {
              TEAM_NAME: this.getHomeTeamName(),
              TEAM_ID: this.getHomeTeamId(),
              SCORE: scoreData
            }
          } : {
            AWAY_TEAM: {
              TEAM_NAME: this.getAwayTeamName(),
              TEAM_ID: this.getAwayTeamId(),
              SCORE: scoreData
            }
          })
        }
      };

      this.PublishLeagueResult(result_input);
      console.log("Received Scorers with PLAYER_ID:", scoreData);
    } catch (error) {
      console.error("Error handling score input result:", error);
      this.commonService.toastMessage("Error processing goal details", 3000, ToastMessageType.Error);
    }
  }

  private createBaseResultInput(): Partial<PublishLeagueResultForActivitiesInput> {
    try {
      const parentclubId = this.sharedservice.getPostgreParentClubId();
      const memberId = this.sharedservice.getLoggedInId();
      const deviceId = this.sharedservice.getDeviceId();
      const platform = this.sharedservice.getPlatform();

      // Validate required shared service data
      if (!parentclubId) {
        console.error("Parent club ID is missing from shared service");
        throw new Error("Parent club ID is required");
      }

      if (!memberId) {
        console.error("Member ID is missing from shared service");
        throw new Error("Member ID is required");
      }

      if (!this.activityId) {
        console.error("Activity ID is missing");
        throw new Error("Activity ID is required");
      }

      if (!this.activityCode) {
        console.error("Activity code is missing");
        throw new Error("Activity code is required");
      }

      const leaguefixtureId = this.getLeagueFixtureId();
      if (!leaguefixtureId) {
        console.error("League fixture ID is missing");
        throw new Error("League fixture ID is required");
      }

      return {
        parentclubId: parentclubId,
        clubId: '',
        memberId: memberId,
        action_type: 0,
        device_type: platform === "android" ? 1 : 2,
        app_type: AppType.ADMIN_NEW,
        device_id: deviceId || '',
        updated_by: memberId,
        created_by: memberId,
        activityId: this.activityId || "",
        activityCode: +this.activityCode,
        leaguefixtureId: leaguefixtureId,
      };
    } catch (error) {
      console.error("Error creating base result input:", error);
      this.commonService.toastMessage("Error preparing result data", 3000, ToastMessageType.Error);

      // Return minimal valid object to prevent further errors
      return {
        parentclubId: '',
        clubId: '',
        memberId: '',
        action_type: 0,
        device_type: 1,
        app_type: AppType.ADMIN_NEW,
        device_id: '',
        updated_by: '',
        created_by: '',
        activityId: '',
        activityCode: 0,
        leaguefixtureId: '',
      };
    }
  }

  async gotoResultInputPage(): Promise<void> {
    try {
      console.log("Going to result input page");

      // Check if we have the minimum required data
      const matchObj = this.isLeague ? this.matchObj : this.matchTeamObj;
      if (!matchObj) {
        console.warn("Match object not available for result input modal");
        this.commonService.toastMessage("Match data not available yet", 3000, ToastMessageType.Info);
        return;
      }

      const homeTeamObj = this.getTeamObjectForModal(true);
      const awayTeamObj = this.getTeamObjectForModal(false);

      if (!homeTeamObj || !awayTeamObj) {
        console.warn("Team objects not available for result input modal");
        this.commonService.toastMessage("Team data not available yet", 3000, ToastMessageType.Info);
        return;
      }

      // Check if league match result API has been called and has basic structure
      // Even if the result_json contains empty values, we should still allow the modal to open
      if (!this.getLeagueMatchResultRes) {
        console.warn("League match result not loaded yet, attempting to load...");
        this.getLeagueMatchResult();
        this.commonService.toastMessage("Loading match result data, please try again", 3000, ToastMessageType.Info);
        return;
      }

      if (!this.activityId || !this.activityCode) {
        console.warn("Activity information not available yet");
        this.commonService.toastMessage("Activity information not available yet", 3000, ToastMessageType.Info);
        return;
      }

      // Initialize result_json with team data if it's empty from API
      this.ensureResultJsonHasTeamData();

      const modal = this.modalCtrl.create("ResultInputPage", {
        "matchObj": matchObj,
        "leagueId": this.getLeagueId(),
        "activityId": this.activityId,
        "homeTeamObj": homeTeamObj,
        "awayTeamObj": awayTeamObj,
        "resultId": this.getLeagueMatchResultRes.Id,
        "activityCode": this.activityCode,
        "resultObject": this.result_json,
        "getLeagueMatchResultRes": this.getLeagueMatchResultRes,
        "isLeague": this.isLeague
      });

      modal.onDidDismiss(data => {
        try {
          console.log('ResultInputPage modal dismissed');
          if (data && this.isValidResultData(data)) {
            this.handleResultInputData(data);
          } else {
            console.log('Invalid or no data received from result input modal');
          }
        } catch (error) {
          console.error("Error handling result input modal dismiss:", error);
          this.commonService.toastMessage("Error processing result input", 3000, ToastMessageType.Error);
        }
      });

      modal.present();
    } catch (error) {
      console.error("Error opening result input page:", error);
      this.commonService.toastMessage("Error opening result input page", 3000, ToastMessageType.Error);
    }
  }

  private isValidResultData(data: any): boolean {
    return data &&
      data.homeTeamGoals !== undefined &&
      data.awayTeamGoals !== undefined &&
      parseInt(data.homeTeamGoals) >= 0 &&
      parseInt(data.awayTeamGoals) >= 0;
  }

  private ensureResultJsonHasTeamData(): void {
    try {
      // Initialize result_json if it's empty or null
      if (!this.result_json) {
        this.result_json = {};
      }

      // Initialize HOME_TEAM if it's empty or missing team data
      if (!this.result_json.HOME_TEAM || !this.result_json.HOME_TEAM.TEAM_NAME || !this.result_json.HOME_TEAM.TEAM_ID) {
        console.log("Initializing HOME_TEAM data from navigation params");
        this.result_json.HOME_TEAM = {
          TEAM_NAME: this.getHomeTeamName(),
          TEAM_ID: this.getHomeTeamId(),
          GOAL: (this.result_json.HOME_TEAM && this.result_json.HOME_TEAM.GOAL) ? this.result_json.HOME_TEAM.GOAL : '0',
          SHOTS: (this.result_json.HOME_TEAM && this.result_json.HOME_TEAM.SHOTS) ? this.result_json.HOME_TEAM.SHOTS : '0',
          SHOTS_ON_GOAL: (this.result_json.HOME_TEAM && this.result_json.HOME_TEAM.SHOTS_ON_GOAL) ? this.result_json.HOME_TEAM.SHOTS_ON_GOAL : '0',
          CORNERS: (this.result_json.HOME_TEAM && this.result_json.HOME_TEAM.CORNERS) ? this.result_json.HOME_TEAM.CORNERS : '0',
          FOULS_COMMITTED: (this.result_json.HOME_TEAM && this.result_json.HOME_TEAM.FOULS_COMMITTED) ? this.result_json.HOME_TEAM.FOULS_COMMITTED : '0',
          OFFSIDES: (this.result_json.HOME_TEAM && this.result_json.HOME_TEAM.OFFSIDES) ? this.result_json.HOME_TEAM.OFFSIDES : '0',
          BALL_POSSESSION: (this.result_json.HOME_TEAM && this.result_json.HOME_TEAM.BALL_POSSESSION) ? this.result_json.HOME_TEAM.BALL_POSSESSION : '0.00',
          YELLOW_CARD: (this.result_json.HOME_TEAM && this.result_json.HOME_TEAM.YELLOW_CARD) ? this.result_json.HOME_TEAM.YELLOW_CARD : '0',
          RED_CARD: (this.result_json.HOME_TEAM && this.result_json.HOME_TEAM.RED_CARD) ? this.result_json.HOME_TEAM.RED_CARD : '0',
          SCORE: (this.result_json.HOME_TEAM && this.result_json.HOME_TEAM.SCORE) ? this.result_json.HOME_TEAM.SCORE : []
        };
      }

      // Initialize AWAY_TEAM if it's empty or missing team data
      if (!this.result_json.AWAY_TEAM || !this.result_json.AWAY_TEAM.TEAM_NAME || !this.result_json.AWAY_TEAM.TEAM_ID) {
        console.log("Initializing AWAY_TEAM data from navigation params");
        this.result_json.AWAY_TEAM = {
          TEAM_NAME: this.getAwayTeamName(),
          TEAM_ID: this.getAwayTeamId(),
          GOAL: (this.result_json.AWAY_TEAM && this.result_json.AWAY_TEAM.GOAL) ? this.result_json.AWAY_TEAM.GOAL : '0',
          SHOTS: (this.result_json.AWAY_TEAM && this.result_json.AWAY_TEAM.SHOTS) ? this.result_json.AWAY_TEAM.SHOTS : '0',
          SHOTS_ON_GOAL: (this.result_json.AWAY_TEAM && this.result_json.AWAY_TEAM.SHOTS_ON_GOAL) ? this.result_json.AWAY_TEAM.SHOTS_ON_GOAL : '0',
          CORNERS: (this.result_json.AWAY_TEAM && this.result_json.AWAY_TEAM.CORNERS) ? this.result_json.AWAY_TEAM.CORNERS : '0',
          FOULS_COMMITTED: (this.result_json.AWAY_TEAM && this.result_json.AWAY_TEAM.FOULS_COMMITTED) ? this.result_json.AWAY_TEAM.FOULS_COMMITTED : '0',
          OFFSIDES: (this.result_json.AWAY_TEAM && this.result_json.AWAY_TEAM.OFFSIDES) ? this.result_json.AWAY_TEAM.OFFSIDES : '0',
          BALL_POSSESSION: (this.result_json.AWAY_TEAM && this.result_json.AWAY_TEAM.BALL_POSSESSION) ? this.result_json.AWAY_TEAM.BALL_POSSESSION : '0.00',
          YELLOW_CARD: (this.result_json.AWAY_TEAM && this.result_json.AWAY_TEAM.YELLOW_CARD) ? this.result_json.AWAY_TEAM.YELLOW_CARD : '0',
          RED_CARD: (this.result_json.AWAY_TEAM && this.result_json.AWAY_TEAM.RED_CARD) ? this.result_json.AWAY_TEAM.RED_CARD : '0',
          SCORE: (this.result_json.AWAY_TEAM && this.result_json.AWAY_TEAM.SCORE) ? this.result_json.AWAY_TEAM.SCORE : []
        };
      }

      // Initialize POTM if it's missing
      if (!this.result_json.POTM) {
        this.result_json.POTM = [];
      }

      console.log("Result JSON after ensuring team data:", this.result_json);
    } catch (error) {
      console.error("Error ensuring result JSON has team data:", error);
      // Initialize with minimal structure to prevent further errors
      this.result_json = {
        HOME_TEAM: {
          TEAM_NAME: this.getHomeTeamName(),
          TEAM_ID: this.getHomeTeamId(),
          GOAL: '0',
          SHOTS: '0',
          SHOTS_ON_GOAL: '0',
          CORNERS: '0',
          FOULS_COMMITTED: '0',
          OFFSIDES: '0',
          BALL_POSSESSION: '0.00',
          YELLOW_CARD: '0',
          RED_CARD: '0',
          SCORE: []
        },
        AWAY_TEAM: {
          TEAM_NAME: this.getAwayTeamName(),
          TEAM_ID: this.getAwayTeamId(),
          GOAL: '0',
          SHOTS: '0',
          SHOTS_ON_GOAL: '0',
          CORNERS: '0',
          FOULS_COMMITTED: '0',
          OFFSIDES: '0',
          BALL_POSSESSION: '0.00',
          YELLOW_CARD: '0',
          RED_CARD: '0',
          SCORE: []
        },
        POTM: []
      };
    }
  }

  private handleResultInputData(data: any): void {
    try {
      console.log("Received data from result input page:", data);

      const homeGoals = parseInt(data.homeTeamGoals);
      const awayGoals = parseInt(data.awayTeamGoals);

      this.homeScore = homeGoals.toString();
      this.awayScore = awayGoals.toString();

      let loserId = '';
      if (data.footballResultStats.WINNER_ID) {
        const homeTeamId = this.getHomeTeamId();
        const awayTeamId = this.getAwayTeamId();
        loserId = data.footballResultStats.WINNER_ID === homeTeamId ? awayTeamId : homeTeamId;
      }

      // Extract footballResultStats with null checks
      const footballResultStats: FootballResultStatsModel = data.footballResultStats || {};

      const result_input: Partial<PublishLeagueResultForActivitiesInput> = {
        ...this.createBaseResultInput(),
        Football: {
          LEAGUE_FIXTURE_ID: this.getLeagueFixtureId(),
          HOME_TEAM: {
            TEAM_NAME: this.getHomeTeamName(),
            TEAM_ID: this.getHomeTeamId(),
            GOAL: homeGoals.toString()
          },
          AWAY_TEAM: {
            TEAM_NAME: this.getAwayTeamName(),
            TEAM_ID: this.getAwayTeamId(),
            GOAL: awayGoals.toString()
          },
          RESULT: {
            DESCRIPTION: footballResultStats.DESCRIPTION || '',
            WINNER_ID: footballResultStats.WINNER_ID || '',
            LOSER_ID: loserId || '',
            RESULT_STATUS: data.resultStatus || '0'
          }
        }
      };

      this.PublishLeagueResult(result_input);
    } catch (error) {
      console.error("Error handling result input data:", error);
      this.commonService.toastMessage("Error processing result data", 3000, ToastMessageType.Error);
    }
  }

  async gotoPotmPage(): Promise<void> {
    try {
      console.log("Going to POTM page");

      // Check if we have the minimum required data
      const matchObj = this.isLeague ? this.matchObj : this.matchTeamObj;
      if (!matchObj) {
        console.warn("Match object not available for POTM modal");
        this.commonService.toastMessage("Match data not available yet", 3000, ToastMessageType.Info);
        return;
      }

      const homeTeamObj = this.getTeamObjectForModal(true);
      const awayTeamObj = this.getTeamObjectForModal(false);

      if (!homeTeamObj || !awayTeamObj) {
        console.warn("Team objects not available for POTM modal");
        this.commonService.toastMessage("Team data not available yet", 3000, ToastMessageType.Info);
        return;
      }

      if (!this.activityId) {
        console.warn("Activity ID not available for POTM modal");
        this.commonService.toastMessage("Activity data not available yet", 3000, ToastMessageType.Info);
        return;
      }

      const modal = this.modalCtrl.create("PotmPage", {
        "matchObj": matchObj,
        "leagueId": this.getLeagueId(),
        "activityId": this.activityId,
        "homeTeamObj": homeTeamObj,
        "awayTeamObj": awayTeamObj,
        "resultObject": this.result_json,
        "isLeague": this.isLeague
      });

      modal.onDidDismiss(data => {
        try {
          console.log('PotmPage modal dismissed');
          if (data && Array.isArray(data)) {
            this.selectedPlayersPotm = data;
            console.log("Received selected POTM players:", this.selectedPlayersPotm);

            // Validate POTM data before processing
            if (this.selectedPlayersPotm.length === 0) {
              console.log("No POTM players selected");
              return;
            }

            const result_input: Partial<PublishLeagueResultForActivitiesInput> = {
              ...this.createBaseResultInput(),
              Football: {
                LEAGUE_FIXTURE_ID: this.getLeagueFixtureId(),
                POTM: this.potmDisplayNames,
              }
            };

            this.PublishLeagueResult(result_input);
          } else {
            console.log('No valid POTM data received from modal');
          }
        } catch (error) {
          console.error("Error handling POTM modal dismiss:", error);
          this.commonService.toastMessage("Error processing POTM selection", 3000, ToastMessageType.Error);
        }
      });

      modal.present();
    } catch (error) {
      console.error("Error opening POTM page:", error);
      this.commonService.toastMessage("Error opening POTM page", 3000, ToastMessageType.Error);
    }
  }

  ngAfterViewInit() {
    this.drawDoughnutChart();
  }

  drawDoughnutChart() {
    const canvas = this.doughnutCanvas.nativeElement;
    const ctx = canvas.getContext("2d");
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(canvas.width, canvas.height) / 2;

    // Parse and validate possession data
    let homeValue = parseFloat(this.homePoss) || 0;
    let awayValue = parseFloat(this.awayPoss) || 0;

    // Ensure values are between 0 and 100
    homeValue = Math.max(0, Math.min(100, homeValue));
    awayValue = Math.max(0, Math.min(100, awayValue));

    const total = homeValue + awayValue;

    // If both are 0, show equal split
    if (total === 0) {
      homeValue = 50;
      awayValue = 50;
    }
    // Only normalize if total is significantly different from 100 (allow for small rounding errors)
    else if (Math.abs(total - 100) > 0.1) {
      homeValue = (homeValue / total) * 100;
      awayValue = (awayValue / total) * 100;
    }

    homeValue = parseFloat(homeValue.toFixed(2));
    awayValue = parseFloat(awayValue.toFixed(2));

    // Match HTML layout: Away team (right/red) first, Home team (left/green) second
    const data = [awayValue, homeValue];
    const labels = [
      this.getAwayTeamName() || "Away Team",
      this.getHomeTeamName() || "Home Team",
    ];
    const colors = ["red", "green"]; // Away team = red (index 0), Home team = green (index 1)

    let startAngle = -Math.PI / 2; // Start from top

    // Clear canvas first
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < data.length; i++) {
      if (data[i] > 0) {
        const sliceAngle = (2 * Math.PI * data[i]) / 100;
        const teamType = i === 0 ? 'AWAY' : 'HOME';

        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
        ctx.lineTo(centerX, centerY);
        ctx.fillStyle = colors[i];
        ctx.fill();
        ctx.closePath();

        startAngle += sliceAngle;
      }
    }

    // Add white circle in the middle to make it a doughnut chart
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.8, 0, 2 * Math.PI);
    ctx.fillStyle = "white";
    ctx.fill();
    ctx.closePath();

    // Draw team logos in the center
    const homeLogo = new Image();
    homeLogo.src = this.homeTeamLogo;
    const awayLogo = new Image();
    awayLogo.src = this.awayTeamLogo;

    let imagesLoaded = 0;
    const totalImages = 2;

    const checkImagesLoaded = () => {
      imagesLoaded++;
      if (imagesLoaded === totalImages) {
        let logoWidth = 40;
        let logoHeight = 40;
        // Reversed layout: Home team on left, Away team on right
        const homeLogoX = centerX - logoWidth - 15;
        const homeLogoY = centerY - logoHeight / 2;
        const awayLogoX = centerX + 15;
        const awayLogoY = centerY - logoHeight / 2;

        ctx.drawImage(homeLogo, homeLogoX, homeLogoY, logoWidth, logoHeight);
        ctx.drawImage(awayLogo, awayLogoX, awayLogoY, logoWidth, logoHeight);

        // Draw vertical line
        ctx.beginPath();
        ctx.moveTo(centerX, centerY - logoHeight);
        ctx.lineTo(centerX, centerY + logoHeight);
        ctx.strokeStyle = "grey";
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.closePath();
      }
    };

    homeLogo.onload = () => {
      checkImagesLoaded();
    };

    awayLogo.onload = () => {
      checkImagesLoaded();
    };
  }

  // Utility Methods - Updated for conditional access based on flow type
  get homeTeamData(): FootballTeamStatsModel | null {
    if (!this.result_json) return null;
    return this.result_json.HOME_TEAM;
  }

  get awayTeamData(): FootballTeamStatsModel | null {
    if (!this.result_json) return null;
    return this.result_json.AWAY_TEAM;
  }

  // UI Data Binding Getters - Support both league and match flows
  get homeTeamName(): string {
    return this.getHomeTeamName();
  }

  get awayTeamName(): string {
    return this.getAwayTeamName();
  }

  get homeTeamLogo(): string {
    if (this.isLeague) {
      return (this.homeTeamObj && this.homeTeamObj.parentclubteam && this.homeTeamObj.parentclubteam.logo_url)
        ? this.homeTeamObj.parentclubteam.logo_url
        : 'assets/imgs/default-team-logo.png';
    } else {
      return (this.hometeamMatchObj && this.hometeamMatchObj.logo_url)
        ? this.hometeamMatchObj.logo_url
        : 'assets/imgs/default-team-logo.png';
    }
  }

  get awayTeamLogo(): string {
    if (this.isLeague) {
      return (this.awayTeamObj && this.awayTeamObj.parentclubteam && this.awayTeamObj.parentclubteam.logo_url)
        ? this.awayTeamObj.parentclubteam.logo_url
        : 'assets/imgs/default-team-logo.png';
    } else {
      return (this.awayteamMatchObj && this.awayteamMatchObj.logo_url)
        ? this.awayteamMatchObj.logo_url
        : 'assets/imgs/default-team-logo.png';
    }
  }

  get matchTitle(): string {
    if (this.isLeague) {
      return (this.matchObj && this.matchObj.match_title) ? this.matchObj.match_title : '';
    } else {
      return (this.matchTeamObj && this.matchTeamObj.MatchTitle) ? this.matchTeamObj.MatchTitle : '';
    }
  }

  get matchDate(): string {
    if (this.isLeague) {
      return (this.matchObj && this.matchObj.start_date) ? this.matchObj.start_date : '';
    } else {
      return (this.matchTeamObj && this.matchTeamObj.MatchStartDate) ? this.matchTeamObj.MatchStartDate : '';
    }
  }

  get matchLocation(): string {
    if (this.isLeague) {
      // Check if location_name property exists (might be added dynamically)
      return (this.matchObj && (this.matchObj as any).location_name) ? (this.matchObj as any).location_name : '';
    } else {
      return (this.matchTeamObj && this.matchTeamObj.VenueName) ? this.matchTeamObj.VenueName : '';
    }
  }

  getPercentage(
    value1: string,
    value2: string,
    team: "HOME_TEAM" | "AWAY_TEAM"
  ): string {
    const val1 = parseInt(value1) || 0;
    const val2 = parseInt(value2) || 0;

    // If both values are 0, return 0
    if (val1 === 0 && val2 === 0) return "0";

    // Find the maximum value between the two teams
    const maxValue = Math.max(val1, val2);

    // The team with higher value gets 100% bar fill
    // The other team gets percentage relative to the higher value
    const percentage =
      team === "HOME_TEAM" ? (val1 / maxValue) * 100 : (val2 / maxValue) * 100;

    return percentage.toFixed(2);
  }

  // Unified getter for participant data regardless of flow type
  get participantData(): any[] {
    return this.isLeague ? this.leagueMatchParticipantRes : this.getIndividualMatchParticipantRes;
  }

}

export class GetIndividualMatchParticipantInput {
  parentclubId: string; // 🏢 Parent club ID
  clubId: string; // 🏟️ Club ID
  activityId: string; // ⚽ Activity ID
  memberId: string; // 👤 Member ID
  action_type: number; // ⚙️ Action type (e.g., LeagueMatchActionType)
  device_type: number; // 📱 Device type (e.g., 1 for Android, 2 for iOS)
  app_type: number; // 📱 App type (e.g., AppType.ADMIN_NEW)
  device_id: string; // 🆔 Device ID
  updated_by: string; // ✍️ User who updated
  MatchId: string; // 🏟️ Match ID
  TeamId: string; // 🏈 Team ID
  leagueTeamPlayerStatusType: number; // 📊 Player status type (e.g., LeagueTeamPlayerStatusType)
}

