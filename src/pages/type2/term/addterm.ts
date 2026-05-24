import { Component } from '@angular/core';
import { NavController, PopoverController, NavParams, AlertController } from 'ionic-angular';
import { SharedServices } from '../../services/sharedservice';
// import { PopoverPage } from '../../popover/popover';
import { Platform } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { FirebaseService } from '../../../services/firebase.service';
// import { Dashboard } from './../../dashboard/dashboard';
import { IonicPage } from 'ionic-angular';
import { CommonService, ToastMessageType, ToastPlacement } from '../../../services/common.service';
import moment from 'moment';
@IonicPage()
@Component({
  selector: 'add-term-page',
  templateUrl: 'addterm.html'
})

export class Type2AddTerm {
  themeType: number;
  tillDate: number;
  financialYearKey: string;
  financialYear: string;
  termKey: any;
  parentClubKey: string;
  termObj = {
    TermName: "", TermStartDate: "", TermEndDate: "", isForAllActivity: true, TermPayByDate: "", HalfTermStartDate: "",
    HalfTermEndDate: "", TermComments: "", TermNoOfWeeks: "", IsActive: true,
    IsEnable: true,
    CreatedDate: 0,
    CreatedBy: 'Parent Club'
  };
  isAndroid: boolean = false;
  clubs: any;
  selectedClub: any;
  selectedType: any;
  allParentClubDataArr: any;
  selectedParentClubKey: any;
  allClub = [];
  activity = [];
  activityArr = [];
  financialYearDetials: any;
  minDate: string;


  desiredActivity = [];

  clubSubscriber: any;







