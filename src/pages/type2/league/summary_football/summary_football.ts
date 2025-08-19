import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { IonicPage, ModalController, NavController, NavParams } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { CommonService, ToastMessageType, ToastPlacement } from '../../../../services/common.service';
import { AlertController } from 'ionic-angular/components/alert/alert-controller';
import { LeagueMatch } from '../models/location.model';
import { LeagueMatchParticipantModel, LeagueParticipationForMatchModel, SelectedPlayerScorersModel } from '../models/league.model';
import { HttpService } from '../../../../services/http.service';
import { API } from '../../../../shared/constants/api_constants';
import { LeagueTeamPlayerStatusType } from '../../../../shared/utility/enums';
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
  matchObj: LeagueMatch;
  leagueId: string;
  activityId: string;
  activityCode: number;
  homeTeamObj: LeagueParticipationForMatchModel;
  awayTeamObj: LeagueParticipationForMatchModel;
  selectedPlayersPotm: LeagueMatchParticipantModel[] = [];
  selectedPlayerhomeScorers: SelectedPlayerScorersModel[] = [];
  selectedPlayersawayScorers: SelectedPlayerScorersModel[] = [];
  selectedPOTMs: any[] = [];
  potmDisabled: boolean = false;
  leagueMatchParticipantRes: LeagueMatchParticipantModel[] = [];
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
    activityCode: '',
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
      this.matchObj = this.navParams.get("match");
      this.leagueId = this.navParams.get("leagueId");
      this.activityId = this.navParams.get("activityId");
      this.activityCode = this.navParams.get("activityCode");
      this.homeTeamObj = this.navParams.get("homeTeam");
      this.awayTeamObj = this.navParams.get("awayTeam");
      console.log("ACTIVITY CODE:", this.activityCode);

      // Initialize API inputs
      this.initializeApiInputs();

    } catch (error) {
      console.error("Error initializing component:", error);
      this.commonService.toastMessage("Error initializing page", 3000, ToastMessageType.Error);
    }
  }

  private initializeApiInputs(): void {
    const baseInput = this.createBaseApiInput();

    // Initialize league match participant input
    this.leagueMatchParticipantInput = {
      ...baseInput,
      LeagueId: this.leagueId,
      MatchId: this.matchObj.match_id,
      TeamId: this.homeTeamObj.parentclubteam.id || '',
      TeamId2: this.awayTeamObj.parentclubteam.id || '',
      leagueTeamPlayerStatusType: LeagueTeamPlayerStatusType.PLAYINGPLUSBENCH
    };

    // Initialize league match result input
    this.leagueMatchResultInput = {
      ...baseInput,
      MatchId: this.matchObj.match_id,
      ActivityCode: this.activityCode || 0
    };

    // Initialize publish league result input
    this.publishLeagueResultForActivitiesInput = {
      ...baseInput,
      activityCode: this.activityCode.toString() || '',
      leaguefixtureId: this.matchObj.fixture_id || '',
      homeLeagueParticipationId: this.homeTeamObj.id || '',
      awayLeagueParticipationId: this.awayTeamObj.id || '',
      isDrawn: false,
      isHomeTeamWinner: false,
      isAwayTeamWinner: false,
      Football: {
        LEAGUE_FIXTURE_ID: '',
        result_description: '',
        result_dets: '',
        POTM: [],
        HOME_TEAM: {
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

    // Load data
    this.getLeagueMatchParticipant();
    this.getLeagueMatchResult();
  }

  private createBaseApiInput(): any {
    return {
      parentclubId: this.sharedservice.getPostgreParentClubId() || '',
      clubId: '',
      activityId: this.activityId || '',
      memberId: this.sharedservice.getLoggedInId() || '',
      action_type: 0,
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
    this.httpService.post(`${API.Get_League_Match_Result}`, this.leagueMatchResultInput).subscribe(
      (res: any) => {
        try {
          if (res.data) {
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
        this.commonService.toastMessage("Error fetching match result", 3000, ToastMessageType.Error);
        this.initializeDefaultValues();
      }
    );
  }

  private processLeagueMatchResult(rawResultJson: any): void {
    if (typeof rawResultJson === 'string') {
      try {
        this.result_json = JSON.parse(rawResultJson) as FootballResultModel;
        console.log("Decoded result_json (parsed):", this.result_json);
      } catch (err) {
        console.error('Failed to parse result_json:', err, rawResultJson);
        this.result_json = {};
      }
    } else if (typeof rawResultJson === 'object' && rawResultJson !== null) {
      this.result_json = rawResultJson as FootballResultModel;
      console.log("Decoded result_json (object):", this.result_json);
    } else {
      console.warn('result_json is neither string nor object:', rawResultJson);
      this.result_json = {};
    }


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
    this.homeScore = "0";
    this.awayScore = "0";
    this.homePoss = "0.00";
    this.awayPoss = "0.00";
  }

  PublishLeagueResult(result_input: Partial<PublishLeagueResultForActivitiesInput>): void {
    this.httpService.post(`${API.Publish_League_Result_For_Activities}`, result_input).subscribe(
      (res: any) => {
        if (res.data) {
          console.log("Publish_League_Result RESPONSE", res.data);
          this.commonService.toastMessage("Result published successfully", 2500, ToastMessageType.Success);
          if (this.isHomeStatsPopupVisible) this.isHomeStatsPopupVisible = false;
          if (this.isAwayStatsPopupVisible) this.isAwayStatsPopupVisible = false;
          this.getLeagueMatchResult();
        } else {
          console.log("No data received from PublishLeagueResult");
        }
      },
      (error) => {
        console.error("Error publishing league result:", error);
        this.commonService.toastMessage("Error publishing result", 3000, ToastMessageType.Error);
      }
    );
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
            console.log("Publish_League_Result_For_Activities RESPONSE", res.data);
            this.getLeagueMatchResult();
          } else {
            console.log("No data received from publishLeagueResultForActivities");
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

  getLeagueMatchParticipant(): void {
    if (!this.leagueMatchParticipantInput.TeamId || !this.leagueMatchParticipantInput.TeamId2) {
      console.error("TeamId and TeamId2 are required for getLeagueMatchParticipant");
      return;
    }

    this.commonService.showLoader("Fetching participants...");

    this.httpService.post(`${API.Get_League_Match_Participant}`, this.leagueMatchParticipantInput).subscribe(
      (res: any) => {
        this.commonService.hideLoader();
        if (res.data) {
          this.leagueMatchParticipantRes = res.data || [];
          console.log("Get_League_Match_Participant RESPONSE", JSON.stringify(res.data));
        } else {
          console.log("No participants data received");
          this.leagueMatchParticipantRes = [];
        }
      },
      (error) => {
        this.commonService.hideLoader();
        console.error("Error fetching league match participants:", error);
        this.commonService.toastMessage("Error fetching participants", 3000, ToastMessageType.Error);
        this.leagueMatchParticipantRes = [];
      }
    );
  }

  async updateHomeTeamStats() {
    const result_input: Partial<PublishLeagueResultForActivitiesInput> = {
      ...this.createBaseResultInput(),
      Football: {
        LEAGUE_FIXTURE_ID: this.matchObj.fixture_id || '',
        HOME_TEAM: {
          TEAM_NAME: this.homeTeamObj.parentclubteam.teamName || '',
          TEAM_ID: this.homeTeamObj.parentclubteam.id || '',
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
  }

  async updateAwayTeamStats() {
    const result_input: Partial<PublishLeagueResultForActivitiesInput> = {
      ...this.createBaseResultInput(),
      Football: {
        LEAGUE_FIXTURE_ID: this.matchObj.fixture_id || '',
        AWAY_TEAM: {
          TEAM_NAME: this.awayTeamObj.parentclubteam.teamName || '',
          TEAM_ID: this.awayTeamObj.parentclubteam.id || '',
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
  }

  async gotoScoreInputPage(ishome: boolean): Promise<void> {
    const score = ishome ? this.homeScore : this.awayScore;
    const teamObj = ishome ? this.homeTeamObj : this.awayTeamObj;

    if (!score || parseInt(score) <= 0) {
      this.commonService.toastMessage("Please set the score first", 3000, ToastMessageType.Info);
      return;
    }

    const modal = this.modalCtrl.create("ScoreInputPage", {
      "matchObj": this.matchObj,
      "leagueId": this.leagueId,
      "activityId": this.activityId,
      "teamObj": teamObj,
      "score": parseInt(score),
      "ishome": ishome,
      "resultObject": this.result_json
    });

    modal.onDidDismiss(data => {
      console.log('ScoreInputPage modal dismissed');
      if (data.goalDetails) {
        this.handleScoreInputResult(data.goalDetails, ishome);
      } else {
        console.log('No goal details received from modal');
      }
    });

    modal.present();
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
          LEAGUE_FIXTURE_ID: this.matchObj.fixture_id || '',
          ...(ishome ? {
            HOME_TEAM: {
              TEAM_NAME: this.homeTeamObj.parentclubteam.teamName || '',
              TEAM_ID: this.homeTeamObj.parentclubteam.id || '',
              SCORE: scoreData
            }
          } : {
            AWAY_TEAM: {
              TEAM_NAME: this.awayTeamObj.parentclubteam.teamName || '',
              TEAM_ID: this.awayTeamObj.parentclubteam.id || '',
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
    return {
      parentclubId: this.sharedservice.getPostgreParentClubId() || '',
      clubId: '',
      memberId: this.sharedservice.getLoggedInId() || '',
      action_type: 0,
      device_type: this.sharedservice.getPlatform() === "android" ? 1 : 2,
      app_type: AppType.ADMIN_NEW,
      device_id: this.sharedservice.getDeviceId() || '',
      updated_by: this.sharedservice.getLoggedInId() || '',
      created_by: this.sharedservice.getLoggedInId() || '',
      activityId: this.activityId || '',
      activityCode: this.activityCode.toString() || '',
      leaguefixtureId: this.matchObj.fixture_id || '',
    };
  }

  async gotoResultInputPage(): Promise<void> {
    console.log("Going to result input page");

    const modal = this.modalCtrl.create("ResultInputPage", {
      "matchObj": this.matchObj,
      "leagueId": this.leagueId,
      "activityId": this.activityId,
      "homeTeamObj": this.homeTeamObj,
      "awayTeamObj": this.awayTeamObj,
      "resultId": this.getLeagueMatchResultRes.Id,
      "activityCode": this.activityCode,
      "resultObject": this.result_json
    });

    modal.onDidDismiss(data => {
      console.log('ResultInputPage modal dismissed');
      if (data && this.isValidResultData(data)) {
        this.handleResultInputData(data);
      } else {
        console.log('Invalid or no data received from result input modal');
      }
    });

    modal.present();
  }

  private isValidResultData(data: any): boolean {
    return data &&
      data.homeTeamGoals !== undefined &&
      data.awayTeamGoals !== undefined &&
      parseInt(data.homeTeamGoals) >= 0 &&
      parseInt(data.awayTeamGoals) >= 0;
  }

  private handleResultInputData(data: any): void {
    try {
      console.log("Received data from result input page:", data);

      const homeGoals = parseInt(data.homeTeamGoals);
      const awayGoals = parseInt(data.awayTeamGoals);

      this.homeScore = homeGoals.toString();
      this.awayScore = awayGoals.toString();

      // Extract footballResultStats with null checks
      const footballResultStats: FootballResultStatsModel = data.footballResultStats || {};

      const result_input: Partial<PublishLeagueResultForActivitiesInput> = {
        ...this.createBaseResultInput(),
        Football: {
          LEAGUE_FIXTURE_ID: this.matchObj.fixture_id || '',
          HOME_TEAM: {
            TEAM_NAME: this.homeTeamObj.parentclubteam.teamName || '',
            TEAM_ID: this.homeTeamObj.parentclubteam.id || '',
            GOAL: homeGoals.toString()
          },
          AWAY_TEAM: {
            TEAM_NAME: this.awayTeamObj.parentclubteam.teamName || '',
            TEAM_ID: this.awayTeamObj.parentclubteam.id || '',
            GOAL: awayGoals.toString()
          },
          RESULT: {
            DESCRIPTION: footballResultStats.DESCRIPTION || '',
            WINNER_ID: footballResultStats.WINNER_ID || '',
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
    console.log("Going to POTM page");

    const modal = this.modalCtrl.create("PotmPage", {
      "matchObj": this.matchObj,
      "leagueId": this.leagueId,
      "activityId": this.activityId,
      "homeTeamObj": this.homeTeamObj,
      "awayTeamObj": this.awayTeamObj,
      "resultObject": this.result_json
    });

    modal.onDidDismiss(data => {
      console.log('PotmPage modal dismissed');
      if (data && Array.isArray(data)) {
        this.selectedPlayersPotm = data;
        console.log("Received selected POTM players:", this.selectedPlayersPotm);

        const result_input: Partial<PublishLeagueResultForActivitiesInput> = {
          ...this.createBaseResultInput(),
          Football: {
            LEAGUE_FIXTURE_ID: this.matchObj.fixture_id || '',
            POTM: this.potmDisplayNames,
            // POTM_PLAYERS: this.potmDisplayString
          }
        };

        this.PublishLeagueResult(result_input);
      } else {
        console.log('No valid POTM data received from modal');
      }
    });

    modal.present();
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

    console.log(
      "Original values - Home:",
      this.homePoss,
      "Away:",
      this.awayPoss
    );
    console.log("Parsed values - Home:", homeValue, "Away:", awayValue);

    // Ensure values are between 0 and 100
    homeValue = Math.max(0, Math.min(100, homeValue));
    awayValue = Math.max(0, Math.min(100, awayValue));

    const total = homeValue + awayValue;
    console.log("Total:", total);

    // If both are 0, show equal split
    if (total === 0) {
      homeValue = 50;
      awayValue = 50;
    }
    // Only normalize if total is significantly different from 100 (allow for small rounding errors)
    else if (Math.abs(total - 100) > 0.1) {
      console.log("Normalizing values because total is", total);
      homeValue = (homeValue / total) * 100;
      awayValue = (awayValue / total) * 100;
    }

    // FORMAT TO 2 DECIMAL PLACES HERE - This was missing
    homeValue = parseFloat(homeValue.toFixed(2));
    awayValue = parseFloat(awayValue.toFixed(2));

    const data = [homeValue, awayValue];
    console.log("Final chart data:", data);

    // ADDITIONAL DEBUG - Show what percentage each slice should be
    console.log(
      `Home slice should be: ${homeValue}% = ${(
        (homeValue / 100) *
        360
      ).toFixed(1)}°`
    );
    console.log(
      `Away slice should be: ${awayValue}% = ${(
        (awayValue / 100) *
        360
      ).toFixed(1)}°`
    );

    const labels = [
      this.homeTeamObj.parentclubteam.teamName || "Home Team",
      this.awayTeamObj.parentclubteam.teamName || "Away Team",
    ];
    const colors = ["green", "red"]; // Home team = green, Away team = red (matching HTML)

    let startAngle = -Math.PI / 2; // Start from top

    // Clear canvas first
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < data.length; i++) {
      if (data[i] > 0) {
        const sliceAngle = (2 * Math.PI * data[i]) / 100;
        console.log(
          `Drawing slice ${i}: value=${data[i]}%, angle=${sliceAngle.toFixed(
            4
          )} radians, degrees=${((sliceAngle * 180) / Math.PI).toFixed(1)}°`
        );

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

    // Rest of your original logo drawing code...
    const homeLogo = new Image();
    homeLogo.src =
      this.homeTeamObj.parentclubteam.logo_url ||
      "assets/imgs/default-team-logo.png";
    console.log(
      "Home team logo URL:",
      this.homeTeamObj.parentclubteam.logo_url
    );
    const awayLogo = new Image();
    awayLogo.src =
      this.awayTeamObj.parentclubteam.logo_url ||
      "assets/imgs/default-team-logo.png";

    let imagesLoaded = 0;
    const totalImages = 2;

    const checkImagesLoaded = () => {
      imagesLoaded++;
      if (imagesLoaded === totalImages) {
        let logoWidth = 40;
        let logoHeight = 40;
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

  // Utility Methods
  get homeTeamData(): FootballTeamStatsModel | null {
    if (!this.result_json) return null;
    return this.result_json.HOME_TEAM;
  }

  get awayTeamData(): FootballTeamStatsModel | null {
    if (!this.result_json) return null;
    return this.result_json.AWAY_TEAM;
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

}