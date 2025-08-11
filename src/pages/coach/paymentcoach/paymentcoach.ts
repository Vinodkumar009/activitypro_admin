// import { CoachPaymentDetails } from './paymentdetails';
// import { Dashboard } from '../../dashboard/dashboard';
import { FirebaseService } from '../../../services/firebase.service';
import { Component } from '@angular/core';
import { NavController, PopoverController, LoadingController, Platform } from 'ionic-angular';
import { SharedServices } from '../../services/sharedservice';
// import { PopoverPage } from '../../popover/popover';
import { Storage } from '@ionic/storage';

import { IonicPage } from 'ionic-angular';
import { CommonService } from '../../../services/common.service';
@IonicPage()
@Component({
  selector: 'paymentcoach-page',
  templateUrl: 'paymentcoach.html'
})

export class CoachPayment {
  termKey: string;
  currentAmountPaid = "0.00";
  currentAmountDue = "0.00";
  currentSessionDetails=[];
  currentFinacialYearTermList: any[];
  selectedCurrentClub: string;
  financialYear1Key: any;
  financialYear1: any;
  sessionFolder = [];
  themeType: number;
  loading: any;
  coachKey: any;
  parentClubKey: any;
  reportType = "Current";
  obj = {
    Message: ''
  }
  sessionDetails = [];
  clubs = [];
  selectedClub = "";
  coaches = [];
  selectedCoach = "";
  memberList = [];
  isAndroid: boolean = false;


  amountPaid = "0.00";
  amountDue = "0.00";

  coachType = "";

  constructor(public commonService:CommonService,public loadingCtrl: LoadingController, platform: Platform, storage: Storage, public fb: FirebaseService, public navCtrl: NavController, public sharedservice: SharedServices, public popoverCtrl: PopoverController) {
    this.obj.Message = "Paid by cash to the coach on " + new Date().getFullYear() + "-" + (new Date().getMonth() + 1) + "-" + new Date().getDate();


    // this.loading.present();
    this.themeType = sharedservice.getThemeType();
    this.isAndroid = platform.is('android');
    storage.get('userObj').then((val) => {
      val = JSON.parse(val);
      if (val.$key != "") {
        this.parentClubKey = val.UserInfo[0].ParentClubKey;
        this.coachKey = val.UserInfo[0].CoachKey;

        this.coachType = val.Type;
        //   this.getClubList();
      }
      // this.loading.dismiss().catch(() => { });
    })

  }

  ionViewDidLoad() {
    this.loading = this.loadingCtrl.create({
      content: 'Please wait...'
    });

    this.loading.present().then(() => {
      
      this.getSessionDetails();
      this.getClubList();
    });
  }

  paymentTabClick(type: string) {
    if (type == "Current") {
      this.loading = this.loadingCtrl.create({
        content: 'Please wait...'
      });

      this.loading.present().then(() => {
        this.coaches = [];
        this.getFinancialYear();
        //  this.calculateCurrentAmount();
        // this.getFinancialYear();

      });
    } else {
      this.coaches = [];
      this.calculateAmount();
    }

  }
  cancel() {
    this.navCtrl.pop();
  }
  pay() {

  }
  getFinancialYear() {
    this.fb.getAll("/FinancialYear/Type2/" + this.parentClubKey).subscribe((data) => {
      if (data.length > 0) {
        this.financialYear1 = data[0];
        this.financialYear1Key = data[0].$key;
        this.selectedCurrentClub = "All";
         this.loading.dismiss();
        for (let i = 0; i < this.clubs.length; i++) {
          this.fb.getAll("/Term/Type2/" + this.parentClubKey + "/" + this.clubs[i].$key + "/" + this.financialYear1Key + "/").subscribe((data1) => {
            this.currentFinacialYearTermList = [];
            if (data1.length > 0) {
              this.currentFinacialYearTermList = data1;

              for (let l = 0; l < data1.length; l++) {
                if (new Date(data1[l].TermEndDate).getTime() > new Date().getTime()) {
                  this.clubs[i].CurrentTermKey = data1[l].$key;


                }
              };
            }
            if (i == this.clubs.length - 1) {
              this.calculateCurrentAmount();
            }
          });

        }

      }
    });
  }
 

