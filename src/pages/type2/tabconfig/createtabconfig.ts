
import { SharedServices } from '../../services/sharedservice';
import { FirebaseService } from '../../../services/firebase.service';


import { Component } from '@angular/core';
import { PopoverController, ToastController, NavController, Platform, ViewController } from 'ionic-angular';

import { Storage } from '@ionic/storage';



import { IonicPage } from 'ionic-angular';
@IonicPage()
@Component({
    selector: 'createtabconfig-page',
    templateUrl: 'createtabconfig.html'
})

export class Type2CreateTabConfig {
    selectedParentClubKey: any;
    selectedClubKey: any;
    memberKey: any;
    notificationList = [];
    parentClubDetails = [];
    
    notificationCategoryObj = {
        Label: "",
        NotificationText: "",
        IsAllowNotification: false,
        Clubs: []
    }

    constructor(public viewController: ViewController, private toastCtrl: ToastController, public fb: FirebaseService, public storage: Storage, public navCtrl: NavController, public sharedservice: SharedServices, platform: Platform, public popoverCtrl: PopoverController) {

        storage.get('userObj').then((val) => {
            val = JSON.parse(val);
            for (let user of val.UserInfo) {
                this.selectedParentClubKey = user.ParentClubKey;
                this.selectedClubKey = user.ClubKey;
                this.memberKey = user.MemberKey;

                break;
            }

        }).catch(error => {


        });
    }

    presentPopover(myEvent) {
        let popover = this.popoverCtrl.create('PopoverPage');
        popover.present({
            ev: myEvent
        });

    }
    showToast(m: string, duration: number) {
        let toast = this.toastCtrl.create({
            message: m,
            duration: duration,
            position: 'bottom'
        });
        toast.present();
    }



}
