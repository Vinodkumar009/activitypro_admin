import { Component } from '@angular/core';
import { LoadingController, NavController, NavParams, ViewController, AlertController, Checkbox } from 'ionic-angular';
import { PopoverController } from 'ionic-angular';
import { SharedServices } from '../../services/sharedservice';
import { FirebaseService } from '../../../services/firebase.service';
import { IonicPage } from 'ionic-angular';
import { CommonService, ToastMessageType, ToastPlacement } from '../../../services/common.service';
import gql from 'graphql-tag';
import { Storage } from "@ionic/storage";
import { GraphqlService } from '../../../services/graphql.service';
//import { UserModel } from '../match/models/match.model';
import { ISession_MemberEnrols, SchoolDetails } from './schoolsession.model';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { UsersModel } from '../../../shared/model/users_list.model';
import { UsersListInput } from '../member/model/member';
@IonicPage()
@Component({
  selector: 'addmembertoschoolsession-page',
  templateUrl: 'addmembertoschoolsession.html',
})

export class Type2AddMemberSchoolSession {
  private searchTerms = new Subject<string>();
  schoolSession: SchoolDetails;
  themeType: number;
  loading: any;
  clubs = [];
  members:UsersModel[]=[];
  filteredMembers:UsersModel[]=[];
  parentClubKey = '';
  allMemebers = [];
  // OldSessionDetails: any;
  selectedMembersForTheSession = [];
  newSelectedMemberArray = [];

  schoolSessionForMember = {
    AmountDue: "0.00",
    AmountPaid: "0.00",
    ActivityCategoryKey: '',
    ActivityKey: '',
    ActivitySubCategoryKey: '',
    AmountPayStatus: "Due",
    AutoEnrolment: true,
    BookingButtonText: '',
    ClubKey: '',
    CoachKey: '',
    CoachName: '',
    Comments: '',
    CreatedBy: '',
    CreatedDate: 0,
    Days: '',
    Duration: '',
    EndDate: '',
    FinancialYearKey: '',
    GroupSize: '',
    IsActive: true,
    IsExistActivityCategory: false,
    IsExistActivitySubCategory: false,
    Key: '',
    NumberOfWeeks: 0,
    ParentClubKey: '',
    PayByDate: '',
    PaymentType: '',
    ReserveButtonText: '',
    SchoolKey: '',
    SchoolName: '',
    SessionFee: '',
    SessionName: '',
    SessionType: '',
    StartDate: '',
    StartTime: '',
    TermKey: '',
    UpdatedBy: '',
    UpdatedDate: 0,
    AllowChildCare: true
  };
  
  venus_user_input:UsersListInput = {
    parentclub_id:"",
    club_id:"",
    search_term:"",
    limit:18,
    offset:0,
    member_type:1
  }
  schoolSesEnrolDets: SchoolSesEnrolDets = {
    ParentClubKey: '',
    ClubKey: '',
    MemberKey: '',
    AppType: 0,
    ActionType: 0,
    DeviceType: 0,
    get_payments: false,
    school_session_id: '',
    parent_fireabse_id: '',
    updated_by: '',
    enrol_users: []
  }

