import { Component, ViewChild } from '@angular/core';
import { ToastController, NavController, PopoverController, FabContainer } from 'ionic-angular';
import { SharedServices } from '../../services/sharedservice';
import { Storage } from '@ionic/storage';
import { FirebaseService } from '../../../services/firebase.service';
import { Events } from 'ionic-angular';
import { IonicPage, Platform, ActionSheetController } from 'ionic-angular';
import { CommonService, ToastMessageType, ToastPlacement } from '../../../services/common.service';
import { CallNumber } from '@ionic-native/call-number';
import { Subscription } from 'rxjs/Subscription';
import gql from 'graphql-tag';
import { UsersListInput, VenueUser } from './model/member';
import { GraphqlService } from '../../../services/graphql.service';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { IClubDetails } from '../../../shared/model/club.model';
@IonicPage()
@Component({
  selector: 'member-page',
  templateUrl: 'member.html',
  providers:[GraphqlService]
})

export class Type2Member {
  private searchTerms = new Subject<string>();
  @ViewChild('fab') fab: FabContainer;
  $MemberSubcriber:Subscription;
  $SchoolMember:Subscription;
  $HolidayCampMember:Subscription;
  $FilterMemberSubcriber:Subscription;
  $FilterSchoolMember:Subscription;
  $FilterHolidayCampMember:Subscription;
  searchText = "";
  LangObj: any = {};//by vinod
  themeType: number;
  show: boolean;
  selectedParentClubKey: string;
  selectedClubKey: string;
  members:VenueUser[] = [];
  holidayCampMembers = [];
  schoolMemberList = [];
  allMemebers = [];
  selectedIndex: number;
  selectedIndexOfHolidayCampMember: number;
  selectedSchoolMemberIndex: number;
  clubs: IClubDetails[] = [];
  isShowMessage1 = false;
  loading: any;
  // originalMember = [];
  // memberschild = [];
  parentMember = 0;
  memberschild = 0;
  memberType: string = "Member";
  selectedTabValue: string = "";
  shouldShowCancel = true;
  limitToFirst = 0;
  isShowNewPost = false;
  venus_user_input:UsersListInput = {
    parentclub_id:"",
    club_id:"",
    search_term:"",
    limit:8,
    offset:0
  }
  loggedin_type:number = 2;
  can_coach_see_revenue:boolean = true;
  constructor(public events: Events, 
     private callNumber: CallNumber,
     public commonService: CommonService, 
     public actionSheetCtrl: ActionSheetController, 
     public platform: Platform,
     public storage: Storage, public navCtrl: NavController, 
     public sharedservice: SharedServices, 
     public fb: FirebaseService, public popoverCtrl: PopoverController,
      private graphqlService:GraphqlService) {
      this.themeType = sharedservice.getThemeType();
      this.selectedIndex = -1;
      this.selectedIndexOfHolidayCampMember = -1;
      this.selectedSchoolMemberIndex = -1;
    

    this.searchTerms.pipe(
      debounceTime(500), // Wait for 300ms after the user stops typing
      distinctUntilChanged() // Only emit if the search term has changed
    ).subscribe(search_term => {
      // Call your API here using the term
      this.members = [];
      this.getMemberFilterItems(search_term && search_term!='' && search_term.length > 2 ? search_term.replace(/ /g, '') : '');
    });
    
  }

  ionViewWillEnter(){
    // this.commonService.category.pipe(first()).subscribe((data) => {
    //   this.loggedin_type = this.sharedservice.getLoggedInType();
    //     if (data == "update_member_list") {
    //       this.members = [];
    //       this.selectedParentClubKey = this.sharedservice.getParentclubKey();
    //       this.venus_user_input.parentclub_id = this.sharedservice.getPostgreParentClubId();
    //       this.getClubDetails();
    //     }
    //   })
          
  }

  ionViewDidEnter() {
    this.fab.close();
  }

  //added by vinod
  ionViewDidLoad() {
    this.getLanguage();
    this.events.subscribe('language', (res) => {
      this.getLanguage();
    });
    this.members = [];
    this.selectedParentClubKey = this.sharedservice.getParentclubKey();
    this.venus_user_input.parentclub_id = this.sharedservice.getPostgreParentClubId();
    this.getClubDetails();          
  }
  getLanguage() {
    this.storage.get("language").then((res) => {
      console.log(res["data"]);
      this.LangObj = res.data;
    })
  }

