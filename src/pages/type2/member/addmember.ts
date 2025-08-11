import { Component, ViewChild } from '@angular/core';
import { NavParams, NavController, PopoverController, AlertController,Slides, Content } from 'ionic-angular';
import { SharedServices } from '../../services/sharedservice';
import { Storage } from '@ionic/storage';
import { Events } from 'ionic-angular';
import { FirebaseService } from '../../../services/firebase.service';
import { IonicPage } from 'ionic-angular';
import { CommonService, ToastMessageType, ToastPlacement } from '../../../services/common.service';
import gql from "graphql-tag";
import { GraphqlService } from '../../../services/graphql.service';
import { IClubDetails } from '../../../shared/model/club.model';
import { AddMemberDTO } from './model/member';
import { catchError, map } from 'rxjs/operators';
import { of } from 'rxjs/observable/of';
//Member class from member modal
@IonicPage()
@Component({
  selector: 'addmember-page',
  templateUrl: 'addmember.html'
})

export class Type2AddMember {
  @ViewChild(Content) content: Content;
  @ViewChild('myslider') myslider: Slides;
  LangObj:any = {};//by vinod
  divNo: number = 1;
  divType: string = '';
  parentClubAdminEmailID = "";
  membershipPackage: any[];
  selectedClub: any;
  selectedPackageKey: any;
  themeType: number;
  selectedParentClubKey: string;
  selectedClubKey: string;
  clubs: IClubDetails[] = [];
  membershipType: any;
  //memberObj: Member = new Member();

  memberObj: AddMemberDTO = new AddMemberDTO();

