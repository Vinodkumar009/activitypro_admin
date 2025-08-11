import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { AlertController } from 'ionic-angular/components/alert/alert-controller';
import { AppType } from '../../../../../shared/constants/module.constants';
import { HttpService } from '../../../../../services/http.service';
import { CommonService, ToastMessageType } from '../../../../../services/common.service';
import { API } from '../../../../../shared/constants/api_constants';
import { SharedServices } from '../../../../services/sharedservice';
import { LeagueParticipationForMatchModel, LeagueMatchParticipantModel, ResultStatusModel } from '../../models/league.model';
import { LeagueMatch } from '../../models/location.model';
import { FootballResultModel, FootballResultStatsModel } from '../../../../../shared/model/league_result.model';



@IonicPage()
@Component({
  selector: 'page-result_input',
  templateUrl: 'result_input.html',
  providers: [HttpService]
})
export class ResultInputPage {
  updateResultEntityInput: UpdateResultEntityInput = {
    resultId: '',
    // ResultDetails: '',
    // resultDescription: '',
    ResultStatus: 0,
    PublishedByApp: '',
    winner_league_participation_id: '',
    loser_league_participation_id: ''
  }
  homeTeamObj: LeagueParticipationForMatchModel;
  awayTeamObj: LeagueParticipationForMatchModel;
  matchObj: LeagueMatch;
  resultId: string;
  leagueId: string;
  activityId: string;
  selectedPlayer: string[] = [];
  goalTime: number[] = [];
  goalDetails: any[] = [];
  score: number = 0;
  currentGoalIndex: number = -1;


  leagueMatchParticipantRes: LeagueMatchParticipantModel[] = [];
  selectedResultStatus: ResultStatusModel | null = null; // 🏆 Holds the selected result status
  selectedWinnerTeamId: string = ''; // 🏆 Holds the selected team
  TEAMS: LeagueParticipationForMatchModel[] = [];

  homeTeamGoals: number;
  awayTeamGoals: number;

  // Result Object from summary page
  resultObject: FootballResultModel;

  // Result Status Properties
  resultStatusList: ResultStatusModel[] = [];
  isLoadingStatuses: boolean = false;
  getResultStatusByActivityInput: GetResultStatusByActivityInput = {
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
    activity_code: 1001
  };
  activityCode: number;

  // 📝 Result Description Properties
  resultDescription: string = '';

  constructor(public navCtrl: NavController, public navParams: NavParams, public viewCtrl: ViewController,
    public storage: Storage, private httpService: HttpService, public sharedservice: SharedServices,
    public commonService: CommonService, public alertCtrl: AlertController) {


    this.matchObj = this.navParams.get("matchObj");
    this.leagueId = this.navParams.get("leagueId");
    this.activityId = this.navParams.get("activityId");
    this.homeTeamObj = this.navParams.get("homeTeamObj");
    this.awayTeamObj = this.navParams.get("awayTeamObj");
    this.resultId = this.navParams.get("resultId");
    this.TEAMS = [this.homeTeamObj, this.awayTeamObj];
    this.score = this.navParams.get("score");
    this.activityCode = this.navParams.get("activityCode");
    this.resultObject = this.navParams.get("resultObject");
    this.updateResultEntityInput.resultId = this.resultId;
    // this.updateResultEntityInput.resultDescription = '';//will add later
    this.updateResultEntityInput.PublishedByApp = AppType.ADMIN_NEW.toString();

    // Initialize form with existing result data if available
    this.initializeFormWithExistingData();

    // Initialize API input for result status
    this.initializeResultStatusInput();

    // Load result status options
    this.getResultStatusByActivity();
  }