  getSessionDetails() {
    this.fb.getAll("/Session/" + this.parentClubKey + "/").subscribe((data) => {
      this.sessionFolder = data;

    });
  }

  //
  //get club list in group segment 
  //
  //calling from constructor
  //calling from sessionTabClick method click
  //


  getClubList() {
    this.fb.getAll("/Coach/Type" + this.coachType + "/" + this.parentClubKey + "/" + this.coachKey + "/Club/").subscribe((data) => {
      this.clubs = data;
     
      if (this.clubs.length != 0) {
        this.selectedClub = "All";
        this.selectedCurrentClub = "All";
        this.getFinancialYear();

      }

      //  if (this.clubs.length != 0) {
      // this.selectedClub = this.clubs[0].$key;
      // this.getCoachLists();
      //  this.getSessionDetailsAcccordingToClub();
      // }
    });
  }

  calculateCurrentAmount() {
    this.currentAmountDue = "0.00";
    this.currentAmountPaid = "0.00";
    let groupSession = [];
    this.currentSessionDetails = [];
    for (let i = 0; i < this.sessionFolder.length; i++) {
      let x = this.commonService.convertFbObjectToArray(this.sessionFolder[i]);
      for (let j = 0; j < x.length; j++) {
        if (x[j].Group != undefined) {
          groupSession.push(x[j].Group);
        }
      }
    }
    for (let index = 0; index < groupSession.length; index++) {
      let gs = this.commonService.convertFbObjectToArray(groupSession[index]);
      for (let sessionIndex = 0; sessionIndex < gs.length; sessionIndex++) {
        if (gs[sessionIndex].IsActive) {
          this.currentSessionDetails.push(gs[sessionIndex]);
        }
      }
    }
    for (let i = 0; i < this.currentSessionDetails.length; i++) {

      if (this.currentSessionDetails[i].CoachKey == this.coachKey) {
        for (let k = 0; k < this.clubs.length; k++) {
          if (this.clubs[k].CurrentTermKey != undefined) {
            if (this.currentSessionDetails[i].TermKey == this.clubs[k].CurrentTermKey) {
              if (this.currentSessionDetails[i].Member != undefined) {
                let memberList = this.commonService.convertFbObjectToArray(this.currentSessionDetails[i].Member);
                for (let j = 0; j < memberList.length; j++) {
                  if (memberList[j].IsActive) {
                    // this.duecount = this.duecount + 1;
                    // this.paidcount = this.paidcount + 1;
                    if (memberList[j].AmountPayStatus == "Due") {
                      this.currentAmountDue = (parseFloat(this.currentAmountDue) + parseFloat(memberList[j].AmountDue)).toFixed(2);
                    } else {
                      this.currentAmountPaid = (parseFloat(this.currentAmountPaid) + parseFloat(memberList[j].AmountPaid)).toFixed(2);
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
     //this.loading.dismiss();
  }

  calculateAmount() {
    this.amountDue = "0.00";
    this.amountPaid = "0.00";
    let groupSession = [];
    this.sessionDetails = [];
    for (let i = 0; i < this.sessionFolder.length; i++) {
      let x = this.commonService.convertFbObjectToArray(this.sessionFolder[i]);
      for (let j = 0; j < x.length; j++) {
        if (x[j].Group != undefined) {
          groupSession.push(x[j].Group);
        }
      }
    }
    for (let index = 0; index < groupSession.length; index++) {
      let gs = this.commonService.convertFbObjectToArray(groupSession[index]);
      for (let sessionIndex = 0; sessionIndex < gs.length; sessionIndex++) {
        if (gs[sessionIndex].IsActive) {
          this.sessionDetails.push(gs[sessionIndex]);
        }
      }
    }
    for (let i = 0; i < this.sessionDetails.length; i++) {

      if (this.sessionDetails[i].CoachKey == this.coachKey) {
        if (this.sessionDetails[i].Member != undefined) {
          let memberList = this.commonService.convertFbObjectToArray(this.sessionDetails[i].Member);
          for (let j = 0; j < memberList.length; j++) {
            if (memberList[j].IsActive) {
              // this.duecount = this.duecount + 1;
              // this.paidcount = this.paidcount + 1;
              if (memberList[j].AmountPayStatus == "Due") {
                this.amountDue = (parseFloat(this.amountDue) + parseFloat(memberList[j].AmountDue)).toFixed(2);
              } else {
                this.amountPaid = (parseFloat(this.amountPaid) + parseFloat(memberList[j].AmountPaid)).toFixed(2);
              }
            }
          }
        }
      }
    }
  }
  calculateAmountNew() {
    this.amountDue = "0.00";
    this.amountPaid = "0.00";
    let groupSession = [];
     this.sessionDetails = [];
    for (let i = 0; i < this.sessionFolder.length; i++) {
      let x = this.commonService.convertFbObjectToArray(this.sessionFolder[i]);
      for (let j = 0; j < x.length; j++) {
        if (x[j].Group != undefined) {
          groupSession.push(x[j].Group);
        }
      }
    }
    for (let index = 0; index < groupSession.length; index++) {
      let gs = this.commonService.convertFbObjectToArray(groupSession[index]);
      for (let sessionIndex = 0; sessionIndex < gs.length; sessionIndex++) {
        if (gs[sessionIndex].IsActive) {
          this.sessionDetails.push(gs[sessionIndex]);
        }
      }
    }
    for (let i = 0; i < this.sessionDetails.length; i++) {
      if (this.sessionDetails[i].ClubKey == this.selectedClub) {
        if (this.sessionDetails[i].CoachKey == this.coachKey) {

          if (this.sessionDetails[i].Member != undefined) {
            let memberList = this.commonService.convertFbObjectToArray(this.sessionDetails[i].Member);
            for (let j = 0; j < memberList.length; j++) {
              if (memberList[j].IsActive) {
                // this.duecount = this.duecount + 1;
                // this.paidcount = this.paidcount + 1;
                if (memberList[j].AmountPayStatus == "Due") {
                  this.amountDue = (parseFloat(this.amountDue) + parseFloat(memberList[j].AmountDue)).toFixed(2);
                } else {
                  this.amountPaid = (parseFloat(this.amountPaid) + parseFloat(memberList[j].AmountPaid)).toFixed(2);
                }
              }
            }
          }
        }
      }
    }
  }
  calculateCurrentAmountNew() {
    this.currentAmountDue = "0.00";
    this.currentAmountPaid = "0.00";
    let groupSession = [];
    this.currentSessionDetails = [];
    for (let i = 0; i < this.sessionFolder.length; i++) {
      let x = this.commonService.convertFbObjectToArray(this.sessionFolder[i]);
      for (let j = 0; j < x.length; j++) {
        if (x[j].Group != undefined) {
          groupSession.push(x[j].Group);
        }
      }
    }
    for (let index = 0; index < groupSession.length; index++) {
      let gs = this.commonService.convertFbObjectToArray(groupSession[index]);
      for (let sessionIndex = 0; sessionIndex < gs.length; sessionIndex++) {
        if (gs[sessionIndex].IsActive) {
          this.currentSessionDetails.push(gs[sessionIndex]);
        }
      }
    }
    this.termKey = "";
    for (var index = 0; index < this.clubs.length; index++) {
      if (this.clubs[index].$key == this.selectedCurrentClub) {
        this.termKey = this.clubs[index].CurrentTermKey;
      }

    }
    for (let i = 0; i < this.currentSessionDetails.length; i++) {
      if (this.currentSessionDetails[i].ClubKey == this.selectedCurrentClub) {
        if (this.currentSessionDetails[i].CoachKey == this.coachKey) {
          if (this.currentSessionDetails[i].TermKey == this.termKey) {
            if (this.currentSessionDetails[i].Member != undefined) {
              let memberList = this.commonService.convertFbObjectToArray(this.currentSessionDetails[i].Member);
              for (let j = 0; j < memberList.length; j++) {
                if (memberList[j].IsActive) {
                  // this.duecount = this.duecount + 1;
                  // this.paidcount = this.paidcount + 1;
                  if (memberList[j].AmountPayStatus == "Due") {
                    this.currentAmountDue = (parseFloat(this.currentAmountDue) + parseFloat(memberList[j].AmountDue)).toFixed(2);
                  } else {
                    this.currentAmountPaid = (parseFloat(this.currentAmountPaid) + parseFloat(memberList[j].AmountPaid)).toFixed(2);
                  }
                }
              }
            }
          }
        }
      }
    }
  }
  onChangeOfClub() {
    this.coaches = [];
    this.selectedCoach = "";
    this.amountDue = "0.00";
    this.amountPaid = "0.00";
    this.sessionDetails = [];
    if (this.selectedClub == "All") {
      this.calculateAmount();
    } else {
      this.calculateAmountNew();
    }

    // this.getSessionDetailsAcccordingToClub();
  }

  onChangeOfCurrentClub() {
    this.coaches = [];
    this.selectedCoach = "";
    this.currentAmountDue = "0.00";
    this.currentAmountPaid = "0.00";
    this.currentSessionDetails = [];
    if (this.selectedCurrentClub == "All") {
      this.calculateCurrentAmount();
    } else {
      this.calculateCurrentAmountNew();
    }

    // this.getSessionDetailsAcccordingToClub();
  }





  getSessionDetailsAcccordingToClub() {
    this.fb.getAll("/Session/" + this.parentClubKey + "/" + this.selectedClub + "/" + this.coachKey + "/Group/").subscribe((data) => {
      this.sessionDetails = [];

      for (let j = 0; j < data.length; j++) {
        if (data[j].IsActive) {
          this.sessionDetails.push(data[j]);
          this.memberList = [];
          for (let k = 0; k < this.sessionDetails.length; k++) {
            if (this.sessionDetails[k].Member != undefined) {
              let members = this.commonService.convertFbObjectToArray(this.sessionDetails[k].Member);
              for (let m = 0; m < members.length; m++) {
                if (members[m].IsActive) {
                  this.memberList.push(members[m]);
                  this.amountDue = "0.00";
                  this.amountPaid = "0.00";
                  for (let memberIndex = 0; memberIndex < this.memberList.length; memberIndex++) {
                    this.amountDue = (parseFloat(this.amountDue) + parseFloat(this.memberList[memberIndex].AmountDue)).toFixed(2);
                    this.amountPaid = (parseFloat(this.amountPaid) + parseFloat(this.memberList[memberIndex].AmountPaid)).toFixed(2);
                  }
                }
              }
            }
          }
        }
      }
    });
  }

  onChangeOfCoach() {
    let ssns = [];
    for (let i = 0; i < this.sessionDetails.length; i++) {
      if (this.selectedCoach == this.sessionDetails[i].CoachKey) {
        ssns.push(this.sessionDetails[i]);
      }
    }

    for (let k = 0; k < ssns.length; k++) {
      if (ssns[k].Member != undefined) {
        let members = this.commonService.convertFbObjectToArray(ssns[k].Member);
        for (let m = 0; m < members.length; m++) {
          if (members[m].IsActive) {
            this.memberList.push(members[m]);
            this.amountDue = "0.00";
            this.amountPaid = "0.00";
            for (let memberIndex = 0; memberIndex < this.memberList.length; memberIndex++) {
              this.amountDue = (parseFloat(this.amountDue) + parseFloat(this.memberList[memberIndex].AmountDue)).toFixed(2);
              this.amountPaid = (parseFloat(this.amountPaid) + parseFloat(this.memberList[memberIndex].AmountPaid)).toFixed(2);
            }
          }
        }
      }
    }
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
  goToPaymentDetailsListPage() {
    this.navCtrl.push("CoachPaymentDetails", { AllSessionLists: this.sessionDetails, AllClubs: this.clubs, SelectedClub: this.selectedClub, SelectedCoach: this.coachKey, ReportType: "Overall", TermKey: this.termKey });
  }
  goToPaymentCurrentDetailsListPage() {
    this.navCtrl.push("CoachPaymentDetails", { AllSessionLists: this.currentSessionDetails, AllClubs: this.clubs, SelectedClub: this.selectedCurrentClub, SelectedCoach: this.coachKey, ReportType: "Current", TermKey: this.termKey });
  }

}




