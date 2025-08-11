import { Component } from '@angular/core';
import { LoadingController, NavController, NavParams,AlertController } from 'ionic-angular';
import { PopoverController } from 'ionic-angular';
import { SharedServices } from '../../services/sharedservice';
// import { PopoverPage } from '../../popover/popover';
import { ToastController } from 'ionic-angular';
import { FirebaseService } from '../../../services/firebase.service';
// import { Dashboard } from './../../dashboard/dashboard';
import * as firebase from 'firebase';

import {IonicPage } from 'ionic-angular';
import { CommonService } from '../../../services/common.service';
@IonicPage()
@Component({
  selector: 'addmembershipsession-page',
  templateUrl: 'addmembershipsession.html'
})

export class Type2AddMembershipSession {
  themeType: number;
  venue: string = "s";
  term: string = "t1";
  activitytype: string = "a1";
  coach: string = "a";
  ageGroup = {
    initialSlide: 0,
    loop: true
    //pager: true
  };
  category = {
    initialSlide: 0,
    loop: true
  };
  startTime: any = 10;
  duration: any = 2;
  musicAlertOpts: { title: string, subTitle: string };
  //
  //variables declarations
  //
  parentClubKey: any;
  clubKey: any;
  CoachKey: any;
  SessionKey: any;
  members: any;


  sessionDetailsObj = {
    IsActive: true,
    ActivityCategoryKey: '',
    ActivityKey: '',
    ActivitySubCategoryKey: '',
    ClubKey: '',
    CoachKey: '',
    CoachName: '',
    Comments: '',
    Days: '',
    Duration: '60',
    EndDate: '',
    FinancialYearKey: '',
    GroupSize: '10',
    IsExistActivitySubCategory: false,
    IsExistActivityCategory: false,
    IsTerm: false,
    ParentClubKey: '',
    SessionFee: '7',
    SessionName: 'Session',
    SessionType: '',
    StartDate: '',
    StartTime: '',
    TermKey: '',
    TotalFeesAmount: '',
    AmountPaid: '',
    AmountDue: '',
    AmountPayStatus: '',
    OtherComments: '',
    IsVerified: false,
    PaidBy: '',
    PayByDate: ''
  };


  memberDetailsObj = {
    IsActive: true,
    ClubKey: '',
    DOB: '',
    EmailID: '',
    EmergencyContactName: '',
    EmergencyNumber: '',
    FirstName: '',
    Gender: '',
    IsChild: false,
    LastName: '',
    MiddleName: '',
    MedicalCondition: '',
    ParentClubKey: '',
    ParentKey: '',
    Password: '',
    PhoneNumber: '',
    Source: '',
    TotalFeesAmount: '',
    AmountPaid: '',
    AmountDue: '',
    AmountPayStatus: '',
    OtherComments: '',
    IsVerified: false,
    PaidBy: '',
    PayByDate: ''
  }
  SessionDetials: any;
  SessionName: any;
  clubs = [];

  loading: any;
  constructor(public commonService:CommonService,private alertCtrl: AlertController,public loadingCtrl: LoadingController, private toastCtrl: ToastController, public fb: FirebaseService, public navParams: NavParams, public navCtrl: NavController, public sharedservice: SharedServices, public popoverCtrl: PopoverController) {
    this.themeType = sharedservice.getThemeType();
    this.parentClubKey = navParams.get('ParentClubKey');
    this.clubKey = navParams.get('ClubKey');
    this.CoachKey = navParams.get('CoachKey');
    this.SessionKey = navParams.get('SessionKey');
    this.SessionName = navParams.get('SessionName');
    this.SessionDetials = navParams.get('SessionDetials');

    //session details for storing in member 

    this.sessionDetailsObj.ActivityCategoryKey = this.SessionDetials.ActivityCategoryKey;
    this.sessionDetailsObj.ActivityKey = this.SessionDetials.ActivityKey;
    this.sessionDetailsObj.ActivitySubCategoryKey = this.SessionDetials.ActivitySubCategoryKey;
    this.sessionDetailsObj.ClubKey = this.SessionDetials.ClubKey;
    this.sessionDetailsObj.CoachKey = this.SessionDetials.CoachKey;
    this.sessionDetailsObj.CoachName = this.SessionDetials.CoachName;
    this.sessionDetailsObj.Comments = this.SessionDetials.Comments;
    this.sessionDetailsObj.Days = this.SessionDetials.Days;
    this.sessionDetailsObj.Duration = this.SessionDetials.Duration;
    this.sessionDetailsObj.EndDate = this.SessionDetials.EndDate;
    this.sessionDetailsObj.FinancialYearKey = this.SessionDetials.FinancialYearKey;
    this.sessionDetailsObj.GroupSize = this.SessionDetials.GroupSize;
    this.sessionDetailsObj.IsExistActivitySubCategory = this.SessionDetials.IsExistActivitySubCategory;
    this.sessionDetailsObj.IsExistActivityCategory = this.SessionDetials.IsExistActivityCategory;
    this.sessionDetailsObj.IsTerm = this.SessionDetials.IsTerm;
    this.sessionDetailsObj.ParentClubKey = this.SessionDetials.ParentClubKey;
    this.sessionDetailsObj.SessionFee = this.SessionDetials.SessionFee;
    this.sessionDetailsObj.SessionName = this.SessionDetials.SessionName;
    this.sessionDetailsObj.SessionType = this.SessionDetials.SessionType;
    this.sessionDetailsObj.StartDate = this.SessionDetials.StartDate;
    this.sessionDetailsObj.StartTime = this.SessionDetials.StartTime;
    this.sessionDetailsObj.TermKey = this.SessionDetials.TermKey;

    //4 fields for payment 
    this.sessionDetailsObj.TotalFeesAmount = this.SessionDetials.SessionFee;
    this.sessionDetailsObj.AmountPaid = "0.00";
    this.sessionDetailsObj.AmountDue = this.SessionDetials.SessionFee;
    this.sessionDetailsObj.AmountPayStatus = "Due";
    this.sessionDetailsObj.OtherComments = "";
    this.sessionDetailsObj.IsVerified = false;
    this.sessionDetailsObj.PaidBy = "";

    this.sessionDetailsObj.PayByDate = this.SessionDetials.PayByDate;
    this.loading = this.loadingCtrl.create({
      content: 'Please wait...'
    });
    this.loading.present().then(() => {

      this.getClubList();
    });
  }


