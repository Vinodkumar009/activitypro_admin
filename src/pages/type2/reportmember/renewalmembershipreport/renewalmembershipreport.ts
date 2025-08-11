// import { Dashboard } from '../../dashboard/dashboard';
import { FirebaseService } from '../../../../services/firebase.service';
import { Component } from '@angular/core';
import { ToastController, NavParams, NavController, PopoverController, LoadingController, ActionSheetController } from 'ionic-angular';
import { SharedServices } from '../../../services/sharedservice';
import { CommonService } from '../../../../services/common.service';

// import { PopoverPage } from '../../popover/popover';
import { Storage } from '@ionic/storage';
// import { Type2ChoiceProperty } from './choiceproperty';


import { IonicPage } from 'ionic-angular';
@IonicPage()
@Component({
  selector: 'renewalmembershipreport-page',
  templateUrl: 'renewalmembershipreport.html'
})

export class RenewalMembershipReportPage {
  TotalSetup: any[];
  theNoOfDaysRemaining: number;
  showMembershipRenewalModal: boolean;
  renewalArr = [];
  loading: any;
  activeMembeships: any[];
  ParentClubKey: any;
  themeType: number;
  Venues: any[];
  ClubKey: any;

  constructor(public toastCtrl: ToastController, public commonService: CommonService, public loadingCtrl: LoadingController, storage: Storage, public fb: FirebaseService, public navCtrl: NavController, public sharedservice: SharedServices, public popoverCtrl: PopoverController, public navParams: NavParams, public actionSheetCtrl: ActionSheetController) {
    this.loading = this.loadingCtrl.create({
      content: 'Please wait...'
    });
    this.themeType = sharedservice.getThemeType();

    storage.get('userObj').then((val) => {
      val = JSON.parse(val);
      if (val.$key != "") {
        this.ParentClubKey = val.UserInfo[0].ParentClubKey;
       

        this.getShowMembership()
        this.getAllVenue(this.ParentClubKey)

      }
      //this.loading.dismiss().catch(() => { });
    })
  }

  getShowMembership() {

    let key
    this.TotalSetup = []
    this.fb.getAll("Membership/MembershipAssigned/" + this.ParentClubKey).subscribe((data) => {
      if (data.length > 0 || data != undefined) {

        data.forEach(eachConfig => {
          let clubkey = eachConfig.$key
          this.commonService.convertFbObjectToArray(eachConfig).forEach(config => {

            let configuration = this.commonService.convertFbObjectToArray1(config)
            console.log("1234", configuration)
            for (let i = 0; i < configuration.length; i++) {
              key = Object.keys(config)
            }
            for (let i = 0; i < configuration.length - 1; i++) {
              if (configuration[i].IsActive == true) {
                //  configuration[i]["Validity"] = moment(configuration[i].Validity).format("DD MMM YYYY")
                configuration[i]['MemberKey'] = configuration[configuration.length - 1]
                configuration[i]['Key'] = key[i];
                configuration[i]['ClubKey'] = clubkey

                this.TotalSetup.push(configuration[i])
              }
            }
          })

        })
      }

    })

  }
  async getAllVenue(ParentClubKey) {
    this.Venues = [];

    await this.fb.getAllWithQuery("Club/Type2/" + ParentClubKey + "/", { orderByChild: "IsActive", equalTo: true }).subscribe((data) => {
      for (let i = data.length - 1; i >= 0; i--) {
        if (data[i].IsActive == true) {
          this.Venues.push(data[i]);
          this.selectVenue(data[0].$key)
        }
      }
     
    });
  }
  selectVenue(event) {
    let selectedClubKey = event;
    this.Venues.forEach(club => {
      if (club.$key == event) {

        club.IsSelect = !club.IsSelect
      } else {
        club.IsSelect = false
      }


    });
    this.setupListing(selectedClubKey)
  }


  setupListing(clubkey) {

    this.fb.getAllWithQuery("Membership/MembershipSetup/" + this.ParentClubKey, { orderByKey: true, equalTo: clubkey }).subscribe((data) => {
      if (data != undefined || data.length > 0) {
        data.forEach(selectedVenue => {
          if (selectedVenue.Setup) {
            this.activeMembeships = []
            this.renewalArr = []
            this.commonService.convertFbObjectToArray(selectedVenue.Setup)
              .forEach(eachSetup => {
                this.renewalArr = []
                if (eachSetup.IsActive) {
                  eachSetup["ClubKey"] = selectedVenue.ClubKey;
                  eachSetup["SetupKey"] = eachSetup.Key;
                  eachSetup["SetupIsSelect"] = false;


                  eachSetup.TimePayments = []
                  this.commonService.convertFbObjectToArray(eachSetup.PaymentOptions)
                    .forEach(eachPayment => {
                      if (eachPayment.IsActive && eachPayment.Price != 0) {
                        eachSetup.TimePayments.push({ Label: eachPayment.Key, Value: eachPayment.Price, IsSelect: false, absDiscount: eachPayment.DiscountAbsolute, percentDiscount: eachPayment.DiscountPercentage })
                      }
                    });
                  if (selectedVenue.MembershipRenewal) {
                    eachSetup["MembershipRenewal"] = this.commonService.convertFbObjectToArray(selectedVenue.MembershipRenewal)
                    this.getRenewalInfo(eachSetup)
                  }

                  // console.log(eachSetup)
                  //this.SetupDisplay.push(eachSetup)
                }
              });
          }
        });
      } else {
        this.renewalArr = []
        console.log("errror")
      }
    });
  }

  getRenewalInfo(eachSetup) {
    console.log(this.TotalSetup)
    this.TotalSetup.forEach(config => {
      if (eachSetup.SetupKey == config.SetupKey) {
        config['Name'] = eachSetup.Name
      }

      let dt1 = new Date()
      let dt2 = new Date(config.Validity)
      this.theNoOfDaysRemaining = Math.floor((Date.UTC(dt2.getFullYear(), dt2.getMonth(), dt2.getDate()) - Date.UTC(dt1.getFullYear(), dt1.getMonth(), dt1.getDate())) / (1000 * 60 * 60 * 24));
      console.log(this.theNoOfDaysRemaining)
      config['NoOfDaysLeft'] = this.theNoOfDaysRemaining
      if (eachSetup.MembershipRenewal.length != 0) {
        if (0 < this.theNoOfDaysRemaining && this.theNoOfDaysRemaining <= eachSetup.MembershipRenewal[0].NoOfDays && (config.IsRenewed != "RenewedPaid")) {
          this.showMembershipRenewalModal = true
          this.renewalArr.push(config)
        }
      }

      //     if(this.theNoOfDaysRemaining == 0){
      //       this.fb.update(config.Key, "Membership/MembershipAssigned/" + this.AllMember[0].ParentClubKey + "/" + this.AllMember[0].ClubKey + "/" + config.MemberKey, { IsActive: false });
      //     }
      //   }

      // })
    });
    console.log(this.renewalArr)
    //1584124200000 db ka
    //1567382400000
  }

  goToSendEmailpage() {
    let ClubName = this.Venues.filter(club => {
      return club.IsSelect
    })[0].ClubName
    this.navCtrl.push("RenewalMembershipPrintPage", {renewalArr: this.renewalArr, ClubName:ClubName});
  }
  getAge(info) {
    if (info != undefined && info != '') {
      let year = info.split("-")[0];
      let currentYear = new Date().getFullYear();
      return (Number(currentYear) - Number(year)) + ' years';
    } else {
      return 'N.A'
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
}