  private initializeResultStatusInput(): void {
    this.getResultStatusByActivityInput = {
      parentclubId: this.sharedservice.getPostgreParentClubId() || '',
      clubId: '',
      activityId: this.activityId || '',
      memberId: this.sharedservice.getLoggedInId() || '',
      action_type: 0,
      device_type: this.sharedservice.getPlatform() === "android" ? 1 : 2,
      app_type: AppType.ADMIN_NEW,
      device_id: this.sharedservice.getDeviceId() || '',
      updated_by: this.sharedservice.getLoggedInId() || '',
      created_by: this.sharedservice.getLoggedInId() || '',
      activity_code: this.activityCode
    };
  }

  private initializeFormWithExistingData(): void {
    if (this.resultObject) {
      console.log("Initializing form with existing result data:", this.resultObject);

      // Set goals from existing data
      if (this.resultObject.HOME_TEAM && this.resultObject.AWAY_TEAM) {
        this.homeTeamGoals = parseInt(this.resultObject.HOME_TEAM.GOAL) || 0;
        this.awayTeamGoals = parseInt(this.resultObject.AWAY_TEAM.GOAL) || 0;
      }

      // Set result description if available
      if (this.resultObject.RESULT && this.resultObject.RESULT.DESCRIPTION) {
        this.resultDescription = this.resultObject.RESULT.DESCRIPTION;
      }

      // Set winner team ID if available
      if (this.resultObject.RESULT && this.resultObject.RESULT.WINNER_ID) {
        this.selectedWinnerTeamId = this.resultObject.RESULT.WINNER_ID;
      }
    }
  }

  getResultStatusByActivity(): void {
    this.isLoadingStatuses = true;
    this.httpService.post(`${API.GET_RESULT_STATUS_BY_ACTIVITY}`, this.getResultStatusByActivityInput).subscribe(
      (res: any) => {
        this.isLoadingStatuses = false;
        try {
          if (res.data && Array.isArray(res.data)) {
            this.resultStatusList = res.data;
            console.log("Get_Result_Status_By_Activity RESPONSE", this.resultStatusList);
          } else {
            console.log("No result status data received");
            this.resultStatusList = [];
            this.commonService.toastMessage("No result status options available", 3000, ToastMessageType.Info);
          }
        } catch (error) {
          console.error("Error processing result status:", error);
          this.resultStatusList = [];
          this.commonService.toastMessage("Error processing result status data", 3000, ToastMessageType.Error);
        }
      },
      (error) => {
        this.isLoadingStatuses = false;
        console.error("Error fetching result status:", error);
        this.commonService.toastMessage("Error fetching result status options", 3000, ToastMessageType.Error);
        this.resultStatusList = [];
      }
    );
  }

  onStatusClick(status: ResultStatusModel) {
    if (!status) return;

    this.selectedResultStatus = status;
    console.log("Selected Result Status:", this.selectedResultStatus);

    // Update the ResultStatus in the input
    this.updateResultEntityInput.ResultStatus = this.selectedResultStatus.id;

    // Reset winner selection when status changes
    this.selectedWinnerTeamId = '';
  }

  onWinnerTeamChange() {
    // Winner team selection logic handled in saveGoal method
  }



