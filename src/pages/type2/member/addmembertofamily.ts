import { Component } from '@angular/core';
import { NavController, PopoverController, NavParams } from 'ionic-angular';
import { SharedServices } from '../../services/sharedservice';
import { Storage } from '@ionic/storage';
import { FirebaseService } from '../../../services/firebase.service';
import { IonicPage } from 'ionic-angular';
import { CommonService, ToastMessageType, ToastPlacement } from '../../../services/common.service';
import { AddMemberDTO, VenueUser } from './model/member';
import gql from 'graphql-tag';
import { GraphqlService } from '../../../services/graphql.service';
@IonicPage()
@Component({
  selector: 'addmembertofamily-page',
  templateUrl: 'addmembertofamily.html'
})

export class Type2AddFamilyMember {
  divNo: number = 1;
  familyObj: AddMemberDTO = new AddMemberDTO();
  memberObj: VenueUser;
  memberKey: any;
  familyKey: any;
  divType: string;

  themeType: number;
  parentmemberObj: any;
  selectedParentClubKey: string;
  selectedClubKey: string;
  familymemberKey: any;
  membershipType: any;
  membershipSubCategoryKey: any;
  userresponseDetails: any;
  memberFeeKey: any;

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
  membershipSubCategoryObj = {
    BaseFees: 0,
    MembershipSubCategoryCode: "",
    MembershipSubCategoryName: "",
  }
  preparedAllClubMemberArr = [];
  allMemberArr = [];
  allMemberArrofClub = [];
  enitityName = "";

  constructor(public commonService: CommonService,
     storage: Storage, public navCtrl: NavController, 
     public navParams: NavParams, public sharedservice: SharedServices, 
     public popoverCtrl: PopoverController, public fb: FirebaseService,
     private graphqlService: GraphqlService,) {

    this.themeType = sharedservice.getThemeType();
    
    this.memberObj = navParams.get('MemberDetails');
    this.divType = navParams.get('divType');

    
    if (this.memberObj.SignedUpType == undefined) {
      if (this.memberObj.clubkey == "") {
        this.memberObj.SignUpUnder = 3;
      } else {
        this.memberObj.SignUpUnder = 1;
      }
    }
    if (this.memberObj.SignedUpType == undefined) {
      if (this.memberObj.clubkey == "") {
        this.memberObj.SignedUpType = 3;
      }
      else {
        this.memberObj.SignedUpType = 1;
      }
    }
    //endshere



    this.familyObj.IsChild = true;
    this.familyObj.Email = this.memberObj.email;
    this.familyObj.Phone = this.memberObj.phone_number;
    this.familyObj.IsAcceptedTermsAndConditions = true;
    this.familyObj.IsTakenConcentForm = true;
    this.familyObj.NotificationEmailAllowed = true;
    this.familyObj.PromoEmailAllowed = true;
    this.familyObj.Password = "";
    this.familyObj.IsEnable = this.memberObj.is_enable;
    this.familyObj.VenueId = this.memberObj.clubkey;
    //this.familyObj.MemberType = 1;
    this.familyObj.SignedUpType = this.memberObj.SignedUpType;
    this.familyObj.ParentClubId = this.sharedservice.getParentclubKey();
    this.familyObj.parent_id = this.memberObj.parentFirebaseKey;

    //
    //ends here
    //

    switch (this.divType) {
      case 'Member':
        this.enitityName = "Member";
        this.familyObj.MemberType = 1;
        break;
      case 'Schoolmember':
        this.enitityName = "SchoolMember";
        this.familyObj.MemberType = 2;
        break;
      case 'Holidaycampmember':
        this.enitityName = "HolidayCampMember";
        this.familyObj.MemberType = 3;//this.memberObj.IsHolidayCampMember;
        break;
    }


    storage.get('userObj').then((val) => {
      val = JSON.parse(val);

      for (let user of val.UserInfo) {
        this.selectedParentClubKey = user.ParentClubKey;
        if (val.$key != "") {
          if (val.UserType == "2") {
          }
        }
      }
    }).catch(error => {

    });
  }


  presentPopover(myEvent) {
    let popover = this.popoverCtrl.create("PopoverPage");
    popover.present({
      ev: myEvent
    });
  }

  cancel() {
    //this.navCtrl.pop();
    this.divNo = 1;
  }

  validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  }

  

  checkForUnique(memberEmailId) {
    let isPresent = false;
    for (let i = 0; i < this.preparedAllClubMemberArr.length; i++) {
      if (memberEmailId == this.preparedAllClubMemberArr[i].EmailID) {
        isPresent = true;
        break;
      }
    }
    if (isPresent) {
      return false;
    }
    else {
      return true;
    }
  }


  



  goToDashboardMenuPage() {
    this.navCtrl.setRoot("Dashboard");
  }

  //................



  next() {
    if (this.validBasic()) {
      this.divNo = 2;
    }
  }

  validBasic(): boolean {
    if (this.familyObj.FirstName == "" || this.familyObj.FirstName == undefined) {
      let message = "Please Enter First Name";
      this.commonService.toastMessage(message, 2500,ToastMessageType.Error,ToastPlacement.Bottom);
      return false;
    }
    else if (this.familyObj.LastName == "" || this.familyObj.LastName == undefined) {
      let message = "Please Enter Last Name";
      this.commonService.toastMessage(message, 2500,ToastMessageType.Error,ToastPlacement.Bottom);
      return false;
    }
    else if (this.familyObj.DOB == "" || this.familyObj.DOB == undefined) {
      let message = "Please Enter DOB";
      this.commonService.toastMessage(message, 2500,ToastMessageType.Error,ToastPlacement.Bottom);
      return false;
    }
    else if (this.familyObj.Gender == "" || this.familyObj.Gender == undefined) {
      let message = "Please select gender";
      this.commonService.toastMessage(message, 2500,ToastMessageType.Error,ToastPlacement.Bottom);
      return false;
    } else if (this.familyObj.Medical_Condition == "" || this.familyObj.Medical_Condition == undefined) {
      let message = "please provide valid medical condition";
      this.commonService.toastMessage(message, 2500,ToastMessageType.Error,ToastPlacement.Bottom);
      return false;
    }
    else {
      return true;
    }
  }
  async showConfirm() {
    // this.familyObj.CreateDate = new Date().getTime().toString();
    // this.familyObj.UpdatedDate = new Date().getTime().toString()
    let undefinedProps = this.commonService.findUndefinedProp(this.familyObj);
    if (undefinedProps!= "") {
      let undefinedPropsArray = undefinedProps.split(",");
      undefinedPropsArray.forEach(element => {
        this.familyObj[element] = "";
      });
    }

    if (this.validBasic()) {
      this.commonService.showLoader("Please wait");
      const userQuery = gql`
      mutation registerVenueUser($register_input:MemberAppAuthRegister!) {
        registerVenueUser(userDetails:$register_input){
          Id
          PostGresId
        }
      }
      `;
    this.graphqlService.mutate(userQuery,{register_input:this.familyObj},0)
      .subscribe(({ data }) => {
        this.commonService.hideLoader();
        this.commonService.toastMessage("Family member added successfully", 2500, ToastMessageType.Success, ToastPlacement.Bottom);
        this.commonService.updateCategory("user_profile")
        this.navCtrl.remove(this.navCtrl.getActive().index - 1, 2);
      }, (err) => {
        this.commonService.hideLoader();
        this.commonService.toastMessage("Familymember add failed", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
      });
    }
  }
}

