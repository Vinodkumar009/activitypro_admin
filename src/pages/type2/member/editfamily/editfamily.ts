import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController, AlertController } from 'ionic-angular';
import { FirebaseService } from '../../../../services/firebase.service';
import { CommonService,ToastMessageType,ToastPlacement,} from "../../../../services/common.service";
import { SharedServices } from '../../../services/sharedservice';
import { FamilyMember, VenueUser } from '../model/member';
//import { HttpService } from '../../../../services/http.service';
import { GraphqlService } from '../../../../services/graphql.service';
import gql from "graphql-tag";
/**
 * Generated class for the EditfamilyPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-editfamily',
  templateUrl: 'editfamily.html',
  //providers:[HttpService]
})
export class EditfamilyPage implements OnInit {
  memberObj:FamilyMember;
  type:any = "";
  parentmemberObj:VenueUser;
  selectedParentClubKey:any = "";
  preparedAllClubMemberArr = [];
  membertype:string;
  ngOnInit(): void {
    this.memberObj = this.navParams.get('memberInfo');
    this.type = this.navParams.get('type');
    console.table(this.memberObj)
    if(this.type == "Member"){
      this.membertype = "Member";
    }else if(this.type == "Holidaycampmember"){
      this.membertype = "HolidayCampMember";
    }else{
      this.membertype = "SchoolMember";
    }
    this.parentmemberObj = this.navParams.get('parentObj');
    this.memberObj.EmailID = this.parentmemberObj.email;
    this.selectedParentClubKey = this.sharedservice.getParentclubKey();
  }
 
  constructor(public alertCtrl:AlertController,
    public fb: FirebaseService,
    public sharedservice: SharedServices,
    public commonService: CommonService,
    public toastCtrl: ToastController,public navCtrl: NavController, 
    public navParams: NavParams,
    //private httpService:HttpService,
    private graphqlService:GraphqlService,
    ) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad EditfamilyPage');
  }
  saveEnableStatetoDB(){
    this.showAlertForIsEnable('Are you sure you want to change the member status');
  }
  saveIsActiveStatetoDB(){
    this.showAlertForIsActive('Are you sure you want to change the member status'); 
  }
  showAlertForIsActive(msg) {
    const confirm = this.alertCtrl.create({
      message: msg +'?',
      buttons: [
        {
          text: 'No',
          handler: () => {
            // if(this.memberObj.IsActive == true){
            //   this.memberObj.IsActive = false
            // }else if(this.memberObj.IsActive == false){
            //   this.memberObj.IsActive = true
            // }
           
          }
          
        },
        {
          text: 'Yes',
          handler: () => {
            if(this.type == 'Holidaycampmember'){
              this.fb.update(this.memberObj.FirebaseKey,"HolidayCampMember/"+this.selectedParentClubKey+'/'+this.parentmemberObj.parentFirebaseKey+'/FamilyMember',{IsActive:this.memberObj.IsActive});
            }else if(this.type == 'Member'){
              this.fb.update(this.memberObj.FirebaseKey,"Member/"+this.selectedParentClubKey+'/'+this.parentmemberObj.clubkey+'/',{IsActive:this.memberObj.IsActive});
              this.fb.update(this.memberObj.FirebaseKey,"Member/"+this.selectedParentClubKey+'/'+this.parentmemberObj.clubkey+'/'+this.parentmemberObj.parentFirebaseKey+'/FamilyMember',{IsActive:this.memberObj.IsActive});
            }else{
              this.fb.update(this.memberObj.FirebaseKey,"SchoolMember/"+this.selectedParentClubKey+'/'+this.parentmemberObj.parentFirebaseKey+'/FamilyMember',{IsActive:this.memberObj.IsActive});
            }
            this.commonService.toastMessage('Profile successfully updated',2500);
          }
        }
      ]
    });
    confirm.present();
  }
  showAlertForIsEnable(msg){
    const confirm = this.alertCtrl.create({
      title:"Member Status",
      message: msg +'?',
      buttons: [
        {
          text: 'No',
          handler: () => {
            if(this.memberObj.IsEnable == true){
              this.memberObj.IsEnable = false
            }else if(this.memberObj.IsEnable == false){
              this.memberObj.IsEnable = true
            }
          }
        },
        {
          text: 'Yes',
          handler: () => {
            this.updateUserProfileExtraInfo({id:this.memberObj.Id,is_enable:this.memberObj.IsEnable})
          }
        }
      ]
    });
    confirm.present();
  }

  updateUserProfileExtraInfo(user_status):void{
    try{
      this.commonService.showLoader("Please wait");
      const userQuery = gql`
      mutation updateUserExtraInfo($profile_input:UserExtraProfileInput!) {
        updateUserExtraInfo(userProfile:$profile_input)
      }
      `;
      this.graphqlService.mutate(userQuery,{profile_input:user_status},0)
      .subscribe(({ data }) => {
        this.commonService.hideLoader();
        this.commonService.updateCategory("user_profile");
        this.navCtrl.pop();
        this.commonService.toastMessage("User status updated",2500,ToastMessageType.Success,ToastPlacement.Bottom);
      },(err) => {
        this.commonService.hideLoader();
        this.commonService.toastMessage("User status updated failed", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
      });      
    }catch(ex){
      this.commonService.hideLoader();
      this.commonService.toastMessage("User status updated failed", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
    }   
  }

  
  validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  }
  
  validBasic(): boolean {
    // if (!this.validateEmail(this.memberObj.EmailID)) {
    //    let message = "Please enter valid email";
    //    this.showToast(message, 3000);
    //    return false;
    // } else
  
     if ((this.memberObj.FirstName).trim() == "" || this.memberObj.FirstName == undefined) {
      let message = "Please enter first name";
      this.commonService.toastMessage(message, 3000,ToastMessageType.Error);
      return false;
    }
    else if ((this.memberObj.LastName).trim() == "" || this.memberObj.LastName == undefined) {
      let message = "Please enter last name";
      this.commonService.toastMessage(message, 3000,ToastMessageType.Error);
      return false;
    }
    else if (this.memberObj.DOB == "" || this.memberObj.DOB == undefined) {
      let message = "Please enter DOB";
      this.commonService.toastMessage(message, 3000,ToastMessageType.Error);
      return false;
    }
    else if (this.memberObj.Gender == "" || this.memberObj.Gender == undefined) {
      let message = "Please select gender";
      this.commonService.toastMessage(message, 3000,ToastMessageType.Error);
      return false;
    }
    // else if (this.memberObj.PhoneNumber.toString().trim().length < 10 || this.memberObj.PhoneNumber == undefined) {
    //   let message = "Please enter valid phone number";
    //   this.commonService.toastMessage(message, 3000,ToastMessageType.Error);
    //   return false;
    // }
    else if ((this.memberObj.MedicalCondition).toString().trim() == "" || this.memberObj.MedicalCondition == undefined) {
      let message = "Please enter medical condition";
      this.commonService.toastMessage(message, 3000,ToastMessageType.Error);
      return false;
    } 
    else {
      return true;
    }
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
    this.navCtrl.pop();
  }
  
  updateFamilyMember(){
    console.log(this.memberObj);
    if(this.validBasic()){
      delete this.memberObj["__typename"];

      this.commonService.showLoader("Please wait");
      const familyUserUpdate = new FamilyUserUpdate(this.memberObj);
      // this.httpService
      //   .put(`${API.USER_UPDATE}`, {
      //     parentclubKey: this.memberObj.ParentClubKey,
      //     clubKey: this.memberObj.ClubKey,
      //     memberKey: this.memberObj.FirebaseKey,
      //     updatedProperties: familyUserUpdate,
      //     membertype:this.membertype
      //   })
      //   .subscribe((data: any) => {
      //     console.log(data);
      //     if (data.status == 200) {
      //       this.commonService.hideLoader();
      //       this.commonService.toastMessage('Profile successfully updated',2500,ToastMessageType.Success,ToastPlacement.Bottom);
      //       this.commonService.updateCategory("user_profile");
      //       this.navCtrl.pop().then(()=>this.navCtrl.pop());
      //     }
      //   },err =>{
      //     this.commonService.hideLoader();
      //     this.commonService.toastMessage('Profile updation failed',2500,ToastMessageType.Error,ToastPlacement.Bottom);
      //   });
      const userQuery = gql`
          mutation updateUserProfile($profile_input:UserProfileInput!) {
            updateUserProfile(userProfile:$profile_input)
          }
          `;
          this.graphqlService.mutate(userQuery,{profile_input:familyUserUpdate},0)
          .subscribe(({ data }) => {
            this.commonService.hideLoader();
            this.commonService.toastMessage("Profile successfully updated",2500,ToastMessageType.Success,ToastPlacement.Bottom);
            this.commonService.updateCategory("user_profile");
            this.navCtrl.remove(this.navCtrl.getActive().index - 1, 2);
          },(err) => {
            this.commonService.hideLoader();
            this.commonService.toastMessage("User registration failed", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
          });
      
    }
  }
  
}


export class FamilyUserUpdate{
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
  constructor(user:FamilyMember){
    this.id = user.Id;
    this.FirstName = user.FirstName;
    this.LastName = user.LastName;
    this.Email = user.EmailID;
    this.Gender = user.Gender;
    this.PhoneNo = user.PhoneNumber;
    this.MedicalCondition = user.MedicalCondition;
    this.DOB = user.DOB;
    this.IsEnable = user.IsEnable;
    this.MediaConsent = user.MediaConsent;
    this.EmergencyNumber = user.EmergencyNumber;
    this.MemberType = 1;
    this.SpecialNeeds = user.SpecialNeeds;
    //this.ChildSplNeedsDesc = user.SpecialNeedsDesc;
    this.ChildSchoolMeals = user.ChildSchoolMeals;
    this.ChildSchool = user.ChildSchool;
    this.IncludeInLeaderBoard = user.IncludeInLeaderBoard;
    this.Handicap = user.Handicap;
    this.VehicleRegNo1 = "";
    this.VehicleRegNo2 = "";
    //this.MembershipID = 
  }

}