  constructor(public commonService: CommonService, private alertCtrl: AlertController, public storage: Storage,
    public loadingCtrl: LoadingController,private graphqlService: GraphqlService,
    public fb: FirebaseService,
    public navParams: NavParams, public navCtrl: NavController,
    public sharedservice: SharedServices,
    public popoverCtrl: PopoverController) {
    this.themeType = this.sharedservice.getThemeType();
    this.schoolSession = <SchoolDetails>this.navParams.get('SchoolSession');

    //console.log("school session data is:", this.schoolSession);
    
    this.storage.get("userObj").then((val) => {
      val = JSON.parse(val);
      if (val.$key != "") {
        this.parentClubKey = val.UserInfo[0].ParentClubKey; //firebase parentclubid
        this.schoolSesEnrolDets.ParentClubKey = val.UserInfo[0].ParentClubKey;
        this.schoolSesEnrolDets.school_session_id = this.schoolSession.id;
        this.schoolSesEnrolDets.updated_by = val.$key;
        this.venus_user_input.parentclub_id = this.sharedservice.getPostgreParentClubId();
      //  this.schoolSesEnrolDets.MemberKey = val.$key;
        this.getParentClubUsers(1)//first time call to get users
        //this.getClubList();
      }
    });

    this.searchTerms.pipe(
      //filter(search_term => search_term.length > 2), // Filter out search terms with length less than 2
      debounceTime(400), // Wait for 500ms after the user stops typing
      distinctUntilChanged() // Only emit if the search term has changed
    ).subscribe(search_term => {
      // Call your API here using the term
      this.venus_user_input.offset = 0
      this.venus_user_input.limit = 18;
      
      if(search_term){
        this.venus_user_input.search_term = search_term!='' ? search_term:"";
      }else{
        this.venus_user_input.search_term = '';
      }
      this.getParentClubUsers(2);
    });

    this.newSelectedMemberArray = [];
    
   
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

  getClubList() {
    // this.fb.getAllWithQuery("/Club/Type2/" + this.parentClubKey, { orderByChild: 'IsActive', equalTo: true }).subscribe((data) => {
    //   this.clubs = this.commonService.convertFbObjectToArray(data);
    //   this.getMemberListsForEdit();
    // });
    //console.table(this.selectedMembersForTheSession);
  }

  doInfinite(infiniteScroll) {
    this.venus_user_input.offset += this.venus_user_input.limit + 1;
    //this.search_term = "";
    this.getParentClubUsers(1);
    setTimeout(() => {
      infiniteScroll.complete();
    }, 200);
  }

  getParentClubUsers = (type:number) => {
    this.allMemebers = [];
    //this.commonService.showLoader("Please wait");
    console.log("time started")
    console.time();
    const userQuery = gql`
    query getAllMembersByParentClubNMemberType($list_input:UsersListInput!) {
      getAllMembersByParentClubNMemberType(userInput:$list_input){
            Id
            FirebaseKey
            FirstName
            LastName
            ClubKey
            IsChild
            DOB
            EmailID
            EmergencyContactName
            EmergencyNumber
            Gender
            MedicalCondition
            ParentClubKey
            ParentKey
            PhoneNumber
            IsEnable
            IsActive
            PromoEmailAllowed
      }
    }
  `;
    this.graphqlService.query(userQuery,{list_input:this.venus_user_input},0)
      .subscribe(({ data }) => {
        console.timeEnd();
        console.log("time ended")
        console.log("member data" + JSON.stringify(data["getAllMembersByParentClubNMemberType"]));
        this.members =[];
        //this.members = data["getAllMembersByParentClubNMemberType"] as UsersModel[];
        if(data["getAllMembersByParentClubNMemberType"].length > 0){
          this.members = data["getAllMembersByParentClubNMemberType"].map((member: UsersModel) => ({
            ...member,
            isSelected: false,
            isAlreadExisted: false
          }));
        }
       
        if(type === 2){
          this.filteredMembers = JSON.parse(JSON.stringify(this.members))
        }else{
          this.filteredMembers = [...this.filteredMembers,...JSON.parse(JSON.stringify(this.members))];
        }
       // console.log("Getting Staff Data", this.members);
        this.checkForExistingUsers();
        //this.commonService.hideLoader();
      }, (err) => {
        this.commonService.toastMessage("Users fetch failed", 3000, ToastMessageType.Error, ToastPlacement.Bottom);
      });

  }

  //find existing users in sessions and make them disable
  checkForExistingUsers() {
    this.schoolSession.session_member.forEach((enrolled_member:ISession_MemberEnrols) => {
      const matchingMember = this.filteredMembers.find((member) => member.Id === enrolled_member.member.Id);
      if (matchingMember) {
        matchingMember['isSelected'] = true;
        matchingMember['isAlreadExisted'] = true;
      }
    });
    this.schoolSesEnrolDets.enrol_users.forEach((enrolled_member) => {
      const matchingMember = this.filteredMembers.find((member) => member.Id === enrolled_member);
      if (matchingMember) {
        matchingMember['isSelected'] = true;
        //matchingMember['isAlreadExisted'] = true;
      }
    });
    console.table(this.filteredMembers);
  }

  //when member selected or deselected
  toggleMember(member:UserModel,cbox:Checkbox){
    // let isPresent = false;
    if (this.schoolSesEnrolDets.enrol_users.length > 0) {
      const userIndex = this.schoolSesEnrolDets.enrol_users.findIndex(userId => userId === member.Id);
      if (userIndex == -1) { //if user not found then push
        if(this.checkCapacityAvailability()){
          this.schoolSession.capacity_left--;
          this.schoolSesEnrolDets.enrol_users.push(member.Id)
        }else{
          if (cbox.checked){
            cbox.checked = false;
            this.commonService.toastMessage("Group size is full",2500,ToastMessageType.Error,ToastPlacement.Bottom);
            //event.srcEvent.stopPropagation();
            return 
          } 
        }
      }else{
        this.schoolSesEnrolDets.enrol_users.splice(userIndex,1);
        this.schoolSession.capacity_left++;
      }
    }
    else if(this.schoolSesEnrolDets.enrol_users.length == 0) {
      if(this.checkCapacityAvailability()){
        this.schoolSession.capacity_left--;
        this.schoolSesEnrolDets.enrol_users.push(member.Id)
      }else{
        if (cbox.checked){
          cbox.checked = false;
          this.commonService.toastMessage("Group size is full",2500,ToastMessageType.Error,ToastPlacement.Bottom);
          //event.srcEvent.stopPropagation();
          return 
        } 
      }
    }
  }

  //check capacity available or not
  checkCapacityAvailability(){
    if(this.schoolSession.capacity_left > 0){
      return true;
    }
    return false;
  }


 
  updateMemberList() {
    let confirm = this.alertCtrl.create({
      title: 'Add Member',
      message: 'Are you sure you want to add member?',
      buttons: [
        {
          text: 'No',
          handler: () => {
            console.log('Disagree clicked');
          }
        },
        {
          text: 'Yes',
          handler: () => {
           this.saveMember();
          }
        }
      ]
    });
    confirm.present();

  }

  
  initializeItems() {
    this.members = this.allMemebers;
  }

  getFilterItems(ev: any) {
    // Reset items back to all of the items
    this.initializeItems();
    // set val to the value of the searchbar
    let val = ev.target.value;
    const searchTerm = ev.target.value;
    this.searchTerms.next(searchTerm);
    // if the value is an empty string don't filter the items
    
  }


  
  update(member) {
    this.navCtrl.push("UpdatePaymentDetails", { SelectedMember: member, SessionDetails: this.schoolSession });
  }

  //Add member in school-session
  saveMember() {
    this.commonService.showLoader("Please wait");
    this.schoolSesEnrolDets.get_payments = false;
    this.schoolSesEnrolDets.ActionType = 1;
    this.schoolSesEnrolDets.AppType = 1;
   
    console.log(JSON.stringify(this.schoolSesEnrolDets));

    const add_member_to_school = gql`
    mutation updateSchoolSesUserEnrolStatus($session_enrol_members: SchoolSesEnrolDets!) {
      updateSchoolSesUserEnrolStatus(session_enrol_members: $session_enrol_members){
        status
        enrolled_ids
      }
    }` 
    
    const variables = {session_enrol_members:this.schoolSesEnrolDets}

    this.graphqlService.mutate(add_member_to_school,variables,0).subscribe(
      result => {
        this.commonService.hideLoader();
        // Handle the result
        //console.log(`member__res:${result}`);
        this.commonService.toastMessage( "Members  added successfully",2500,ToastMessageType.Success,ToastPlacement.Bottom);
        this.commonService.updateCategory("update_scl_session_list");
        this.navCtrl.pop();
      },
      error => {
        // Handle errors
        this.commonService.hideLoader();
        console.error(error);
        this.commonService.toastMessage("Player Addition failed",2500,ToastMessageType.Error,ToastPlacement.Bottom);
      }
    );
   
  }

  
}




export class SchoolSesEnrolDets {
  ParentClubKey: string
  ClubKey: string
  MemberKey: string
  AppType: number
  ActionType: number
  DeviceType: number
  get_payments: boolean
  school_session_id: string
  parent_fireabse_id: string
  enrol_users: string[]
  updated_by: string
}

export class UserModel {
  Id: string;
  Name: string;

  Gender: string;
  DOB: string;
  FirebaseKey: string;
}