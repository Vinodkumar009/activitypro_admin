import { Component } from '@angular/core';
import { NavController, PopoverController, LoadingController, AlertController, NavParams } from 'ionic-angular';
import { SharedServices } from '../../services/sharedservice';
// import { PopoverPage } from '../../popover/popover';
import { FirebaseService } from '../../../services/firebase.service';
import { Storage } from '@ionic/storage';

// import { Dashboard } from './../../dashboard/dashboard';
import {IonicPage } from 'ionic-angular';
import { CommonService } from '../../../services/common.service';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
@IonicPage()
@Component({
    selector: 'selectcoachlevel-page',
    templateUrl: 'selectcoachlevel.html'
})

export class Type2SelectCoachLevel {
    themeType: number;
    venue: string = "";
    loading: any;
    game: string = "";
    coachList: any;
    allCoachList: any;
    parentClubKey: string;
    clubs: any;
    selectedVenuesAgainstCoach: any;
    clubDetailsObj = {
        "City": "",
        "ClubContactName": "",
        "ClubDescription": "",
        "ClubID": "",
        "ClubName": "",
        "ClubShortName": "",
        "ContactPhone": "",
        "FirstLineAddress": "",
        "ParentClubID": "",
        "PostCode": "",
        "State": "",
        "secondLineAddress": ""
    }
    coachDetailsObj = {
        "DBSNumber": "",
        "DOB": "",
        "EmailID": "",
        "FirstName": "",
        "LastName": "",
        "Level": "",
        "PhoneNumber": "",
        "Recognition": "",
        "Reg": "",
        "ShortDescription": ""
    }
    CoachInfo: any;
    coachClubArr = [];
    selectedClubKey: any;
    coachClubActivityArr = [];
    selectedActivityKey: any;
    allCoachingLevel = [];
    selectedCoachingLevelKey:any;
    coachKey:any;
    responseDetails:any;
    tempcoachlevelArr = [];
    allCoachArr = [];
    tempcoachArr = [];
    orgCoachLevelArr = [];
    constructor(public commonService:CommonService,private apollo: Apollo,public navParams: NavParams, public alertCtrl: AlertController, public loadingCtrl: LoadingController, storage: Storage, public navCtrl: NavController, public sharedservice: SharedServices, public fb: FirebaseService, public popoverCtrl: PopoverController) {
        // this.loading = this.loadingCtrl.create({
        //  content: 'Please wait...'
        //  });

        //  this.loading.present();
        this.CoachInfo = navParams.get('CoachInfo');
        this.coachClubArr = this.commonService.convertFbObjectToArray(this.CoachInfo.Club);
        this.coachKey = this.CoachInfo.$key;
     
        this.themeType = sharedservice.getThemeType();
        storage.get('userObj').then((val) => {
            val = JSON.parse(val);
            for (let club of val.UserInfo)
                if (val.$key != "") {
                    this.parentClubKey = club.ParentClubKey;





                    //this.getClubList();

                }
        })
    }



    getClubList() {
        this.fb.getAll("/Club/" + this.parentClubKey).subscribe((data) => {
            this.clubs = data;
        });

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

    getAllActivityAgainstCoachClub() {
        if (this.coachClubArr.length != undefined) {
            for (let i = 0; i < this.coachClubArr.length; i++) {
                if (this.selectedClubKey == this.coachClubArr[i].$key) {
                    this.coachClubActivityArr = this.commonService.convertFbObjectToArray(this.coachClubArr[i].Activity);
                    //break;
                }
            }
        }
    }

    getAllCoachingLevelAgainstCoachClubActivity() {
        this.fb.getAll("/Activity/" + this.parentClubKey + "/" + this.selectedClubKey + "/" + this.selectedActivityKey +"/CoachingLevel/").subscribe((data1) => {
            this.allCoachingLevel = data1;
        });
    }

    getSpecificCoachingLevel(){
        
        if( this.allCoachingLevel.length != undefined){
            this.tempcoachlevelArr = [];
            for(let i=0; i<this.allCoachingLevel.length; i++){
                //this.tempcoachlevelArr = [];
                if(this.selectedCoachingLevelKey == this.allCoachingLevel[i].$key){
                        this.tempcoachlevelArr.push(this.allCoachingLevel[i])
                }
            }
        }

        this.fb.getAll("/Coach/Type2/" + this.parentClubKey + "/").subscribe((data2) => {
            this.allCoachArr = data2;
            if(this.allCoachArr.length != undefined){
                this.tempcoachArr = [];
                for(let k=0; k<this.allCoachArr.length; k++){
                    if(this.coachKey == this.allCoachArr[k].$key){
                        this.tempcoachArr.push(this.allCoachArr[k]);
                    }
                }
            }
        });


        if(this.tempcoachArr.length != undefined){
            this.orgCoachLevelArr = [];
            for(let m=0; m<this.tempcoachArr.length; m++){
                if(this.tempcoachArr[m].CoachingLevel != undefined){
                    this.orgCoachLevelArr = this.commonService.convertFbObjectToArray(this.tempcoachArr[m].CoachingLevel);
                }
            }
        }
    }


    saveSelectedCoachLevel(){
        
        let obj = {
            AliasName:"",
            CoachingLevelCode:"",
            CoachingLevelName:"",
        }
       
            if(this.orgCoachLevelArr.length > 0){
                 for(let z=0; z<this.orgCoachLevelArr.length; z++){
                     this.responseDetails = this.fb.update(this.orgCoachLevelArr[z].Key, "/Coach/Type2/" + this.parentClubKey + "/" + this.coachKey + "/CoachingLevel/",{ IsActive: false });
                }
            }
       
        obj.AliasName = this.tempcoachlevelArr[0].AliasName;
        obj.CoachingLevelCode = this.tempcoachlevelArr[0].CoachingLevelCode;
        obj.CoachingLevelName = this.tempcoachlevelArr[0].CoachingLevelName;
        this.responseDetails = this.fb.update(this.tempcoachlevelArr[0].$key, "/Coach/Type2/" + this.parentClubKey + "/" + this.coachKey + "/CoachingLevel/",{ IsActive: true });

        this.responseDetails = this.fb.update(this.tempcoachlevelArr[0].$key, "/Coach/Type2/" + this.parentClubKey + "/" + this.coachKey + "/CoachingLevel/",obj);
        if(this.responseDetails != undefined){
            alert("Successfully Saved");
            this.navCtrl.pop();

        }
    }


}
