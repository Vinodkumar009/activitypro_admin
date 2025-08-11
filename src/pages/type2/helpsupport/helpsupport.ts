
import { SharedServices } from '../../services/sharedservice';
import { FirebaseService } from '../../../services/firebase.service';
import { Component  } from '@angular/core';
import { PopoverController, ToastController, NavController, Platform, ViewController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { IonicPage, AlertController } from 'ionic-angular';
import { CommonService } from "../../../services/common.service";
@IonicPage()
@Component({
    selector: 'helpsupport-page',
    templateUrl: 'helpsupport.html',
    providers: [CommonService,FirebaseService,]
})

export class HelpSupportPage {
  
    clubDetails = [];
    selectedParentClubKey: any;
    selectedClubKey: any;
    memberKey: any;
    app: any;
    helpNSupport = [];
    SetupDisplay: any;
    filterSetup: any;
    themeType: number;
    IsShowBackText:boolean = false;
    constructor(public alertCtrl: AlertController, public commonService: CommonService, public viewController: ViewController, private toastCtrl: ToastController, public fb: FirebaseService, public storage: Storage, public navCtrl: NavController, public sharedservice: SharedServices, public platform: Platform, public popoverCtrl: PopoverController,) {
        storage.get('userObj').then((val) => {
            val = JSON.parse(val);
            for (let user of val.UserInfo) {
                this.selectedParentClubKey = user.ParentClubKey;
                this.selectedClubKey = user.ClubKey;
                this.memberKey = user.MemberKey;
                // this.themeType = sharedservice.getThemeType();
                this.getDetails()

                //  this.getParentClubDetails();

                break;
            }

        }).catch(error => {});

        if (this.platform.is('ios')) {
          this.IsShowBackText = true;
        }


    }
  
      getDetails() {
        this.fb.getAllWithQuery("/ActivityPro/HelpSupport/admin",{  orderByChild: "IsEnable", equalTo: true }).subscribe((data) => {
          this.helpNSupport = data
          this.helpNSupport.forEach(faq=>{
            faq["IsSelect"]=false;
        })
        this.SetupDisplay = this.helpNSupport;
          console.log(data);
        });
      }
      getFilterItems(ev: any) {
        // Reset items back to all of the items
      
        this.initializeItems()
        // set val to the value of the searchbar
        let val = ev.target.value;
    
        // if the value is an empty string don't filter the items
        if (val && val.trim() != '') {
            this.SetupDisplay = this.filterSetup.filter((item) => {
                if (item.HelpHeader != undefined) {
                    return (item.HelpHeader.toLowerCase().indexOf(val.toLowerCase()) > -1);
                }
            })
        }
      }
    
      select(faq){
        faq.IsSelect= !faq.IsSelect
      }
    
    
    initializeItems() {
      this.filterSetup = this.helpNSupport;
      this.SetupDisplay = this.helpNSupport;
    }
      gotoAddHelpNSupport() {
        this.navCtrl.push('AddHelpNSupportPage', { App: this.app });
      }
      gotoInbox() {
        this.navCtrl.push('Inbox');
      }
    showToast(m: string, duration: number) {
        let toast = this.toastCtrl.create({
            message: m,
            duration: duration,
            position: 'bottom'
        });
        toast.present();
    }
    gotoHelpsupportEmail(){
     // this.navCtrl.push("HelpSupportEmailPage")
    }
    presentPopover(myEvent) {
        let popover = this.popoverCtrl.create('PopoverPage');
        popover.present({
            ev: myEvent
        });
    }

    pop(){
      this.navCtrl.pop();
    }

   
}