  //added by vinod ends here


  presentPopover(myEvent) {
    let popover = this.popoverCtrl.create("PopoverPage");
    popover.present({
      ev: myEvent
    });
  }


  profile(member, index) {
    this.navCtrl.push('ProfilePage', {userInfo: member})
  }

  addMember() {
    if (this.memberType != "Schoolmember") {
      this.navCtrl.push("Type2AddMember", {
        RegisterdMembers: this.members,
        divType: this.memberType
      });
    } else {
      this.commonService.toastMessage("This feature is not available", 2500,ToastMessageType.Error);
    }
  }

  editMember() {
    this.navCtrl.push("Type2EditMember");
  }

  toggoleMethod() {
    this.show = !this.show;
  }
  gotoAddFamilyMember(memberObj) {
    this.navCtrl.push("Type2AddFamilyMember", { ClubKey: this.selectedClubKey, MemberDetails: memberObj, divType: this.memberType });
  }
  gotoEditFamilyMember() {
    this.navCtrl.push("Type2EditFamilyMember");
  }


  memberDetailsForGroup1(index) {
    this.selectedIndex = (index == this.selectedIndex) ? -1 : index;
  }


  initializeItems1() {
    this.members = this.allMemebers;
  }


  getParentClubUsers = (type:number) => {
    console.log("time started")
    console.time();
    const userQuery = gql`
    query getAllVenueUsersByFilter($venue_input: UsersListInput!) {
      getAllVenueUsersByFilter(userInput:$venue_input){
        venue_users{
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
        total_users
      }
    }
  `;
  this.graphqlService.query(userQuery,{venue_input:this.venus_user_input},0)
    .subscribe(({data}) => {
      //console.log('challeges data' + data["getAllMembersByParentClubNMemberType"]);
      console.timeEnd();
      console.log("time ended")
      //if(data["getAllVenueUsersByFilter"]["venue_users"].length > 0){
        if(type === 2){
          this.members = [];
          this.members = data["getAllVenueUsersByFilter"]["venue_users"];
        }else{
          if(data["getAllVenueUsersByFilter"]["venue_users"].length > 0){
            this.members = [...this.members, ...data["getAllVenueUsersByFilter"]["venue_users"]];
          }
        }
      //}
    },(err)=>{
      //this.commonService.hideLoader();
      this.commonService.toastMessage("Users fetch failed",3000,ToastMessageType.Error,ToastPlacement.Bottom);
    });   
  }



  goToDashboardMenuPage() {
    this.navCtrl.setRoot("Dashboard");
  }



  notifyToMember(member) {
    this.navCtrl.push("Type2NotificationToIndividualMember", { MemberDetails: member });
  }
  sentAnEmailToMember(member) {
    let mlist = [];
    mlist.push(member);
    this.navCtrl.push("MailToMemberByAdminPage", { MemberList: mlist, NavigateFrom: "Member" });
  }

  callToMember(member) {
    if (this.callNumber.isCallSupported()) {
      this.callNumber.callNumber(member.PhoneNumber, true)
        .then(() => console.log())
        .catch(() => console.log());
    } else {
      this.commonService.toastMessage("Your device is not supporting to lunch call dialer.", 2500,ToastMessageType.Error);
    }
  }


  //
  //enhanced one
  //
  memberTabClick() {
    if (this.selectedTabValue != this.memberType) {
      this.limitToFirst = 0;
      //this.callMemberListMethod();
    }
  }
  