  constructor(public commonService: CommonService, public alertCtrl: AlertController, public navCtrl: NavController, storage: Storage, public navParams: NavParams, public sharedservice: SharedServices, platform: Platform, public popoverCtrl: PopoverController, public fb: FirebaseService) {
    this.themeType = sharedservice.getThemeType();

    // Set minimum date to today
    this.minDate = moment().format('YYYY-MM-DD');

    this.financialYear = navParams.get('financialYear');
    this.isAndroid = platform.is('android');
    this.financialYearKey = navParams.get('financialYearKey');

    this.financialYearDetials = navParams.get("FinancialYerarDetials");

    this.selectedType = "Type2";

    if (this.financialYear == "current") {
      this.tillDate = new Date().getFullYear();
    }
    else if (this.financialYear == "next") {
      this.tillDate = new Date().getFullYear() + 1;
    }
    storage.get('userObj').then((val) => {
      val = JSON.parse(val);
      for (let club of val.UserInfo)
        if (val.$key != "") {
          this.selectedParentClubKey = club.ParentClubKey;
          this.parentClubKey = club.ParentClubKey;
          this.getAllActivity();
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





  getClubList() {
    const passedClubKey = this.navParams.get('selectedClubKey');
    let clubSubscriber = this.fb.getAll("/Club/Type2/" + this.parentClubKey).subscribe((data) => {
      if (data.length > 0) {
        for (let i = 0; i < data.length; i++) {
          if (data[i].IsEnable) {
            this.allClub.push(data[i]);
          }
        }

        if (passedClubKey && this.allClub.some(c => c.$key === passedClubKey)) {
          this.selectedClub = passedClubKey;
          this.onChangeClub();
        } else {
          this.selectedClub = "All";
        }
      }
      clubSubscriber.unsubscribe();
    });
  }

  getAllActivity() {
    let activitySubscriber = this.fb.getAll("/Activity/" + this.selectedParentClubKey).subscribe((response) => {
      this.activity = response;
      for (let i = 0; i < this.activity.length; i++) {
        let clubKey = this.activity[i].$key;

        this.activity[i] = this.commonService.convertFbObjectToArray(this.activity[i]);
        for (let j = 0; j < this.activity[i].length; j++) {

          this.activity[i][j]["ClubKey"] = clubKey;
          let isPresent = false;
          for (let k = 0; k < this.desiredActivity.length; k++) {
            if (this.activity[i][j].Key == this.desiredActivity[k].Key) {
              isPresent = true;
              break;
            }
          }
          if (!isPresent) {





            // this.activity[i][j]
            // this.desiredActivity.push({
            //   ActivityCode : this.activity[i][j].ActivityCode,
            //   ActivityName :this.activity[i][j].ActivityName,
            //   AliasName :this.activity[i][j].AliasName,
            //   BaseFees:this.activity[i][j].BaseFees,
            //   IsActive: this.activity[i][j].IsActive,
            //   IsEnable:this.activity[i][j].IsEnable,
            //   IsExistActivityCategory :this.activity[i][j].IsExistActivityCategory,
            //   IsSelected:true
            // });
            this.desiredActivity.push(this.activity[i][j]);
            this.desiredActivity[this.desiredActivity.length - 1]["IsSelected"] = true;
          }
        }
      }
      activitySubscriber.unsubscribe();
      // Ensure all checkboxes reflect the "All Activity" state
      if (this.termObj.isForAllActivity) {
        this.allActivityChange();
      }
    });
  }

  // ionViewWillUnload() {
  //   // if (this.clubSubscriber != undefined) {
  //   //   this.clubSubscriber.unsu
  //   // }
  // }



  allActivityChange() {
    // console.log(this.termObj.isForAllActivity);
    // if(this.termObj.isForAllActivity){
    // }


    for (let i = 0; i < this.desiredActivity.length; i++) {
      this.desiredActivity[i].IsSelected = this.termObj.isForAllActivity;
    }

  }


  onChangeClub() {
    this.desiredActivity = [];
    if (this.selectedClub == "All") {
      for (let i = 0; i < this.activity.length; i++) {
        for (let j = 0; j < this.activity[i].length; j++) {
          let isPresent = false;
          for (let k = 0; k < this.desiredActivity.length; k++) {
            if (this.activity[i][j].Key == this.desiredActivity[k].Key) {
              isPresent = true;
              break;
            }
          }
          if (!isPresent) {
            this.desiredActivity.push(this.activity[i][j]);
            this.desiredActivity[this.desiredActivity.length - 1]["IsSelected"] = true;
          }
        }
      }
    } else {



      console.log(this.activity);
      console.log(this.selectedClub);
      for (let i = 0; i < this.activity.length; i++) {
        for (let j = 0; j < this.activity[i].length; j++) {
          if (this.activity[i][j]["ClubKey"] == this.selectedClub) {
            this.desiredActivity.push(this.activity[i][j]);
            this.desiredActivity[this.desiredActivity.length - 1]["IsSelected"] = this.termObj.isForAllActivity;
          }
        }
      }
      // for (let i = 0; i < this.activity.length; i++) {
      //   let clubKey = this.activity[i].$key;

      //   this.activity[i] = this.commonService.convertFbObjectToArray(this.activity[i]);
      //   for (let j = 0; j < this.activity[i].length; j++) {

      //     if(this.activity[i][j]["ClubKey"] == clubKey){

      //     }
      //     let isPresent = false;
      //     for (let k = 0; k < this.desiredActivity.length; k++) {
      //       if (this.activity[i][j].Key == this.desiredActivity[k].Key) {
      //         isPresent = true;
      //         break;
      //       }
      //     }
      //     if (!isPresent) {
      //       this.desiredActivity.push(this.activity[i][j]);
      //       this.desiredActivity[this.desiredActivity.length - 1]["IsSelected"] = true;
      //     }
      //   }
      // }
    }


    console.log(this.desiredActivity);
  }

  // -----------------------------------------------------------------------
  //
  //
  //----------------------------------------------------------------------


  toggolSelectionActivity(item) {
    if (item.isSelect) {
      this.activityArr.push(item);
    }
    else {
      for (let index = 0; index < this.activityArr.length; index++) {
        if (item.$key == this.activityArr[index].$key) {
          this.activityArr.splice(index, 1);
          break;
        }

      }
    }
  }



  calculateHalfEnd(TermStartDate){
  
    this.termObj.HalfTermEndDate = moment(TermStartDate).add(6, 'days').format("YYYY-MM-DD");
    
  }      


  saveTerm() {
    if (this.validateTerm()) {

      if (this.selectedClub == "All") {




        let termObjforAll = {
          TermName: this.termObj.TermName,
          TermStartDate: this.termObj.TermStartDate,
          TermEndDate: this.termObj.TermEndDate,
          isForAllActivity: this.termObj.isForAllActivity,
          TermPayByDate: this.termObj.TermPayByDate,
          HalfTermStartDate: this.termObj.HalfTermStartDate,
          HalfTermEndDate: this.termObj.HalfTermEndDate,

          TermComments: this.termObj.TermComments,
          TermNoOfWeeks: this.termObj.TermNoOfWeeks,
          IsActive: this.termObj.IsActive,
          IsEnable: this.termObj.IsEnable,
          CreatedDate: this.termObj.CreatedDate,
          CreatedBy: this.termObj.CreatedBy,
          Activity: {}
        }



        for (let i = 0; i < this.activity.length; i++) {
          termObjforAll.Activity = {};
          let clubKey = "";
          for (let j = 0; j < this.activity[i].length; j++) {
            if(this.activity[i][j].ActivityCode!=undefined){
              if (clubKey == "") {
                clubKey = this.activity[i][j].ClubKey;
              }
              termObjforAll.Activity[this.activity[i][j].Key] = {};
              termObjforAll.Activity[this.activity[i][j].Key]["ActivityCode"] = this.activity[i][j].ActivityCode;
              termObjforAll.Activity[this.activity[i][j].Key]["ActivityName"] = this.activity[i][j].ActivityName;
              termObjforAll.Activity[this.activity[i][j].Key]["AliasName"] = this.activity[i][j].AliasName;
              termObjforAll.Activity[this.activity[i][j].Key]["BaseFees"] = this.activity[i][j].BaseFees;
              termObjforAll.Activity[this.activity[i][j].Key]["IsActive"] = false;
              termObjforAll.Activity[this.activity[i][j].Key]["IsEnable"] = this.activity[i][j].IsEnable;
              termObjforAll.Activity[this.activity[i][j].Key]["IsExistActivityCategory"] = this.activity[i][j].IsExistActivityCategory;
              if (this.activity[i][j].IsExistActivityCategory) {
                termObjforAll.Activity[this.activity[i][j].Key]["ActivityCategory"] = this.activity[i][j].ActivityCategory;
              }
              for (let k = 0; k < this.desiredActivity.length; k++) {
                if ((this.desiredActivity[k].Key == this.activity[i][j].Key) && (this.desiredActivity[k].IsSelected && this.desiredActivity[k].Key!=undefined)) {
                  termObjforAll.Activity[this.activity[i][j].Key]["IsActive"] = true;
                }
              }
            }
            
          }

          //console.log(this.activity);
          //console.log(this.allClub);
          //console.log("/Term/" + this.selectedType + "/" + this.selectedParentClubKey + "/" + clubKey + "/" + this.financialYearKey + "/");
          this.fb.saveReturningKey("/Term/" + this.selectedType + "/" + this.selectedParentClubKey + "/" + clubKey + "/" + this.financialYearKey + "/", termObjforAll);
        }




      } else {
        let termObjforAll = {
          TermName: this.termObj.TermName,
          TermStartDate: this.termObj.TermStartDate,
          TermEndDate: this.termObj.TermEndDate,
          isForAllActivity: this.termObj.isForAllActivity,
          TermPayByDate: this.termObj.TermPayByDate,
          HalfTermStartDate: this.termObj.HalfTermStartDate,
          HalfTermEndDate: this.termObj.HalfTermEndDate,

          TermComments: this.termObj.TermComments,
          TermNoOfWeeks: this.termObj.TermNoOfWeeks,
          IsActive: this.termObj.IsActive,
          IsEnable: this.termObj.IsEnable,
          CreatedDate: this.termObj.CreatedDate,
          CreatedBy: this.termObj.CreatedBy,
          Activity: {}
        }
        for (let j = 0; j < this.desiredActivity.length; j++) {
          if (this.desiredActivity[j].IsSelected && this.desiredActivity[j].Key!=undefined && this.desiredActivity[j].ActivityCode!=undefined) {
            termObjforAll.Activity[this.desiredActivity[j].Key] = {};
            termObjforAll.Activity[this.desiredActivity[j].Key]["ActivityCode"] = this.desiredActivity[j].ActivityCode;
            termObjforAll.Activity[this.desiredActivity[j].Key]["ActivityName"] = this.desiredActivity[j].ActivityName;
            termObjforAll.Activity[this.desiredActivity[j].Key]["AliasName"] = this.desiredActivity[j].AliasName;
            termObjforAll.Activity[this.desiredActivity[j].Key]["BaseFees"] = this.desiredActivity[j].BaseFees;
            termObjforAll.Activity[this.desiredActivity[j].Key]["IsActive"] = this.desiredActivity[j].IsActive;
            termObjforAll.Activity[this.desiredActivity[j].Key]["IsEnable"] = this.desiredActivity[j].IsEnable;
            termObjforAll.Activity[this.desiredActivity[j].Key]["IsExistActivityCategory"] = this.desiredActivity[j].IsExistActivityCategory;
            if (this.desiredActivity[j].IsExistActivityCategory) {
              termObjforAll.Activity[this.desiredActivity[j].Key]["ActivityCategory"] = this.desiredActivity[j].ActivityCategory;
            }
          }


        }

        this.fb.saveReturningKey("/Term/" + this.selectedType + "/" + this.selectedParentClubKey + "/" + this.desiredActivity[0].ClubKey + "/" + this.financialYearKey + "/", termObjforAll);
      }

      this.commonService.toastMessage("Term created successfully.", 2500,ToastMessageType.Success);
      this.navCtrl.pop();
    }
  }


  cancelTerm() {
    this.termObj = {
      TermName: "", TermStartDate: "", TermEndDate: "", isForAllActivity: true, TermPayByDate: "", HalfTermStartDate:"", HalfTermEndDate:"", TermComments: "", TermNoOfWeeks: "", IsActive: true,
      IsEnable: true,
      CreatedDate: 0,
      CreatedBy: 'Parent Club'
    };
    this.termKey = undefined;
    this.selectedClub = undefined;
    this.navCtrl.pop();
  }

  validateSelectionOfAcitivity(): boolean {
    for (let i = 0; i < this.desiredActivity.length; i++) {
      if (this.desiredActivity[i].IsSelected) {
        return true;
      }
    }
    return false;
  }
  validateTerm(): boolean {
    if (this.financialYearKey == "" || this.financialYearKey == undefined) {
      //alert("Select Club");
      this.commonService.toastMessage('Financial Year Key Could not be found. Please contact support.',2500,ToastMessageType.Error);
      return false;
    }


    if (this.selectedClub == "" || this.selectedClub == undefined) {
      //alert("Select Club");
      this.commonService.toastMessage('Please select venue',2500,ToastMessageType.Error);
      return false;
    }

    else if (this.termObj.TermName == "" || this.termObj.TermName == undefined) {
      this.commonService.toastMessage('Please enter term name',2500,ToastMessageType.Error);
      return false;
    }

    else if (this.termObj.TermStartDate == "" || this.termObj.TermStartDate == undefined) {
      this.commonService.toastMessage('Please choose start date',2500,ToastMessageType.Error);
      return false;
    }

    else if (this.termObj.TermEndDate == "" || this.termObj.TermEndDate == undefined) {
      this.commonService.toastMessage('Please choose end date',2500,ToastMessageType.Error);
      return false;
    }

    else if (this.termObj.TermPayByDate == "" || this.termObj.TermPayByDate == undefined) {
      this.commonService.toastMessage('Please choose early payment date',2500,ToastMessageType.Error);
      return false;
    }

    else if (this.termObj.TermComments == "" || this.termObj.TermComments == undefined) {
      this.commonService.toastMessage('Please enter term comments',2500,ToastMessageType.Error);
      return false;
    }

    else if (this.termObj.isForAllActivity == undefined) {
      this.commonService.toastMessage('Please select an activity',2500,ToastMessageType.Error);
      return false;
    }

    else if (this.termObj.isForAllActivity == false) {
      if (this.desiredActivity.length > 0 && !this.validateSelectionOfAcitivity()) {
        this.commonService.toastMessage('Please select an activity',2500,ToastMessageType.Error);
        return false;

      }
      else if (this.desiredActivity.length == 0) {
        this.commonService.toastMessage('No activity available for the selected venue. Please contact support',2500,ToastMessageType.Error);
        return false;
      }
      // this.desiredActivity.forEach(element => {

      // });
    }





    return true;
  }

  
  goToDashboardMenuPage() {
    this.navCtrl.setRoot("Dashboard");
  }
  dateChanged(TermStartDate: string): void {
    this.termObj.TermPayByDate = moment(TermStartDate).format("YYYY-MM-DD");
    this.validateDates();
  }

  onEndDateChange(): void {
    this.validateDates();
  }

  validateDates(): void {
    if (this.termObj.TermStartDate && this.termObj.TermEndDate) {
      const startDate = moment(this.termObj.TermStartDate);
      const endDate = moment(this.termObj.TermEndDate);

      if (startDate.isAfter(endDate)) {
        this.commonService.toastMessage('Start date cannot be later than end date', 2500,ToastMessageType.Error);
        // Reset dates
        this.termObj.TermStartDate = '';
        this.termObj.TermEndDate = '';
        this.termObj.TermPayByDate = '';
      }
    }
  }

  showalert() {
    if (this.validateTerm()) {
      let alert = this.alertCtrl.create({
        title: 'Check Term Year',
        message: 'You have selected the Term Year: ' + this.financialYearDetials.StartMonth + " " + this.financialYearDetials.StartYear + " - " + this.financialYearDetials.EndMonth + " " + this.financialYearDetials.EndYear,
        buttons: [
          {
            text: 'Yes - Looks Good!',
            handler: () => {
              this.saveTerm()
            }
          },
          {
            text: 'No - Cancel',
            handler: () => {
              this.commonService.toastMessage('Please select the correct Term Year tab before creating',2500,ToastMessageType.Error);
            }
          },

        ]
      });
      alert.present();
    }
  }


}
