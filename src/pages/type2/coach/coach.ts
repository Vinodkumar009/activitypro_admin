import { Component } from '@angular/core';
import { NavController, PopoverController, LoadingController, AlertController } from 'ionic-angular';
import { SharedServices } from '../../services/sharedservice';
// import { PopoverPage } from '../../popover/popover';
// import { Type2EditCoach } from './editcoach';
// import { Type2AddCoach } from './addcoach';
import { FirebaseService } from '../../../services/firebase.service';
import { Storage } from '@ionic/storage';
// import { Dashboard } from './../../dashboard/dashboard';
import {IonicPage } from 'ionic-angular';
@IonicPage()
@Component({
  selector: 'coach-page',
  templateUrl: 'coach.html'
})

export class Type2Coach {
  themeType: number;
  venue: string = "";
  loading: any;
  game: string = "";
  coachList: any;
  parentClubKey: string;
  clubs: any;
  selectedVenuesAgainstCoach: any;
  constructor(public alertCtrl: AlertController, public loadingCtrl: LoadingController, public storage: Storage, public navCtrl: NavController, public sharedservice: SharedServices, public fb: FirebaseService, public popoverCtrl: PopoverController) {
    this.loading = this.loadingCtrl.create({
      content: 'Please wait...'
    });

    this.loading.present();
    this.getCoachLists();
    this.getClubLists();

    this.themeType = sharedservice.getThemeType();


    // this.hideLoader(2500);

  }
  getCoachLists() {
    this.storage.get('userObj').then((val) => {
      val = JSON.parse(val);
      for (let club of val.UserInfo)
        if (val.$key != "") {
          this.parentClubKey = club.ParentClubKey;
          this.fb.getAll("/Coach/" + this.parentClubKey).subscribe((data) => {
            this.coachList = data;
            this.loading.dismiss().catch(() => {});
          });
        }
    })

  }
  getClubLists() {
    this.storage.get('userObj').then((val) => {
      val = JSON.parse(val);
      for (let club of val.UserInfo)
        if (val.$key != "") {
          this.parentClubKey = club.ParentClubKey;
          this.fb.getAll("/Club/" + club.ParentClubKey).subscribe((data) => {
            this.clubs = data;
          });
        }
    })
  }
  presentPopover(myEvent) {
    let popover = this.popoverCtrl.create("PopoverPage");
    popover.present({
      ev: myEvent
    });
  }
  addCoach() {
    this.navCtrl.push("Type2AddCoach");
  }
  editCoach() {
    this.navCtrl.push("Type2EditCoach");
  }

  selectVenue() {
    let alert = this.alertCtrl.create();
    alert.setTitle('Select Venues');
    this.clubs.forEach((club) => {
      alert.addInput({
        type: 'checkbox',
        label: club.ClubName,
        value: club,
        checked: false
      });
    });
    alert.addButton('Cancel');
    alert.addButton({
      text: 'Save',
      handler: data => {
        this.selectedVenuesAgainstCoach = data;
      }
    });
    alert.present();
  }

  
goToDashboardMenuPage() {
        this.navCtrl.setRoot("Dashboard");
    }

}
