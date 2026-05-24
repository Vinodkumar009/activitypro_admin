import { Component } from '@angular/core';
import { NavController, PopoverController, LoadingController ,ToastController} from 'ionic-angular';
import { SharedServices } from '../../services/sharedservice';
// import { PopoverPage } from '../../popover/popover';
import { FirebaseService } from '../../../services/firebase.service';
import { Storage } from '@ionic/storage';
// import { Type2PackageSetupHome } from './packagesetuphome';
// import { Dashboard } from './../../dashboard/dashboard';
import {IonicPage } from 'ionic-angular';
import { CommonService } from '../../../services/common.service';
@IonicPage()
@Component({
  selector: 'packagesetuplist-page',
  templateUrl: 'packagesetuplist.html'
})

export class Type2MembershipPackageList {
  themeType: number;
  parentClubKey: string;
  schools: any;
  clubs: any;
  selectedClub: any;
  selectedLevelType: any;
  allClub = [];
  selectedActivity: any;
  activity = [];
  discount = [];
  discount1 = [];
  discountChargesTab: string = "discount";
  selectedClubKey: any;
  selectedClubname: string;
  discountList = [];
  chargeList = [];
  menus: Array<{ DisplayTitle: string; 
    OriginalTitle:string;
    MobComponent: string;
    WebComponent: string; 
    MobIcon:string;
    MobLocalImage: string;
    MobCloudImage: string; 
    WebLocalImage: string;
    WebIcon:string;
    WebCloudImage:string;
    MobileAccess:boolean;
    WebAccess:boolean;
    Role: number;
    Type: number;
    Level: number }>;
  clubDisCountArr = [];
  allMemberCategory = [];
  memberSubCategoryArray = [];
  allPackage = [];
  responseDetails: any;
  packageKey:string;
  isFlag = false;
  constructor(public commonService:CommonService,public toastCtrl: ToastController,public loadingCtrl: LoadingController, storage: Storage,
    public navCtrl: NavController, public sharedservice: SharedServices,
    public fb: FirebaseService, public popoverCtrl: PopoverController) {

    this.themeType = sharedservice.getThemeType();
    this.menus = sharedservice.getMenuList();
    storage.get('userObj').then((val) => {
      val = JSON.parse(val);
      for (let club of val.UserInfo)
        if (val.$key != "") {
          this.parentClubKey = club.ParentClubKey;
          //this.getAllMembership();
         
        }
    })
  }

  //   getSchoolLists() {
  //     this.fb.getAll("/School/Type2/" + this.parentClubKey + "/").subscribe((data) => {
  //       this.schools = data;

  //     });

  //   }

ionViewWillEnter(){
   this.getAllClub();
}
  goTo(obj) {







    console.log(obj);

    this.navCtrl.push(obj.component);
  }
  presentPopover(myEvent) {
    let popover = this.popoverCtrl.create("PopoverPage");
    popover.present({
      ev: myEvent
    });
  }
  //   goToAssignDiscount() {
  //     this.navCtrl.push(Type2AssignMembership);
  //   }

  goToDashboardMenuPage() {
    this.navCtrl.setRoot("Dashboard");
  }
  //   gotoAssignMembershipPage() {
  //     this.navCtrl.push(Type2AssignMembership);
  //   }




 

  onClubChange() {
    this.getAllMemberPackage();
  }

  getAllClub() {
    this.fb.getAllWithQuery("/Club/Type2/" + this.parentClubKey, { orderByChild: "IsEnable", equalTo: true }).subscribe((data4) => {
      if (data4.length > 0) {
        this.allClub = data4;
        console.log(this.allClub);
        if(data4.length>0){
 this.selectedClubKey = this.allClub[0].$key;
        }
       
        //this.getAllMemberPackage();
      }
    })
  }

  getAllMemberPackage() {
    this.fb.getAll("/MembershipPackage/" + this.parentClubKey + "/" + this.selectedClubKey + "/").subscribe((data) => {
      this.allPackage = [];
      if (data.length > 0) {
        this.allPackage = data;
        //console.log(this.allPackage);
        for (let i = 0; i < this.allPackage.length; i++) {
          if (this.allPackage[i].MemberCategory != undefined) {
            this.allPackage[i].MemberCategoryArr = this.commonService.convertFbObjectToArray(this.allPackage[i].MemberCategory);

            for (let j = 0; j < this.allPackage[i].MemberCategoryArr.length; j++) {
              if (this.allPackage[i].MemberCategoryArr[j].MemberSubcategory != undefined) {
                this.allPackage[i].MemberCategoryArr[j].MemberSubcategoryArr = this.commonService.convertFbObjectToArray(this.allPackage[i].MemberCategoryArr[j].MemberSubcategory);
              }
            }
          }
        }
        console.log(this.allPackage);
        if (this.selectedClubKey != undefined){
          this.packageKey = "";
          for (let k = 0; k < this.allClub.length; k++) {
            if (this.selectedClubKey == this.allClub[k].$key) {
                if(this.allClub[k].PackageKey != undefined){
                  this.packageKey = this.allClub[k].PackageKey;
                }
            }
          }
        }
        console.log(this.packageKey);
        for(let m = 0; m < this.allPackage.length; m++){
          if(this.packageKey == this.allPackage[m].$key){
            this.allPackage[m].isDefault = true;
            //break;
          }
        }

      }
    })
  }


  gotoMembershipPackage() {
    this.navCtrl.push("Type2PackageSetupHome");
  }

  showToast(m: string, howLongShow: number) {
        let toast = this.toastCtrl.create({
            message: m,
            duration: howLongShow,
            position: 'bottom'
        });
        toast.present();
    }

  makeitAsDeafault(packageDetails) {
    
    this.responseDetails = this.fb.update(this.selectedClubKey, "/Club/Type2/" + this.parentClubKey + "/", { PackageKey: packageDetails.$key });
    if (this.responseDetails != undefined) {
      let message = "Successfully set as default";
      this.showToast(message, 3000);
    }
  }

  editPackageList(){

  }

  viewPackageList(){
    
  }

}
