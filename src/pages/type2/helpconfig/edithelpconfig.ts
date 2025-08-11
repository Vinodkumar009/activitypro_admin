
import { SharedServices } from '../../services/sharedservice';
import { FirebaseService } from '../../../services/firebase.service';
import { Component } from '@angular/core';
import { PopoverController, ToastController, NavController, Platform, ViewController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import * as firebase from 'firebase';
import { IonicPage, AlertController, NavParams } from 'ionic-angular';
import { CommonService } from "../../../services/common.service";

@IonicPage()
@Component({
    selector: 'edithelpconfig-page',
    templateUrl: 'edithelpconfig.html'
})

export class EditHelpConfig {
    config: any;
    selectedParentClubKey = "";
    constructor(public navParams: NavParams, public alertCtrl: AlertController, public commonService: CommonService, public viewController: ViewController, private toastCtrl: ToastController, public fb: FirebaseService, public storage: Storage, public navCtrl: NavController, public sharedservice: SharedServices, platform: Platform, public popoverCtrl: PopoverController) {
        this.config = navParams.get('HelpConfigItem');
        storage.get('userObj').then((val) => {
            val = JSON.parse(val);
            for (let user of val.UserInfo) {
                this.selectedParentClubKey = user.ParentClubKey;
                break;
            }

        }).catch(error => {


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
    presentPopover(myEvent) {
        let popover = this.popoverCtrl.create('PopoverPage');
        popover.present({
            ev: myEvent
        });
    }
    cancel() {
        this.navCtrl.pop();
    }
    saveEdit() {
        this.fb.update(this.config.Key, "/HelpConfig/Member/" + this.selectedParentClubKey, {
             ButtonText: this.config.ButtonText,
             Description:this.config.Description,
             Header:this.config.Header,
             IconUrl:this.config.IconUrl,
         });
         this.showToast("Updated successfully...",2000);
         this.navCtrl.pop();
    }
}