  // userObj = {
  //   EmailID: "",
  //   Name: "",
  //   Password: "",
  //   RoleType: "",
  //   Type: "",
  //   UserType: "",
  //   Registerdby: "",
  //   OriginalParentClubKey: "",
  //   OriginalClubKey: ""
  // };

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
  membershipSubCategoryObj = {
    BaseFees: 0,
    MembershipSubCategoryCode: "",
    MembershipSubCategoryName: "",
  }
  allMemberArr = [];
  membershipPackageObj = { AmountDue: 0, AmountPayStatus: "", AmountPaid: 0, PaidBye: "", PackageFees: 0, PaybyDate: "", PackageName: "", PackageKey: "" };
  memberList = [];
  membershipSubCategoryKey: any;
  allMemberArrofClub = [];
  preparedAllClubMemberArr = [];
  constructor(public events: Events,
    public commonService: CommonService, 
    public navParams: NavParams,
     public storage: Storage, public navCtrl: NavController,
      public sharedservice: SharedServices, 
      public fb: FirebaseService, 
      public popoverCtrl: PopoverController, 
      public alertCtrl: AlertController, 
      private graphqlService: GraphqlService,) {
      this.divType = navParams.get('divType');

      this.memberObj.IsTakenConcentForm = true;
      this.memberObj.NotificationEmailAllowed = true;
      this.memberObj.PromoEmailAllowed = true;
      this.memberObj.IsAcceptedTermsAndConditions = true;
      this.memberObj.MemberType = 1;
      this.memberObj.IsEnable = true;
      this.themeType = sharedservice.getThemeType();
      this.memberObj.IsChild = false;
      this.memberObj.ParentClubId = this.sharedservice.getParentclubKey();
      this.getClubList();
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
    })
  }
  

  getClubList() {
    const clubs_input = {
      parentclub_id:this.sharedservice.getPostgreParentClubId(),
      user_postgre_metadata:{
        UserMemberId:this.sharedservice.getLoggedInId()
      },
      user_device_metadata:{
        UserAppType:0,
        UserDeviceType:this.sharedservice.getPlatform() == "android" ? 1:2
      }
    }
    const clubs_query = gql`
        query getVenuesByParentClub($clubs_input: ParentClubVenuesInput!){
          getVenuesByParentClub(clubInput:$clubs_input){
                Id
                ClubName
                FirebaseId
                MapUrl
                sequence
            }
        }
        `;
          this.graphqlService.query(clubs_query,{clubs_input: clubs_input},0)
            .subscribe((res: any) => {
              this.clubs = res.data.getVenuesByParentClub as IClubDetails[];
              //console.log("clubs lists:", JSON.stringify(this.clubs));
              this.selectedClub = this.clubs[0].FirebaseId;
            },
           (error) => {
                //this.commonService.hideLoader();
                console.error("Error in fetching:", error);
               // Handle the error here, you can display an error message or take appropriate action.
           })
  }


  presentPopover(myEvent) {
    let popover = this.popoverCtrl.create("PopoverPage");
    popover.present({
      ev: myEvent
    });
  }

  continue() {
    this.navCtrl.push("Type2ContinueAddMember", { clubKey: this.selectedClubKey, memberObjDFetails: this.memberObj });
  }

  validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  }

  telephoneEdit() {
    let ph = Number(this.memberObj.Phone);
    if (isNaN(ph)) {
      if (isNaN(parseInt(this.memberObj.Phone))) {
        this.memberObj.Phone = "";
      } else {
        this.memberObj.Phone = (parseInt(this.memberObj.Phone)).toString();
      }
      let message = "You can only enter numeric values.";
      this.commonService.toastMessage(message, 3000,ToastMessageType.Error);
    }
  }

  
  checkForUnique(email:string) {
    // let isPresent = false;
    // for (let i = 0; i < this.preparedAllClubMemberArr.length; i++) {
    //   if (memberEmailId == this.preparedAllClubMemberArr[i].EmailID) {
    //     isPresent = true;
    //     break;
    //   }
    // }
    // if (isPresent) {
    //   return false;
    // }
    // else {
    //   return true;
    // }
    const userQuery = gql`
    query checkUserEmailExistance($email_id:String!,$parentclub_id:String!) {
        checkUserEmailExistance(email:$email_id,parentClubId:$parentclub_id)
      }
    `;
    return this.graphqlService
    .query( userQuery,{ email_id: email, parentclub_id: this.sharedservice.getParentclubKey() },1)
    .pipe(
      map(({ data }) => {
        return data["checkUserEmailExistance"];
      }),
      catchError(() => {
        return of(true); // Assuming you want to return `true` on error
      })
    ); 
  }


  cancelMember() {
    this.navCtrl.pop();
  }
  goToDashboardMenuPage() {
    this.navCtrl.setRoot("Dashboard");
  }

  //when slide changed
  slideChanged() {
    setTimeout(() => {
      this.content.scrollToTop(200);
    });
    // this.isBeginSlide = this.myslider.isBeginning();
    // this.isEndSlide = this.myslider.isEnd();
    // console.log(this.isEndSlide);
    let slideslen = this.myslider.length();
    console.log(slideslen,this.myslider.getActiveIndex());
  }
  

  //going to next slide
  next() {
    if(!this.myslider.isEnd()){
      this.myslider.slideNext();
    }
  }

  //going to previous slide
  back(){
    if(!this.myslider.isBeginning()){
      this.myslider.slidePrev();
    }
  }

  async validBasic():Promise<boolean> {
    if (!this.selectedClub || this.selectedClub == "") {
      const message = "Please select the user venue";
      this.commonService.toastMessage(message, 3000,ToastMessageType.Error);
      return false;
    }
    else if (!this.validateEmail(this.memberObj.Email)) {
      const message = "Please enter valid email";
      this.commonService.toastMessage(message, 3000,ToastMessageType.Error);
      return false;
    }else if ((this.memberObj.FirstName).trim() == "" || this.memberObj.FirstName == undefined) {
      const message = "Please enter first name";
      this.commonService.toastMessage(message, 3000,ToastMessageType.Error);
      return false;
    }
    else if ((this.memberObj.LastName).trim() == "" || this.memberObj.LastName == undefined) {
      const message = "Please enter last name";
      this.commonService.toastMessage(message, 3000,ToastMessageType.Error)
      return false;
    }
    else if (this.memberObj.DOB == "" || this.memberObj.DOB == undefined) {
      const message = "Please enter DOB";
      this.commonService.toastMessage(message, 3000,ToastMessageType.Error);
      return false;
    }
    else if (this.memberObj.Gender == "" || this.memberObj.Gender == undefined) {
      const message = "Please select gender";
      this.commonService.toastMessage(message, 3000,ToastMessageType.Error);
      return false;
    }
    else if (this.memberObj.Phone.toString().trim().length < 7 || this.memberObj.Phone == undefined) {
      const message = "Please enter valid phoneno";
      this.commonService.toastMessage(message, 3000,ToastMessageType.Error);
      return false;
    }
    else if ((this.memberObj.Medical_Condition).toString().trim() == "" || this.memberObj.Medical_Condition == undefined) {
      const message = "Please enter medical condition";
      this.commonService.toastMessage(message, 3000,ToastMessageType.Error);
      return false;
    } 
    else if (!this.memberObj.IsTakenConcentForm) {
      const message = "Please select the checkbox, You have taken the consent from the member";
      this.commonService.toastMessage(message, 3000,ToastMessageType.Error);
      return false;
    }else {
      const isAlreadyExists = await this.checkForUnique(this.memberObj.Email).toPromise();
      if (isAlreadyExists) {
        const message = "Emailid is already present";
        this.commonService.toastMessage(message, 2500, ToastMessageType.Error);
        return false;
      }else{
        return true;
      } 
    }
  }
  

  //parent creation confirm alert
  async showConfirm() {
    if (await this.validBasic()) {
      this.memberObj.Email = this.memberObj.Email.toLowerCase();
      this.clubMemberCreation();
    }
  }

  // holidayCampMemberCreation(isAllowToAddFamilyMember) {
  //   this.memberKey = this.fb.saveReturningKey("/HolidayCampMember/" + this.memberObj.ParentClubKey, this.memberObj);
  //   let holidaycampObj = {
  //     EmailID: "",
  //     Name: "",
  //     RoleType: "",
  //     Type: "",
  //     UserType: "",
  //     MemberStatus: 1,
  //     Password: '',
  //     IsHolidayCampMember: true,
  //     SignedUpType: this.memberObj.SignedUpType
  //   }
  //   if (this.memberKey != undefined) {

  //     holidaycampObj.EmailID = this.memberObj.EmailID.toLowerCase();
  //     holidaycampObj.Name = this.memberObj.FirstName + " " + this.memberObj.MiddleName + " " + this.memberObj.LastName;
  //     holidaycampObj.Password = this.memberObj.Password;
  //     holidaycampObj.RoleType = "5";
  //     holidaycampObj.Type = "2";
  //     holidaycampObj.UserType = "2";
  //     holidaycampObj.MemberStatus = 1;
  //     if (this.selectedParentClubKey == "-Kd2fSCGOw6K3mvzu-yH" || this.selectedParentClubKey == "-KhXUETCkqohXhvssWQl") {
  //       this.userresponseDetails = this.fb.saveReturningKey("/User/Member/", holidaycampObj);
  //     } else {
  //       this.userresponseDetails = this.fb.saveReturningKey("/User/Member/" + this.selectedParentClubKey, holidaycampObj);
  //     }
  //     if (this.userresponseDetails != undefined) {
  //       this.userInfoObj.ParentClubKey = this.memberObj.ParentClubKey;
  //       this.userInfoObj.ClubKey = "";
  //       this.userInfoObj.MemberKey = this.memberKey;
  //       if (this.selectedParentClubKey == "-Kd2fSCGOw6K3mvzu-yH" || this.selectedParentClubKey == "-KhXUETCkqohXhvssWQl") {
  //         this.fb.saveReturningKey("/User/Member/" + this.userresponseDetails + "/UserInfo/", this.userInfoObj);
  //       } else {
  //         this.fb.saveReturningKey("/User/Member/" + this.selectedParentClubKey + "/" + this.userresponseDetails + "/UserInfo/", this.userInfoObj);
  //       }
  //     }
  //     if (isAllowToAddFamilyMember == "Yes") {
  //       this.navCtrl.push("Type2AddFamilyMember", { MemberKey: this.memberKey, MemberDetails: this.memberObj, divType: this.divType });
  //     }
  //   }
  // }

  clubMemberCreation() {
    this.memberObj.VenueId = this.selectedClub;
    this.memberObj.Password = "tttttt"
    this.commonService.showLoader("Please wait");
    const userQuery = gql`
    mutation registerVenueUser($register_input:MemberAppAuthRegister!) {
      registerVenueUser(userDetails:$register_input){
        Id
        PostGresId
      }
    }
    `;
    this.graphqlService.mutate(userQuery,{register_input:this.memberObj},0)
    .subscribe(({ data }) => {
      this.commonService.hideLoader();
      this.commonService.toastMessage("User created successfully", 2500, ToastMessageType.Success, ToastPlacement.Bottom);
      this.navCtrl.pop();
      
      //this.confirmFamilyMemberCreation();
    },(err) => {
      this.commonService.hideLoader();
      this.commonService.toastMessage("User registration failed", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
    });

  }

  async confirmFamilyMemberCreation(){
    let confirm = this.alertCtrl.create({
      title: 'Add Family Member?',
      message: 'Do you want to add family memeber ?',
      buttons: [
        {
          text: 'No,Thanks',
          handler: () => {
            this.navCtrl.pop();
          }
        },
        {
          text: 'Add',
          handler: () => {
            this.getUserDetails();
          }
        }
      ]
    });
    confirm.present();
  }


  getUserDetails(){
    const user_input = {
      member_id:this.navParams.get("member_id"),
      user_postgre_metadata:{
        UserMemberId:this.sharedservice.getLoggedInId()
      },
      user_device_metadata:{
        UserAppType:0,
        //UserActionType
        UserDeviceType:this.sharedservice.getPlatform() == "android" ? 1:2, //Which app {1:Android,2:IOS,3:Web,4:API}
      }
    }
    const userQuery = gql`
    query getUserDetsForAdmin($user_input: userDetsAdminInput!) {
      getUserDetsForAdmin(userInput:$user_input){
          Id
          parent_firstname
          parent_lastname
          DOB
          clubkey
          parentFirebaseKey
          email
          phone_number
          childcount
          is_enable
          is_coach
          handicap
          is_gold_member
          allow_court_booking
          membership_Id
          vehicleRegNo1
          vehicleRegNo2
          Gender
          medical_condition
          parent_status
          media_consent
      }
    }
  `;
  this.graphqlService.query(userQuery,{user_input:user_input},0).subscribe(({data}) => {
    this.navCtrl.push("Type2AddFamilyMember", {
      ClubKey: this.memberObj.VenueId,
      MemberDetails: data["getUserDetsForAdmin"],
      divType: "Member",
    });
    },(err)=>{
      this.commonService.toastMessage("Users fetch failed",3000,ToastMessageType.Error,ToastPlacement.Bottom);
    });
  }

  

}


