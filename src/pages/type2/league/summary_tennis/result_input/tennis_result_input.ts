import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import { CommonService, ToastMessageType } from '../../../../../services/common.service';
import { HttpService } from '../../../../../services/http.service';
import { API } from '../../../../../shared/constants/api_constants';
import { SharedServices } from '../../../../services/sharedservice';
import { AppType } from '../../../../../shared/constants/module.constants';
import { ResultStatusModel } from '../../models/league.model';

@IonicPage()
@Component({
  selector: 'page-tennis-result-input',
  templateUrl: 'tennis_result_input.html',
  providers: [HttpService]
})
export class TennisResultInputPage {
  matchObj: any;
  homeTeamObj: any;
  awayTeamObj: any;
  result_json: any;
  selectedWinner: string = "";
  resultStatus: string = "1";
  homeSetsWon: number = 0;
  awaySetsWon: number = 0;
  homeGamesWon: number = 0;
  awayGamesWon: number = 0;
  
  resultStatusList: ResultStatusModel[] = [];
  selectedResultStatus: ResultStatusModel | null = null;
  isLoadingStatuses: boolean = false;
  activityId: string;
  activityCode: number;
  getResultStatusByActivityInput: any = {};

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public commonService: CommonService,
    private httpService: HttpService,
    public sharedservice: SharedServices,
    public viewCtrl: ViewController
  ) {
    this.matchObj = this.navParams.get('matchObj');
    this.homeTeamObj = this.navParams.get('homeTeamObj');
    this.awayTeamObj = this.navParams.get('awayTeamObj');
    this.result_json = this.navParams.get('result_json') || {};
    this.activityId = this.navParams.get('activityId');
    this.activityCode = this.navParams.get('activityCode');
    
    this.initializeValues();
    this.initializeResultStatusInput();
    this.getResultStatusByActivity();
  }

  initializeValues() {
    if (this.result_json.RESULT) {
      this.selectedWinner = this.result_json.RESULT.WINNER_ID || "";
      this.resultStatus = this.result_json.RESULT.RESULT_STATUS || "1";
    }
    
    if (this.result_json.HOME_TEAM) {
      this.homeSetsWon = parseInt(this.result_json.HOME_TEAM.SETS_WON) || 0;
      this.homeGamesWon = parseInt(this.result_json.HOME_TEAM.GAMES_WON) || 0;
    }
    
    if (this.result_json.AWAY_TEAM) {
      this.awaySetsWon = parseInt(this.result_json.AWAY_TEAM.SETS_WON) || 0;
      this.awayGamesWon = parseInt(this.result_json.AWAY_TEAM.GAMES_WON) || 0;
    }
  }

  private initializeResultStatusInput(): void {
    this.getResultStatusByActivityInput = {
      parentclubId: this.sharedservice.getPostgreParentClubId() || '',
      clubId: '',
      activityId: this.activityId || '',
      memberId: this.sharedservice.getLoggedInUserId() || '',
      action_type: 0,
      device_type: this.sharedservice.getPlatform() === "android" ? 1 : 2,
      app_type: AppType.ADMIN_NEW,
      device_id: this.sharedservice.getDeviceId() || '',
      updated_by: this.sharedservice.getLoggedInUserId() || '',
      created_by: this.sharedservice.getLoggedInUserId() || '',
      activity_code: this.activityCode
    };
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
          }
        } catch (error) {
          console.error("Error processing result status:", error);
          this.resultStatusList = [];
        }
      },
      (error) => {
        this.isLoadingStatuses = false;
        console.error("Error fetching result status:", error);
        this.resultStatusList = [];
      }
    );
  }

  onStatusClick(status: ResultStatusModel) {
    if (!status) return;
    this.selectedResultStatus = status;
    this.resultStatus = status.id.toString();
    console.log("Selected Result Status:", this.selectedResultStatus);
  }

  saveResult() {
    if (!this.validateResult()) {
      return;
    }

    const resultData = {
      selectedWinner: this.selectedWinner,
      resultStatus: this.resultStatus,
      homeSetsWon: this.homeSetsWon.toString(),
      awaySetsWon: this.awaySetsWon.toString(),
      homeGamesWon: this.homeGamesWon.toString(),
      awayGamesWon: this.awayGamesWon.toString()
    };

    this.commonService.toastMessage("Result saved successfully", 2500, ToastMessageType.Success);
    this.viewCtrl.dismiss(resultData);
  }

  private validateResult(): boolean {
    if (this.resultStatus === '1') {
      if (!this.selectedWinner) {
        this.commonService.toastMessage('Please select a match winner', 3000, ToastMessageType.Error);
        return false;
      }

      if (this.homeSetsWon < 0 || this.awaySetsWon < 0) {
        this.commonService.toastMessage('Sets won cannot be negative', 3000, ToastMessageType.Error);
        return false;
      }

      if (this.homeGamesWon < 0 || this.awayGamesWon < 0) {
        this.commonService.toastMessage('Games won cannot be negative', 3000, ToastMessageType.Error);
        return false;
      }

      if (this.homeSetsWon === 0 && this.awaySetsWon === 0) {
        this.commonService.toastMessage('At least one team must win a set', 3000, ToastMessageType.Error);
        return false;
      }

      if (this.homeSetsWon === this.awaySetsWon) {
        this.commonService.toastMessage('Match cannot end in a tie. One team must win more sets', 3000, ToastMessageType.Error);
        return false;
      }

      const winnerSets = this.selectedWinner === (this.homeTeamObj && this.homeTeamObj.parentclubteam && this.homeTeamObj.parentclubteam.id) ? this.homeSetsWon : this.awaySetsWon;
      const loserSets = this.selectedWinner === (this.homeTeamObj && this.homeTeamObj.parentclubteam && this.homeTeamObj.parentclubteam.id) ? this.awaySetsWon : this.homeSetsWon;
      
      if (winnerSets <= loserSets) {
        this.commonService.toastMessage('Winner must have won more sets than the loser', 3000, ToastMessageType.Error);
        return false;
      }

      if (winnerSets > 3) {
        this.commonService.toastMessage('Maximum sets that can be won is 3', 3000, ToastMessageType.Error);
        return false;
      }
    }

    return true;
  }

  cancel() {
    this.viewCtrl.dismiss();
  }
}