import { Component } from '@angular/core';
import { NavController, PopoverController, LoadingController } from 'ionic-angular';
import { SharedServices } from '../../services/sharedservice';
// import { PopoverPage } from '../../popover/popover';
import { FirebaseService } from '../../../services/firebase.service';
import { Storage } from '@ionic/storage';
// import { Type2AssignMembership } from './assignmembership';
// import { Dashboard } from './../../dashboard/dashboard';
// import { Type2AssignMembershipSubCategory } from './assignmembershipsubcategory';
import {IonicPage } from 'ionic-angular';
import { CommonService } from '../../../services/common.service';
@IonicPage()
@Component({
  selector: 'membershiplist-page',
  templateUrl: 'membershiplist.html'
})

export class Type2MembershipList {
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
    WebIcon:string; 
    WebLocalImage: string;
    WebCloudImage:string;
    MobileAccess:boolean;
    WebAccess:boolean;
    Role: number;
    Type: number;
    Level: number }>;
  clubDisCountArr = [];
  allMemberCategory = [];
  memberSubCategoryArray = [];
  constructor(public commonService:CommonService,public loadingCtrl: LoadingController, storage: Storage,
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
          this.getAllClub();
        }
    })
  }

  //   getSchoolLists() {
  //     this.fb.getAll("/School/Type2/" + this.parentClubKey + "/").subscribe((data) => {
  //       this.schools = data;

  //     });

  //   }

  goTo(obj) {
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
  gotoAssignMembershipPage() {
    this.navCtrl.push("Type2AssignMembership");
  }

  onClubChange() {
    this.getAllMembership();
  }

  getAllClub() {
    this.fb.getAllWithQuery("/Club/Type2/" + this.parentClubKey, { orderByChild: "IsEnable", equalTo: true }).subscribe((data4) => {
      if (data4.length > 0) {
        this.allClub = data4;
        this.selectedClubKey = this.allClub[0].$key;
        //this.getClubDiscount()
        this.getAllMembership();

      }
      //console.clear();
      //console.log(this.allClub);



    })
  }

  getAllMembership() {
    this.fb.getAll("/MemberCategory/" + this.parentClubKey + "/" + this.selectedClubKey + "/").subscribe((data) => {
      this.allMemberCategory = [];
      if (data.length > 0) {

        this.allMemberCategory = data;
        console.log(this.allMemberCategory);

        this.memberSubCategoryArray = [];
        data.forEach(element => {

          let arr = [];

          if (element.MembershipSubCategory != undefined) {
            arr = (this.commonService.convertFbObjectToArray(element.MembershipSubCategory));
            this.memberSubCategoryArray.push(arr);
          }
          else {
            this.memberSubCategoryArray.push([]);
          }


        });
        //console.clear();
        console.log(this.memberSubCategoryArray);
      }


    });
  }


  addMemberSubCategory(memberDetails) {
    this.navCtrl.push("Type2AssignMembershipSubCategory", { memberDetails: memberDetails, selectedClubKey: this.selectedClubKey });
  }

}
