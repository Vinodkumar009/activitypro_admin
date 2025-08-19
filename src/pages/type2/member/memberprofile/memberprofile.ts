import { Component, OnInit } from "@angular/core";
import { IonicPage,NavController,NavParams,AlertController,ToastController, Toast,} from "ionic-angular";
import { Storage } from "@ionic/storage";
import { Events } from "ionic-angular";
import { CommonService,ToastMessageType,ToastPlacement,} from "../../../../services/common.service";
import { CallNumber } from "../../../../../node_modules/@ionic-native/call-number";
import { FirebaseService } from "../../../../services/firebase.service";
import * as moment from "moment";
import gql from 'graphql-tag';
import { SharedServices } from "../../../services/sharedservice";
import { FamilyMember, FamilyMemberInput, VenueUser } from "../model/member";
import { HttpService } from "../../../../services/http.service";
import { GraphqlService } from "../../../../services/graphql.service";
import { API } from "../../../../shared/constants/api_constants";
import { first } from "rxjs/operators";
import { ModuleTypes } from "../../../../shared/constants/module.constants";
/**
 * Generated class for the MemberprofilePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: "page-memberprofile",
  templateUrl: "memberprofile.html",
  providers:[HttpService]
})
export class MemberprofilePage implements OnInit {
  LangObj: any = {}; //by vinod
  memberInfo = new VenueUser();
  type: string = "";
  family_members:FamilyMember[] = [];
  preparedAllClubMemberArr = [];
  selectedParentClubKey = "";
  payloadObj: any = {
    ParentClubKey: "",
    MemberKeys: "",
    ParentClubId: "",
    MemberIds: "",
    ClubKey:"",
    AppType: 1,
  };
  headers: any;
  clubs: any = "";
  selectedClubKey: any = "";
  selectedClub: any;
  selectedMemberToMigrate: any;
  activeMembeships = [];
  membershipAssigned = false;
  SetupDisplay: any[];
  time: number;
  Duration: string;
  nodeUrl: string;
  AllowHandicap:boolean = false;
  courtbookingstatus = false;
  goldMemberStatus = false;
  AllowMediaConsent:boolean = true;
  CoachStatus = false;
  membertype:string = "";
  ngOnInit(): void {
    
  }


  constructor(
    public events: Events,
    public storage: Storage,
    public fb: FirebaseService,
    public sharedservice: SharedServices,
    public toastCtrl: ToastController,
    public callNumber: CallNumber,
    public alertCtrl: AlertController,
    public commonService: CommonService,
    public navCtrl: NavController,
    public navParams: NavParams,
    private graphqlService:GraphqlService,
    private httpService:HttpService
  ) {
    
      
  }


  ionViewWillEnter(){
    this.commonService.category.pipe(first()).subscribe((data) => {
      if (data == "user_profile") {
        //this.memberInfo = this.navParams.get("member_id");
        this.getUserDetails();
        console.log("memberdets:",this.memberInfo);
        this.commonService.updateCategory("");
        this.type = this.navParams.get("type");
        if(this.type == 'Member'){
          this.membertype = "Member";
        }else if(this.type == 'Holidaycampmember'){
          this.membertype = "HolidayCampMember";
        } else{
          this.membertype = "SchoolMember";
        }
        this.nodeUrl = "https://activitypro-nest-261607.appspot.com";
      }
    })    
  }
 
  

  //deep copy
  keepCloning(objectpassed) {
    if (objectpassed === null || typeof objectpassed !== "object") {
      return objectpassed;
    }
    // give temporary-storage the original obj's constructor
    var temporarystorage = objectpassed.constructor();
    for (var key in objectpassed) {
      temporarystorage[key] = this.keepCloning(objectpassed[key]);
    }
    return temporarystorage;
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
      //console.log('challeges data' + data["getFamilyMembers"]);
      console.timeEnd();
      console.log("time ended");
      this.memberInfo = data["getUserDetsForAdmin"];
      if(this.memberInfo)this.getFamilyDetails()
    },(err)=>{
      //this.commonService.hideLoader();
      this.commonService.toastMessage("Users fetch failed",3000,ToastMessageType.Error,ToastPlacement.Bottom);
    });
  }

  getFamilyDetails(){
    console.log("time started")
    console.time();
    const family_input:FamilyMemberInput = {
      ParentClubKey:this.sharedservice.getPostgreParentClubId(),
      MemberKey:this.navParams.get("member_id"),//this.memberInfo.parentFirebaseKey, using firebase
      AppType:0,
      DeviceType:this.sharedservice.getPlatform() == "android" ? 1:2, //Which app {1:Android,2:IOS,3:Web,4:API}
      ActionType:3  //pass 2 to send postgreId,Pass 1 to send Firebasekey in above MemberKey field
      //ClubKey:"" // if u need to get data from firebase
    }
    const userQuery = gql`
    query getFamilyMembers($family_input: FamilyMemberInput!) {
      getFamilyMembers(familyMemberInput:$family_input){
        Id
        FirstName
        LastName
        EmailID
        Gender
        DOB
        FirebaseKey
        ParentClubKey
        ClubKey
        IsChild
        EmergencyContactName
        EmergencyNumber
        MedicalCondition
        ParentKey
        PhoneNumber
        IsEnable
        IsActive
        PromoEmailAllowed
        MediaConsent
        SpecialNeeds
        SpecialNeedsDesc
        ChildSchoolMeals
        ChildSchool
        IncludeInLeaderBoard
        Handicap
      }
    }
  `;
  this.graphqlService.query(userQuery,{family_input:family_input},0).subscribe(({data}) => {
      //console.log('challeges data' + data["getFamilyMembers"]);
      console.timeEnd();
      console.log("time ended");
      this.family_members = data["getFamilyMembers"] as FamilyMember[];
      this.getMemberships()
    },(err)=>{
      //this.commonService.hideLoader();
      this.commonService.toastMessage("Users fetch failed",3000,ToastMessageType.Error,ToastPlacement.Bottom);
    });
  }


  getMemberships(){
    const memberkeys = [];
    //memberkeys.push(this.memberInfo.parentFirebaseKey);
    this.family_members.forEach((member) => {memberkeys.push(member.FirebaseKey)});

    this.httpService
        //.get(`${API.MEMBERSHIP_INFO}?parentClubKey=${this.sharedservice.getParentclubKey()}&clubKey=${this.memberInfo.clubkey}&memberKeys=${memberkeys}`,)
        .get(`${API.MEMBERSHIP_INFO}?parentClubKey=${this.sharedservice.getParentclubKey()}&clubKey=${this.memberInfo.clubkey}&memberKeys=${memberkeys}`,null,null,0)
        .subscribe((res: any) => {
          console.table(`memberships:${res}`);
         for(const member of this.family_members){
            if(res.data.memberShipDetailsForMember[member.FirebaseKey] && res.data.memberShipDetailsForMember[member.FirebaseKey].length > 0){
              member["MembershipName"] = res.data.memberShipDetailsForMember[member.FirebaseKey].SetupName;
            }
         }
        });
  }

  getMembership() {
    // //for.getUserDetails
    this.activeMembeships = JSON.parse(
      JSON.stringify(this.family_members)
    );
    this.fb
      .getAllWithQuery(`Membership/MembershipAssigned/${this.sharedservice.getParentclubKey()}`,{ orderByKey: true, equalTo: this.memberInfo.clubkey })
      .subscribe((data) => {
        if (data.length > 0) {
          data.forEach((selectedConfig) => {
            this.commonService
              .convertFbObjectToArray(selectedConfig)
              .forEach((config) => {
                let configuration =
                  this.commonService.convertFbObjectToArray1(config);
                this.activeMembeships.forEach((member) => {
                  for (let i = 0; i < configuration.length - 1; i++) {
                    if (
                      configuration[i].IsActive &&
                      this.memberInfo.parentFirebaseKey ==
                        configuration[configuration.length - 1] &&
                      configuration[i].Validity >= new Date().getTime()
                    ) {
                      this.memberInfo["MembershipName"] =
                        configuration[i].SetupName;
                    }
                    if (
                      configuration[i].IsActive &&
                      configuration[i].ParentKey == this.memberInfo.parentFirebaseKey &&
                      member.FirebaseKey == configuration[configuration.length - 1] &&
                      configuration[i].IsChild &&
                      configuration[i].Validity >= new Date().getTime()
                    ) {
                      (member["SetupName"] = configuration[i].SetupName),
                        (member["CurrentPayment"] =
                          configuration[i].PaymentOptions),
                        (member["Validity"] = moment(
                          configuration[i].Validity
                        ).format("YYYY/MM/DD")),
                        this.activeMembeships.splice(
                          this.activeMembeships.indexOf(member),
                          1,
                          member
                        );
                      this.membershipAssigned = true;
                    } else if (
                      configuration[i].IsChild == false &&
                      configuration[i].IsActive &&
                      configuration[configuration.length - 1] ==
                        this.memberInfo.parentFirebaseKey
                    ) {
                      this.membershipAssigned = true;
                    }
                  }
                });
              });
          });
        }
      });
  }

  //   getAllSetup() {
  //     let MemberKey
  //     let key

  //     let MemberKeyList = ''
  //     MemberKeyList = this.memberInfo.$key + ','
  //     this.memberInfo.FamilyMember.forEach(mem => {
  //       MemberKeyList = MemberKeyList + ','+ mem.Key
  //     });
  //     MemberKeyList = MemberKeyList.substr(0, MemberKeyList.length - 1)
  //     this.http.get(`${this.nodeUrl}/membership/membershipinfo?memberKeys=${MemberKeyList}&clubKey=${this.selectedClubKey}&parentClubKey=${this.ParentClubKey}`).subscribe((data: any) => {
  //         //this.Discounts = discountObj.data;
  //         if (data.status == 200) {

  //           this.memberInfo.FamilyMember.forEach(member => {

  //             const membership = data.data['memberShipDetailsForMember'][member.key][0]
  //             if(membership){
  //               membership['MemberKey'] = member.key
  //               membership['DisplayName'] = member['FirstName'] +" "+ member['LastName']
  //               this.ActiveSetups.push(membership)
  //               const paramObj = {
  //                 MemberKey: member.key,
  //                 Key: membership.MembershipAssignedKey,
  //                 ParentKey: membership['ParentKey'],
  //                 IsChild: membership['IsChild'],
  //                 DisplayName: membership['DisplayName']
  //             }
  //             }
  //           })
  //         }
  //         console.log("ActiveSetups", this.ActiveSetups)
  //         this.setupListing()
  //       }, (err) => {
  //         console.log(JSON.stringify(err));
  //         console.log("ActiveSetups", this.ActiveSetups)
  //         this.setupListing()
  //       });

  // }

  gotowallet() {
    this.fb
      .getAllWithQuery(
        "StandardCode/Wallet/LoyaltyPoint/" + this.selectedParentClubKey,
        { orderByKey: true, equalTo: this.memberInfo.clubkey }
      )
      .subscribe((loyaltySetup) => {
        if (loyaltySetup.length < 0) {
          this.commonService.toastMessage("No Loyalty Setup Found", 3000);
        } else {
          this.navCtrl.push("LoyaltyProfile", { member: this.memberInfo });
        }
      });
  }

  ionViewDidLoad() {
    console.log("ionViewDidLoad MemberprofilePage");
    this.getLanguage();
    this.events.subscribe("language", (res) => {
      this.getLanguage();
    });
  }
  //added by vinod
  getLanguage() {
    this.storage.get("language").then((res) => {
      console.log(res["data"]);
      this.LangObj = res.data;
    });
  }

  //added by vinod ends here

  ionViewDidEnter() {
    //this.getDetails();
  }
  
  goToMemberProfilePage() {
    this.navCtrl.push("BookinghistoryPage", {
      member_info: this.memberInfo,
      family_members: this.family_members,
    });
  }
  //function added
  // goToshowMembershipPage() {
  //   this.navCtrl.push("ShowmembershipPage", {
  //     ParentClubKey: this.sharedservice.getParentclubKey(),
  //     ClubKey: this.memberInfo.clubkey,
  //     MemberKey: this.memberInfo.clubkey,
  //     //FamilyMember: this.memberInfo.FamilyMember, vinod commentd after 
  //   });
  // }
  goToshowMembershipPage() {
    //console.log("membershipinfo is:",this.memberInfo);
    this.navCtrl.push("ShowmembershipPage", {MemberInfo:this.memberInfo });
    this.commonService.updateCategory("update_user_memberships_list")
  }
  
  goToshowMemberChallenges() { //commented part of 
    if (this.family_members.length > 0) {
      this.navCtrl.push("Userchallenges", {
        User: this.memberInfo,
        ParentClubKey: this.sharedservice.getParentclubKey(),
        FamilyMember: this.family_members,
      });
    } else {
      this.commonService.toastMessage("Please add family member",2500,ToastMessageType.Error,ToastPlacement.Bottom);
    }
  }

  addFamilyMember() {
    this.navCtrl.push("Type2AddFamilyMember", {
      ClubKey: this.memberInfo.clubkey,
      MemberDetails: this.memberInfo,
      divType: this.type,
    });
  }

  showAlertForIsActive(msg) {
    const confirm = this.alertCtrl.create({
      title: "Member Status",
      message: msg + "?",
      buttons: [
        {
          text: "No",
          handler: () => {
            console.log(this.memberInfo);
            this.memberInfo.parent_status = !this.memberInfo.parent_status;
            console.log(this.memberInfo);
          },
        },
        {
          text: "Yes",
          handler: () => {
            this.updateUserProfileExtraInfo({id:this.navParams.get("member_id"),user_status:this.memberInfo.parent_status})
          },
        },
      ],
    });
    confirm.present();
  }


  showAlertForIsEnable(msg) {
    const confirm = this.alertCtrl.create({
      title: "Member Status",
      message: msg + "?",
      buttons: [
        {
          text: "No",
          handler: () => {
            console.log(this.memberInfo);
            if (this.memberInfo.is_enable == true) {
              this.memberInfo.is_enable = false;
            } else if (this.memberInfo.is_enable == false) {
              this.memberInfo.is_enable = true;
            }
            console.log(this.memberInfo);
          },
        },
        {
          text: "Yes",
          handler: () => {
            this.updateUserProfileExtraInfo({id:this.navParams.get("member_id"),is_enable:this.memberInfo.is_enable})
          },
        },
      ],
    });
    confirm.present();
  }
  
  showAlertForIsCourtBooking(msg) {
    const confirm = this.alertCtrl.create({
      title: "Allow Court Booking",
      message: msg + "?",
      buttons: [
        {
          text: "No",
          handler: () => {
            console.log(this.memberInfo);
            this.memberInfo.allow_court_booking = !this.memberInfo.allow_court_booking
          },
        },
        {
          text: "Yes",
          handler: () => {
            this.updateUserProfileExtraInfo({id:this.navParams.get("member_id"),allow_court_booking:this.memberInfo.allow_court_booking})
          },
        },
      ],
    });
    confirm.present();
  }
  activeConfirmation() {}

  //updating gold_member/coach_status/media_consent/is_enable,deactivate
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
        this.commonService.toastMessage("Profile successfully updated",2500,ToastMessageType.Success,ToastPlacement.Bottom);
        if(user_status.user_status!==undefined){
          this.navCtrl.pop();
        }
      },(err) => {
        this.commonService.hideLoader();
        if(err.errors && err.errors.length > 0){
          this.commonService.toastMessage(err.errors[0].message, 2500, ToastMessageType.Error, ToastPlacement.Bottom);
        }else{
          this.commonService.toastMessage("Profile update failed", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
        }
      });      
    }catch(ex){
      this.commonService.hideLoader();
      this.commonService.toastMessage("Profile update failed", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
    }   
  }

  //sending notification
  notifyToMember() {
    // this.navCtrl.push("Type2NotificationToIndividualMember", {
    //   MemberDetails: this.memberInfo,
    // });
    
    this.navCtrl.push("Type2NotificationSession",{
      users:[this.memberInfo.Id],
      type:ModuleTypes.MEMBER,
      heading:`Hey:${this.memberInfo.parent_firstname} ${this.memberInfo.parent_lastname}`
    });            
  }

  //sending email
  sentAnEmailToMember() {
    const member_list = [];
      member_list.push({
              IsChild:false,
              ParentId:"",
              MemberId:this.memberInfo.Id, 
              MemberEmail:this.memberInfo.email, 
              MemberName: this.memberInfo.parent_firstname + " " + this.memberInfo.parent_lastname
      })
      const session = {}
      const email_modal = {
          module_info:session,
          email_users:member_list,
          type:110
      }
      this.navCtrl.push("MailToMemberByAdminPage", {email_modal});
       
  }

  //dialing phone number
  callToMember() {
    if(this.memberInfo.phone_number !== undefined || this.memberInfo.phone_number!==""){
      if (this.callNumber.isCallSupported()) {
        this.callNumber
          .callNumber(this.memberInfo.phone_number, true)
          .then(() => console.log())
          .catch(() => console.log());
      } else {
        this.commonService.toastMessage("Your device is not supporting to lunch call dialer.",2500,ToastMessageType.Info,ToastPlacement.Bottom);
      }
    }else{
      this.commonService.toastMessage("Invalid phone number.", 2500,ToastMessageType.Error,ToastPlacement.Bottom);
    }
  }
  
  changeActiveState() {
    // if(this.memberInfo.IsActive == true){
    //   this.memberInfo.IsActive = false;
    // }else if(this.memberInfo.IsActive == false){
    //   this.memberInfo.IsActive = true;
    // }
  }
  saveActiveStatetoDB() {
    this.showAlertForIsActive("Are you sure you want to delete member ");
  }
  saveEnableStatetoDB() {
    this.showAlertForIsEnable(
      "Are you sure you want to change the member status"
    );
  }
  saveCourtBookingtoDB() {
    this.showAlertForIsCourtBooking(
      "Are you sure you want to change the member court booking status"
    );
  }
  goToEditPage() {
    this.navCtrl.push("UpdateprofilePage", {
      memberInfo: this.memberInfo,
      type: this.type,
    });
  }

  presentToast(msg) {
    const toast = this.toastCtrl.create({
      message: msg,
      duration: 3000,
    });
    toast.present();
  }

  goToShowFamily() {
    // for (let i = 0; i < this.family_members.length; i++) {
    //   //let age = (new Date().getFullYear() - new Date(this.activeMembeships[i].DOB).getFullYear());
    //   let age = this.commonService.getAgeFromYYYY_MM(
    //     this.family_members[i].DOB
    //   );
      
    //   if (isNaN(age)) {
    //     this.family_members[i].Age = "";
    //   } else {
    //     this.family_members[i].Age = age;
    //   }
    // }
    this.navCtrl.push("ShowfamilymemberPage", {
      memberdetails: this.memberInfo,
      familyInfo: this.family_members,
      type: this.type,
    });
  }
  becomeMember() {
    this.selectedMemberToMigrate = this.memberInfo;
    let modal = document.getElementById("customModal8");
    modal.style.display = "block";
    let sbar = document.getElementById("customsearchbar");
    sbar.style.display = "none";
    this.getClubDetails();
  }

  getClubDetails() {
    const club$Obs = this.fb.getAllWithQuery(`/Club/Type2/${this.sharedservice.getParentclubKey()}`, {orderByChild: "IsEnable",equalTo: true,}).subscribe((data) => {
        this.clubs = data;
        club$Obs.unsubscribe();
        console.log(data);
        if (data.length != 0) {
          this.selectedClubKey = this.clubs[0].$key;
          try {
            // this.getClubMmebers(this.selectedClubKey);
          } catch (ex) {
          } finally {
            //this.loading.dismiss().catch(() => { });
          }
        }
      });
  }
  closeModal() {
    let modal = document.getElementById("customModal8");
    let sbar = document.getElementById("customsearchbar");
    if (event.target == modal) {
      modal.style.display = "none";
      sbar.style.display = "block";
    }
  }
  cancelModal() {
    let modal = document.getElementById("customModal8");
    let sbar = document.getElementById("customsearchbar");
    //if (event.target == modal) {
    modal.style.display = "none";
    sbar.style.display = "block";
    //}
  }


  saveGoldMemberStatus() {
    this.showAlertForIsGoldMember(
      "Are you sure you want to change the gold status of the member"
    );
  }
  showAlertForIsGoldMember(msg) {
    const confirm = this.alertCtrl.create({
      title: "Gold Member Status",
      message: msg + "?",
      buttons: [
        {
          text: "No",
          handler: () => {
            this.memberInfo.is_gold_member = !this.memberInfo.is_gold_member;
          },
        },
        {
          text: "Yes",
          handler: () => {
            this.updateUserProfileExtraInfo({id:this.navParams.get("member_id"),is_gold_member:this.memberInfo.is_gold_member})
          },
        },
      ],
    });
    confirm.present();
  }
  
  allowMediaConsent() {
    const title = "Allow Media";
    const message = `Are you sure you want to change the setting?`;
    this.commonService.commonAlertWithStatus(title,message,"No","Yes",(status:boolean)=>{
      if(status){
        this.updateUserProfileExtraInfo({id:this.navParams.get("member_id"),allow_media_consent:this.memberInfo.media_consent})
      }
      else{
        this.memberInfo.media_consent = !this.memberInfo.media_consent;
      }
    });
  }

  saveCoachStatus() {
    const confirm = this.alertCtrl.create({
      title: "Coach Status",
      message: `Are you sure you want to change the coach status of the member?`,
      buttons: [
        {
          text: "No",
          handler: () => {
            this.memberInfo.is_coach = !this.memberInfo.is_coach;
          },
        },
        {
          text: "Yes",
          handler: () => {
            this.updateUserProfileExtraInfo({id:this.navParams.get("member_id"),is_coach:this.memberInfo.is_coach})
          },
        },
      ],
    });
    confirm.present();
  }


  ionViewWillLeave() {
    //this.commonService.updateCategory("");
  }


}


