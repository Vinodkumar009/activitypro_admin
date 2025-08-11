import { CommonService, ToastMessageType, ToastPlacement } from './../../../services/common.service';
import { Component } from '@angular/core';
import { NavController, PopoverController, AlertController, ActionSheetController } from 'ionic-angular';
import { SharedServices } from '../../services/sharedservice';
// import { PopoverPage } from '../../popover/popover';
import { FirebaseService } from '../../../services/firebase.service';
import { Storage } from '@ionic/storage';
// import { Type2AddVenue } from '../venue/addvenue';
// import { Dashboard } from './../../dashboard/dashboard';
import { Apollo } from "apollo-angular";
import gql from "graphql-tag";

import { IonicPage } from 'ionic-angular';
import { HttpClient } from '@angular/common/http';
@IonicPage()
@Component({
  selector: 'venue-page',
  templateUrl: 'venue.html'
})

export class Type2Venue {
  themeType: number;
  clubs=[];
  x: any;
  reOrderToggle = false;
  parentClubKey: any;
  navText: string = "Re-order";nestUrl: any;
;
  constructor(public alertCtrl: AlertController, public http: HttpClient, 
    private commonService:CommonService, 
    public storage: Storage, 
    public actionSheetCtrl: ActionSheetController, 
    public navCtrl: NavController, 
    public sharedservice: SharedServices,
     public fb: FirebaseService, 
     public popoverCtrl: PopoverController,
     private apollo: Apollo
     ) {

  }

  ionViewWillEnter() {
    this.nestUrl = this.sharedservice.getnestURL()
    this.themeType = this.sharedservice.getThemeType();
    this.storage.get('userObj').then((val) => {
      val = JSON.parse(val);
      for (let club of val.UserInfo)
        if (val.$key != "") {
          if (val.UserType == "2") {
            this.clubs = [];
            this.parentClubKey = club.ParentClubKey
            this.getVenues()
            // this.fb.getAll("/Club/Type2/" + club.ParentClubKey).subscribe((data) => {
            //   this.clubs = [];
            //   for (let i = 0; i < data.length; i++) {
            //     if (data[i].IsEnable) {
            //       this.clubs.push(data[i]);
            //     }
            //   }
            //   if (this.clubs[0].Sequence)
            //   this.clubs = this.commonService.sortingObjects(this.clubs, 'Sequence')
            // });
          }
        }
    }).catch(error => {
      // alert("Errr occured");
      this.storage.get('userObj').then((val) => {
        val = JSON.parse(val);
        //for (let club of val.UserInfo)
        if (val.$key != "") {
          // this.fb.getAll("/Club/" + club.ParentClubKey).subscribe((data) => {
          //   this.clubs = data;
          //  console.log(this.clubs);
          // });
        }
      });
    });


  }

  presentPopover(myEvent) {
    let popover = this.popoverCtrl.create("PopoverPage");
    popover.present({
      ev: myEvent
    });
  }
  showSelected() {
    alert();
  }
  addVenue() {
    this.navCtrl.push("Type2AddVenue", { venuePageClubArr: this.clubs });
  }
  presentActionSheet(club) {
    // this.myIndex = -1;
    let actionSheet
    // if (this.platform.is('android')) {
    actionSheet = this.actionSheetCtrl.create({
      buttons: [{
        text: 'Edit',
        //icon: 'pen',
        handler: () => {
          this.navCtrl.push("Type2EditVenue", { venue: club });

        },
      },
      {
        text: 'Assign Activity',
        //icon: 'pen',
        handler: () => {
          this.navCtrl.push("AssignActivityPage", { venue: club });
        },
      },
      {
        text: 'Delete Venue',
        //icon: 'pen',
        handler: () => {
          this.navCtrl.push("DeleteVenue", { venue: club, parentclub:this.parentClubKey });
        },
      }]
    })

    actionSheet.present();
  }

  goToDashboardMenuPage() {
    this.navCtrl.setRoot("Dashboard");
  }



  removeVenueAlert() {

    let confirm = this.alertCtrl.create({
      title: 'Remove Alert',
      message: 'Do you really want to remove this venue?',
      buttons: [
        {
          text: 'No',
          handler: () => {
            console.log('Disagree clicked');
          }
        },
        {
          text: 'Yes',
          handler: () => {
            // this.loading.present();
            // this.asyncAwait();
            // this.loading = this.loadingCtrl.create({
            //     content: 'Please wait...'
            // });
            // this.loading.present().then(() => {
            //     this.notify();
            //     this.loading.dismiss();
            //     //this.navCtrl.pop();
            // });

          }
        }
      ]
    });
    confirm.present();

  }
  enableReorder() {
    this.reOrderToggle = !this.reOrderToggle;
    this.navText = this.reOrderToggle ? "Done" : "Re-order";
  }

  reorderItems(indexes) {
    // if (indexes.from != 0) {
    let element = this.clubs[indexes.from];
    this.clubs.splice(indexes.from, 1);
    this.clubs.splice(indexes.to, 0, element);
    let club_seq_input = [];
    for (let tabIndex = 0; tabIndex < this.clubs.length; tabIndex++) {
      club_seq_input.push({club_firebasekey:this.clubs[tabIndex].$key,postgre_id:this.clubs[tabIndex].ClubID,sequence:tabIndex})
      this.fb.update(this.clubs[tabIndex].$key, "/Club/Type2/" + this.parentClubKey, { Sequence: tabIndex });
    }
    this.updatePostgreVenue(club_seq_input);
    // } 
    // else {
    //     let message = "You can not reorder the first element.";
    //     this.showToast(message, 3000);
    // }
  }

  updatePostgreVenue(club_input) {
    this.commonService.showLoader("Please wait");
    const seq_payload = {
      club_sequnce:club_input
    }
    this.apollo
      .mutate({
        mutation: gql`
          mutation updateClubSequence($club_seq_input: ClubSequnceInput!) {
            updateClubSequence(clubSequnceInput: $club_seq_input) 
          }
        `,
        variables: { club_seq_input: seq_payload },
      })
      .subscribe(
        ({ data }) => {
          this.commonService.hideLoader();
          console.log("venue data" + data["updateClubSequence"]);
          let message = "Venues reorderd successfully."
          this.commonService.toastMessage(message, 2500, ToastMessageType.Success);
          this.getVenues();
        },
        (err) => {
          this.commonService.hideLoader();
          console.log(JSON.stringify(err));
          this.commonService.toastMessage("Venue reorderd failed",2500,ToastMessageType.Error,ToastPlacement.Bottom);
        }
      );
  }



  getVenues() {
    return new Promise((resolve, reject) =>{
      this.http.get(`${this.nestUrl}/superadmin/venue?parentKey=${this.parentClubKey}`).subscribe((res) => {
        resolve('success')
        //this.commonService.hideLoader() 
        this.clubs = res['data']
        this.clubs = this.clubs.map((club)=> ({...club, $key:club.ClubKey}))

      },
        err => {
          this.clubs = []
          reject('fail')
        })
    })
  }

}
