import { Component } from '@angular/core';
import { NavController, PopoverController, LoadingController, NavParams, ToastController } from 'ionic-angular';
import { SharedServices } from '../../services/sharedservice';
//import { PopoverPage } from '../../popover/popover';
//import { AngularFire, FirebaseListObservable } from 'angularfire2';
import { FirebaseService } from '../../../services/firebase.service';
import { Storage } from '@ionic/storage';
//import { Dashboard } from './../../dashboard/dashboard';
//import { Type2ActivityFeesList } from './activityfeeslist';
import {IonicPage } from 'ionic-angular';


@IonicPage()
@Component({
    selector: 'propertyvalue-page',
    templateUrl: 'propertyvalue.html'
})

export class Type2PropertyValue {
    themeType: number;
    parentClubKey: string;
    allClub: any;
    selectedClub: any;
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
    activityFeesKey = "";
    allActivityFeesdata = [];
    propertiesArr = [];
    propertyObj = {
        PropertyValue: ''
    };
    propertyArr = [];
    propertiesArrList = [];
    valueKey: any;
    activityFeesKeyList = "";

    activityFeesKeyListArr = [];
    constructor(public toastCtrl: ToastController, public loadingCtrl: LoadingController, storage: Storage,
        public navCtrl: NavController, public sharedservice: SharedServices, public fb: FirebaseService, public popoverCtrl: PopoverController, public navParams: NavParams) {

        this.themeType = sharedservice.getThemeType();
        this.menus = sharedservice.getMenuList();
        this.activityFeesKey = navParams.get('activityFeesKey');
        this.activityFeesKeyList = navParams.get('activityFeesKeyList');
       
        storage.get('userObj').then((val) => {
            val = JSON.parse(val);
            for (let club of val.UserInfo)
                if (val.$key != "") {
                    this.parentClubKey = club.ParentClubKey;
                    //this.getClubList();
                }
        })
        this.getActivityFees();

    }



    presentPopover(myEvent) {
        let popover = this.popoverCtrl.create('PopoverPage');
        popover.present({
            ev: myEvent
        });
    }


    goToDashboardMenuPage() {
        this.navCtrl.setRoot('Dashboard');
    }

    getActivityFees() {
        if (this.activityFeesKeyList != undefined) {
            this.activityFeesKeyListArr = this.activityFeesKeyList.split(',');
        }
        this.fb.getAll("/ActivityFees/Type2/").subscribe((data) => {
            if (data.length > 0) {
                this.allActivityFeesdata = data;
                
                for (let i = 0; i < this.allActivityFeesdata.length; i++) {
                    if (this.activityFeesKey != undefined) {
                        if (this.activityFeesKey == this.allActivityFeesdata[i].$key) {
                            //if (this.allActivityFeesdata[i].Properties != undefined){
                                this.propertiesArr = this.allActivityFeesdata[i].Properties.split(',');
                                break;
                            //}
                        }
                    }
                    else if (this.activityFeesKeyListArr.length > 0) {
                        if (this.activityFeesKeyListArr[0] == this.allActivityFeesdata[i].$key) {
                            this.propertiesArr = this.allActivityFeesdata[i].Properties.split(',');
                            break;
                        }
                    }
                }

                this.prepareObject();
            }
        })
    }

    addSingleProperty(item) {
        
        this.propertyObj = {
            PropertyValue: ''
        };
        item.Value.push(this.propertyObj);
    }

    prepareObject() {
        let propertiesArrObj = {
            Name: '', Value: []
        }
        for (let i = 0; i < this.propertiesArr.length; i++) {
            propertiesArrObj.Name = this.propertiesArr[i];
            propertiesArrObj.Value = [];

            this.propertiesArrList.push(propertiesArrObj);

            propertiesArrObj = {
                Name: '', Value: []
            }
        }
    }

    cancelProperties() {
        this.navCtrl.pop();
    }

    saveProperties() {
        let valueObj = { value: '' };

        for (let i = 0; i < this.propertiesArrList.length; i++) {
            // let obj = {};
            // let properties = "";
            for (let j = 0; j < this.propertiesArrList[i].Value.length; j++) {
                valueObj.value = this.propertiesArrList[i].Value[j].PropertyValue;
                if (this.activityFeesKey != undefined) {
                    this.valueKey = this.fb.saveReturningKey("/ActivityFees/Type2/" + this.activityFeesKey + "/" + this.propertiesArrList[i].Name + "/", valueObj);
                }
                else if (this.activityFeesKeyListArr.length > 0) {
                    for (let a = 0; a < this.allActivityFeesdata.length; a++) {
                        for (let b = 0; b < this.activityFeesKeyListArr.length; b++) {
                            if (this.activityFeesKeyListArr[b] == this.allActivityFeesdata[a].$key) {
                                this.valueKey = this.fb.saveReturningKey("/ActivityFees/Type2/" + this.allActivityFeesdata[a].$key + "/" + this.propertiesArrList[i].Name + "/", valueObj);
                            }
                        }
                    }
                }

                // properties += this.propertiesArrList[i].Value[j].PropertyValue + ",";
                // obj[this.propertiesArrList[i].Name] = properties
            }
            // properties = properties.substr(0, properties.length - 1);
            // this.valueKey = this.fb.update(this.activityFeesKey, "/ActivityFees/Type2/", obj);
            // obj = {};

        }

        if (this.valueKey != undefined) {
            let message = "Successfully Saved";
            this.showToast(message, 3000);
            this.navCtrl.push('Type2ActivityFeesList');
        }
    }

    showToast(m: string, howLongShow: number) {
        let toast = this.toastCtrl.create({
            message: m,
            duration: howLongShow,
            position: 'bottom'
        });
        toast.present();
    }





}
