import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import { CommonService, ToastMessageType } from '../../../../../services/common.service';
import { HttpService } from '../../../../../services/http.service';
import { SharedServices } from '../../../../services/sharedservice';

@IonicPage()
@Component({
  selector: 'page-tennis-set-input',
  templateUrl: 'tennis_set_input.html',
  providers: [HttpService]
})
export class TennisSetInputPage {
  matchObj: any;
  homeTeamObj: any;
  awayTeamObj: any;
  isHomeTeam: boolean;
  result_json: any;
  setScores: any[] = [];

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public commonService: CommonService,
    public sharedservice: SharedServices,
    public viewCtrl: ViewController
  ) {
    this.matchObj = this.navParams.get('matchObj');
    this.homeTeamObj = this.navParams.get('homeTeamObj');
    this.awayTeamObj = this.navParams.get('awayTeamObj');
    this.isHomeTeam = this.navParams.get('isHomeTeam');
    this.result_json = this.navParams.get('result_json') || {};
    
    this.initializeSetScores();
  }

  initializeSetScores() {
    if (this.result_json.SET_SCORES && this.result_json.SET_SCORES.length > 0) {
      this.setScores = this.result_json.SET_SCORES.map(set => {
        const scores = set.SCORE ? set.SCORE.split('-') : ['', ''];
        return {
          SET_NUMBER: set.SET_NUMBER,
          SCORE1: scores[0] || '',
          SCORE2: scores[1] || '',
          WINNER_TEAM_ID: set.WINNER_TEAM_ID
        };
      });
    } else {
      this.setScores = [
        { SET_NUMBER: 1, SCORE1: "", SCORE2: "", WINNER_TEAM_ID: "" },
        { SET_NUMBER: 2, SCORE1: "", SCORE2: "", WINNER_TEAM_ID: "" },
        { SET_NUMBER: 3, SCORE1: "", SCORE2: "", WINNER_TEAM_ID: "" }
      ];
    }
  }

  addSet() {
    if (this.setScores.length < 5) {
      this.setScores.push({
        SET_NUMBER: this.setScores.length + 1,
        SCORE1: "",
        SCORE2: "",
        WINNER_TEAM_ID: ""
      });
    }
  }

  removeSet() {
    if (this.setScores.length > 1) {
      this.setScores.pop();
    }
  }

  saveSetScores() {
    if (!this.validateSetScores()) {
      return;
    }

    const setScoresData = this.setScores.map((set, index) => ({
      SET_NUMBER: index + 1,
      SCORE: `${set.SCORE1}-${set.SCORE2}`,
      WINNER_TEAM_ID: set.WINNER_TEAM_ID
    }));

    //this.commonService.toastMessage("Set scores saved successfully", 2500, ToastMessageType.Success);
    this.viewCtrl.dismiss({ setScores: setScoresData });
  }

  private validateSetScores(): boolean {
    const filledSets = this.setScores.filter(set => set.SCORE1 && set.SCORE2 && set.SCORE1.toString().trim() !== '' && set.SCORE2.toString().trim() !== '');
    
    if (filledSets.length === 0) {
      this.commonService.toastMessage('Please enter at least one set score', 3000, ToastMessageType.Error);
      return false;
    }

    for (let i = 0; i < filledSets.length; i++) {
      const score1 = parseInt(filledSets[i].SCORE1) || 0;
      const score2 = parseInt(filledSets[i].SCORE2) || 0;
      
      if (!this.isValidTennisScore(`${score1}-${score2}`)) {
        this.commonService.toastMessage(`Invalid score in Set ${i + 1}`, 3000, ToastMessageType.Error);
        return false;
      }
    }

    return true;
  }

  private isValidTennisScore(score: string): boolean {
    const scorePattern = /^\d{1,2}-\d{1,2}$/;
    if (!scorePattern.test(score)) {
      return false;
    }

    const [score1, score2] = score.split('-').map(s => parseInt(s));
    
    if (score1 < 0 || score2 < 0 || score1 > 20 || score2 > 20) {
      return false;
    }

    if (score1 === score2) {
      return false;
    }

    return true;
  }

  cancel() {
    this.viewCtrl.dismiss();
  }
}