import { Component } from '@angular/core';
import { NavController, PopoverController, NavParams } from 'ionic-angular';
import { SharedServices } from '../../services/sharedservice';
// import { PopoverPage } from '../../popover/popover';
import { FirebaseService } from '../../../services/firebase.service';
import { Storage } from '@ionic/storage';
// import { Type2Venue } from '../venue/venue';
// import { Dashboard } from './../../dashboard/dashboard';

import {IonicPage } from 'ionic-angular';
@IonicPage()
@Component({
    selector: 'addvenue-page',
    templateUrl: 'addvenue.html'
})
export class Type2AddVenue {
    platform:string = "";
    fbEventSubscriber: any;
    fbEventSubscriber1: any;
    selectedParentClub: string;
    userType: string;
    responseDetails: any;
    userresponseDetails: any;
    themeType: number;
    parentclubs1: any;
    clubs = [];
    clubs1 = [];
    ccc = [];
    AddVenue = 'Add Venue'
    tempClubObj = {
        City: "",
        ClubAdminEmailID: "",
        ClubAdminPassword: "",
        ClubContactName: "",
        ClubDescription: "",
        Location:'',
        Country:'',
        CountryName:'',
        ClubID: "",
        ClubName: "",
       
        ClubShortName: "",
        ContactPhone: "",
        FirstLineAddress: "",
        ParentClubID: "",
        PostCode: "",
        VisibleatSignUpPage : 1,
        SecondLineAddress: "",
        State: "",
        WebsiteUrl:'',
        Type: "",
        OriginalClubKey: "",
        IsActive: true,
        IsEnable: true,
        CreatedDate: 0,
            CreatedBy: 'Parent Club',
            ParentClubKey:"",
            OriginalParentClubKey:""

    };
    userObj = {
        EmailID: "",
        Name: "",
        Password: "",
        RoleType: "",
        Type: "",
        UserType: ""
    };
    userInfoObj = {
        ParentClubKey: "",
        ClubKey: "",
        OriginalClubKey:"",
        OriginalParentClubKey:""
    }
    len: number;
    out = [];
    obj = {};
    venuePageClubArr = [];
    filterSetup: any;
    SetupDisplay: any[];
    constructor(storage: Storage, public navParams: NavParams, public navCtrl: NavController, public sharedservice: SharedServices, public fb: FirebaseService, public popoverCtrl: PopoverController) {
        this.themeType = sharedservice.getThemeType();
        this.platform = this.sharedservice.getPlatform();
        this.clubs = [];
        this.venuePageClubArr = navParams.get('venuePageClubArr');
        storage.get('userObj').then((val) => {
            val = JSON.parse(val);
            this.userType = val.UserType;
            for (let club of val.UserInfo)
                if (val.$key != "") {
                    this.selectedParentClub = club.ParentClubKey;
                    this.parentclubs1 = [];
                    this.fbEventSubscriber = this.fb.getAll("/ParentClub/Type1").subscribe((data1) => {
                        this.parentclubs1 = data1;
                        this.clubs = [];

                        if (data1.length > 0) {
                            if (this.parentclubs1.length > 0) {

                                for (let i = 0; i < this.parentclubs1.length; i++) {

                                    this.fbEventSubscriber1 = this.fb.getAll("/Club/Type1/" + this.parentclubs1[i].$key)
                                        .subscribe((data) => {
                                           

                                            if (data.length > 0) {
                                                this.parentclubs1[i].IsSelected = false;
                                                this.parentclubs1[i].clubs = data;


                                                for (let z = 0; z < this.parentclubs1[i].clubs.length; z++) {
                                                    this.parentclubs1[i].clubs[z].IsSelected = false;
                                                }
                                               


                                                for (let j = 0; j < data.length; j++) {

                                                    this.clubs.push(data[j]);
                                                    for (let k = 0; k < this.venuePageClubArr.length; k++) {
                                                        if (data[j].$key == this.venuePageClubArr[k].OriginalClubKey) {
                                                            data[j].disabled = true;
                                                            break;
                                                        }
                                                        else{
                                                            data[j].disabled = false;
                                                        }
                                                    }

                                                }
                                                this.SetupDisplay = this.clubs
                                            }
                                        });
                                }


                            }


                        }
                    });

                }
        }).catch(error => {
        });
      
    }

    removeDuplicates(num) {
        alert();
        let x;
        this.len = num.length;
        this.out = [];
        this.obj = {};

        for (x = 0; x < this.len; x++) {
            this.obj[num[x]] = 0;
        }
        for (x in this.obj) {
            this.out.push(x);
        }
        return this.out;
    }

    // ngOnDestroy() {
    //     this.fbEventSubscriber.unsubscribe();
    //   }

