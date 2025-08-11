import { Component ,ViewChild} from '@angular/core';
import { NavController, PopoverController, LoadingController ,ToastController, ActionSheetController, FabContainer} from 'ionic-angular';
import { SharedServices } from '../../services/sharedservice';
// import { PopoverPage } from '../../popover/popover';
import { FirebaseService } from '../../../services/firebase.service';
import { CommonService } from '../../../services/common.service';
import { Storage } from '@ionic/storage';
import { Events } from 'ionic-angular';
import { LanguageService } from '../../../services/language.service';
// import { Type2CourtSetupHome } from './courtsetuphome';
// import { Dashboard } from './../../dashboard/dashboard';
import {IonicPage } from 'ionic-angular';
@IonicPage()
@Component({
  selector: 'courtsetuplist-page',
  templateUrl: 'courtsetuplist.html'
})

export class Type2CourtSetupList {
  LangObj:any = {};//by vinod
  isShowPaymentModal:boolean = false;
  themeType: number;
  parentClubKey: string;
  allClub = [];
  selectedClubKey: any;
  allCourtSetup = [];
  menus: Array<{ DisplayTitle: string; 
    OriginalTitle:string;
    MobComponent: string;
    WebComponent: string; 
    MobIcon:string;
    MobLocalImage: string;
    MobCloudImage: string; 
    WebIcon:string;
    WebLocalImage: string;
    WebCloudImage:string;
    MobileAccess:boolean;
    WebAccess:boolean;
    Role: number;
    Type: number;
    Level: number }>;
  allActivityArr = [];
  selectedActivity:any;
  IsTable: boolean = false;
  @ViewChild('fab')fab : FabContainer;

  constructor(public events: Events,public actionSheetCtrl: ActionSheetController,public toastCtrl: ToastController,public loadingCtrl: LoadingController, public storage: Storage,
    public navCtrl: NavController, public sharedservice: SharedServices,private langService:LanguageService,
    public fb: FirebaseService, public popoverCtrl: PopoverController,public commonService: CommonService,) {

    this.themeType = sharedservice.getThemeType();
    this.menus = sharedservice.getMenuList();
    
    storage.get('userObj').then((val) => {
      val = JSON.parse(val);
      for (let club of val.UserInfo)
        if (val.$key != "") {
          this.parentClubKey = club.ParentClubKey;
          this.getAllClub();
        }
    })
  }
 
  ionViewDidLoad() {
    
    this.getLanguage();
    this.events.subscribe('language', (res) => {
      this.getLanguage();
    });
  }

  getLanguage(){
    this.storage.get("language").then((res)=>{
      console.log(res["data"]);
     this.LangObj = res.data;
     this.fab.close();
    })
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
  //   gotoAssignMembershipPage() {
  //     this.navCtrl.push(Type2AssignMembership);
  //   }




  onClubChange() {
    this.getAllActivity();
    //this.getAllCourtSetup();
  }

  getAllActivity() {
        this.fb.getAll("/Activity/" + this.parentClubKey + "/" + this.selectedClubKey + "/").subscribe((data) => {
            this.allActivityArr = [];
            if (data.length > 0) {
                this.allActivityArr = data;
                this.selectedActivity = data[0].$key;
                if(this.selectedActivity == '-MCMaUe_FtFh1RZuIqtG'){
                  this.IsTable = true
                }
                this.getAllCourtSetup();
            }
        })
    }

  getAllClub() {
    this.fb.getAllWithQuery("/Club/Type2/" + this.parentClubKey, { orderByChild: "IsEnable", equalTo: true }).subscribe((data4) => {
      if (data4.length > 0) {
        this.allClub = data4;
        this.selectedClubKey = this.allClub[0].$key;
        this.checkPaymentSetup();
        this.getAllActivity();
      }
    })
  }

  //payment activity details
checkPaymentSetup() {
  this.fb.getAll(`Activity/${this.parentClubKey}`).subscribe((res) => {
    console.log(res);
    let showmodal:boolean = true;
    for (let i = 0; i < this.allClub.length; i++) {
      for (let j = 0; j < res.length; j++) {
        if (this.allClub[i].$key === res[j].$key) {
          for (let key in res[j]) {
            if (key != "$key") {
                res[j][key].PaymentSetup = this.commonService.convertFbObjectToArray(res[j][key].PaymentSetup);
                console.log(res[j][key].PaymentSetup);
                for (let l = 0; l < res[j][key].PaymentSetup.length; l++) {
                  if (res[j][key].PaymentSetup[l].IsActive) {
                    console.log(res[j][key].PaymentSetup[l].SetupType);
                      if ((res[j][key].PaymentSetup[l].PaymentGatewayName == "StripeConnect") && (res[j][key].PaymentSetup[l].SetupType == "Court Booking")) {
                          // console.log("matched");
                          // console.log(`${res[j][key].PaymentSetup[l].IsActive}:${res[j][key].PaymentSetup[l].PaymentGatewayName}:${res[j][key].PaymentSetup[l].SetupType}`);
                          showmodal = false;
                          this.isShowPaymentModal = false;
                      }
                  }
                }
            }
          }
        }
      }
    }
    this.isShowPaymentModal = showmodal;
    
  }, (err) => {
    console.log(err);
  })
}

//custom component for payment setup redirect
GotoPaymentSetup() {
  this.isShowPaymentModal = false;
  //let setup = { SetupName: 'Court Booking', DisplayName:'Court Booking', ImageUrl: "assets/images/tennis-court.svg" }
  this.navCtrl.push("StripeConnectPage");
}

skip() {
  this.isShowPaymentModal = false;
}


  gotoCourtSetupPage(fab: FabContainer) {
    fab.close();
    this.isShowPaymentModal = false;
    this.navCtrl.push("Type2CourtSetupHome");
  }
  gotoBooking(fab: FabContainer) {
    fab.close();
    this.isShowPaymentModal = false;
    this.navCtrl.push("BookingsetupPage");
  }
  gotoPriceBand(fab: FabContainer) {
    fab.close();
    this.isShowPaymentModal = false;
    this.navCtrl.push("PricebandPage");
  }

  showToast(m: string, howLongShow: number) {
        let toast = this.toastCtrl.create({
            message: m,
            duration: howLongShow,
            position: 'bottom'   
        });
        toast.present();
    }

  getAllCourtSetup(){
    if(this.selectedActivity == '-MCMaUe_FtFh1RZuIqtG'){
      this.IsTable = true
    }
    this.fb.getAll("/Court/" + this.parentClubKey + "/" + this.selectedClubKey + "/" + this.selectedActivity +"/").subscribe((data) => {
      this.allCourtSetup = [];
      if (data.length > 0) {
        this.allCourtSetup = data;
        this.allCourtSetup = this.allCourtSetup.filter(priceband=>{
          return (priceband.IsActive)
        })
      }
    });
  }

 editCourt(){
   
 }

 presentActionSheet(Details) {
  let actionSheet = this.actionSheetCtrl.create({
    title: 'Modify Setup',
    buttons: [
      {
        text: 'Edit',
        handler: () => {
          console.log('Archive clicked');
        //  this.navCtrl.push('EditpricebandPage',{pricebandDetails:pricebandDetails})
          this.navCtrl.push('Type2CourtSetupHome',{Details:Details})
        }
      },
      {
        text: 'Close',
        role: 'cancel',
        handler: () => {
          console.log('Cancel clicked');
        }
      }
    ]       
  });

  actionSheet.present();
}

}
