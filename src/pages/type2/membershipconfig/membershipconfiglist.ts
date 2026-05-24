import { Component } from '@angular/core';
import { NavController, PopoverController, LoadingController } from 'ionic-angular';
import { SharedServices } from '../../services/sharedservice';
// import { PopoverPage } from '../../popover/popover';
import { FirebaseService } from '../../../services/firebase.service';
import { Storage } from '@ionic/storage';
// import { Dashboard } from './../../dashboard/dashboard';
// import { Type2NewMembershipHome } from './newmembershiphome';
// import { Type2RenewalMembershipHome } from './renewalmembershiphome';
import {  ToastController } from 'ionic-angular';

import {IonicPage } from 'ionic-angular';
@IonicPage()
@Component({
    selector: 'membershipconfiglist-page',
    templateUrl: 'membershipconfiglist.html'
})

export class Type2MembershipConfigList {
    themeType: number;
    parentClubKey: string;
    menus: Array<{ DisplayTitle: string; 
        OriginalTitle:string;
        MobComponent: string;
        WebComponent: string; 
        MobIcon:string;
        MobLocalImage: string;
        WebIcon:string;
        MobCloudImage: string; 
        WebLocalImage: string;
        WebCloudImage:string;
        MobileAccess:boolean;
        WebAccess:boolean;
        Role: number;
        Type: number;
        Level: number }>;
    financialYear1: {};
    financialYear2: {};
    financialYear1Key: string;
    financialYear2Key: string;
    membershipConfigTab: string = "newmember";
    allClub = [];
    selectedClub:any;
    allActivityArr = [];
    selectedActivity:any;
    allNewMenber = [];
    today1:any;
    allRenewalMenber = [];
    constructor(public toastCtrl: ToastController,public loadingCtrl: LoadingController, storage: Storage,
        public navCtrl: NavController, public sharedservice: SharedServices,
        public fb: FirebaseService, public popoverCtrl: PopoverController) {

        this.themeType = sharedservice.getThemeType();
        this.menus = sharedservice.getMenuList();
        storage.get('userObj').then((val) => {
            val = JSON.parse(val);
            for (let club of val.UserInfo)
                if (val.$key != "") {
                    this.parentClubKey = club.ParentClubKey;
                    this.getClubList();
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
    
    gotoMemberConfigHome() {
        if (this.membershipConfigTab == "newmember") {
            this.navCtrl.push("Type2NewMembershipHome");
        } 
        else if (this.membershipConfigTab == "renewal") {
            this.navCtrl.push("Type2RenewalMembershipHome");
        }
    }

    getClubList() {
        this.fb.getAllWithQuery("/Club/Type2/" + this.parentClubKey, { orderByChild: "IsEnable", equalTo: true }).subscribe((data) => {
            //alert();
            if (data.length > 0) {
                this.allClub = data;
                this.selectedClub = data[0].$key;
                this.getAllActivity();
            }
        })
    }

    onClubChange() {
        this.getAllActivity();
    }

    getAllActivity() {
        this.fb.getAll("/Activity/" + this.parentClubKey + "/" + this.selectedClub + "/").subscribe((data) => {
            this.allActivityArr = [];
            if (data.length > 0) {
                this.allActivityArr = data;
                this.selectedActivity = data[0].$key;
                this.getNewMemberConfig();
            }
        })
    }

    getNewMemberConfig(){
        this.fb.getAll("/MembershipConfig/" + this.parentClubKey + "/" + this.selectedClub + "/" +this.selectedActivity+"/NewMember/" ).subscribe((data) => {
            this.allNewMenber = [];
            if (data.length > 0) {
                this.allNewMenber = data;
            }
        })
       
       this.fb.getAll("/MembershipConfig/" + this.parentClubKey + "/" + this.selectedClub + "/" +this.selectedActivity+"/RenewalMember/" ).subscribe((data1) => {
            this.allRenewalMenber = [];
            if (data1.length > 0) {
                this.allRenewalMenber = data1;
            }
        })
    }

    setDate(date){
        
        var today = new Date(date);
        let dd = today.getDate();
        var mm = today.getMonth() + 1; //January is 0!
        var mm1;
        var yyyy = today.getFullYear();
        if (dd < 10) {
            dd = 0 + dd;
        }
        if (mm < 10) {
            mm1 = '0' + mm;
        }
        this.today1 = dd+'/'+mm1+'/'+yyyy;
        
        return this.today1;
    }

    editNewMember(){
        
    }

    editRenewalMember(){
        
    }

}
