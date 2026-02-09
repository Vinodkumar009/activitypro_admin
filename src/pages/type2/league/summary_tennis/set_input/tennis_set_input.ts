import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, Events } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { CommonService, ToastMessageType } from '../../../../../services/common.service';
import { HttpService } from '../../../../../services/http.service';
import { SharedServices } from '../../../../services/sharedservice';
import { ThemeService } from '../../../../../services/theme.service';

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
  
  // DTO for template binding - simplified team data
  teamData: {
    homeTeamName: string;
    awayTeamName: string;
  } = {
    homeTeamName: "",
    awayTeamName: ""
  };
  
  // Auto-calculated values
  homeSetsWon: number = 0;
  awaySetsWon: number = 0;
  homeGamesWon: number = 0;
  awayGamesWon: number = 0;

  isDarkTheme: boolean = true;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public commonService: CommonService,
    public sharedservice: SharedServices,
    public viewCtrl: ViewController,
    public events: Events,
    public storage: Storage,
    public themeService: ThemeService
  ) {
    this.matchObj = this.navParams.get('matchObj');
    this.homeTeamObj = this.navParams.get('homeTeamObj');
    this.awayTeamObj = this.navParams.get('awayTeamObj');
    this.isHomeTeam = this.navParams.get('isHomeTeam');
    this.result_json = this.navParams.get('result_json') || {};
    
    this.initializeTeamData();
    this.initializeSetScores();
  }

  ionViewDidLoad() {
    this.loadTheme();
    this.events.subscribe('theme:changed', (isDark) => {
      this.isDarkTheme = isDark;
      this.applyTheme();
    });
  }

  ionViewWillLeave() {
    this.events.unsubscribe('theme:changed');
  }

  loadTheme() {
    this.storage.get('dashboardTheme').then((isDarkTheme) => {
      if (isDarkTheme !== null) {
        this.isDarkTheme = isDarkTheme;
      } else {
        this.isDarkTheme = true;
      }
      this.applyTheme();
    }).catch(() => {
      this.isDarkTheme = true;
      this.applyTheme();
    });
  }

  applyTheme() {
    const element = document.querySelector('page-tennis-set-input');
    if (element) {
      if (this.isDarkTheme) {
        element.classList.remove('light-theme');
      } else {
        element.classList.add('light-theme');
      }
    }
  }

  initializeTeamData() {
    // Handle home team
    if (this.homeTeamObj) {
      if (this.homeTeamObj.parentclubteam) {
        // Old structure with parentclubteam
        this.teamData.homeTeamName = this.homeTeamObj.parentclubteam.teamName || "";
      } else {
        // New structure - direct properties
        this.teamData.homeTeamName = this.homeTeamObj.teamName || "";
      }
    }

    // Handle away team
    if (this.awayTeamObj) {
      if (this.awayTeamObj.parentclubteam) {
        // Old structure with parentclubteam
        this.teamData.awayTeamName = this.awayTeamObj.parentclubteam.teamName || "";
      } else {
        // New structure - direct properties
        this.teamData.awayTeamName = this.awayTeamObj.teamName || "";
      }
    }

    console.log('Initialized team data:', this.teamData);
  }

  initializeSetScores() {
    // Always start with exactly 3 sets
    this.setScores = [
      { SET_NUMBER: 1, SCORE1: "", SCORE2: "", WINNER_TEAM_ID: "" },
      { SET_NUMBER: 2, SCORE1: "", SCORE2: "", WINNER_TEAM_ID: "" },
      { SET_NUMBER: 3, SCORE1: "", SCORE2: "", WINNER_TEAM_ID: "" }
    ];
    
    // If there's existing data, populate it but keep only 3 sets max
    if (this.result_json.SET_SCORES && this.result_json.SET_SCORES.length > 0) {
      const existingSets = this.result_json.SET_SCORES.slice(0, 3); // Take only first 3 sets
      existingSets.forEach((set, index) => {
        if (index < 3) {
          const scores = set.SCORE ? set.SCORE.split('-') : ['', ''];
          this.setScores[index] = {
            SET_NUMBER: index + 1,
            SCORE1: scores[0] || '',
            SCORE2: scores[1] || '',
            WINNER_TEAM_ID: set.WINNER_TEAM_ID
          };
        }
      });
    }
    
    this.calculateSummary();
  }

  addSet() {
    if (this.setScores.length < 5) {
      this.setScores.push({
        SET_NUMBER: this.setScores.length + 1,
        SCORE1: "",
        SCORE2: "",
        WINNER_TEAM_ID: ""
      });
      this.calculateSummary();
    }
  }

  removeSet() {
    if (this.setScores.length > 1) {
      this.setScores.pop();
      this.calculateSummary();
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

    // Return both set scores and calculated summary
    this.viewCtrl.dismiss({ 
      setScores: setScoresData,
      homeSetsWon: this.homeSetsWon,
      awaySetsWon: this.awaySetsWon,
      homeGamesWon: this.homeGamesWon,
      awayGamesWon: this.awayGamesWon
    });
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

  // Auto-calculate sets won and games won based on set scores
  calculateSummary() {
    this.homeSetsWon = 0;
    this.awaySetsWon = 0;
    this.homeGamesWon = 0;
    this.awayGamesWon = 0;

    const filledSets = this.setScores.filter(set => 
      set.SCORE1 && set.SCORE2 && 
      set.SCORE1.toString().trim() !== '' && 
      set.SCORE2.toString().trim() !== ''
    );

    filledSets.forEach(set => {
      const score1 = parseInt(set.SCORE1) || 0;
      const score2 = parseInt(set.SCORE2) || 0;

      // Add to games won
      this.homeGamesWon += score1;
      this.awayGamesWon += score2;

      // Determine set winner and increment sets won
      if (score1 > score2) {
        this.homeSetsWon++;
      } else if (score2 > score1) {
        this.awaySetsWon++;
      }
    });
  }

  // Call calculateSummary when scores change
  onScoreChange() {
    this.calculateSummary();
  }

  cancel() {
    this.viewCtrl.dismiss();
  }
}