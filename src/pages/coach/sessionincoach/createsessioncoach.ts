// session creation for private and one to one

import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { PopoverController } from 'ionic-angular';
import { SharedServices } from '../../services/sharedservice';
// import { PopoverPage } from '../../popover/popover';
// import { Dashboard } from './../../dashboard/dashboard';

import {IonicPage } from 'ionic-angular';
@IonicPage()
@Component({
    selector: 'createsessioncoach-page',
    templateUrl: 'createsessioncoach.html'
})

export class CoachCreateSession {
    themeType: number;
    venueForPrivate: string = "s";
    activityTypeForPrivate: string = "a1";
    sessionTypeForPrivate: string = "f";
    coachForPrivateSession: string = "m";
    ageGroup = {
        initialSlide: 0,
        loop: true
        //pager: true
    };
    sessionForPrivatesession: string = "s1";
    durationForPrivateSession: string = "1";
    repeatForPrivateSession: string = "r1";
    refByForPrivateSession: string = "m";

    constructor(public navCtrl: NavController, public sharedservice: SharedServices, public popoverCtrl: PopoverController) {
        this.themeType = sharedservice.getThemeType();
    }
    presentPopover(myEvent) {
        let popover = this.popoverCtrl.create("PopoverPage");
        popover.present({
            ev: myEvent
        });
    }

    
goToDashboardMenuPage() {
        this.navCtrl.setRoot("Dashboard");
    }
	


}
