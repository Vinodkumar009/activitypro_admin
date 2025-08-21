import { Component, ViewChild, ElementRef } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController } from 'ionic-angular';
import { CommonService, ToastMessageType } from '../../../../services/common.service';
import { SharedServices } from '../../../services/sharedservice';
import { HttpService } from '../../../../services/http.service';
import { API } from '../../../../shared/constants/api_constants';
import { AppType } from '../../../../shared/constants/module.constants';
import { LeagueTeamPlayerStatusType } from '../../../../shared/utility/enums';

@IonicPage()
@Component({
  selector: 'page-tennis-summary-tennis',
  templateUrl: 'tennis_summary_tennis.html',
  providers: [HttpService]
})
export class TennisSummaryTennisPage {
  matchObj: any;
  homeTeamObj: any;
  awayTeamObj: any;
  result_json: TennisResultModel = {
    POTM: [],
    RESULT: {
      WINNER_ID: '',
      RESULT_STATUS: '0'
    },
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
  leagueMatchResultInput: any = {};
  getLeagueMatchResultRes: any;
  publishLeagueResultForActivitiesInput: any = {};
  leagueMatchParticipantInput: any = {};
  leagueMatchParticipantRes: any[] = [];

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public commonService: CommonService,
    public sharedservice: SharedServices,
    private httpService: HttpService,
    public modalCtrl: ModalController
  ) {
      this.matchObj = this.navParams.get("match");
      this.leagueId = this.navParams.get("leagueId");
      this.activityId = this.navParams.get("activityId");
      this.activityCode = this.navParams.get("activityCode");
      this.homeTeamObj = this.navParams.get("homeTeam");
      this.awayTeamObj = this.navParams.get("awayTeam");
    
    this.initializeInputs();
    this.getLeagueMatchResult();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SummaryTennisPage');
  }

  private initializeInputs(): void {
    const baseInput = this.createBaseApiInput();

    this.leagueMatchResultInput = {
      ...baseInput,
      MatchId: this.matchObj.match_id,
      ActivityCode: this.activityCode || 0
    };

    this.publishLeagueResultForActivitiesInput = {
      ...baseInput,
      Tennis: {
        LEAGUE_FIXTURE_ID: this.matchObj && this.matchObj.fixture_id || '',
        POTM: [],
        RESULT: {
          WINNER_ID: "",
          RESULT_STATUS: "0"
        },
        HOME_TEAM: {
          TEAM_NAME: this.homeTeamObj && this.homeTeamObj.parentclubteam && this.homeTeamObj.parentclubteam.teamName || '',
          TEAM_ID: this.homeTeamObj && this.homeTeamObj.parentclubteam && this.homeTeamObj.parentclubteam.id || '',
          SETS_WON: "0",
          GAMES_WON: "0",
          ACES: "0",
          DOUBLE_FAULTS: "0",
          FIRST_SERVE_PERCENTAGE: "0",
          UNFORCED_ERRORS: "0",
          BREAK_POINTS_WON: "0"
        },
        AWAY_TEAM: {
          TEAM_NAME: this.awayTeamObj && this.awayTeamObj.parentclubteam && this.awayTeamObj.parentclubteam.teamName || '',
          TEAM_ID: this.awayTeamObj && this.awayTeamObj.parentclubteam && this.awayTeamObj.parentclubteam.id || '',
          SETS_WON: "0",
          GAMES_WON: "0",
          ACES: "0",
          DOUBLE_FAULTS: "0",
          FIRST_SERVE_PERCENTAGE: "0",
          UNFORCED_ERRORS: "0",
          BREAK_POINTS_WON: "0"
        },
        SET_SCORES: []
      }
    };

    this.leagueMatchParticipantInput = {
          ...baseInput,
          LeagueId: this.leagueId,
          MatchId: this.matchObj.match_id,
          TeamId: this.homeTeamObj.parentclubteam.id || '',
          TeamId2: this.awayTeamObj.parentclubteam.id || '',
          leagueTeamPlayerStatusType: LeagueTeamPlayerStatusType.PLAYINGPLUSBENCH
    };
  }

