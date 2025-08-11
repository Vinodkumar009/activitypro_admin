import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController } from 'ionic-angular';
import { FirebaseService } from '../../../../services/firebase.service';
import { SharedServices } from '../../../services/sharedservice';
import { CommonService, ToastMessageType, ToastPlacement } from '../../../../services/common.service';
import { VenueUser } from '../model/member';
import gql from "graphql-tag";
import { catchError, map } from 'rxjs/operators';
import { of } from 'rxjs/observable/of';
import { GraphqlService } from '../../../../services/graphql.service';
import { Subscription } from 'rxjs';

/**
 * Generated class for the UpdateprofilePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-updateprofile',
  templateUrl: 'updateprofile.html',
})
export class UpdateprofilePage implements OnInit {
  private updateSubscription: Subscription;
  memberObj:VenueUser;
  existing_email:string = "";
  preparedAllClubMemberArr = [];
  selectedParentClubKey = "";
  nestUrl:string;
  membertype:string;
  ngOnInit(): void {
    this.memberObj = this.navParams.get('memberInfo');
    this.existing_email = this.memberObj.email;
    this.membertype = "Member";
    // if(this.memberObj.SignedUpType == '2'){
    //   this.membertype = "SchoolMember";
    // }else if(this.memberObj.SignedUpType == '3'){
    //   this.membertype = "HolidayCampMember";
    // } else{
    //   this.membertype = "Member";
    // }
  }

  constructor(public toastCtrl:ToastController,
    public fb: FirebaseService,
    public commonService: CommonService,
    public sharedService: SharedServices,
    public navCtrl: NavController, 
    public navParams: NavParams,
    private graphqlService:GraphqlService,
    ) {
      this.nestUrl = this.sharedService.getnestURL();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad UpdateprofilePage');
  }
  async updateMember(){
    if(await this.validBasic()){
    this.commonService.showLoader("Please wait");
      //const updatedMemberObj = JSON.parse(JSON.stringify(this.memberObj));
        const updatedMemberObj = new UserUpdateDTO(this.memberObj);
        
          const userQuery = gql`
          mutation updateUserProfile($profile_input:UserProfileInput!) {
            updateUserProfile(userProfile:$profile_input)
          }
          `;
          this.graphqlService.mutate(userQuery,{profile_input:updatedMemberObj},0)
          .subscribe(({ data }) => {
            this.commonService.hideLoader();
            this.commonService.updateCategory("user_profile");
            this.commonService.toastMessage("Profile successfully updated",2500,ToastMessageType.Success,ToastPlacement.Bottom);
            this.cancel();
          },(err) => {
            this.commonService.hideLoader();
            this.commonService.toastMessage("Profile update failed", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
          });
    }
    
  }

validateEmail(email) {
  var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
}

async validBasic():Promise<boolean> {
  if (!this.validateEmail(this.memberObj.email)) {
    let message = "Please enter valid email";
    this.commonService.toastMessage(message, 2500,ToastMessageType.Error,ToastPlacement.Bottom);
    return false;
  }
  // if (!this.checkForUnique(this.memberObj.email)) {
  //   let message = "Email id is already present.";
  //   this.commonService.toastMessage(message, 2500,ToastMessageType.Error,ToastPlacement.Bottom);
  //   return false;
  // }
  else if ((this.memberObj.parent_firstname).trim() == "" || this.memberObj.parent_firstname == undefined) {
    let message = "Please enter first name";
    this.commonService.toastMessage(message, 2500,ToastMessageType.Error,ToastPlacement.Bottom);
    return false;
  }
  else if ((this.memberObj.parent_lastname).trim() == "" || this.memberObj.parent_lastname == undefined) {
    let message = "Please enter last name";
    this.commonService.toastMessage(message, 2500,ToastMessageType.Error,ToastPlacement.Bottom);
    return false;
  }
  else if (this.memberObj.DOB == "" || this.memberObj.DOB == undefined) {
    let message = "Please enter DOB";
    this.commonService.toastMessage(message, 2500,ToastMessageType.Error,ToastPlacement.Bottom);
    return false;
  }
  else if (this.memberObj.Gender == "" || this.memberObj.Gender == undefined) {
    let message = "Please select gender";
    this.commonService.toastMessage(message, 2500,ToastMessageType.Error,ToastPlacement.Bottom);
    return false;
  }
  else if (this.memberObj.phone_number.toString().trim().length < 10 || this.memberObj.phone_number == undefined) {
    let message = "Please enter valid phone number";
    this.commonService.toastMessage(message, 2500,ToastMessageType.Error,ToastPlacement.Bottom);
    return false;
  }
  else if ((this.memberObj.medical_condition).toString().trim() == "" || this.memberObj.media_consent == undefined) {
    let message = "Please enter medical condition";
    this.commonService.toastMessage(message, 2500,ToastMessageType.Error,ToastPlacement.Bottom);
    return false;
  }else if(this.existing_email!=this.memberObj.email){
    const isAlreadyExists = await this.checkForUnique(this.memberObj.email).toPromise();
    if (isAlreadyExists) {
      let message = "Email id is already present";
      this.commonService.toastMessage(message, 2500, ToastMessageType.Error);
      return false;
    }else{
      return true;
    }       
  }else{
    return true;
  } 
}
  checkForUnique(email:string){
      const userQuery = gql`
      query checkUserEmailExistance($email_id:String!,$parentclub_id:String!) {
          checkUserEmailExistance(email:$email_id,parentClubId:$parentclub_id)
        }
      `;
      return this.graphqlService
      .query( userQuery,{ email_id: email, parentclub_id: this.sharedService.getParentclubKey() },1)
      .pipe(
        map(({ data }) => {
          return data["checkUserEmailExistance"];
        }),
        catchError(() => {
          return of(true); // Assuming you want to return `true` on error
        })
      ); 
  }
  getAllMembers() {
    // if (this.selectedParentClubKey == "-Kd2fSCGOw6K3mvzu-yH" || this.selectedParentClubKey == "-KhXUETCkqohXhvssWQl") {
    //   let subscribeObj = this.fb.getAllWithQuery("User/Member/", { orderByKey: true }).subscribe((data) => {
    //     this.preparedAllClubMemberArr = data;
    //     subscribeObj.unsubscribe();
    //   });
    // } else {
    //   let subscribeObj = this.fb.getAllWithQuery("User/Member/" + this.selectedParentClubKey, { orderByKey: true }).subscribe((data) => {
    //     this.preparedAllClubMemberArr = data;
    //     subscribeObj.unsubscribe();
    //   });
    // }
  }
  
  cancel(){
      this.navCtrl.getPrevious().data.memberdetails = this.memberObj;
      this.commonService.updateCategory("user_profile");
      this.navCtrl.pop();
  }

  ionViewWillLeave() {
    if (this.updateSubscription) {
      this.updateSubscription.unsubscribe();
    }
  }

}



export class UserUpdateDTO{
  id:string;
  Email:string;
  FirstName:string;
  LastName:string;
  IsEnable:boolean;
  DOB:string;
  Gender:string;
  MedicalCondition:string;
  PhoneNo:string;
  VehicleRegNo1:string;
  VehicleRegNo2:string;
  MembershipID:string;
  Handicap:Number;
  MediaConsent:boolean;
  SpecialNeeds:boolean;
  ChildSchoolMeals: boolean;
  ChildSchool: string;
  IncludeInLeaderBoard: boolean;
  EmergencyNumber: string;
  MemberType: number;
  constructor(user:VenueUser){
    this.id = user.Id;
    this.FirstName = user.parent_firstname;
    this.LastName = user.parent_lastname;
    this.Email = user.email;
    this.Gender = user.Gender;
    this.PhoneNo = user.phone_number;
    this.MedicalCondition = user.medical_condition;
    this.DOB = user.DOB;
    this.MembershipID = user.membership_Id;
    this.VehicleRegNo1 = user.vehicleRegNo1 || "";
    this.VehicleRegNo2 = user.vehicleRegNo2 || "";
    this.Handicap = user.handicap || 1;
    this.IsEnable = true;
    this.MediaConsent = user.media_consent;
    this.MemberType = 1;
  }

}