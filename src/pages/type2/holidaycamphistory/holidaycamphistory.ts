import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, PopoverController, ToastController } from 'ionic-angular';
import { FirebaseService } from '../../../services/firebase.service';
import { CommonService } from '../../../services/common.service';
import { Storage } from '@ionic/storage';
// import { NgCircleProgressModule } from 'ng-circle-progress';

/**
 * Generated class for the HolidaycamphistoryPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-holidaycamphistory',
  templateUrl: 'holidaycamphistory.html',
})
export class HolidaycamphistoryPage {
  loading: any;
  isNoData: boolean;
  currencyDetails: any;
  holidayCampList: any[] = [];
  parentClubKey: any;

  constructor(private toastCtrl: ToastController, public popoverCtrl: PopoverController, public loadingCtrl: LoadingController, public commonService: CommonService, storage: Storage, public fb: FirebaseService, public navCtrl: NavController, public navParams: NavParams) {
    storage.get('Currency').then((val) => {
      this.currencyDetails = JSON.parse(val);
    }).catch(error => {
    });

    storage.get('userObj').then((val) => {
      val = JSON.parse(val);
      if (val.$key != "") {
        this.parentClubKey = val.UserInfo[0].ParentClubKey;
       
        this.getPastHolidayCampList();
      }
    });
  }
  getPastHolidayCampList() {
    this.loading = this.loadingCtrl.create({
      content: 'Please wait...'
    });
    this.loading.present().then(() => {
      this.fb.getAllWithQuery("HolidayCamp/" + this.parentClubKey + "/", { orderByChild: 'IsActive', equalTo: true }).subscribe((data) => {
        this.holidayCampList = [];

        for (let i = 0; i < data.length; i++) {
          let mm = (new Date().getMonth()) > 10 ? new Date().getMonth() : "0" + new Date().getMonth();
          let dd = (new Date().getDate()) > 10 ? new Date().getDate() : "0" + new Date().getDate();
          let yy = new Date().getFullYear();
          let todayDate = yy + "-" + mm + "-" + dd;

          if ((new Date(data[i].EndDate).getTime()) < (new Date(todayDate).getTime())) {
            let amountDetails = {
              TotalAmount: 0,
              TotalDue: 0,
              TotalPaid: 0,
              TotalPaidPercentage: 0
            };
            if (data[i].Member != undefined) {
              let member = this.commonService.convertFbObjectToArray(data[i].Member);

              for (let outerIndex = 0; outerIndex < member.length; outerIndex++) {
                if (member[outerIndex].IsActive) {
                  if (member[outerIndex].AmountPayStatus == "Due") {
                    amountDetails.TotalAmount += parseFloat(member[outerIndex].AmountToShow);
                    amountDetails.TotalDue += parseFloat(member[outerIndex].AmountDue);
                  } else {
                    amountDetails.TotalAmount += parseFloat(member[outerIndex].AmountToShow);
                    amountDetails.TotalPaid += parseFloat(member[outerIndex].AmountPaid);
                  }
                }
              }
            }

            // data[i]["CircleTitle"] = this.currencyDetails.CurrencySymbol + parseFloat(amountDetails.TotalPaid.toString()).toFixed(2);
            data[i]["CircleTitle"] = this.currencyDetails.CurrencySymbol + parseFloat(amountDetails.TotalAmount.toString()).toFixed(2);
            amountDetails.TotalPaidPercentage = (((amountDetails.TotalPaid) / (amountDetails.TotalAmount)) * 100);
            if (isNaN(amountDetails.TotalPaidPercentage)) {
              amountDetails.TotalPaidPercentage = 0;
              data[i]["CircleTitle"] = this.currencyDetails.CurrencySymbol + "0.00";
            }

            data[i]["Subtitle"] = this.currencyDetails.CurrencySymbol + parseFloat((amountDetails.TotalPaid).toString()).toFixed(2) + " Paid";
            data[i]["TotalPaidPercentage"] = parseFloat(amountDetails.TotalPaidPercentage.toString()).toFixed(2);


            this.holidayCampList.push(data[i]);
          }
        }
        this.setActiveMember(this.holidayCampList);
        if (this.holidayCampList.length == 0) {
          this.isNoData = true;
        }

        this.loading.dismiss();
      });

    });
  }

  showToast(m: string) {
    let toast = this.toastCtrl.create({
      message: m,
      duration: 5000,
      position: 'bottom'
    });
    toast.present();
  }

  setActiveMember(data) {
    for (let i = 0; i < data.length; i++) {
      let ActiveMember = 0;
      if (this.holidayCampList[i]["Member"] != undefined) {
        let memberLength = this.commonService.convertFbObjectToArray(this.holidayCampList[i]["Member"]);
        for (let j = 0; j < memberLength.length; j++) {
          if (memberLength[j].IsActive) {
            ActiveMember++;
          }
        }
        this.holidayCampList[i]["ActiveMemberStrength"] = ActiveMember;
      } else {
        this.holidayCampList[i]["ActiveMemberStrength"] = ActiveMember;
      }
    }
  }
  getDateIn_DDMMYYYY_Format(date): string {
    let d = new Date(date);
    let month = "";
    switch (d.getMonth()) {
      case 0:
        month = "Jan";
        break;
      case 1:
        month = "Feb";
        break;
      case 2:
        month = "Mar";
        break;
      case 3:
        month = "Apr";
        break;
      case 4:
        month = "May";
        break;
      case 5:
        month = "Jun";
        break;
      case 6:
        month = "Jul";
        break;
      case 7:
        month = "Aug";
        break;
      case 8:
        month = "Sep";
        break;
      case 9:
        month = "Oct";
        break;
      case 10:
        month = "Nov";
        break;
      case 11:
        month = "Dec";
        break;
    }

    return d.getDate() + "-" + month + "-" + d.getFullYear();
  }
  getDateIn_DDMM_Format(date): string {
    let d = new Date(date);
    let month = "";
    switch (d.getMonth()) {
      case 0:
        month = "Jan";
        break;
      case 1:
        month = "Feb";
        break;
      case 2:
        month = "Mar";
        break;
      case 3:
        month = "Apr";
        break;
      case 4:
        month = "May";
        break;
      case 5:
        month = "Jun";
        break;
      case 6:
        month = "Jul";
        break;
      case 7:
        month = "Aug";
        break;
      case 8:
        month = "Sep";
        break;
      case 9:
        month = "Oct";
        break;
      case 10:
        month = "Nov";
        break;
      case 11:
        month = "Dec";
        break;
    }

    return d.getDate() + "-" + month;
  }


  goToDashboardMenuPage() {
    this.navCtrl.setRoot("Dashboard");
  }
  presentPopover(myEvent) {
    let popover = this.popoverCtrl.create("PopoverPage");
    popover.present({
      ev: myEvent
    });
  }

}
