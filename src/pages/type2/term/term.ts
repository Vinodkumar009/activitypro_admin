import { Component } from '@angular/core';
import { NavController, PopoverController, ToastController, ActionSheetController } from 'ionic-angular';
import { SharedServices } from '../../services/sharedservice';
// import { PopoverPage } from '../../popover/popover';
import { Platform } from 'ionic-angular';
// import { Type2AddTerm } from './addterm';
// import { Type2EdiTterm } from './editterm';
// import { Dashboard } from './../../dashboard/dashboard';

import { FirebaseService } from '../../../services/firebase.service';
import { Storage } from '@ionic/storage';
import { IonicPage } from 'ionic-angular';
@IonicPage()
@Component({
  selector: 'term-page',
  templateUrl: 'term.html'
})

export class Type2Term {
  themeType: number;
  term: string;
  financialYearData: any;
  parentClubKey: string;
  financialYear1: {};
  financialYear2: {};
  financialYear1Key: string = "";
  financialYear2Key: string = "";
  isAndroid: boolean = false;
  currentFinacialYearTermList = [];
  nexttFinacialYearTermList = [];
  allClubs = [];
  clubKey: any;
  termTabValue: any;
  selectedClubKey: any;
  constructor(private toastCtrl: ToastController,  public actionSheetCtrl: ActionSheetController, public navCtrl: NavController, storage: Storage, public sharedservice: SharedServices, public fb: FirebaseService, platform: Platform, public popoverCtrl: PopoverController) {
    this.term = "current";
    this.themeType = sharedservice.getThemeType();
    this.isAndroid = platform.is('android');
    this.termTabValue = 'current';



    storage.get('userObj').then((val) => {
      val = JSON.parse(val);
      for (let club of val.UserInfo)
        if (val.$key != "") {
          this.parentClubKey = club.ParentClubKey;
          this.getFinancialYear();
        }
    })

  }


  showToast(m: string, d: number) {
    let toast = this.toastCtrl.create({
      message: m,
      duration: d,
      position: 'top'
    });
    toast.present();
  }

  getFinancialYear() {
    this.fb.getAll("/FinancialYear/Type2/" + this.parentClubKey).subscribe((data) => {
      let financialYears = data;
      if (financialYears.length != 0) {
        let monthArray = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

        let currentYear = new Date().getFullYear();
        let currentMonth = new Date().getMonth();
        let isDone = false;
        for (let i = 0; i < financialYears.length; i++) {

          //if 
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
    this.getTermLists();
  }

  getClubKeys() {
    this.fb.getAll("/Club/Type2/" + this.parentClubKey + "/").subscribe((data) => {
      if (data.length > 0) {
        for (let i = 0; i < data.length; i++) {
          if (data[i].IsEnable) {
            this.allClubs.push(data[i]);
          }
        }


        if (this.allClubs.length > 0) {
          this.selectedClubKey = this.allClubs[0].$key;
          this.getTermLists();
        }


      }
    });
  }

  getTermLists() {
    if (this.financialYear1Key != undefined && this.financialYear1Key != "") {
      this.fb.getAll("/Term/Type2/" + this.parentClubKey + "/" + this.selectedClubKey + "/" + this.financialYear1Key + "/").subscribe((data1) => {
        this.currentFinacialYearTermList = [];
        if (data1.length > 0) {
          this.currentFinacialYearTermList = data1;
          console.log("current financial year");
          console.log(data1);
        }
      });
    }
    if (this.financialYear2Key != undefined && this.financialYear2Key != "") {
      this.fb.getAll("/Term/Type2/" + this.parentClubKey + "/" + this.selectedClubKey + "/" + this.financialYear2Key + "/").subscribe((data) => {
        this.nexttFinacialYearTermList = [];
        if (data.length > 0) {
          this.nexttFinacialYearTermList = data;
          console.log("next financial year");
          console.log(data);
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
  gotoAddTerm() {
    if (this.term == "current") {
      this.navCtrl.push("Type2AddTerm", { financialYearKey: this.financialYear1Key, financialYear: this.term,FinancialYerarDetials: this.financialYear1, bothCurrentNextFinanYear: [{'currentYear':this.financialYear1, 'nextYear':this.financialYear2}]});
    } else if (this.term == "next") {
      this.navCtrl.push("Type2AddTerm", { financialYearKey: this.financialYear2Key, financialYear: this.term, FinancialYerarDetials: this.financialYear2});
    }

  }
  editTermAlert(term){
    const actionSheet = this.actionSheetCtrl.create({
      //  title: 'Send Report',
      buttons: [
        {
          text: 'Edit',
          handler: () => {
            this.editTerm(term)
          }
        },

      ]
    });
    actionSheet.present();
  }
  editTerm(termObj) {

    if (this.term == "current") {
      this.navCtrl.push("Type2EdiTterm", { selectedClubKey: this.selectedClubKey, financialYearKey: this.financialYear1Key, financialYear: this.term, termDetails: termObj });
    } else if (this.term == "next") {
      this.navCtrl.push("Type2EdiTterm", { selectedClubKey: this.selectedClubKey, financialYearKey: this.financialYear2Key, financialYear: this.term, termDetails: termObj });
    }
  }


  goToDashboardMenuPage() {
    this.navCtrl.setRoot("Dashboard");
  }

}
