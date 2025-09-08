import { Component, ViewChild, ElementRef } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController } from 'ionic-angular';
import { CommonService, ToastMessageType } from '../../../../services/common.service';
import { SharedServices } from '../../../services/sharedservice';
import { HttpService } from '../../../../services/http.service';
import { API } from '../../../../shared/constants/api_constants';
import { AppType } from '../../../../shared/constants/module.constants';
import { LeagueTeamPlayerStatusType, LeagueMatchActionType } from '../../../../shared/utility/enums';
import { LeagueMatch } from '../models/location.model';
import { LeagueParticipationForMatchModel, LeagueMatchParticipantModel } from '../models/league.model';
import { AllMatchData, GetIndividualMatchParticipantModel } from '../../../../shared/model/match.model';
import { TeamsForParentClubModel } from '../models/team.model';
import {
  TennisResultModel,
  TennisSectionModel,
  LeagueMatchResultInput,
  PublishLeagueResultForActivitiesInput,
  LeagueMatchParticipantInput,
  POTMDetailModel
} from '../../../../shared/model/league_result.model';

@IonicPage()
@Component({
  selector: 'page-tennis-summary-tennis',
  templateUrl: 'tennis_summary_tennis.html',
  providers: [HttpService]
})
export class TennisSummaryTennisPage {
  // League flow properties
  matchObj: LeagueMatch;
  homeTeamObj: LeagueParticipationForMatchModel;
  awayTeamObj: LeagueParticipationForMatchModel;

  // Match flow properties
  matchTeamObj: AllMatchData;
  hometeamMatchObj: TeamsForParentClubModel;
  awayteamMatchObj: TeamsForParentClubModel;

  // Common properties
  isLeague: boolean = false;
  result_json: TennisResultModel = {
    POTM: [],
    HOME_TEAM: {
      TEAM_NAME: '',
      TEAM_ID: '',
      SETS_WON: '0',
      GAMES_WON: '0',
      ACES: '0',
      DOUBLE_FAULTS: '0',
      FIRST_SERVE_PERCENTAGE: '0',
      UNFORCED_ERRORS: '0',
      BREAK_POINTS_WON: '0'
    },
    AWAY_TEAM: {
      TEAM_NAME: '',
      TEAM_ID: '',
      SETS_WON: '0',
      GAMES_WON: '0',
      ACES: '0',
      DOUBLE_FAULTS: '0',
      FIRST_SERVE_PERCENTAGE: '0',
      UNFORCED_ERRORS: '0',
      BREAK_POINTS_WON: '0'
    },
    SET_SCORES: []
  };
  homeScore: string = "0";
  awayScore: string = "0";
  isHomeStatsPopupVisible: boolean = false;
  isAwayStatsPopupVisible: boolean = false;
  potmDisplayNames: any[] = [];
  // Backup states for rollback on API failure
  private homeStatsBackup: any = null;
  private awayStatsBackup: any = null;
  leagueId: string;
  activityId: string;
  activityCode: number;
  leagueMatchParticipantRes: LeagueMatchParticipantModel[] = [];
  getIndividualMatchParticipantRes: GetIndividualMatchParticipantModel[] = [];
  getLeagueMatchResultRes: any;