  getClubList() {

    let x: any;
    let ref = firebase.database().ref('/').child("/Club/Type2/" + this.parentClubKey);
    ref.once("value", function (snapshot) {
      x = snapshot.val();
      ref.off();
    }, function (error) {
      this.showToast(error.message, 5000);
    });
    x = this.commonService.convertFbObjectToArray(x);
    this.clubs = x;
    this.getMemberList();
  }



  presentPopover(myEvent) {
    let popover = this.popoverCtrl.create("PopoverPage");
    popover.present({
      ev: myEvent
    });
  }
  getMemberList() {
    this.members = [];
    for (let clubIndex = 0; clubIndex < this.clubs.length; clubIndex++) {
      this.fb.getAll("/Member/" + this.parentClubKey + "/" + this.clubs[clubIndex].Key).subscribe((data) => {
        for (let i = 0; i < data.length; i++) {
          data[i].isSelect = false;
          let age = (new Date().getFullYear() - new Date(data[i].DOB).getFullYear());
          if (isNaN(age)) {
            data[i].Age = "N.A";
          } else {
            data[i].Age = age;
          }
          this.members.push(data[i]);
        }
        this.loading.dismiss().catch(() => { });
      });
    }
  }

  showToast(m: string) {
    let toast = this.toastCtrl.create({
      message: m,
      duration: 5000,
      position: 'bottom'
    });
    toast.present();
  }

  addMember() {
    let confirm = this.alertCtrl.create({
      title: 'Add Member',
      message: 'Are you sure you want to add member?',
      buttons: [
        {
          text: 'No',
          handler: () => {
            console.log('Disagree clicked');
          }
        },
        {
          text: 'Yes',
          handler: () => {

            // this.loading = this.loadingCtrl.create({
            //   content: 'Please wait...'
            // });
            // this.loading.present().then(() => {
              this.addMemberToSession();
            // });
            //  this.loading.dismiss().catch(() => { });
          }
        }
      ]
    });
    confirm.present();
  }


