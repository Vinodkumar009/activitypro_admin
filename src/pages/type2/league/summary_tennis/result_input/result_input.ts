import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import { LeagueMatch } from '../../models/location.model';
import { LeagueParticipationForMatchModel } from '../../models/league.model';

@IonicPage({
    name: 'TennisResultInputPage',
    segment: 'tennis-result-input'
})
@Component({
    selector: 'page-tennis-result-input',
    templateUrl: 'result_input.html',
})
export class TennisResultInputPage {
    matchObj: LeagueMatch;
    leagueId: string;
    activityId: string;
    homeTeamObj: LeagueParticipationForMatchModel;
    awayTeamObj: LeagueParticipationForMatchModel;
    resultId: string;

    homeSetsWon: string = '0';
    awaySetsWon: string = '0';
    homeGamesWon: string = '0';
    awayGamesWon: string = '0';

    constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        public viewCtrl: ViewController
    ) {
        this.matchObj = this.navParams.get("matchObj");
        this.leagueId = this.navParams.get("leagueId");
        this.activityId = this.navParams.get("activityId");
        this.homeTeamObj = this.navParams.get("homeTeamObj");
        this.awayTeamObj = this.navParams.get("awayTeamObj");
        this.resultId = this.navParams.get("resultId");
    }

    saveResult() {
        const resultData = {
            homeSetsWon: this.homeSetsWon,
            awaySetsWon: this.awaySetsWon,
            homeGamesWon: this.homeGamesWon,
            awayGamesWon: this.awayGamesWon
        };

        this.viewCtrl.dismiss(resultData);
    }

    cancel() {
        this.viewCtrl.dismiss({});
    }
}