import { Component } from '@angular/core';
import { NavController, PopoverController, LoadingController } from 'ionic-angular';
import { SharedServices } from '../../services/sharedservice';
// import { PopoverPage } from '../../popover/popover';
import { FirebaseService } from '../../../services/firebase.service';
import { Storage } from '@ionic/storage';
import { CommonService } from "../../../services/common.service";
// import { Dashboard } from './../../dashboard/dashboard';

import {IonicPage } from 'ionic-angular';
@IonicPage()
@Component({
    selector: 'addschool-page',
    templateUrl: 'addschool.html'
})
export class Type2AddSchool {
    themeType: number;
    parentClubKey: string;
    schools: any;
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
    allSchools: any;
    schoolArr = [];
    responseDetails: any;
    filterSetup: any;
    SetupDisplay: any;
    constructor(public loadingCtrl: LoadingController, storage: Storage,public commonService: CommonService,
        public navCtrl: NavController, public sharedservice: SharedServices,
        public fb: FirebaseService, public popoverCtrl: PopoverController) {

        this.themeType = sharedservice.getThemeType();
        this.menus = sharedservice.getMenuList();
        this.getAllSchoolSetup();


        storage.get('userObj').then((val) => {
            val = JSON.parse(val);
            for (let club of val.UserInfo)
                if (val.$key != "") {
                    this.parentClubKey = club.ParentClubKey;
                }
        })
    }


    goTo(obj) {
        this.navCtrl.push(obj.component);
    }
    presentPopover(myEvent) {
        let popover = this.popoverCtrl.create("PopoverPage");
        popover.present({
            ev: myEvent
        });
    }
      ionViewDidLoad() {
      
    this.commonService.screening("Type2School");
  
}
    getAllSchoolSetup() {
        const schoolSetup$Obs = this.fb.getAll("/StandardCode/SchoolSetup/Default/").subscribe((data) => {
            schoolSetup$Obs.unsubscribe();
            this.allSchools = data;
            if (this.allSchools.length != undefined) {
                for (let i = 0; i < this.allSchools.length; i++) {
                    this.allSchools[i].isSelect = false;
                }
            }    
            this.initializeItems() 
        });
    }

    toggolSelectionSchool(item) {
        if (item.isSelect) {
            this.schoolArr.push(item);
        }
        else {
            for (let index = 0; index < this.schoolArr.length; index++) {
                if (item.$key == this.schoolArr[index].$key) {
                    this.schoolArr.splice(index, 1);
                    break;
                }

            }
        }
    }


    saveSchoolAgainstParentKey() {

        let obj = {
            SchoolName: '',
            SchoolAddress: '',
            SchoolContactNumber: '',
            SchoolEmailID: '',
            IsActive: true,
            IsEnable: true,
			FirstLineAddress:'',
        SecondLineAddress:'',
        PostCode:'',
		City:'',
        CreatedDate: 0,
                CreatedBy: 'Parent Club'
        };
        for (let index = 0; index < this.schoolArr.length; index++) {

            obj.SchoolName = this.schoolArr[index].SchoolName;
            obj.SchoolAddress = this.schoolArr[index].SchoolAddress;
            obj.SchoolContactNumber = this.schoolArr[index].SchoolContactNumber;
            obj.SchoolEmailID = this.schoolArr[index].SchoolEmailID;
            obj.IsActive = true;
            obj.IsEnable = true;
            obj.CreatedDate =new Date().getTime();
			obj.FirstLineAddress= this.schoolArr[index].FirstLineAddress;
        obj.SecondLineAddress= this.schoolArr[index].SecondLineAddress;
        obj.PostCode= this.schoolArr[index].PostCode;
		obj.City= this.schoolArr[index].City;
            this.responseDetails = this.fb.update(this.schoolArr[index].$key, "/School/Type2/" + this.parentClubKey + "/", obj);

        }
        if (this.responseDetails != undefined) {
            this.commonService.toastMessage("Successfully saved",2500);
            this.navCtrl.pop();
        }


    }

    cancelSchoolAgainstParentKey(){
        if (this.allSchools.length != undefined) {
                for (let i = 0; i < this.allSchools.length; i++) {
                    this.allSchools[i].isSelect = false;
                }
            }

        this.navCtrl.pop();
    }

    goToDashboardMenuPage() {
        this.navCtrl.setRoot("Dashboard");
    }

    getItems(ev: any) {
        // Reset items back to all of the items
        this.initializeItems();

        // set val to the value of the searchbar
        let val = ev.target.value;

        // if the value is an empty string don't filter the items
        if (val && val.trim() != '') {
            this.SetupDisplay = this.filterSetup.filter((item) => {
                if (item.SchoolName != undefined) {
                    return (item.SchoolName.toLowerCase().indexOf(val.toLowerCase()) > -1);
                }
                if (item.SchoolAddress != undefined) {
                    return (item.SchoolAddress.toLowerCase().indexOf(val.toLowerCase()) > -1);
                }
            })
        }
    }
    initializeItems() {
        this.filterSetup = this.allSchools;
        this.SetupDisplay = this.allSchools;
    }



}
