import { Component } from '@angular/core';
import { NavController, PopoverController, NavParams } from 'ionic-angular';
import { SharedServices } from '../../services/sharedservice';
// import { PopoverPage } from '../../popover/popover';
import { Storage } from '@ionic/storage';
import { FirebaseService } from '../../../services/firebase.service';
// import { Dashboard } from './../../dashboard/dashboard';

import {IonicPage } from 'ionic-angular';
import { CommonService } from '../../../services/common.service';
@IonicPage()
@Component({
  selector: 'continueaddmember-page',
  templateUrl: 'continueaddmember.html'
})

export class Type2ContinueAddMember {
  themeType: number;
  selectedParentClubKey: any;
  mySlideOptions = {
    initialSlide: 0,
    loop: true,
    pager: true
  };

  sub = {
    initialSlide: 0,
    loop: true,
    pager: true
  };
  gameType = {
    initialSlide: 0,
    loop: true,
    pager: true
  };
  selectedClubKey: string;
  clubs: any;
  memberObj1: any;
  membershipType: any;
  //selectedMembershipType: any;
  //selectedActivityType:any;
  membershipSubCategoryData: any;
  memberKey: any;
  memberFeeKey: any;
  userresponseDetails: any;
  userresponseDetailsKey: any;
  Activities: any;
  memberObj = {
    Source: '',
    FirstName: '',
    MiddleName: '',
    LastName: '',
    DOB: '',
    Gender: '',
    PhoneNumber: '',
    EmailID: '',
    EmergencyNumber: '',
    EmergencyContactName: '',
    MedicalCondition: '',
    IsChild: false,
    ClubKey: '',
    ParentClubKey: '',
    Password: '',
    PromoEmailAllowed: true,
    NotificationEmailAllowed: true,
    IsActive: true,
    IsEnable: true,
    IsTakenConcentForm: true
  };
  userObj = {
    EmailID: "",
    Name: "",
    Password: "",
    RoleType: "",
    Type: "",
    UserType: ""
  };
  userInfoObj = {
    ParentClubKey: "",
    ClubKey: "",
    MemberKey: ""
  }

  memberFeesObj = {
    TotalFeesAmount: 0,
    TotalFeesAmountPayble: 0,
    AmountPaid: 0,
    IsActive: true,
    FeeComments: "",
    IsPaid: false
  }
  membershipTypeObj = {
    MemebershipTypeCode: "",
    MemebershipTypeName: "",
    BaseFees: 0
  }
  selectedMembershipType = {
    $key: "",
    MemebershipTypeCode: "",
    MemebershipTypeName: "",
    BaseFees: 0
  }
  membershipSubCategoryObj = {
    BaseFees: 0,
    MembershipSubCategoryCode: "",
    MembershipSubCategoryName: "",
  }
  selectedmembershipSubCategory = {
    Key: "",
    BaseFees: 0,
    MembershipSubCategoryCode: "",
    MembershipSubCategoryName: "",
  }
  selectedActivityType = {
    $key: "",
    AliasName: "",
    ActivityName: "",
    BaseFees: 0
  }
  constructor(public commonService:CommonService,storage: Storage, public navCtrl: NavController, public navParams: NavParams, public sharedservice: SharedServices, public fb: FirebaseService, public popoverCtrl: PopoverController) {
    this.themeType = sharedservice.getThemeType();
    this.memberObj1 = navParams.get('memberObjDFetails');
    this.selectedClubKey = navParams.get('clubKey');
    this.memberObj = navParams.get('memberObjDFetails');

    storage.get('userObj').then((value) => {
      let val = JSON.parse(value);

      for (let user of val.UserInfo) {
        this.selectedParentClubKey = user.ParentClubKey;
        //this.selectedClubKey = navParams.get('clubKey');
        this.getActivities();
        if (val.$key != "") {
          this.fb.getAll("/MembershipType/" + this.selectedParentClubKey + "/" + this.selectedClubKey).subscribe((data) => {
            this.membershipType = data;

            if (data.length > 0) {
              this.selectedMembershipType = data[0];

              this.prepareSubcategoryOfMembershipType(this.selectedMembershipType);
              this.prepareAmountStructure();
            }
          });
        }
      }
    }).catch(error => {
      // alert("Errr occured");

    });



  }
  onSelectMembershipType(event, item) {
 

  }
  // selectedmembershipSubCategory :any;
  prepareSubcategoryOfMembershipType(membershipTypeData) {
    //if(membershipTypeData.length>0){
    //for (let membershipSubCategory of membershipTypeData) {
    let arr = this.commonService.convertFbObjectToArray(membershipTypeData.MembershipSubCategory);
    this.membershipSubCategoryData = arr;
    this.selectedmembershipSubCategory = arr[0];
    // this.membershipSubCategoryKey = arr[0].Key;
    // this.membershipSubCategoryObj.MembershipSubCategoryName = arr[0].MembershipSubCategoryName;
    // this.membershipSubCategoryObj.MembershipSubCategoryCode = arr[0].MembershipSubCategoryCode;
    // this.membershipSubCategoryObj.BaseFees = arr[0].BaseFees;
    //   }
    //}
  }

