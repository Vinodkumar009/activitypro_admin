import { Component } from '@angular/core';
import { NavController, PopoverController, LoadingController , NavParams} from 'ionic-angular';
import { SharedServices } from '../../services/sharedservice';
// import { PopoverPage } from '../../popover/popover';
import { FirebaseService } from '../../../services/firebase.service';
import { Storage } from '@ionic/storage';
// import { Dashboard } from './../../dashboard/dashboard';
//import { Platform } from 'ionic-angular';
import {  ToastController } from 'ionic-angular';
import {IonicPage } from 'ionic-angular';
@IonicPage()
@Component({
    selector: 'oneoffcourtbook-page',
    templateUrl: 'oneoffcourtbook.html'
})

export class Type2OneoffCourtBook {
    themeType: number;
    parentClubKey: string;
    menus: Array<{ DisplayTitle: string; 
        OriginalTitle:string;
        MobComponent: string;
        WebComponent: string; 
        MobIcon:string;
        MobLocalImage: string;
        MobCloudImage: string; 
        WebIcon:string;
        WebLocalImage: string;
        WebCloudImage:string;
        MobileAccess:boolean;
        WebAccess:boolean;
        Role: number;
        Type: number;
        Level: number }>;
    allClub = [];
    selectedClub:any;
    allActivityArr = [];
    selectedActivity:any;
    
    constructor(public toastCtrl: ToastController,public loadingCtrl: LoadingController, storage: Storage,
        public navCtrl: NavController, public sharedservice: SharedServices,
         public fb: FirebaseService, public popoverCtrl: PopoverController,public navParams: NavParams) {

        this.themeType = sharedservice.getThemeType();
        this.menus = sharedservice.getMenuList();
        storage.get('userObj').then((val) => {
            val = JSON.parse(val);
            for (let club of val.UserInfo)
                if (val.$key != "") {
                    this.parentClubKey = club.ParentClubKey;
                    //this.getClubList();
                    //this.getAllDiscount();
                }
        })
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

    showToast(m: string, howLongShow: number) {
        let toast = this.toastCtrl.create({
            message: m,
            duration: howLongShow,
            position: 'bottom'
        });
        toast.present();
    }

    // getClubList() {
    //     this.fb.getAll("/Club/Type2/" + this.parentClubKey).subscribe((data) => {
    //         //alert();
    //         if (data.length > 0) {
    //             this.allClub = data;
    //             this.selectedClub = data[0].$key;
    //             this.getAllActivity();

    //         }
    //     })
    // }

    // onClubChange() {
    //     this.getAllActivity();
    // }

    // getAllActivity() {
    //     this.fb.getAll("/Activity/" + this.parentClubKey + "/" + this.selectedClub + "/").subscribe((data) => {
    //         this.allActivityArr = [];
    //         if (data.length > 0) {
    //             this.allActivityArr = data;
    //             this.selectedActivity = data[0].$key;
    //         }
    //     })
    // }

    

    

 




}
