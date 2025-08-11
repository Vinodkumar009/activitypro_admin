
import { SharedServices } from '../../../services/sharedservice';
import { FirebaseService } from '../../../../services/firebase.service';
import { Component } from '@angular/core';
import { PopoverController, ToastController, NavController,NavParams, Platform, ViewController,ActionSheetController, LoadingController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { Http, Headers, RequestOptions } from '@angular/http';
import { IonicPage, AlertController } from 'ionic-angular';
import { CommonService } from "../../../../services/common.service";
import * as $ from 'jquery';
@IonicPage()
@Component({
    selector: 'helpsupportemail-page',
    templateUrl: 'helpsupportemail.html'
    
})

export class HelpSupportEmailPage {
    emailObj = { Message: "", Subject: "" };
    ParentClubKey: any;
    clubs: any[];
    selectedClubKey: any;
    constructor(public actionSheetCtrl: ActionSheetController, public comonService: CommonService, public viewCtrl: ViewController, public fb: FirebaseService, private toastCtrl: ToastController, public loadingCtrl: LoadingController, public alertCtrl: AlertController, private navParams: NavParams, public navCtrl: NavController, storage: Storage, public sharedservice: SharedServices, platform: Platform, public popoverCtrl: PopoverController) {
        storage.get('userObj').then((val) => {
            val = JSON.parse(val);
            if (val.$key != "") {
                this.ParentClubKey = val.UserInfo[0].ParentClubKey;
                this.getAllVenue(this.ParentClubKey)
            }
       

          
            //this.getAllSetups(this.ParentClubKey)

        })
        
    }
    getAllVenue(ParentClubKey) {
        this.clubs = [];
        this.fb.getAllWithQuery("Club/Type2/" + ParentClubKey + "/", { orderByChild: "IsActive", equalTo: true }).subscribe((data) => {
            for (let i = data.length - 1; i >= 0; i--) {
                if (data[i].IsActive == true) {
                    this.clubs.push(data[i]);
                    this.selectVenue(data[i].$key)

                }
            }
        });

    }
    selectVenue(event) {
        this.selectedClubKey = event;     
    }
}