  private createBaseApiInput(): any {
    const parentclubId = this.sharedservice.getPostgreParentClubId();
    const userId = this.sharedservice.getLoggedInUserId();
    
    return {
      parentclubId: this.sharedservice.getPostgreParentClubId() || '',
      clubId: '',
      activityId: this.activityId || '',
      activityCode:this.activityCode,
      memberId: this.sharedservice.getLoggedInId() || '',
      action_type: 0,
      device_type: this.sharedservice.getPlatform() === "android" ? 1 : 2,
      app_type: AppType.ADMIN_NEW,
      device_id: this.sharedservice.getDeviceId() || '',
      updated_by: this.sharedservice.getLoggedInUserId(),
      created_by: this.sharedservice.getLoggedInUserId()
    };
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
    const modal = this.modalCtrl.create('TennisSetInputPage', {
      matchObj: this.matchObj,
      homeTeamObj: this.homeTeamObj,
      awayTeamObj: this.awayTeamObj,
      isHomeTeam: isHomeTeam,
      result_json: this.result_json
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
    const modal = this.modalCtrl.create('TennisResultInputPage', {
      matchObj: this.matchObj,
      homeTeamObj: this.homeTeamObj,
      awayTeamObj: this.awayTeamObj,
      result_json: this.result_json,
      activityId: this.activityId,
      activityCode: this.activityCode,
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
    this.getLeagueMatchParticipant();
    setTimeout(() => {
      const modal = this.modalCtrl.create('TennisPotmPage', {
        matchObj: this.matchObj,
        homeTeamObj: this.homeTeamObj,
        awayTeamObj: this.awayTeamObj,
        participants: this.leagueMatchParticipantRes,
        result_json: this.result_json
      });

      modal.onDidDismiss(data => {
        if (data && Array.isArray(data)) {
          this.handlePotmData(data);
        }
      });

      modal.present();
    }, 500);
  }

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
        this.commonService.toastMessage("Error fetching match result", 2500, ToastMessageType.Error);
        this.initializeDefaultValues();
      }
    );
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

    this.updateComponentFromResultJson();
  }

  private updateComponentFromResultJson(): void {
    if (this.result_json) {
      const homeTeam = this.result_json.HOME_TEAM;
      const awayTeam = this.result_json.AWAY_TEAM;

      if (homeTeam && awayTeam) {
        this.homeScore = homeTeam.SETS_WON && homeTeam.SETS_WON.toString() || "0";
        this.awayScore = awayTeam.SETS_WON && awayTeam.SETS_WON.toString() || "0";
      }

      if (this.result_json.POTM && this.result_json.POTM.length > 0) {
        this.potmDisplayNames = this.result_json.POTM;
      }
    }
  }

  private initializeDefaultValues(): void {
    this.result_json = {
      POTM: [],
      RESULT: {
        WINNER_ID: '',
        RESULT_STATUS: '0'
      },
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
    this.homeScore = "0";
    this.awayScore = "0";
    this.potmDisplayNames = [];
  }

  updateHomeTeamStats(): void {
    if (!this.validateTeamStats('HOME')) {
      return;
    }

    // Create backup before updating
    this.homeStatsBackup = {
      ACES: this.result_json.HOME_TEAM && this.result_json.HOME_TEAM.ACES || '0',
      DOUBLE_FAULTS: this.result_json.HOME_TEAM && this.result_json.HOME_TEAM.DOUBLE_FAULTS || '0',
      FIRST_SERVE_PERCENTAGE: this.result_json.HOME_TEAM && this.result_json.HOME_TEAM.FIRST_SERVE_PERCENTAGE || '0',
      UNFORCED_ERRORS: this.result_json.HOME_TEAM && this.result_json.HOME_TEAM.UNFORCED_ERRORS || '0',
      BREAK_POINTS_WON: this.result_json.HOME_TEAM && this.result_json.HOME_TEAM.BREAK_POINTS_WON || '0'
    };

    const result_input = {
      ...this.createBaseResultInput(),
      Tennis: {
        LEAGUE_FIXTURE_ID: this.matchObj && this.matchObj.fixture_id || '',
        HOME_TEAM: {
          TEAM_NAME: this.homeTeamObj && this.homeTeamObj.parentclubteam && this.homeTeamObj.parentclubteam.teamName || '',
          TEAM_ID: this.homeTeamObj && this.homeTeamObj.parentclubteam && this.homeTeamObj.parentclubteam.id || '',
          ACES: (this.result_json.HOME_TEAM && this.result_json.HOME_TEAM.ACES || 0).toString(),
          DOUBLE_FAULTS: (this.result_json.HOME_TEAM && this.result_json.HOME_TEAM.DOUBLE_FAULTS || 0).toString(),
          FIRST_SERVE_PERCENTAGE: (this.result_json.HOME_TEAM && this.result_json.HOME_TEAM.FIRST_SERVE_PERCENTAGE || 0).toString(),
          UNFORCED_ERRORS: (this.result_json.HOME_TEAM && this.result_json.HOME_TEAM.UNFORCED_ERRORS || 0).toString(),
          BREAK_POINTS_WON: (this.result_json.HOME_TEAM && this.result_json.HOME_TEAM.BREAK_POINTS_WON || 0).toString()
        }
      }
    };

    this.PublishLeagueResultWithRollback(result_input, 'HOME');
  }

  updateAwayTeamStats(): void {
    if (!this.validateTeamStats('AWAY')) {
      return;
    }

    // Create backup before updating
    this.awayStatsBackup = {
      ACES: this.result_json.AWAY_TEAM && this.result_json.AWAY_TEAM.ACES || '0',
      DOUBLE_FAULTS: this.result_json.AWAY_TEAM && this.result_json.AWAY_TEAM.DOUBLE_FAULTS || '0',
      FIRST_SERVE_PERCENTAGE: this.result_json.AWAY_TEAM && this.result_json.AWAY_TEAM.FIRST_SERVE_PERCENTAGE || '0',
      UNFORCED_ERRORS: this.result_json.AWAY_TEAM && this.result_json.AWAY_TEAM.UNFORCED_ERRORS || '0',
      BREAK_POINTS_WON: this.result_json.AWAY_TEAM && this.result_json.AWAY_TEAM.BREAK_POINTS_WON || '0'
    };

    const result_input = {
      ...this.createBaseResultInput(),
      Tennis: {
        LEAGUE_FIXTURE_ID: this.matchObj && this.matchObj.fixture_id || '',
        AWAY_TEAM: {
          TEAM_NAME: this.awayTeamObj && this.awayTeamObj.parentclubteam && this.awayTeamObj.parentclubteam.teamName || '',
          TEAM_ID: this.awayTeamObj && this.awayTeamObj.parentclubteam && this.awayTeamObj.parentclubteam.id || '',
          ACES: (this.result_json.AWAY_TEAM && this.result_json.AWAY_TEAM.ACES || 0).toString(),
          DOUBLE_FAULTS: (this.result_json.AWAY_TEAM && this.result_json.AWAY_TEAM.DOUBLE_FAULTS || 0).toString(),
          FIRST_SERVE_PERCENTAGE: (this.result_json.AWAY_TEAM && this.result_json.AWAY_TEAM.FIRST_SERVE_PERCENTAGE || 0).toString(),
          UNFORCED_ERRORS: (this.result_json.AWAY_TEAM && this.result_json.AWAY_TEAM.UNFORCED_ERRORS || 0).toString(),
          BREAK_POINTS_WON: (this.result_json.AWAY_TEAM && this.result_json.AWAY_TEAM.BREAK_POINTS_WON || 0).toString()
        }
      }
    };

    this.PublishLeagueResultWithRollback(result_input, 'AWAY');
  }

  private validateTeamStats(team: 'HOME' | 'AWAY'): boolean {
    const teamData = team === 'HOME' ? this.result_json.HOME_TEAM : this.result_json.AWAY_TEAM;
    const teamName = team === 'HOME' ? this.homeTeamObj.parentclubteam.teamName : this.awayTeamObj.parentclubteam.teamName;

    if (!teamData) {
      this.commonService.toastMessage(`${teamName} data not found`, 2500, ToastMessageType.Error);
      return false;
    }

    const aces = parseInt(teamData.ACES) || 0;
    const doubleFaults = parseInt(teamData.DOUBLE_FAULTS) || 0;
    const firstServePercentage = parseFloat(teamData.FIRST_SERVE_PERCENTAGE) || 0;
    const unforcedErrors = parseInt(teamData.UNFORCED_ERRORS) || 0;
    const breakPointsWon = parseInt(teamData.BREAK_POINTS_WON) || 0;

    if (aces < 0) {
      this.commonService.toastMessage(`${teamName}: Aces cannot be negative`, 2500, ToastMessageType.Error);
      return false;
    }

    if (doubleFaults < 0) {
      this.commonService.toastMessage(`${teamName}: Double faults cannot be negative`, 2500, ToastMessageType.Error);
      return false;
    }

    if (firstServePercentage < 0 || firstServePercentage > 100) {
      this.commonService.toastMessage(`${teamName}: First serve percentage must be between 0-100`, 2500, ToastMessageType.Error);
      return false;
    }

    if (unforcedErrors < 0) {
      this.commonService.toastMessage(`${teamName}: Unforced errors cannot be negative`, 2500, ToastMessageType.Error);
      return false;
    }

    if (breakPointsWon < 0) {
      this.commonService.toastMessage(`${teamName}: Break points won cannot be negative`, 2500, ToastMessageType.Error);
      return false;
    }

    if (aces > 50) {
      this.commonService.toastMessage(`${teamName}: Aces seem too high (max 50)`, 2500, ToastMessageType.Error);
      return false;
    }

    if (doubleFaults > 30) {
      this.commonService.toastMessage(`${teamName}: Double faults seem too high (max 30)`, 2500, ToastMessageType.Error);
      return false;
    }

    if (unforcedErrors > 100) {
      this.commonService.toastMessage(`${teamName}: Unforced errors seem too high (max 100)`, 2500, ToastMessageType.Error);
      return false;
    }

    return true;
  }

  private handleSetInputData(setScores: any[]): void {
    // if (!this.validateSetScores(setScores)) {
    //   return;
    // }

    const result_input = {
      ...this.createBaseResultInput(),
      Tennis: {
        LEAGUE_FIXTURE_ID: this.matchObj && this.matchObj.fixture_id || '',
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

    const result_input = {
      ...this.createBaseResultInput(),
      Tennis: {
        LEAGUE_FIXTURE_ID: this.matchObj && this.matchObj.fixture_id || '',
        RESULT: {
          WINNER_ID: data.selectedWinner || '',
          RESULT_STATUS: data.resultStatus || '0'
        },
        HOME_TEAM: {
          TEAM_NAME: this.homeTeamObj && this.homeTeamObj.parentclubteam && this.homeTeamObj.parentclubteam.teamName || '',
          TEAM_ID: this.homeTeamObj && this.homeTeamObj.parentclubteam && this.homeTeamObj.parentclubteam.id || '',
          SETS_WON: data.homeSetsWon || '0',
          GAMES_WON: data.homeGamesWon || '0'
        },
        AWAY_TEAM: {
          TEAM_NAME: this.awayTeamObj && this.awayTeamObj.parentclubteam && this.awayTeamObj.parentclubteam.teamName || '',
          TEAM_ID: this.awayTeamObj && this.awayTeamObj.parentclubteam && this.awayTeamObj.parentclubteam.id || '',
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
      PLAYER_ID: player.user && player.user.Id || ''
    }));

    const result_input = {
      ...this.createBaseResultInput(),
      Tennis: {
        LEAGUE_FIXTURE_ID: this.matchObj && this.matchObj.fixture_id || '',
        POTM: this.potmDisplayNames
      }
    };
    this.PublishLeagueResult(result_input);
  }

  

  private validateResultData(data: any): boolean {
    if (!data) {
      this.commonService.toastMessage('No result data provided', 2500, ToastMessageType.Error);
      return false;
    }

    if (data.resultStatus === '1') {
      if (!data.selectedWinner) {
        this.commonService.toastMessage('Winner must be selected for completed matches', 2500, ToastMessageType.Error);
        return false;
      }

      const homeSets = parseInt(data.homeSetsWon) || 0;
      const awaySets = parseInt(data.awaySetsWon) || 0;

      if (homeSets < 0 || awaySets < 0) {
        this.commonService.toastMessage('Sets cannot be negative', 2500, ToastMessageType.Error);
        return false;
      }

      if (homeSets === awaySets) {
        this.commonService.toastMessage('Match cannot end in a tie', 2500, ToastMessageType.Error);
        return false;
      }
    }

    return true;
  }

  private validatePotmData(potmPlayers: any[]): boolean {
    if (!potmPlayers || potmPlayers.length === 0) {
      this.commonService.toastMessage('No POTM players selected', 2500, ToastMessageType.Error);
      return false;
    }

    if (potmPlayers.length > 2) {
      this.commonService.toastMessage('Maximum 2 players can be selected as POTM', 2500, ToastMessageType.Error);
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
    return {
      user_postgre_metadata: { UserParentClubId: this.sharedservice.getPostgreParentClubId() },
      action_type: 1,
      device_type: this.sharedservice.getPlatform() === "android" ? 1 : 2,
      app_type: AppType.ADMIN_NEW,
      device_id: this.sharedservice.getDeviceId() || '',
      updated_by: this.sharedservice.getLoggedInUserId(),
      activityCode: this.activityCode,
      leaguefixtureId: this.matchObj.fixture_id
    };
  }

  PublishLeagueResult(result_input: any): void {
    this.commonService.showLoader("Updating result");
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
        this.commonService.hideLoader();
        console.error("Error publishing league result:", error);
        if(error.error && error.error.message) {
          this.commonService.toastMessage(error.error.message, 2500, ToastMessageType.Error);
        } else {
          this.commonService.toastMessage("Error publishing result", 2500, ToastMessageType.Error);
        }
      }
    );
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
        this.commonService.toastMessage("Failed to update stats. Reverted to previous values.", 2500, ToastMessageType.Error);
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
        this.commonService.toastMessage("Error fetching participants", 2500, ToastMessageType.Error);
        this.leagueMatchParticipantRes = [];
      }
    );
  }
}

interface TennisResultModel {
  LEAGUE_FIXTURE_ID?: string;
  POTM?: any[];
  RESULT?: {
    WINNER_ID?: string;
    RESULT_STATUS?: string;
  };
  HOME_TEAM?: {
    TEAM_NAME?: string;
    TEAM_ID?: string;
    SETS_WON?: string;
    GAMES_WON?: string;
    ACES?: string;
    DOUBLE_FAULTS?: string;
    FIRST_SERVE_PERCENTAGE?: string;
    UNFORCED_ERRORS?: string;
    BREAK_POINTS_WON?: string;
  };
  AWAY_TEAM?: {
    TEAM_NAME?: string;
    TEAM_ID?: string;
    SETS_WON?: string;
    GAMES_WON?: string;
    ACES?: string;
    DOUBLE_FAULTS?: string;
    FIRST_SERVE_PERCENTAGE?: string;
    UNFORCED_ERRORS?: string;
    BREAK_POINTS_WON?: string;
  };
  SET_SCORES?: Array<{
    SET_NUMBER?: number;
    SCORE?: string;
    WINNER_TEAM_ID?: string;
  }>;
}