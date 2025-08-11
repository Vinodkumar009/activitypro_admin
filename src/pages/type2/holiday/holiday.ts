import { Component } from '@angular/core';
import { NavController, PopoverController } from 'ionic-angular';
import { SharedServices } from '../../services/sharedservice';
import { Platform } from 'ionic-angular';
import { FirebaseService } from '../../../services/firebase.service';
import { Storage } from '@ionic/storage';
import { IonicPage } from 'ionic-angular';
@IonicPage()
@Component({
  selector: 'holiday-page',
  templateUrl: 'holiday.html'
})

export class Type2Holiday {
  themeType: number;
  holidayFYTab: string = "current";
  isAndroid: boolean = false;
  financialYearData: any;
  parentClubKey: string;
  financialYear1: {};
  financialYear2: {};
  financialYear1Key: string;
  financialYear2Key: string;
  currentFinacialYearHolidayList = [];
  nexttFinacialYearHolidayList = [];
  allClubs=[];
  selectedClubKey: any;
  constructor(public navCtrl: NavController, storage: Storage, public fb: FirebaseService, public sharedservice: SharedServices, platform: Platform, public popoverCtrl: PopoverController) {

    this.themeType = sharedservice.getThemeType();
    this.isAndroid = platform.is('android');
    storage.get('userObj').then((val) => {
      val = JSON.parse(val);
      for (let club of val.UserInfo)
        if (val.$key != "") {
          this.parentClubKey = club.ParentClubKey;
          this.getFinancialYearList();

        }
    })
  }
  getFinancialYearList() {
       this.fb.getAll("/FinancialYear/Type2/" + this.parentClubKey).subscribe((data) => {
      let financialYears = data;
      if (financialYears.length != 0) {
        let monthArray = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

        let currentYear = new Date().getFullYear();
        let currentMonth = new Date().getMonth();
        let isDone = false;
        for (let i = 0; i < financialYears.length; i++) {
          if ((financialYears[i].StartYear == financialYears[i].EndYear) && (parseInt(financialYears[i].EndYear) == currentYear) && (currentMonth <= monthArray.indexOf(financialYears[i].EndMonth))) {
            isDone = true;
            this.financialYear1Key = financialYears[i].$key;
            this.financialYear1 = financialYears[i];
            if (financialYears[i + 1] != undefined) {
              this.financialYear2 = data[i + 1];
              this.financialYear2Key = data[i + 1].$key;
            }
            this.getClubKeys();
            break;
          }
        }
        if (!isDone) {
          for (let financialYearIndex = 0; financialYearIndex < financialYears.length; financialYearIndex++) {
            let currentYear = new Date().getFullYear();
            let monthArray = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            let endMonthIndex = monthArray.indexOf(financialYears[financialYearIndex].EndMonth);
            let startMonthIndex = monthArray.indexOf(financialYears[financialYearIndex].StartMonth);
            let condition1 = (parseInt(financialYears[financialYearIndex].StartYear) <= currentYear);
            let condition2 = (parseInt(financialYears[financialYearIndex].EndYear) >= currentYear);
            let condition3 = false;
            if (parseInt(financialYears[financialYearIndex].StartYear) == currentYear) {
              condition3 = (startMonthIndex <= new Date().getMonth());
            } else {
              condition3 = (endMonthIndex >= new Date().getMonth());
            }
            if (condition1 && condition2 && condition3) {
              this.financialYear1Key = financialYears[financialYearIndex].$key;
              this.financialYear1 = financialYears[financialYearIndex];


              if (financialYears[financialYearIndex + 1] != undefined) {
                this.financialYear2 = data[financialYearIndex + 1];
                this.financialYear2Key = data[financialYearIndex + 1].$key;
              }
              this.getClubKeys();
              break;
            }
          }
        }
      }

    });




  }

  onClubChange() {
    this.getHolidayLists();
  }

  getClubKeys() {
    this.fb.getAllWithQuery("/Club/Type2/" + this.parentClubKey + "/", { orderByChild: "IsEnable", equalTo: true }).subscribe((data) => {
      if (data.length > 0) {
        for (let i = 0; i < data.length; i++) {
          if (data[i].IsEnable) {
            this.allClubs.push(data[i]);
          }
        }
        if (this.allClubs.length > 0) {
          this.selectedClubKey = this.allClubs[0].$key;
          this.getHolidayLists();
        }


      }
    });
  }



  getHolidayLists() {
    if (this.financialYear1Key != undefined && this.financialYear1Key != "") {
      this.fb.getAll("/Holiday/Type2/" + this.parentClubKey + "/" + this.selectedClubKey + "/" + this.financialYear1Key + "/").subscribe((data1) => {
        this.currentFinacialYearHolidayList = [];
        if (data1.length > 0) {
          this.currentFinacialYearHolidayList = data1;
        }
      });
     
    }
    if (this.financialYear2Key != undefined && this.financialYear2Key != "") {
     

      this.fb.getAll("/Holiday/Type2/" + this.parentClubKey + "/" + this.selectedClubKey + "/" + this.financialYear2Key + "/").subscribe((data) => {
        this.nexttFinacialYearHolidayList = [];
        if (data.length > 0) {
          this.nexttFinacialYearHolidayList = data;
        }
      });
    }
  }


  presentPopover(myEvent) {
    let popover = this.popoverCtrl.create("PopoverPage");
    popover.present({
      ev: myEvent
    });
  }
  gotoAddHoliday() {
    //this.navCtrl.push(AddHoliday);
    if (this.holidayFYTab == "current") {
      this.navCtrl.push('Type2AddHoliday', { financialYearKey: this.financialYear1Key, financialYear: this.holidayFYTab });
    } else if (this.holidayFYTab == "next") {
      this.navCtrl.push("Type2AddHoliday", { financialYearKey: this.financialYear2Key, financialYear: this.holidayFYTab });
    }
  }
  editHoliday(holidayobj) {
    if (this.holidayFYTab == "current") {
      this.navCtrl.push("Type2EditHoliday", { selectedClubKey: this.selectedClubKey, holiday: holidayobj, financialYearKey: this.financialYear1Key });
    } else if (this.holidayFYTab == "next") {
      this.navCtrl.push("Type2EditHoliday", { selectedClubKey: this.selectedClubKey, holiday: holidayobj, financialYearKey: this.financialYear2Key });
    }
  }

  goToDashboardMenuPage() {
    this.navCtrl.setRoot("Dashboard");
  }


}