  saveGoal() {
    // 🏆 Validate result status selection
    if (!this.selectedResultStatus) {
      this.commonService.toastMessage('Please select a result status.', 3000, ToastMessageType.Info);
      return;
    }

    const isDrawn = this.selectedResultStatus.status.toUpperCase() === 'DRAW';
    const isWin = this.selectedResultStatus.status.toUpperCase() === 'WIN';

    // 🏟️ Validate home and away goals for WIN and DRAW statuses
    if (isWin || isDrawn) {
      if (
        this.homeTeamGoals === undefined ||
        this.awayTeamGoals === undefined ||
        isNaN(this.homeTeamGoals) ||
        isNaN(this.awayTeamGoals)
      ) {
        this.commonService.toastMessage('Please enter valid numbers for both team goals.', 3000, ToastMessageType.Info);
        return;
      }
    }

    // Create FootballResultStatsModel
    const footballResultStats: FootballResultStatsModel = {
      DESCRIPTION: this.resultDescription || '',
      WINNER_ID: '',
      RESULT_STATUS: this.selectedResultStatus.status
    };

    // 🤝 Handle different result types
    if (isWin) {
      // Validate winner selection for 'WIN' result type
      if (!this.selectedWinnerTeamId) {
        this.commonService.toastMessage('Please select a winner team.', 3000, ToastMessageType.Info);
        return;
      }

      // 🏆 Find winner and loser teams based on selectedWinnerTeamId
      const winnerTeam = this.TEAMS.find(team => team.parentclubteam.id === this.selectedWinnerTeamId);
      const loserTeam = this.TEAMS.find(team => team.parentclubteam.id !== this.selectedWinnerTeamId);

      // 🏟️ Assign goals based on which team is the winner
      let winnerTeamGoals = 0;
      let loserTeamGoals = 0;

      if (winnerTeam.id === this.homeTeamObj.id) {
        winnerTeamGoals = this.homeTeamGoals;
        loserTeamGoals = this.awayTeamGoals;
      } else if (winnerTeam.id === this.awayTeamObj.id) {
        winnerTeamGoals = this.awayTeamGoals;
        loserTeamGoals = this.homeTeamGoals;
      }

      // Validate that winner team has more goals than loser team
      if (winnerTeamGoals <= loserTeamGoals) {
        this.commonService.toastMessage('Winner team goals must be greater than losing team goals.', 3000, ToastMessageType.Info);
        return;
      }

      // Set winner ID in FootballResultStatsModel
      footballResultStats.WINNER_ID = this.selectedWinnerTeamId;

      // 🟢 Dismiss modal with winner result data
      this.viewCtrl.dismiss({
        homeTeamGoals: this.homeTeamGoals.toString(),
        awayTeamGoals: this.awayTeamGoals.toString(),
        winnerTeamGoals: winnerTeamGoals.toString(),
        loserTeamGoals: loserTeamGoals.toString(),
        resultStatus: this.selectedResultStatus.id,
        footballResultStats: footballResultStats
      });
    } else if (isDrawn) {
      // For drawn type, check if both teams have the same number of goals
      if (this.homeTeamGoals !== this.awayTeamGoals) {
        this.commonService.toastMessage('For drawn matches, both teams must have the same number of goals.', 3000, ToastMessageType.Info);
        return;
      }

      // For draw, no specific winner ID
      footballResultStats.WINNER_ID = '';

      // 🤝 For drawn matches, dismiss modal with drawn match data
      this.viewCtrl.dismiss({
        homeTeamGoals: this.homeTeamGoals.toString(),
        awayTeamGoals: this.awayTeamGoals.toString(),
        winnerTeamGoals: null,
        loserTeamGoals: null,
        resultStatus: this.selectedResultStatus.id,
        footballResultStats: footballResultStats
      });
    } else {
      // For other statuses (POSTPONED, ABANDONED, CANCELLED), no winner ID
      footballResultStats.WINNER_ID = '';

      // For other statuses, just save the status
      this.viewCtrl.dismiss({
        homeTeamGoals: this.homeTeamGoals ? this.homeTeamGoals.toString() : '0',
        awayTeamGoals: this.awayTeamGoals ? this.awayTeamGoals.toString() : '0',
        winnerTeamGoals: null,
        loserTeamGoals: null,
        resultStatus: this.selectedResultStatus.id,
        footballResultStats: footballResultStats
      });
    }
  }


  dismiss() {
    this.viewCtrl.dismiss({
      winnerTeam: {},
      loserTeam: {},
      winnerTeamGoals: 0,
      loserTeamGoals: 0,
      footballResultStats: null
    });
  }
}
export class UpdateResultEntityInput {
  resultId: string;
  ResultDetails?: string;
  resultDescription?: string;
  ResultStatus?: number;
  PublishedByApp: string;
  winner_league_participation_id?: string;
  loser_league_participation_id?: string;
}


// API Input Interface
export interface GetResultStatusByActivityInput {
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
  activity_code: number;
}