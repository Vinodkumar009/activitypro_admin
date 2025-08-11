import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, Platform, AlertController, ActionSheetController, ToastController } from 'ionic-angular';
import { FirebaseService } from '../../../../services/firebase.service';
import { CommonService } from '../../../../services/common.service';
import { Storage } from '@ionic/storage';
import * as moment from 'moment';
/**
 * Generated class for the MembershipModalPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-membershipyear',
  templateUrl: 'membershipyear.html',
})
export default class MembershipYearPage {
  ParentClubKey: any;
  Venues = [];
  selectedClubKey;
  isAdded = false;

  endDateArr = [];
  currencyDetails: any;
 // endYearKey: any;


  constructor(public navCtrl: NavController, public navParams: NavParams, private view: ViewController, private fb: FirebaseService,
    storage: Storage, private platform: Platform, public comonService: CommonService, private alertCtrl: AlertController,
    private toastCtrl: ToastController, public actionSheetCtrl: ActionSheetController, ) {

    storage.get('userObj').then((val) => {
      val = JSON.parse(val);
      if (val.$key != "") {
        this.ParentClubKey = val.UserInfo[0].ParentClubKey;
      }
      console.log("ParentClubKey: ", this.ParentClubKey)
      this.getAllVenue(this.ParentClubKey)

    }).catch(error => {
    });
    storage.get('Currency').then((val) => {
      this.currencyDetails = JSON.parse(val);
    }).catch(error => {
    });
  }

  getAllVenue(ParentClubKey) {
    this.Venues = [];
    this.fb.getAllWithQuery("Club/Type2/" + ParentClubKey + "/", { orderByChild: "IsActive", equalTo: true }).subscribe((data) => {
      for (let i = data.length - 1; i >= 0; i--) {
        if (data[i].IsActive == true) {
          this.Venues.push(data[i]);
          //this.selectedClubKey = data[i].$key;
          this.selectVenue(data[data.length - 1].$key)
        }
      }    
                
    });
  }
  selectVenue(event) {
    this.selectedClubKey = event;
    this.getYearlyEndDate(this.selectedClubKey)
  }

  ionViewDidLoad() {
    this.getAllVenue(this.ParentClubKey)
  }

  getYearlyEndDate(selectedClubKey) {
    this.endDateArr = []
    this.fb.getAll("Membership/MembershipSetup/" + this.ParentClubKey + "/" + selectedClubKey + "/MembershipYear/").subscribe(data => {
    //this.fb.getAll("Membership/MembershipSetup/" + this.ParentClubKey + "/" + selectedClubKey + "/MembershipYear/").subscribe(data => {
      if (data.length > 0) {
        data.forEach(endYear=>{
          //console.log(endYear,"i")
          this.endDateArr = []
         
          if(endYear.IsActive){
           
              if (endYear.Option == "FinancialYear") {
              
              
                endYear['OptionName'] = "Financial Year"
                this.endDateArr.push(endYear)
                this.isAdded = true;
              }
              if (endYear.Option == "TwelvemonthrollingMonthBefore") {
               
                endYear["OptionName"] = "Twelve month rolling"
                endYear["subOption"] = 'finish a month before'
                endYear["Date"] = moment(new Date(endYear.ExpireDate)).format("DD-MMM-YYYY")
                this.endDateArr.push(endYear)
                this.isAdded = true;
              }
              if (endYear.Option == "TwelvemonthrollingAtThatMonth") {
              
                endYear["OptionName"] = "Twelve month rolling"
                endYear["subOption"] = 'finish at that month'
                endYear["Date"] = moment(new Date(endYear.ExpireDate)).format("DD-MMM-YYYY")
                this.endDateArr.push(endYear)
                this.isAdded = true;
              }
            }
          

        })
      } else {
        this.isAdded = false;
      }
     
    })
  }
  showOptions(endDate) {
    let actionSheet = this.actionSheetCtrl.create({
      buttons: [
        {
          text: "Edit Membership Year",
          icon: this.platform.is('android') ? 'ios-create-outline' : '',
          handler: () => {
            this.navCtrl.push('AddmembershipYearPage', { ClubKey: this.selectedClubKey, EndYearKey: endDate.$key, EndDateObj: endDate })

          }
        },
        {
          text: 'Delete Membership Year',
          cssClass: 'dangerRed',
          icon: this.platform.is('android') ? 'trash' : '',
          handler: () => {
            this.deleteDiscount(endDate.$key)
            //console.log("Delete", discount)
          }
        }
      ]
    });

    actionSheet.present();
  }

  deleteDiscount(endYearKey) {
    let alert = this.alertCtrl.create({
      title: "Delete End Date",
      message: ' Are you sure want to delete?',
      buttons: [
        {
          text: "No",
          role: 'cancel'

        },
        {
          text: 'Yes',
          handler: data => {
            console.log(endYearKey, "Membership/MembershipSetup/" + this.ParentClubKey + "/" + this.selectedClubKey + "/MembershipYear", { IsActive: false })
            this.fb.update(endYearKey, "Membership/MembershipSetup/" + this.ParentClubKey + "/" + this.selectedClubKey + "/MembershipYear", { IsActive: false });
            this.showToast("End Date Deleted", 3000);
            this.isAdded = false
            this.getYearlyEndDate(this.selectedClubKey)
          }
        }
      ]
    });
    alert.present();
  }
  addMembershipYear() {
    this.navCtrl.push('AddmembershipYearPage', { ClubKey: this.selectedClubKey })
  }

  showToast(m: string, dur: number) {
    let toast = this.toastCtrl.create({
      message: m,
      duration: dur,
      position: 'bottom'
    });
    toast.present();
  }
}