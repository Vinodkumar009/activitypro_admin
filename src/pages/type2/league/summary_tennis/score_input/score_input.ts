import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import { LeagueMatch } from '../../models/location.model';
import { LeagueParticipationForMatchModel } from '../../models/league.model';

@IonicPage({
    name: 'TennisScoreInputPage',
    segment: 'tennis-score-input'
})
@Component({
    selector: 'page-tennis-score-input',
    templateUrl: 'score_input.html',
})
export class TennisScoreInputPage {
    matchObj: LeagueMatch;
    leagueId: string;
    activityId: string;
    teamObj: LeagueParticipationForMatchModel;
    setsWon: number;
    ishome: boolean;

    setScores: any[] = [];

    constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        public viewCtrl: ViewController
    ) {
        this.matchObj = this.navParams.get("matchObj");
        this.leagueId = this.navParams.get("leagueId");
        this.activityId = this.navParams.get("activityId");
        this.teamObj = this.navParams.get("teamObj");
        this.setsWon = this.navParams.get("setsWon") || 0;
        this.ishome = this.navParams.get("ishome");

        this.initializeSetScores();
    }

    initializeSetScores() {
        this.setScores = [];
        for (let i = 1; i <= this.setsWon; i++) {
            this.setScores.push({
                setNumber: i,
                homeGames: '',
                awayGames: ''
            });
        }
    }

    saveSetScores() {
        const setDetails = this.setScores.map(set => ({
            SET_NUMBER: set.setNumber,
            SCORE: `${set.homeGames}-${set.awayGames}`,
            WINNER: parseInt(set.homeGames) > parseInt(set.awayGames) ? 'HOME' : 'AWAY'
        }));

        this.viewCtrl.dismiss({ setDetails: setDetails });
    }

    cancel() {
        this.viewCtrl.dismiss({});
    }
}