  // API Input Objects
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
    Tennis: {
      LEAGUE_FIXTURE_ID: '',
      result_description: '',
      POTM: [],
      HOME_TEAM: {
        TEAM_NAME: '',
        TEAM_ID: '',
        SETS_WON: '0',
        GAMES_WON: '0',
        ACES: '0',
        DOUBLE_FAULTS: '0',
        FIRST_SERVE_PERCENTAGE: '0',
        UNFORCED_ERRORS: '0',
        BREAK_POINTS_WON: '0'
      },
      AWAY_TEAM: {
        TEAM_NAME: '',
        TEAM_ID: '',
        SETS_WON: '0',
        GAMES_WON: '0',
        ACES: '0',
        DOUBLE_FAULTS: '0',
        FIRST_SERVE_PERCENTAGE: '0',
        UNFORCED_ERRORS: '0',
        BREAK_POINTS_WON: '0'
      },
      SET_SCORES: []
    }
  };

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

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public commonService: CommonService,
    public sharedservice: SharedServices,
    private httpService: HttpService,
    public modalCtrl: ModalController
  ) {
    this.initializeComponent();
  }

  private initializeComponent(): void {
    try {
      // Get navigation parameters
      this.isLeague = this.navParams.get("isLeague");
      console.log("Is League Flow:", this.isLeague);
      this.activityId = this.navParams.get("activityId");
      this.activityCode = this.navParams.get("activityCode");

      // Initialize parameters based on flow type
      if (this.isLeague) {
        // League flow initialization
        this.matchObj = this.navParams.get("match");
        console.log("League Match Object:", this.matchObj.match_id);
        this.homeTeamObj = this.navParams.get("homeTeam");
        this.awayTeamObj = this.navParams.get("awayTeam");
        this.leagueId = this.navParams.get("leagueId");
      } else {
        // Match flow initialization
        this.matchTeamObj = this.navParams.get("match");
        console.log("Match Object:", this.matchTeamObj.MatchId);
        this.hometeamMatchObj = this.navParams.get("homeTeam");
        this.awayteamMatchObj = this.navParams.get("awayTeam");
        this.leagueId = ""; // Empty string for match flow
      }

      // Initialize API inputs after objects are set
      this.initializeApiInputs();
      
      // Initialize result_json with team data immediately for UI binding
      this.initializeDefaultValues();

      // Load data (this will update result_json if API returns data)
      this.getMatchParticipants();
      this.getLeagueMatchResult();

    } catch (error) {
      console.error("Error initializing component:", error);
      this.commonService.toastMessage("Error initializing page", 3000, ToastMessageType.Error);
    }
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SummaryTennisPage');
  }

  private initializeApiInputs(): void {
    const baseInput = this.createBaseApiInput();

    // Initialize league match result input
    this.leagueMatchResultInput = {
      ...baseInput,
      MatchId: this.getMatchId(),
      ActivityCode: this.activityCode || 0
    };

    // Initialize league match participant input
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

    // Initialize publish league result input
    this.publishLeagueResultForActivitiesInput = {
      ...baseInput,
      activityCode: this.activityCode || 0,
      leaguefixtureId: this.getLeagueFixtureId(),
      homeLeagueParticipationId: this.getHomeLeagueParticipationId(),
      awayLeagueParticipationId: this.getAwayLeagueParticipationId(),
      Tennis: {
        LEAGUE_FIXTURE_ID: this.getLeagueFixtureId(),
        result_description: '',
        POTM: [],
        HOME_TEAM: {
          NAME: this.getHomeTeamName(),
          TEAM_ID: this.getHomeTeamId(),
          SETS_WON: '0',
          GAMES_WON: '0',
          ACES: '0',
          DOUBLE_FAULTS: '0',
          FIRST_SERVE_PERCENTAGE: '0',
          UNFORCED_ERRORS: '0',
          BREAK_POINTS_WON: '0'
        },
        AWAY_TEAM: {
          NAME: this.getAwayTeamName(),
          TEAM_ID: this.getAwayTeamId(),
          SETS_WON: '0',
          GAMES_WON: '0',
          ACES: '0',
          DOUBLE_FAULTS: '0',
          FIRST_SERVE_PERCENTAGE: '0',
          UNFORCED_ERRORS: '0',
          BREAK_POINTS_WON: '0'
        },
        SET_SCORES: []
      }
    };
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
      updated_by: this.sharedservice.getLoggedInUserId() || '',
      created_by: this.sharedservice.getLoggedInUserId() || ''
    };
  }

  // Helper methods for conditional data access
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

  getPercentage(homeValue: any, awayValue: any, team: string): number {
    const home = parseFloat(homeValue) || 0;
    const away = parseFloat(awayValue) || 0;
    const total = home + away;

    if (total === 0) return 0;

    if (team === 'HOME_TEAM') {
      return (home / total) * 100;
    } else {
      return (away / total) * 100;
    }
  }

  async gotoSetInputPage(isHomeTeam: boolean): Promise<void> {
    const matchObj = this.isLeague ? this.matchObj : this.matchTeamObj;
    const homeTeamObj = this.getTeamObjectForModal(true);
    const awayTeamObj = this.getTeamObjectForModal(false);

    if (!matchObj || !homeTeamObj || !awayTeamObj) {
      this.commonService.toastMessage("Team data not available yet", 3000, ToastMessageType.Info);
      return;
    }

    const modal = this.modalCtrl.create('TennisSetInputPage', {
      matchObj: matchObj,
      homeTeamObj: homeTeamObj,
      awayTeamObj: awayTeamObj,
      isHomeTeam: isHomeTeam,
      result_json: this.result_json,
      isLeague: this.isLeague
    });

    modal.onDidDismiss(data => {
      if (data && data.setScores) {
        this.result_json.SET_SCORES = data.setScores;
        this.handleSetInputData(data.setScores);
      }
    });
    modal.present();
  }

  async gotoResultInputPage(): Promise<void> {
    const matchObj = this.isLeague ? this.matchObj : this.matchTeamObj;
    const homeTeamObj = this.getTeamObjectForModal(true);
    const awayTeamObj = this.getTeamObjectForModal(false);

    if (!matchObj || !homeTeamObj || !awayTeamObj) {
      this.commonService.toastMessage("Team data not available yet", 3000, ToastMessageType.Info);
      return;
    }

    const modal = this.modalCtrl.create('TennisResultInputPage', {
      matchObj: matchObj,
      homeTeamObj: homeTeamObj,
      awayTeamObj: awayTeamObj,
      result_json: this.result_json,
      activityId: this.activityId,
      activityCode: this.activityCode,
      isLeague: this.isLeague,
      result_status: this.getLeagueMatchResultRes.ResultStatus || 0,
    });

    modal.onDidDismiss(data => {
      if (data) {
        this.handleResultInputData(data);
      }
    });

    modal.present();
  }

  async gotoPotmPage(): Promise<void> {
    this.getMatchParticipants();
    setTimeout(() => {
      const matchObj = this.isLeague ? this.matchObj : this.matchTeamObj;
      const homeTeamObj = this.getTeamObjectForModal(true);
      const awayTeamObj = this.getTeamObjectForModal(false);
      const participants = this.isLeague ? this.leagueMatchParticipantRes : this.getIndividualMatchParticipantRes;

      if (!matchObj || !homeTeamObj || !awayTeamObj) {
        this.commonService.toastMessage("Team data not available yet", 3000, ToastMessageType.Info);
        return;
      }

      const modal = this.modalCtrl.create('TennisPotmPage', {
        matchObj: matchObj,
        homeTeamObj: homeTeamObj,
        awayTeamObj: awayTeamObj,
        participants: participants,
        result_json: this.result_json,
        isLeague: this.isLeague
      });

      modal.onDidDismiss(data => {
        if (data && Array.isArray(data)) {
          this.handlePotmData(data);
        }
      });

      modal.present();
    }, 500);
  }

  private getTeamObjectForModal(ishome: boolean): any {
    try {
      if (this.isLeague) {
        return ishome ? this.homeTeamObj : this.awayTeamObj;
      } else {
        return ishome ? this.hometeamMatchObj : this.awayteamMatchObj;
      }
    } catch (error) {
      console.error("Error getting team object for modal:", error);
      return null;
    }
  }

  getLeagueMatchResult(): void {
    try {
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
              console.log("Get_League_Match_Result RESPONSE", res.data);
              this.processLeagueMatchResult(this.getLeagueMatchResultRes.result_json);
            } else {
              console.log("No data received from getLeagueMatchResult");
              this.initializeDefaultValues();
            }
          } catch (error) {
            console.error("Error processing league match result:", error);
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
      this.initializeDefaultValues();
    }
  }

  private processLeagueMatchResult(rawResultJson: any): void {
    if (typeof rawResultJson === 'string') {
      try {
        this.result_json = JSON.parse(rawResultJson) as TennisResultModel;
        console.log("Decoded result_json (parsed):", this.result_json);
      } catch (err) {
        console.error('Failed to parse result_json:', err, rawResultJson);
        this.result_json = {};
      }
    } else if (typeof rawResultJson === 'object' && rawResultJson !== null) {
      this.result_json = rawResultJson as TennisResultModel;
      console.log("Decoded result_json (object):", this.result_json);
    } else {
      console.warn('result_json is neither string nor object:', rawResultJson);
      this.result_json = {};
    }

    // Always ensure team data is populated for both league and match flows
    this.ensureResultJsonHasTeamData();
    this.updateComponentFromResultJson();
  }

  private ensureResultJsonHasTeamData(): void {
    try {
      if (!this.result_json) {
        this.result_json = {};
      }

      // Always ensure HOME_TEAM exists with proper data
      const existingHomeTeam = this.result_json.HOME_TEAM || {};
      this.result_json.HOME_TEAM = {
        TEAM_NAME: existingHomeTeam.TEAM_NAME || this.getHomeTeamName(),
        TEAM_ID: existingHomeTeam.TEAM_ID || this.getHomeTeamId(),
        SETS_WON: existingHomeTeam.SETS_WON || '0',
        GAMES_WON: existingHomeTeam.GAMES_WON || '0',
        ACES: existingHomeTeam.ACES || '0',
        DOUBLE_FAULTS: existingHomeTeam.DOUBLE_FAULTS || '0',
        FIRST_SERVE_PERCENTAGE: existingHomeTeam.FIRST_SERVE_PERCENTAGE || '0',
        UNFORCED_ERRORS: existingHomeTeam.UNFORCED_ERRORS || '0',
        BREAK_POINTS_WON: existingHomeTeam.BREAK_POINTS_WON || '0'
      };

      // Always ensure AWAY_TEAM exists with proper data
      const existingAwayTeam = this.result_json.AWAY_TEAM || {};
      this.result_json.AWAY_TEAM = {
        TEAM_NAME: existingAwayTeam.TEAM_NAME || this.getAwayTeamName(),
        TEAM_ID: existingAwayTeam.TEAM_ID || this.getAwayTeamId(),
        SETS_WON: existingAwayTeam.SETS_WON || '0',
        GAMES_WON: existingAwayTeam.GAMES_WON || '0',
        ACES: existingAwayTeam.ACES || '0',
        DOUBLE_FAULTS: existingAwayTeam.DOUBLE_FAULTS || '0',
        FIRST_SERVE_PERCENTAGE: existingAwayTeam.FIRST_SERVE_PERCENTAGE || '0',
        UNFORCED_ERRORS: existingAwayTeam.UNFORCED_ERRORS || '0',
        BREAK_POINTS_WON: existingAwayTeam.BREAK_POINTS_WON || '0'
      };

      if (!this.result_json.POTM) {
        this.result_json.POTM = [];
      }

      if (!this.result_json.SET_SCORES) {
        this.result_json.SET_SCORES = [];
      }
    } catch (error) {
      console.error("Error ensuring result JSON has team data:", error);
      // Fallback to complete initialization
      this.initializeDefaultValues();
    }
  }

  private updateComponentFromResultJson(): void {
    if (this.result_json) {
      const homeTeam = this.result_json.HOME_TEAM;
      const awayTeam = this.result_json.AWAY_TEAM;

      if (homeTeam && awayTeam) {
        this.homeScore = (homeTeam.SETS_WON && homeTeam.SETS_WON.toString()) || "0";
        this.awayScore = (awayTeam.SETS_WON && awayTeam.SETS_WON.toString()) || "0";
      }

      if (this.result_json.POTM && this.result_json.POTM.length > 0) {
        this.potmDisplayNames = this.result_json.POTM;
      } else {
        this.potmDisplayNames = [];
      }
    }
  }

  private initializeDefaultValues(): void {
    this.result_json = {
      POTM: [],
      HOME_TEAM: {
        TEAM_NAME: this.getHomeTeamName(),
        TEAM_ID: this.getHomeTeamId(),
        SETS_WON: '0',
        GAMES_WON: '0',
        ACES: '0',
        DOUBLE_FAULTS: '0',
        FIRST_SERVE_PERCENTAGE: '0',
        UNFORCED_ERRORS: '0',
        BREAK_POINTS_WON: '0'
      },
      AWAY_TEAM: {
        TEAM_NAME: this.getAwayTeamName(),
        TEAM_ID: this.getAwayTeamId(),
        SETS_WON: '0',
        GAMES_WON: '0',
        ACES: '0',
        DOUBLE_FAULTS: '0',
        FIRST_SERVE_PERCENTAGE: '0',
        UNFORCED_ERRORS: '0',
        BREAK_POINTS_WON: '0'
      },
      SET_SCORES: []
    };
    this.homeScore = "0";
    this.awayScore = "0";
    this.potmDisplayNames = [];
    
    // Ensure data is properly bound for UI
    this.updateComponentFromResultJson();
  }

  updateHomeTeamStats(): void {
    try {
      if (!this.validateTeamStats('HOME')) {
        return;
      }

      if (!this.result_json || !this.result_json.HOME_TEAM) {
        console.error("Home team result data is missing");
        this.commonService.toastMessage("Home team data is not available", 3000, ToastMessageType.Error);
        return;
      }

      const homeTeamName = this.getHomeTeamName();
      const homeTeamId = this.getHomeTeamId();
      const fixtureId = this.getLeagueFixtureId();

      if (!homeTeamName || !homeTeamId || !fixtureId) {
        console.error("Required home team data is missing");
        this.commonService.toastMessage("Required home team information is missing", 3000, ToastMessageType.Error);
        return;
      }

      // Create backup before updating
      this.homeStatsBackup = {
        ACES: this.result_json.HOME_TEAM.ACES || '0',
        DOUBLE_FAULTS: this.result_json.HOME_TEAM.DOUBLE_FAULTS || '0',
        FIRST_SERVE_PERCENTAGE: this.result_json.HOME_TEAM.FIRST_SERVE_PERCENTAGE || '0',
        UNFORCED_ERRORS: this.result_json.HOME_TEAM.UNFORCED_ERRORS || '0',
        BREAK_POINTS_WON: this.result_json.HOME_TEAM.BREAK_POINTS_WON || '0'
      };

      const baseInput = this.createBaseResultInput();
      if (!baseInput.parentclubId || !baseInput.activityId || !baseInput.memberId) {
        console.error("Base result input validation failed");
        this.commonService.toastMessage("Required user information is missing", 3000, ToastMessageType.Error);
        return;
      }

      const result_input = {
        ...baseInput,
        Tennis: {
          LEAGUE_FIXTURE_ID: fixtureId,
          HOME_TEAM: {
            NAME: homeTeamName,
            TEAM_ID: homeTeamId,
            ACES: (this.result_json.HOME_TEAM.ACES || 0).toString(),
            DOUBLE_FAULTS: (this.result_json.HOME_TEAM.DOUBLE_FAULTS || 0).toString(),
            FIRST_SERVE_PERCENTAGE: (this.result_json.HOME_TEAM.FIRST_SERVE_PERCENTAGE || 0).toString(),
            UNFORCED_ERRORS: (this.result_json.HOME_TEAM.UNFORCED_ERRORS || 0).toString(),
            BREAK_POINTS_WON: (this.result_json.HOME_TEAM.BREAK_POINTS_WON || 0).toString()
          }
        }
      };

      this.PublishLeagueResultWithRollback(result_input, 'HOME');
    } catch (error) {
      console.error("Error updating home team stats:", error);
      this.commonService.toastMessage("Error updating home team statistics", 3000, ToastMessageType.Error);
    }
  }

  updateAwayTeamStats(): void {
    try {
      if (!this.validateTeamStats('AWAY')) {
        return;
      }

      if (!this.result_json || !this.result_json.AWAY_TEAM) {
        console.error("Away team result data is missing");
        this.commonService.toastMessage("Away team data is not available", 3000, ToastMessageType.Error);
        return;
      }

      const awayTeamName = this.getAwayTeamName();
      const awayTeamId = this.getAwayTeamId();
      const fixtureId = this.getLeagueFixtureId();

      if (!awayTeamName || !awayTeamId || !fixtureId) {
        console.error("Required away team data is missing");
        this.commonService.toastMessage("Required away team information is missing", 3000, ToastMessageType.Error);
        return;
      }

      // Create backup before updating
      this.awayStatsBackup = {
        ACES: this.result_json.AWAY_TEAM.ACES || '0',
        DOUBLE_FAULTS: this.result_json.AWAY_TEAM.DOUBLE_FAULTS || '0',
        FIRST_SERVE_PERCENTAGE: this.result_json.AWAY_TEAM.FIRST_SERVE_PERCENTAGE || '0',
        UNFORCED_ERRORS: this.result_json.AWAY_TEAM.UNFORCED_ERRORS || '0',
        BREAK_POINTS_WON: this.result_json.AWAY_TEAM.BREAK_POINTS_WON || '0'
      };

      const baseInput = this.createBaseResultInput();
      if (!baseInput.parentclubId || !baseInput.activityId || !baseInput.memberId) {
        console.error("Base result input validation failed");
        this.commonService.toastMessage("Required user information is missing", 3000, ToastMessageType.Error);
        return;
      }

      const result_input = {
        ...baseInput,
        Tennis: {
          LEAGUE_FIXTURE_ID: fixtureId,
          AWAY_TEAM: {
            NAME: awayTeamName,
            TEAM_ID: awayTeamId,
            ACES: (this.result_json.AWAY_TEAM.ACES || 0).toString(),
            DOUBLE_FAULTS: (this.result_json.AWAY_TEAM.DOUBLE_FAULTS || 0).toString(),
            FIRST_SERVE_PERCENTAGE: (this.result_json.AWAY_TEAM.FIRST_SERVE_PERCENTAGE || 0).toString(),
            UNFORCED_ERRORS: (this.result_json.AWAY_TEAM.UNFORCED_ERRORS || 0).toString(),
            BREAK_POINTS_WON: (this.result_json.AWAY_TEAM.BREAK_POINTS_WON || 0).toString()
          }
        }
      };

      this.PublishLeagueResultWithRollback(result_input, 'AWAY');
    } catch (error) {
      console.error("Error updating away team stats:", error);
      this.commonService.toastMessage("Error updating away team statistics", 3000, ToastMessageType.Error);
    }
  }

  private validateTeamStats(team: 'HOME' | 'AWAY'): boolean {
    const teamData = team === 'HOME' ? this.result_json.HOME_TEAM : this.result_json.AWAY_TEAM;
    const teamName = team === 'HOME' ? this.getHomeTeamName() : this.getAwayTeamName();

    if (!teamData) {
      this.commonService.toastMessage(`${teamName} data not found`, 3000, ToastMessageType.Error);
      return false;
    }

    const aces = parseInt(teamData.ACES) || 0;
    const doubleFaults = parseInt(teamData.DOUBLE_FAULTS) || 0;
    const firstServePercentage = parseFloat(teamData.FIRST_SERVE_PERCENTAGE) || 0;
    const unforcedErrors = parseInt(teamData.UNFORCED_ERRORS) || 0;
    const breakPointsWon = parseInt(teamData.BREAK_POINTS_WON) || 0;

    if (aces < 0) {
      this.commonService.toastMessage(`${teamName}: Aces cannot be negative`, 3000, ToastMessageType.Error);
      return false;
    }

    if (doubleFaults < 0) {
      this.commonService.toastMessage(`${teamName}: Double faults cannot be negative`, 3000, ToastMessageType.Error);
      return false;
    }

    if (firstServePercentage < 0 || firstServePercentage > 100) {
      this.commonService.toastMessage(`${teamName}: First serve percentage must be between 0-100`, 3000, ToastMessageType.Error);
      return false;
    }

    if (unforcedErrors < 0) {
      this.commonService.toastMessage(`${teamName}: Unforced errors cannot be negative`, 3000, ToastMessageType.Error);
      return false;
    }

    if (breakPointsWon < 0) {
      this.commonService.toastMessage(`${teamName}: Break points won cannot be negative`, 3000, ToastMessageType.Error);
      return false;
    }

    if (aces > 50) {
      this.commonService.toastMessage(`${teamName}: Aces seem too high (max 50)`, 3000, ToastMessageType.Error);
      return false;
    }

    if (doubleFaults > 30) {
      this.commonService.toastMessage(`${teamName}: Double faults seem too high (max 30)`, 3000, ToastMessageType.Error);
      return false;
    }

    if (unforcedErrors > 100) {
      this.commonService.toastMessage(`${teamName}: Unforced errors seem too high (max 100)`, 3000, ToastMessageType.Error);
      return false;
    }

    return true;
  }

  private handleSetInputData(setScores: any[]): void {
    const result_input = {
      ...this.createBaseResultInput(),
      Tennis: {
        LEAGUE_FIXTURE_ID: this.getLeagueFixtureId(),
        SET_SCORES: setScores
      }
    };
    this.PublishLeagueResult(result_input);
  }

  private handleResultInputData(data: any): void {
    if (!this.validateResultData(data)) {
      return;
    }

    this.homeScore = data.homeSetsWon || '0';
    this.awayScore = data.awaySetsWon || '0';

    // Determine loser ID based on winner
    let loserId = '';
    if (data.selectedWinner) {
      const homeTeamId = this.getHomeTeamId();
      const awayTeamId = this.getAwayTeamId();
      loserId = data.selectedWinner === homeTeamId ? awayTeamId : homeTeamId;
    }

    const result_input = {
      ...this.createBaseResultInput(),
      Tennis: {
        LEAGUE_FIXTURE_ID: this.getLeagueFixtureId(),
        // RESULT_STATUS: data.RESULT_STATUS || '',
        // WINNER_ID: data.WINNER_ID || '',
        RESULT: {
          WINNER_ID: data.selectedWinner || '',
          LOSER_ID: loserId,
          RESULT_STATUS: data.resultStatus || '0'
        },
        HOME_TEAM: {
          NAME: this.getHomeTeamName(),
          TEAM_ID: this.getHomeTeamId(),
          SETS_WON: data.homeSetsWon || '0',
          GAMES_WON: data.homeGamesWon || '0'
        },
        AWAY_TEAM: {
          NAME: this.getAwayTeamName(),
          TEAM_ID: this.getAwayTeamId(),
          SETS_WON: data.awaySetsWon || '0',
          GAMES_WON: data.awayGamesWon || '0'
        }
      }
    };
    this.PublishLeagueResult(result_input);
  }

  private handlePotmData(potmPlayers: any[]): void {
    if (!this.validatePotmData(potmPlayers)) {
      return;
    }

    this.potmDisplayNames = potmPlayers.map(player => ({
      PLAYER: `${player.user && player.user.FirstName || ''} ${player.user && player.user.LastName || ''}`.trim(),
      PLAYER_ID: player.user && player.user.Id || '',
      TEAM: player.Team && player.Team.teamName || '',
      TEAM_ID: player.Team && player.Team.id || ''
    }));

    const result_input = {
      ...this.createBaseResultInput(),
      Tennis: {
        LEAGUE_FIXTURE_ID: this.getLeagueFixtureId(),
        POTM: this.potmDisplayNames
      }
    };
    this.PublishLeagueResult(result_input);
  }



  private validateResultData(data: any): boolean {
    if (!data) {
      this.commonService.toastMessage('No result data provided', 3000, ToastMessageType.Error);
      return false;
    }

    if (data.resultStatus === '1') {
      if (!data.selectedWinner) {
        this.commonService.toastMessage('Winner must be selected for completed matches', 3000, ToastMessageType.Error);
        return false;
      }

      const homeSets = parseInt(data.homeSetsWon) || 0;
      const awaySets = parseInt(data.awaySetsWon) || 0;

      if (homeSets < 0 || awaySets < 0) {
        this.commonService.toastMessage('Sets cannot be negative', 3000, ToastMessageType.Error);
        return false;
      }

      if (homeSets === awaySets) {
        this.commonService.toastMessage('Match cannot end in a tie', 3000, ToastMessageType.Error);
        return false;
      }
    }

    return true;
  }

  private validatePotmData(potmPlayers: any[]): boolean {
    if (!potmPlayers || potmPlayers.length === 0) {
      this.commonService.toastMessage('No POTM players selected', 3000, ToastMessageType.Error);
      return false;
    }

    if (potmPlayers.length > 2) {
      this.commonService.toastMessage('Maximum 2 players can be selected as POTM', 3000, ToastMessageType.Error);
      return false;
    }

    return true;
  }

  private isValidTennisScore(score: string): boolean {
    const scorePattern = /^\d{1,2}-\d{1,2}$/;
    if (!scorePattern.test(score)) {
      return false;
    }

    const [score1, score2] = score.split('-').map(s => parseInt(s));

    if (score1 === score2 || Math.max(score1, score2) < 6) {
      return false;
    }

    return true;
  }

  private createBaseResultInput(): any {
    try {
      const parentclubId = this.sharedservice.getPostgreParentClubId();
      const memberId = this.sharedservice.getLoggedInId();
      const deviceId = this.sharedservice.getDeviceId();
      const platform = this.sharedservice.getPlatform();

      if (!parentclubId || !memberId || !this.activityId || !this.activityCode) {
        throw new Error("Required data is missing");
      }

      const leaguefixtureId = this.getLeagueFixtureId();
      if (!leaguefixtureId) {
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
        activityId: this.activityId,
        activityCode: this.activityCode,
        leaguefixtureId: leaguefixtureId,
      };
    } catch (error) {
      console.error("Error creating base result input:", error);
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

  PublishLeagueResult(result_input: any): void {
    try {
      if (!result_input) {
        console.error("Result input is null or undefined");
        this.commonService.toastMessage("Invalid result data", 3000, ToastMessageType.Error);
        return;
      }

      if (!result_input.parentclubId || !result_input.activityId || !result_input.memberId) {
        console.error("Required fields missing in result input");
        this.commonService.toastMessage("Required data is missing", 3000, ToastMessageType.Error);
        return;
      }

      if (!result_input.Tennis || !result_input.Tennis.LEAGUE_FIXTURE_ID) {
        console.error("Tennis data or fixture ID is missing");
        this.commonService.toastMessage("Match fixture data is missing", 3000, ToastMessageType.Error);
        return;
      }

      this.httpService.post(`${API.Publish_League_Result_For_Activities}`, result_input).subscribe(
        (res: any) => {
          try {
            if (res && res.data) {
              console.log("Publish_League_Result RESPONSE", res.data);
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

  PublishLeagueResultWithRollback(result_input: any, team: 'HOME' | 'AWAY'): void {
    this.commonService.showLoader("Updating result");
    this.httpService.post(`${API.Publish_League_Result_For_Activities}`, result_input).subscribe(
      (res: any) => {
        this.commonService.hideLoader();
        // Close popup immediately on API success
        if (this.isHomeStatsPopupVisible) this.isHomeStatsPopupVisible = false;
        if (this.isAwayStatsPopupVisible) this.isAwayStatsPopupVisible = false;

        if (res.data) {
          console.log("Publish_League_Result RESPONSE", res.data);
          this.commonService.toastMessage("Result updated successfully", 2500, ToastMessageType.Success);
          // Clear backup on success
          if (team === 'HOME') this.homeStatsBackup = null;
          if (team === 'AWAY') this.awayStatsBackup = null;
          this.getLeagueMatchResult();
        } else {
          console.log("No data received from PublishLeagueResult");
          this.rollbackStats(team);
        }
      },
      (error) => {
        this.commonService.hideLoader();
        console.error("Error publishing result:", error);
        this.commonService.toastMessage("Failed to update stats. Reverted to previous values.", 3000, ToastMessageType.Error);
        if (this.isHomeStatsPopupVisible) this.isHomeStatsPopupVisible = false;
        if (this.isAwayStatsPopupVisible) this.isAwayStatsPopupVisible = false;
        this.rollbackStats(team);
      }
    );
  }

  private rollbackStats(team: 'HOME' | 'AWAY'): void {
    if (team === 'HOME' && this.homeStatsBackup) {
      if (this.result_json.HOME_TEAM) {
        this.result_json.HOME_TEAM.ACES = this.homeStatsBackup.ACES;
        this.result_json.HOME_TEAM.DOUBLE_FAULTS = this.homeStatsBackup.DOUBLE_FAULTS;
        this.result_json.HOME_TEAM.FIRST_SERVE_PERCENTAGE = this.homeStatsBackup.FIRST_SERVE_PERCENTAGE;
        this.result_json.HOME_TEAM.UNFORCED_ERRORS = this.homeStatsBackup.UNFORCED_ERRORS;
        this.result_json.HOME_TEAM.BREAK_POINTS_WON = this.homeStatsBackup.BREAK_POINTS_WON;
      }
      this.homeStatsBackup = null;
    }

    if (team === 'AWAY' && this.awayStatsBackup) {
      if (this.result_json.AWAY_TEAM) {
        this.result_json.AWAY_TEAM.ACES = this.awayStatsBackup.ACES;
        this.result_json.AWAY_TEAM.DOUBLE_FAULTS = this.awayStatsBackup.DOUBLE_FAULTS;
        this.result_json.AWAY_TEAM.FIRST_SERVE_PERCENTAGE = this.awayStatsBackup.FIRST_SERVE_PERCENTAGE;
        this.result_json.AWAY_TEAM.UNFORCED_ERRORS = this.awayStatsBackup.UNFORCED_ERRORS;
        this.result_json.AWAY_TEAM.BREAK_POINTS_WON = this.awayStatsBackup.BREAK_POINTS_WON;
      }
      this.awayStatsBackup = null;
    }
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
      if (!this.leagueMatchParticipantInput.MatchId || !this.leagueMatchParticipantInput.activityId) {
        this.leagueMatchParticipantRes = [];
        return;
      }

      if (!this.leagueMatchParticipantInput.TeamId || !this.leagueMatchParticipantInput.TeamId2) {
        this.leagueMatchParticipantRes = [];
        return;
      }

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
              console.log("Get_League_Match_Participant RESPONSE", JSON.stringify(res.data));
            } else {
              this.leagueMatchParticipantRes = [];
            }
          } catch (error) {
            this.leagueMatchParticipantRes = [];
          }
        },
        (error) => {
          this.commonService.hideLoader();
          console.error("Error fetching league match participants:", error);
          this.leagueMatchParticipantRes = [];
        }
      );
    } catch (error) {
      this.commonService.hideLoader();
      this.leagueMatchParticipantRes = [];
    }
  }

  getIndividualMatchParticipant(): void {
    try {
      console.log('getIndividualMatchParticipant called for non-league flow');
      console.log('MatchId:', this.getIndividualMatchParticipantInput.MatchId);
      console.log('activityId:', this.getIndividualMatchParticipantInput.activityId);
      
      if (!this.getIndividualMatchParticipantInput.MatchId || !this.getIndividualMatchParticipantInput.activityId) {
        console.log('Missing MatchId or activityId, exiting');
        this.getIndividualMatchParticipantRes = [];
        return;
      }

      const homeTeamId = this.getHomeTeamId();
      const awayTeamId = this.getAwayTeamId();
      console.log('homeTeamId:', homeTeamId, 'awayTeamId:', awayTeamId);

      if (!homeTeamId || !awayTeamId) {
        console.log('Missing team IDs, exiting');
        this.getIndividualMatchParticipantRes = [];
        return;
      }

      if (homeTeamId === awayTeamId) {
        console.log('Same team IDs, exiting');
        this.getIndividualMatchParticipantRes = [];
        return;
      }

      console.log('Making API call to GetIndividualMatchParticipant');

      this.commonService.showLoader("Fetching participants...");

      const homeTeamInput = { ...this.getIndividualMatchParticipantInput, TeamId: homeTeamId };

      this.httpService.post(`${API.GetIndividualMatchParticipant}`, homeTeamInput).subscribe(
        (homeRes: any) => {
          const awayTeamInput = { ...this.getIndividualMatchParticipantInput, TeamId: awayTeamId };

          this.httpService.post(`${API.GetIndividualMatchParticipant}`, awayTeamInput).subscribe(
            (awayRes: any) => {
              this.commonService.hideLoader();
              try {
                const homeParticipants = (homeRes && homeRes.data && Array.isArray(homeRes.data)) ? homeRes.data : [];
                const awayParticipants = (awayRes && awayRes.data && Array.isArray(awayRes.data)) ? awayRes.data : [];

                this.getIndividualMatchParticipantRes = [...homeParticipants, ...awayParticipants];
              } catch (error) {
                this.getIndividualMatchParticipantRes = [];
              }
            },
            (error) => {
              this.commonService.hideLoader();
              this.getIndividualMatchParticipantRes = [];
            }
          );
        },
        (error) => {
          this.commonService.hideLoader();
          this.getIndividualMatchParticipantRes = [];
        }
      );
    } catch (error) {
      console.error('Error in getIndividualMatchParticipant:', error);
      this.commonService.hideLoader();
      this.getIndividualMatchParticipantRes = [];
    }
  }

  // UI Data Binding Getters - Support both league and match flows
  get homeTeamName(): string {
    const name = (this.result_json && this.result_json.HOME_TEAM && this.result_json.HOME_TEAM.TEAM_NAME) || this.getHomeTeamName();
    return name;
  }

  get awayTeamName(): string {
    const name = (this.result_json && this.result_json.AWAY_TEAM && this.result_json.AWAY_TEAM.TEAM_NAME) || this.getAwayTeamName();
    return name;
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
      return (this.matchObj && (this.matchObj as any).location_name) ? (this.matchObj as any).location_name : '';
    } else {
      return (this.matchTeamObj && this.matchTeamObj.VenueName) ? this.matchTeamObj.VenueName : '';
    }
  }

  // Unified getter for participant data regardless of flow type
  get participantData(): any[] {
    return this.isLeague ? this.leagueMatchParticipantRes : this.getIndividualMatchParticipantRes;
  }
}

export class GetIndividualMatchParticipantInput {
  parentclubId: string;
  clubId: string;
  activityId: string;
  memberId: string;
  action_type: number;
  device_type: number;
  app_type: number;
  device_id: string;
  updated_by: string;
  MatchId: string;
  TeamId: string;
  leagueTeamPlayerStatusType: number;
}