  addMemberToSession() {
    let memberArray = [];
    let memberKeys = [];
    let isExcute = false;
    let x = []
    x = this.members;
    if (x.length == 0) {
      isExcute = false;
    }
    for (let index = 0; index < x.length; index++) {
      if (x[index].isSelect) {
        isExcute = true;
        break;
      }
    }


    if (isExcute) {
      // this.members.forEach(element => {
      for (let i = 0; i < this.members.length; i++) {
        let element = this.members[i];
        if (element.isSelect) {
          memberKeys.push(element.$key);
          this.memberDetailsObj.ClubKey = element.ClubKey;
          this.memberDetailsObj.IsChild = element.IsChild;
          this.memberDetailsObj.DOB = element.DOB;
          this.memberDetailsObj.EmailID = element.EmailID;
          this.memberDetailsObj.EmergencyContactName = element.EmergencyContactName;
          this.memberDetailsObj.EmergencyNumber = element.EmergencyNumber;
          this.memberDetailsObj.FirstName = element.FirstName;
          this.memberDetailsObj.MiddleName = element.MiddleName;
          this.memberDetailsObj.Gender = element.Gender;
          this.memberDetailsObj.IsChild = element.IsChild;
          this.memberDetailsObj.LastName = element.LastName;
          this.memberDetailsObj.MedicalCondition = element.MedicalCondition;
          this.memberDetailsObj.ParentClubKey = element.ParentClubKey;
          this.memberDetailsObj.Password = element.Password;
          this.memberDetailsObj.PhoneNumber = element.PhoneNumber;
          this.memberDetailsObj.Source = element.Source;
          this.memberDetailsObj.ParentKey = element.ParentKey;
          if (element.ParentKey == undefined) {
            this.memberDetailsObj.ParentKey = "";
          }
          if (element.IsChild == undefined) {
            this.memberDetailsObj.IsChild = false;
          }
          if (element.ClubKey == undefined) {
            this.memberDetailsObj.ClubKey = "";
          }
          if (element.DOB == undefined) {
            this.memberDetailsObj.DOB = "";
          }
          if (element.EmailID == undefined) {
            this.memberDetailsObj.EmailID = "";
          }
          if (element.EmergencyContactName == undefined) {
            this.memberDetailsObj.EmergencyContactName = "";
          }
          if (element.EmergencyNumber == undefined) {
            this.memberDetailsObj.EmergencyNumber = "";
          }
          if (element.FirstName == undefined) {
            this.memberDetailsObj.FirstName = "";
          }
          if (element.MiddleName == undefined) {
            this.memberDetailsObj.MiddleName = "";
          }
          if (element.Gender == undefined) {
            this.memberDetailsObj.Gender = "";
          }
          if (element.IsChild == undefined) {
            this.memberDetailsObj.IsChild = false;
          }
          if (element.LastName == undefined) {
            this.memberDetailsObj.LastName = "";
          }
          if (element.Gender == undefined) {
            this.memberDetailsObj.Gender = "";
          }
          if (element.ParentClubKey == undefined) {
            this.memberDetailsObj.ParentClubKey = "";
          }
          if (element.MedicalCondition == undefined) {
            this.memberDetailsObj.MedicalCondition = "";
          }
          if (element.Password == undefined) {
            this.memberDetailsObj.Password = "";
          }
          if (element.PhoneNumber == undefined) {
            this.memberDetailsObj.PhoneNumber = "";
          }
          if (element.Source == undefined) {
            this.memberDetailsObj.Source = "";
          }


          //member details 4field for payment keeping store in session

          this.memberDetailsObj.TotalFeesAmount = this.SessionDetials.SessionFee;
          this.memberDetailsObj.AmountPaid = "0.00";
          this.memberDetailsObj.AmountDue = this.SessionDetials.SessionFee;
          this.memberDetailsObj.AmountPayStatus = "Due";
          this.memberDetailsObj.OtherComments = "";
          this.memberDetailsObj.IsVerified = false;
          this.memberDetailsObj.PaidBy = "";
          this.memberDetailsObj.PayByDate = this.SessionDetials.PayByDate;
          memberArray.push(this.memberDetailsObj);
          this.memberDetailsObj = {
            IsActive: true, ClubKey: '',
            DOB: '', EmailID: '', EmergencyContactName: '', EmergencyNumber: '', FirstName: '',
            Gender: '', IsChild: false, LastName: '', MedicalCondition: '', ParentClubKey: '', ParentKey: '',
            Password: '', PhoneNumber: '', Source: '', TotalFeesAmount: '', MiddleName: '',
            AmountPaid: '', AmountDue: '', AmountPayStatus: '', OtherComments: '', IsVerified: false, PaidBy: '', PayByDate: ''
          }
        }

      }

      for (let j = 0; j < memberArray.length; j++) {
        //keeping member details in session folder
        this.fb.update(memberKeys[j], "/Session/" + this.parentClubKey + "/" + this.clubKey + "/" + this.CoachKey + "/" + this.SessionName + "/" + this.SessionKey + "/Member/", memberArray[j]);
        //keeping the session details in member folder
        this.fb.update(this.SessionKey, "/Member/" + this.parentClubKey + "/" + memberArray[j].ClubKey + "/" + memberKeys[j] + "/Session/", this.sessionDetailsObj);
        //keeping member detials in coach detials
        this.fb.update(memberKeys[j], "/Coach/Type2/" + this.parentClubKey + "/" + this.CoachKey + "/Session/" + this.SessionKey + "/Member/", memberArray[j]);
      }


      let message = "Member(s) for the session updated successfully";
      this.showToast(message);
      this.navCtrl.pop();
      this.navCtrl.pop();
    }
    else {
      let message = "Please Select atleast one member for the session creation.";
      this.showToast(message);
    }

  }

  goToDashboardMenuPage() {
    this.navCtrl.setRoot("Dashboard");
  }

}