  presentPopover(myEvent) {
    let popover = this.popoverCtrl.create("PopoverPage");
    popover.present({
      ev: myEvent
    });
  }
  onselectionMembershipType(item) {
    this.prepareSubcategoryOfMembershipType(item);
  }
  onselectionMembershipSubCategory(item) {
    this.selectedmembershipSubCategory = item;
  }
  onselectionActivitiy(item) {
    this.selectedActivityType = item;
  }
  getActivities() {
    this.fb.getAll("/Activity/" + this.selectedParentClubKey + "/" + this.selectedClubKey).subscribe((data) => {


      if (data.length > 0) {
        this.Activities = data;
        this.selectedActivityType = data[0];

        //this.prepareSubcategoryOfMembershipType(this.selectedMembershipType);
      }
    });
  }

  prepareAmountStructure() {
    // this.selectedMembershipType
  }
  createCoach() {
    this.memberObj.ClubKey = this.selectedClubKey;
    this.memberObj.ParentClubKey = this.selectedParentClubKey;
    this.memberObj.Password = "tttttt";
    this.memberKey = this.fb.saveReturningKey("/Member/" + this.selectedParentClubKey + "/" + this.selectedClubKey, this.memberObj);
    if (this.memberKey != undefined) {
      this.userObj.EmailID = this.memberObj.EmailID;
      this.userObj.Name = this.memberObj.FirstName + this.memberObj.MiddleName + this.memberObj.LastName;
      this.userObj.Password = this.memberObj.Password;
      this.userObj.RoleType = "5";
      this.userObj.Type = "2";
      this.userObj.UserType = "2";
      //this.userresponseDetails= "dsagdsg";
      this.userresponseDetails = this.fb.saveReturningKey("/User/Member/", this.userObj);

      if (this.userresponseDetails != undefined) {
        this.userInfoObj.ParentClubKey = this.selectedParentClubKey;
        this.userInfoObj.ClubKey = this.selectedClubKey;
        this.userInfoObj.MemberKey = this.memberKey;

        this.fb.saveReturningKey("/User/Member/" + this.userresponseDetails + "/UserInfo/", this.userInfoObj);
        this.membershipTypeObj.MemebershipTypeName = this.selectedMembershipType.MemebershipTypeName;
        this.membershipTypeObj.MemebershipTypeCode = this.selectedMembershipType.MemebershipTypeCode;
        this.membershipTypeObj.BaseFees = this.selectedMembershipType.BaseFees;



        this.membershipSubCategoryObj.MembershipSubCategoryName = this.selectedmembershipSubCategory.MembershipSubCategoryName;
        this.membershipSubCategoryObj.MembershipSubCategoryCode = this.selectedmembershipSubCategory.MembershipSubCategoryCode;
        this.membershipSubCategoryObj.BaseFees = this.selectedmembershipSubCategory.BaseFees;


        this.userresponseDetails = this.fb.update(this.selectedMembershipType.$key, "/Member/" + this.selectedParentClubKey + "/" + this.selectedClubKey + "/" + this.memberKey + "/MembershipType/", this.membershipTypeObj);

        this.userresponseDetails = this.fb.update(this.selectedmembershipSubCategory.Key, "/Member/" + this.selectedParentClubKey + "/" + this.selectedClubKey + "/" + this.memberKey + "/MembershipType/" + this.membershipType[0].$key + "/MembershipSubCategory/", this.membershipSubCategoryObj);


        this.memberFeesObj.TotalFeesAmount = this.selectedMembershipType.BaseFees + this.selectedmembershipSubCategory.BaseFees + this.selectedActivityType.BaseFees;
        this.memberFeesObj.TotalFeesAmountPayble = this.selectedMembershipType.BaseFees + this.selectedmembershipSubCategory.BaseFees + this.selectedActivityType.BaseFees;
        this.memberFeesObj.AmountPaid = 0;
        this.memberFeesObj.IsActive = true;
        this.memberFeesObj.IsPaid = false;
        this.memberFeesObj.FeeComments = "Not Paid";


        this.memberFeeKey = this.fb.saveReturningKey("/MemberFee/MemberRegistration/", this.memberFeesObj);

        this.userresponseDetails = this.fb.update(this.memberKey, "/MemberFee/MemberRegistration/" + this.memberFeeKey + "/Member/", { MemberKey: this.memberKey });

        this.userresponseDetails = this.fb.update(this.selectedMembershipType.$key, "/MemberFee/MemberRegistration/" + this.memberFeeKey + "/Member/" + this.memberKey + "/MembershipType/", this.membershipTypeObj);

        this.userresponseDetailsKey = this.fb.update(this.selectedmembershipSubCategory.Key, "/MemberFee/MemberRegistration/" + this.memberFeeKey + "/Member/" + this.memberKey + "/MembershipType/" + this.selectedMembershipType.$key + "/MembershipSubCategory/", this.membershipSubCategoryObj);

        this.userresponseDetails = this.fb.update(this.memberFeeKey, "/Member/" + this.selectedParentClubKey + "/" + this.selectedClubKey + "/" + this.memberKey + "/MemberFee/", { MemberFeeKey: this.memberFeeKey });
        this.userresponseDetails = this.fb.update(this.selectedActivityType.$key, "/Member/" + this.selectedParentClubKey + "/" + this.selectedClubKey + "/" + this.memberKey + "/Activity/", { key: this.selectedActivityType.$key, AliasName: this.selectedActivityType.AliasName, ActivityName: this.selectedActivityType.ActivityName, BaseFees: this.selectedActivityType.BaseFees });


        this.userresponseDetails = this.fb.update(this.memberKey, "/Activity/" + this.selectedParentClubKey + "/" + this.selectedClubKey +"/"+this.selectedActivityType.$key + "/Member/", this.membershipTypeObj);
      }
    }


  }

  goToDashboardMenuPage() {
        this.navCtrl.setRoot("Dashboard");
    }
}
