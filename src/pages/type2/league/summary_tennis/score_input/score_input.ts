import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, Events } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { LeagueMatch } from '../../models/location.model';
import { LeagueParticipationForMatchModel } from '../../models/league.model';
import { ThemeService } from '../../../../../services/theme.service';

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

    isDarkTheme: boolean = true;

    constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        public viewCtrl: ViewController,
        public events: Events,
        public storage: Storage,
        public themeService: ThemeService
    ) {
        this.matchObj = this.navParams.get("matchObj");
        this.leagueId = this.navParams.get("leagueId");
        this.activityId = this.navParams.get("activityId");
        this.teamObj = this.navParams.get("teamObj");
        this.setsWon = this.navParams.get("setsWon") || 0;
        this.ishome = this.navParams.get("ishome");

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
        const element = document.querySelector('page-tennis-score-input');
        if (element) {
            if (this.isDarkTheme) {
                element.classList.remove('light-theme');
            } else {
                element.classList.add('light-theme');
            }
        }
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