  getClubDetails() {
    try{
    //   const clubQuery = gql`
    //   query getParentClubVenues($firebase_parentclubId:String!) {
    //     getParentClubVenues(firebase_parentclubId:$firebase_parentclubId){
    //       Id
    //       City
    //       ClubContactName
    //       ClubName
    //       ClubShortName
    //       CountryName
    //       PostCode
    //       ContactPhone
    //       ClubDescription
    //       sequence
    //       FirebaseId
    //     }
    //   }
    // `;
    // this.graphqlService.query(clubQuery,{firebase_parentclubId:this.selectedParentClubKey},0).subscribe(({data}) => {
    //     this.clubs = JSON.parse(JSON.stringify(data["getParentClubVenues"] as Club[]));
    //     console.table('clubs data' + data["getParentClubVenues"]);
    //     if(this.clubs.length > 0){
    //       this.selectedClubKey = this.clubs[0].Id;
    //       this.venus_user_input.club_id = this.selectedClubKey;
    //       this.members = [];
    //       this.getParentClubUsers();
    //     } 
    //   },(err)=>{
    //     this.commonService.toastMessage("Clubs fetch failed",3000,ToastMessageType.Error,ToastPlacement.Bottom);
    //   });  
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
          if(this.clubs.length > 0){
            this.selectedClubKey = this.clubs[0].Id;
            this.venus_user_input.club_id = this.selectedClubKey;
            this.members = [];
            this.getParentClubUsers(1);
          }else{
            this.commonService.toastMessage("No clubs found",3000,ToastMessageType.Error,ToastPlacement.Bottom);
          } 
      },
      (error) => {
          console.error("Error in fetching:", error);
          this.commonService.toastMessage("Clubs fetch failed",3000,ToastMessageType.Error,ToastPlacement.Bottom);
      })


    }catch(err){
      this.commonService.toastMessage("Clubs fetch failed",3000,ToastMessageType.Error,ToastPlacement.Bottom);
    }

  }


  
  venueSelected() {
    this.limitToFirst = 0;
    this.venus_user_input.offset = 0;
    this.venus_user_input.limit = 8;
    this.venus_user_input.search_term = '';
    this.venus_user_input.club_id = this.selectedClubKey;
    //this.members = [];
    this.getParentClubUsers(2);
  }


  memberDetailsForGroup(index) {
    if (this.memberType == "Member") {
      this.selectedIndex = (index == this.selectedIndex) ? -1 : index;
    }
    else if (this.memberType == "Holidaycampmember") {
      this.selectedIndexOfHolidayCampMember = (index == this.selectedIndexOfHolidayCampMember) ? -1 : index;
    }
    else if (this.memberType == "Schoolmember") {

      this.selectedSchoolMemberIndex = (index == this.selectedSchoolMemberIndex) ? -1 : index;
    }

  }


  //Holiday camp member listing

  

  

  doInfinite(infiniteScroll) {
    
    this.venus_user_input.offset+=this.venus_user_input.limit
    //this.venus_user_input.searchterm = "";
    this.getParentClubUsers(1);
    setTimeout(() => {
      infiniteScroll.complete();
    }, 200);
  }

  presentActionSheet(member, index, type) {
    this.navCtrl.push('MemberprofilePage', {member_id: member.Id,type: type});
    this.commonService.updateCategory("user_profile");
  }

  



  getFilterItems(event: any) {
    // if (this.memberType == "Member") {
    //   this.getMemberFilterItems(ev);
    // }
    // else if (this.memberType == "Holidaycampmember") {
    //   this.getHolidayCampMemberFilterItems(ev);
    // }
    // else if (this.memberType == "Schoolmember") {
    //   this.getSchoolMemberFilterItems(ev);
    // }
    const searchTerm = event.target.value;
    this.searchTerms.next(searchTerm);
  }



  initializeItems() {
    if (this.memberType == "Member") {
      this.members = this.allMemebers;
    }
    else if (this.memberType == "Holidaycampmember") {
      this.members = this.holidayCampMembers;
    }
    else if (this.memberType == "Schoolmember") {
      this.members = this.schoolMemberList;
    }
  }

  // getSearchedClubMemeber(ev) {

  //   let val = ev.target.value;
  //   this.fb.getFilterValue("/Member/" + this.selectedParentClubKey + "/" + this.selectedClubKey, "FirstName", val).subscribe((response) => {
  //     console.log(response);
  //   });

  // }

  getMemberFilterItems(search_text) {
  
    //let val = ev.target.value;
    const val = search_text;
    if(val && val!='')console.log(val.length);
    // if the value is an empty string don't filter the items
      this.venus_user_input.offset = 0;
      this.venus_user_input.limit = 12;
      //this.members = [];
      if (val && val.trim()!= '' && val.length > 1) {
        this.venus_user_input.search_term = val;
        this.getParentClubUsers(2);
      }else {
        this.venus_user_input.search_term = "";
        this.getParentClubUsers(2);
      }

  }


  getHolidayCampMemberFilterItems(ev) {
    this.$FilterHolidayCampMember = this.fb.getAllWithQuery("/HolidayCampMember/" + this.selectedParentClubKey, { orderByChild: 'IsChild', equalTo: false }).subscribe((data) => {
      this.holidayCampMembers = [];
      this.allMemebers = [];
      for (let memmberIndex = 0; memmberIndex < data.length; memmberIndex++) {
        if (data[memmberIndex].IsActive) {
          this.holidayCampMembers.push(data[memmberIndex]);
        }
      }
      for (let i = 0; i < this.holidayCampMembers.length; i++) {
        this.holidayCampMembers[i]["FullName"] = this.holidayCampMembers[i].FirstName + " " + this.holidayCampMembers[i].LastName;
        this.holidayCampMembers[i].ChildMember = [];
        this.holidayCampMembers[i]["MemberCount"] = 0;
        if (this.holidayCampMembers[i].IsChild == false) {
          let x = this.commonService.convertFbObjectToArray(this.holidayCampMembers[i].FamilyMember);
          this.holidayCampMembers[i]["MemberCount"] = x.filter(member => member.IsActive).length;
          for (let childmemberIndex = 0; childmemberIndex < x.length; childmemberIndex++) {
            x[childmemberIndex]["FullName"] = x[childmemberIndex].FirstName + " " + x[childmemberIndex].LastName;
          }
          this.holidayCampMembers[i].ChildMember = x;
          this.parentMember++;
          // if (this.holidayCampMembers[i].FamilyMember != undefined) {
          //   let x = this.commonService.convertFbObjectToArray(this.holidayCampMembers[i].FamilyMember);
          //   this.memberschild = this.memberschild + x.length;
          // }
        }
      }

      this.allMemebers = this.holidayCampMembers;



      try {
        // Reset items back to all of the items
        this.initializeItems();

        // set val to the value of the searchbar
        let val = ev.target.value;

        // if the value is an empty string don't filter the items
        if (val && val.trim() != '') {
          this.holidayCampMembers = this.holidayCampMembers.filter((item) => {
            if (item.FullName != undefined) {
              if (item.FullName.toLowerCase().indexOf(val.toLowerCase()) > -1) {
                return true;
              }
              else {
                if (item.ChildMember != undefined) {
                  for (let i = 0; i < item.ChildMember.length; i++) {
                    if (item.ChildMember[i].FullName.toLowerCase().indexOf(val.toLowerCase()) > -1) {
                      return true;
                    }
                  }
                }
              }

            }
          })

        }
        this.parentMember = 0;
        this.memberschild = 0;
        for (let i = 0; i < this.holidayCampMembers.length; i++) {
          if (this.holidayCampMembers[i].IsChild == false) {
            this.parentMember++;
            if (this.holidayCampMembers[i].FamilyMember != undefined) {
              let x = this.commonService.convertFbObjectToArray(this.holidayCampMembers[i].FamilyMember);
              this.holidayCampMembers[i]["MemberCount"] = x.filter(member => member.IsActive).length;
            }
          }

        }

      }
      catch (ex) {
        let msg = "Some error occured! Pls. contact support";
        this.commonService.toastMessage(msg, 2500,ToastMessageType.Error);
      }




    });
  }

  
  selectedClub = "";
  selectedMemberToMigrate: any;


  becomeAMember(item) {
    this.selectedMemberToMigrate = item;
    let modal = document.getElementById('customModal1');
    modal.style.display = "block";
    let sbar = document.getElementById('customsearchbar');
    sbar.style.display = "none";
  }

  closeModal() {
    let modal = document.getElementById('customModal1');
    let sbar = document.getElementById('customsearchbar');
    if (event.target == modal) {
      modal.style.display = "none";
      sbar.style.display = "block";
    }

  }


  migrateMember() {
    let memberObj = {
      ClubKey: this.selectedClub,
      CreateDate: this.selectedMemberToMigrate.CreateDate,
      DOB: this.selectedMemberToMigrate.DOB,
      EmailID: this.selectedMemberToMigrate.EmailID,
      EmergencyContactName: this.selectedMemberToMigrate.EmergencyContactName,
      EmergencyNumber: this.selectedMemberToMigrate.EmergencyNumber,
      FirstName: this.selectedMemberToMigrate.FirstName,
      Gender: this.selectedMemberToMigrate.Gender,
      IsAcceptTermAndCondition: this.selectedMemberToMigrate.IsAcceptTermAndCondition,
      IsActive: true,
      IsChild: this.selectedMemberToMigrate.IsChild,
      IsEnable: true,
      IsTakenConcentForm: this.selectedMemberToMigrate.IsTakenConcentForm,
      LastName: this.selectedMemberToMigrate.LastName,
      MedicalCondition: this.selectedMemberToMigrate.MedicalCondition,
      MemberStatus: this.selectedMemberToMigrate.MemberStatus,
      MiddleName: this.selectedMemberToMigrate.MiddleName,
      NotificationEmailAllowed: this.selectedMemberToMigrate.NotificationEmailAllowed,
      ParentClubKey: this.selectedMemberToMigrate.ParentClubKey,
      Password: this.selectedMemberToMigrate.Password,
      PhoneNumber: this.selectedMemberToMigrate.PhoneNumber,
      PromoEmailAllowed: this.selectedMemberToMigrate.PromoEmailAllowed,
      Source: this.selectedMemberToMigrate.Source,
      UpdatedDate: this.selectedMemberToMigrate.UpdatedDate,
      SignedUpType: 1,
      SignUpUnder: this.selectedMemberToMigrate.SignUpUnder,
      //IsHolidayCampMember: false,
    };

    if (this.selectedMemberToMigrate.FamilyMember != undefined) {
      //memberObj["FamilyMember"] = this.selectedMemberToMigrate.FamilyMember;


      memberObj["FamilyMember"] = {};

      this.selectedMemberToMigrate.FamilyMember = this.commonService.convertFbObjectToArray(this.selectedMemberToMigrate.FamilyMember);
      for (let memberIndex = 0; memberIndex < this.selectedMemberToMigrate.FamilyMember.length; memberIndex++) {
        memberObj["FamilyMember"][this.selectedMemberToMigrate.FamilyMember[memberIndex].Key] = {
          ClubKey: this.selectedClub,
          CreateDate: this.selectedMemberToMigrate.FamilyMember[memberIndex].CreateDate,
          DOB: this.selectedMemberToMigrate.FamilyMember[memberIndex].DOB,
          EmailID: this.selectedMemberToMigrate.EmailID,
          EmergencyContactName: this.selectedMemberToMigrate.FamilyMember[memberIndex].EmergencyContactName,
          EmergencyNumber: this.selectedMemberToMigrate.FamilyMember[memberIndex].EmergencyNumber,
          FirstName: this.selectedMemberToMigrate.FamilyMember[memberIndex].FirstName,
          Gender: this.selectedMemberToMigrate.FamilyMember[memberIndex].Gender,
          IsAcceptTermAndCondition: this.selectedMemberToMigrate.FamilyMember[memberIndex].IsAcceptTermAndCondition == undefined ? true : this.selectedMemberToMigrate.FamilyMember[memberIndex].IsAcceptTermAndCondition,
          IsActive: true,
          IsChild: true,
          IsEnable: true,
          IsTakenConcentForm: this.selectedMemberToMigrate.IsTakenConcentForm,
          LastName: this.selectedMemberToMigrate.FamilyMember[memberIndex].LastName,
          MedicalCondition: this.selectedMemberToMigrate.FamilyMember[memberIndex].MedicalCondition,
          MemberStatus: this.selectedMemberToMigrate.FamilyMember[memberIndex].MemberStatus,
          MiddleName: this.selectedMemberToMigrate.FamilyMember[memberIndex].MiddleName == undefined ? "" : this.selectedMemberToMigrate.FamilyMember[memberIndex].MiddleName,
          NotificationEmailAllowed: this.selectedMemberToMigrate.FamilyMember[memberIndex].NotificationEmailAllowed == undefined ? true : this.selectedMemberToMigrate.FamilyMember[memberIndex].NotificationEmailAllowed,
          ParentClubKey: this.selectedMemberToMigrate.FamilyMember[memberIndex].ParentClubKey,
          Password: "",
          PhoneNumber: this.selectedMemberToMigrate.PhoneNumber,
          PromoEmailAllowed: this.selectedMemberToMigrate.FamilyMember[memberIndex].PromoEmailAllowed == undefined,
          Source: this.selectedMemberToMigrate.FamilyMember[memberIndex].Source == undefined ? "" : this.selectedMemberToMigrate.FamilyMember[memberIndex].Source,
          UpdatedDate: this.selectedMemberToMigrate.FamilyMember[memberIndex].UpdatedDate,
          SignedUpType: 1,
          SignUpUnder: this.selectedMemberToMigrate.SignUpUnder,
          ParentKey: this.selectedMemberToMigrate.$key,
        }
      }





    }
    if (this.selectedMemberToMigrate.HolidayCamp != undefined) {
      memberObj["HolidayCamp"] = this.selectedMemberToMigrate.HolidayCamp;
    }
    if (this.selectedMemberToMigrate.SchoolSession != undefined) {
      memberObj["SchoolSession"] = this.selectedMemberToMigrate.SchoolSession;
    }


    // console.log(this.selectedClub);
    // console.log(this.selectedMemberToMigrate);
    // console.log(this.members);
    //console.log(memberObj);

    if (this.selectedMemberToMigrate.SignUpUnder == 3) {
      //making IsEnable and IsActive false in holiday camp member
      this.fb.update(this.selectedMemberToMigrate.$key, "HolidayCampMember/" + this.selectedMemberToMigrate.ParentClubKey, { IsActive: false, IsEnable: false });

      //making IsEnable and IsActive false in holiday camp member
      this.fb.update(this.selectedMemberToMigrate.$key, "/Member/" + this.selectedMemberToMigrate.ParentClubKey + "/" + this.selectedClub, memberObj);
      if (this.selectedMemberToMigrate.ParentClubKey == "-Kd2fSCGOw6K3mvzu-yH" || this.selectedMemberToMigrate.ParentClubKey == "-KhXUETCkqohXhvssWQl") {

        let userTableSubscriber = this.fb.getAllWithQuery("User/Member/", { orderByChild: 'EmailID', equalTo: this.selectedMemberToMigrate.EmailID.toLowerCase() }).subscribe((data) => {
          let datauserinfo = this.commonService.convertFbObjectToArray(data[0].UserInfo);



          let usernifnObj = {
            [(datauserinfo[0].Key)]: {
              ClubKey: "",
              MemberKey: "",
              ParentClubKey: ""
            }
          };


          usernifnObj[datauserinfo[0].Key].ClubKey = this.selectedClub;
          usernifnObj[datauserinfo[0].Key].MemberKey = this.selectedMemberToMigrate.$key;
          usernifnObj[datauserinfo[0].Key].ParentClubKey = this.selectedMemberToMigrate.ParentClubKey;
          this.fb.update(data[0].$key, "User/Member/", { SignedUpType: 1, IsHolidayCampMember: false, UserInfo: usernifnObj });
          userTableSubscriber.unsubscribe();
        });
      } else {
        let userTableSubscriber = this.fb.getAllWithQuery("User/Member/" + this.selectedMemberToMigrate.ParentClubKey, { orderByChild: 'EmailID', equalTo: this.selectedMemberToMigrate.EmailID.toLowerCase() }).subscribe((data) => {
          let userTableSubscriber = this.fb.getAllWithQuery("User/Member/" + this.selectedMemberToMigrate.ParentClubKey, { orderByChild: 'EmailID', equalTo: this.selectedMemberToMigrate.EmailID.toLowerCase() }).subscribe((data) => {
            let datauserinfo = this.commonService.convertFbObjectToArray(data[0].UserInfo);



            let usernifnObj = {
              [(datauserinfo[0].Key)]: {
                ClubKey: "",
                MemberKey: "",
                ParentClubKey: ""
              }
            };


            usernifnObj[datauserinfo[0].Key].ClubKey = this.selectedClub;
            usernifnObj[datauserinfo[0].Key].MemberKey = this.selectedMemberToMigrate.$key;
            usernifnObj[datauserinfo[0].Key].ParentClubKey = this.selectedMemberToMigrate.ParentClubKey;
            this.fb.update(data[0].$key, "User/Member/" + this.selectedMemberToMigrate.ParentClubKey, { SignedUpType: 1, IsHolidayCampMember: false, UserInfo: usernifnObj });
            userTableSubscriber.unsubscribe();
          });
        });
      }
    }

    if (this.selectedMemberToMigrate.FamilyMember != undefined) {
      // memberObj["FamilyMember"] = this.selectedMemberToMigrate.FamilyMember;

      let familyMember = this.selectedMemberToMigrate.FamilyMember;
      for (let i = 0; i < familyMember.length; i++) {
        //making IsEnable and IsActive false in holiday camp member
        this.fb.update(familyMember[i].Key, "HolidayCampMember/" + this.selectedMemberToMigrate.ParentClubKey, { IsActive: false, IsEnable: false });

        // //making IsEnable and IsActive false in holiday camp member
        // this.fb.update(this.selectedMemberToMigrate.$key, "/Member/" + this.selectedMemberToMigrate.ParentClubKey + "/" + this.selectedClub, memberObj);

        let familyuserTableSubscriber = this.fb.getAllWithQuery("/HolidayCampMember/" + this.selectedMemberToMigrate.ParentClubKey, { orderByKey: true, equalTo: familyMember[i].Key }).subscribe((data) => {
          console.log(data);
          let familymemberObj = {
            ClubKey: this.selectedClub,
            CreateDate: data[0].CreateDate,
            DOB: data[0].DOB,
            EmailID: this.selectedMemberToMigrate.EmailID,
            EmergencyContactName: data[0].EmergencyContactName,
            EmergencyNumber: data[0].EmergencyNumber,
            FirstName: data[0].FirstName,
            Gender: data[0].Gender,
            IsAcceptTermAndCondition: data[0].IsAcceptTermAndCondition == undefined ? true : data[0].IsAcceptTermAndCondition,
            IsActive: true,
            IsChild: true,
            IsEnable: true,
            IsTakenConcentForm: this.selectedMemberToMigrate.IsTakenConcentForm,
            LastName: data[0].LastName,
            MedicalCondition: data[0].MedicalCondition,
            MemberStatus: data[0].MemberStatus,
            MiddleName: data[0].MiddleName == undefined ? "" : data[0].MiddleName,
            NotificationEmailAllowed: data[0].NotificationEmailAllowed == undefined ? true : data[0].NotificationEmailAllowed,
            ParentClubKey: data[0].ParentClubKey,
            Password: "",
            PhoneNumber: this.selectedMemberToMigrate.PhoneNumber,
            PromoEmailAllowed: data[0].PromoEmailAllowed == undefined,
            Source: data[0].Source == undefined ? "" : data[0].Source,
            UpdatedDate: data[0].UpdatedDate,
            SignedUpType: 1,
            SignUpUnder: this.selectedMemberToMigrate.SignUpUnder,
            ParentKey: this.selectedMemberToMigrate.$key,

          }
          console.log(familymemberObj);

          if (data[0].HolidayCamp != undefined) {
            familymemberObj["HolidayCamp"] = data[0].HolidayCamp;
          }
          if (data[0].SchoolSession != undefined) {
            familymemberObj["SchoolSession"] = data[0].SchoolSession;
          }

          this.fb.update(data[0].$key, "/Member/" + this.selectedMemberToMigrate.ParentClubKey + "/" + this.selectedClub,
            familymemberObj);
          familyuserTableSubscriber.unsubscribe();
        });
      }



    }

    this.cancelModal();

  }

  cancelModal() {
    let modal = document.getElementById('customModal1');
    let sbar = document.getElementById('customsearchbar');
    //if (event.target == modal) {
    modal.style.display = "none";
    sbar.style.display = "block";
    //}
  }

  showNewPost() {
    this.isShowNewPost = !this.isShowNewPost;
  }
  gotoSendEmailPage(index: number) {
    console.log(this.memberType);
    if (this.memberType != "Member") {

      this.navCtrl.push("EmailforholidaycampandschoolsessionmemberPage", { MemberType: this.memberType });
    } else {
      this.navCtrl.push("Filteremail");
      //this.navCtrl.push("Type2notification");
    }
    
  }
  gotoSendNotification(type:number) {
      this.navCtrl.push("Filternotification");
  }

  ionViewWillLeave() { //unsbscribe all subscription to avoid all unnecessary data leaks
    //The Subscription object also has a closed property that one can use to check if the stream was already unsubscribed (completed or had an error).
    if(this.$MemberSubcriber && !this.$MemberSubcriber.closed){
      this.$MemberSubcriber.unsubscribe();
    }
    if(this.$SchoolMember && !this.$SchoolMember.closed){
      this.$SchoolMember.unsubscribe();
    }
    if(this.$HolidayCampMember && !this.$HolidayCampMember.closed){
      this.$HolidayCampMember.unsubscribe();
    }
    if(this.$FilterMemberSubcriber && !this.$FilterMemberSubcriber.closed){
      this.$FilterMemberSubcriber.unsubscribe();
    }
    if(this.$FilterSchoolMember && !this.$FilterSchoolMember.closed){
      this.$FilterSchoolMember.unsubscribe();
    }
    if(this.$FilterHolidayCampMember && !this.$FilterHolidayCampMember.closed){
      this.$FilterHolidayCampMember.unsubscribe();
    }
    
  }


}