    // getItems(ev: any) {
    //     let val = ev.target.value;
    //     if (val && val.trim() != '') {
    //         return this.clubs.filter(customer => customer.ClubName.toLowerCase().indexOf(val.toLowerCase()) > -1);
    //     }
    // }
    getItems(ev: any) {
        // Reset items back to all of the items
        this.initializeItems();
    
        // set val to the value of the searchbar
        let val = ev.target.value;

        // if the value is an empty string don't filter the items
        if (val && val.trim() != '') {
            this.SetupDisplay = this.filterSetup.filter((item) => {
                if (item.ClubName != undefined) {
                    return (item.ClubName.toLowerCase().indexOf(val.toLowerCase()) > -1);
                }
            })
        }
    }
    initializeItems() {
        this.filterSetup = this.clubs;
        this.SetupDisplay = this.clubs;
    }

    presentPopover(myEvent) {
        let popover = this.popoverCtrl.create("PopoverPage");
        popover.present({
            ev: myEvent
        });
    }


    addVenue() {
        for (let i = 0; i < this.clubs.length; i++) {
            if (this.clubs[i].IsSelected == true && !this.clubs[i].disabled ) {
                this.tempClubObj.City = this.clubs[i].City;
                this.tempClubObj.ClubAdminEmailID = this.clubs[i].ClubAdminEmailID;
                this.tempClubObj.ClubAdminPassword = this.clubs[i].ClubAdminPassword;
                this.tempClubObj.ClubContactName = this.clubs[i].ClubContactName;
                this.tempClubObj.ClubDescription = this.clubs[i].ClubDescription;
                this.tempClubObj.ClubID = this.clubs[i].ClubID;
                this.tempClubObj.ClubName = this.clubs[i].ClubName;
                this.tempClubObj.Location = this.clubs[i].Location ? this.clubs[i].Location : '',
                this.tempClubObj.Country = this.clubs[i].Country ? this.clubs[i].Country : '',
                this.tempClubObj.CountryName = this.clubs[i].CountryName ? this.clubs[i].CountryName : '',
                this.tempClubObj.ClubShortName = this.clubs[i].ClubShortName;
                this.tempClubObj.ContactPhone = this.clubs[i].ContactPhone;
                this.tempClubObj.WebsiteUrl = this.clubs[i].WebsiteUrl ? this.clubs[i].WebsiteUrl : '';
                this.tempClubObj.FirstLineAddress = this.clubs[i].FirstLineAddress;
                this.tempClubObj.ParentClubID = this.clubs[i].ParentClubID;
                this.tempClubObj.PostCode = this.clubs[i].PostCode;
                this.tempClubObj.SecondLineAddress = this.clubs[i].SecondLineAddress;
                this.tempClubObj.State = this.clubs[i].State;
                this.tempClubObj.Type = "";
                this.tempClubObj.OriginalClubKey = this.clubs[i].$key;
                this.tempClubObj.IsActive = true;
                this.tempClubObj.IsEnable = true;
                this.tempClubObj.ParentClubKey = this.selectedParentClub;
                this.tempClubObj.OriginalParentClubKey =(this.clubs[i].ParentClubKey != undefined) ? this.clubs[i].ParentClubKey : ""; 
                this.tempClubObj.CreatedDate = new Date().getTime();
                if (this.userType == "2") {
                    this.responseDetails = this.fb.saveReturningKey("/Club/Type2/" + this.selectedParentClub + "/", this.tempClubObj);
                    if (this.responseDetails != undefined) {
                        this.userObj.EmailID = this.tempClubObj.ClubAdminEmailID;
                        this.userObj.Name = this.tempClubObj.ClubName;
                        this.userObj.Password = this.tempClubObj.ClubAdminPassword;
                        this.userObj.RoleType = "3";
                        this.userObj.Type = "2";
                        this.userObj.UserType = "2";





                        this.userresponseDetails = this.fb.saveReturningKey("/User/", this.userObj);
                        if (this.userresponseDetails != undefined) {
                            this.userInfoObj.ParentClubKey = this.selectedParentClub;
                            this.userInfoObj.ClubKey = this.responseDetails;
                            this.userInfoObj.OriginalClubKey = this.clubs[i].$key;
                            this.userInfoObj.OriginalParentClubKey=(this.clubs[i].ParentClubKey != undefined) ? this.clubs[i].ParentClubKey : "";

                            this.fb.saveReturningKey("/User/" + this.userresponseDetails + "/UserInfo/", this.userInfoObj);
                            this.navCtrl.pop();
                        }
                        this.responseDetails = this.fb.saveReturningKey("/Club/Type1/" + this.clubs[i].ParentClubKey +"/"+this.clubs[i].$key+ "/Type2Child", {ParentClubKey:this.selectedParentClub,Clubkey:this.responseDetails});
                    }
                }
            }
        }
    }


    cancelVenue() {
        this.navCtrl.pop();
    }

  
    goToDashboardMenuPage() {
        this.navCtrl.setRoot("Dashboard");
    }
}