import { Component, ViewChildren } from '@angular/core';
import { IonicPage, NavController, NavParams, Slides, AlertController, ActionSheetController, Platform } from 'ionic-angular';
import * as moment from 'moment';
import { Storage } from '@ionic/storage';
import { FirebaseService } from '../../../services/firebase.service';
import { CommonService } from '../../../services/common.service';
// import { IonicPage } from 'ionic-angular';

@IonicPage()
@Component({
    selector: 'page-locationsetup',
    templateUrl: 'locationsetup.html',
})
export class LocationsetupPage {
    ParentClubKey: string;
    LocationDetails = [];
    constructor(
        public alertCtrl: AlertController,
        public navCtrl: NavController,
        private fb: FirebaseService,
        public actionSheetCtrl: ActionSheetController,
        storage: Storage
        , private platform: Platform
    ) {
        storage.get('userObj').then((val) => {
            val = JSON.parse(val);
            if (val.$key != "") {
                this.ParentClubKey = val.UserInfo[0].ParentClubKey;
            }
        })
    }
    ionViewDidEnter() {
        this.getLocationData(this.ParentClubKey)
    }

    getLocationData(ParentClubKey) {
        this.fb.getAllWithQuery("Location/" + ParentClubKey + "/", { orderByChild: "IsActive", equalTo: true }).subscribe((data) => {
            this.LocationDetails = [];
            for (let i = data.length - 1; i >= 0; i--) {
                if (data[i].IsActive == true) {
                    this.LocationDetails.push(data[i]);
                }
            }
            console.log(this.LocationDetails);
        });

    }
    showOptions(LocationKey) {

        let actionSheet = this.actionSheetCtrl.create({
            buttons: [
                {
                    text: "Edit Location",
                    icon: this.platform.is('android') ? 'ios-create-outline' : '',
                    handler: () => {
                        this.navCtrl.push("AddlocationPage", { LocationKey: LocationKey });
                    }
                }, {
                    text: 'Delete Location',
                    cssClass: 'dangerRed',
                    icon: this.platform.is('android') ? 'trash' : '',
                    handler: () => {
                        this.deleteLocation(LocationKey)
                    }
                }
            ]
        });

        actionSheet.present();

    }
    deleteLocation(LocationKey) {
        let alert = this.alertCtrl.create({
            title: 'Delete Location',
            message: ' Are you sure to delete this Location ?',
            buttons: [
                {
                    text: "Cancel",
                    role: 'cancel'

                },
                {
                    text: 'Delete',
                    handler: data => {
                        console.log("Location/" + this.ParentClubKey + "/" + LocationKey)
                        this.fb.update(LocationKey, "Location/" + this.ParentClubKey, { IsActive: false });
                        // this.fb.deleteFromFb("Location/"+ this.ParentClubKey + "/" +LocationKey)
                    }
                }
            ]
        });
        alert.present();
    }

    gotoAddLocation() {
        this.navCtrl.push("AddlocationPage");

    }
}