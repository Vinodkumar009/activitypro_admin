import { Component } from '@angular/core';
import { NavController, PopoverController, LoadingController, ToastController, AlertController, Checkbox } from "ionic-angular";
import { SharedServices } from '../../services/sharedservice';
import { Platform } from 'ionic-angular';
import { FirebaseService } from '../../../services/firebase.service';
import { Storage } from '@ionic/storage';
import { IonicPage } from 'ionic-angular';
import { NavParams } from 'ionic-angular';
import { CommonService, ToastMessageType, ToastPlacement } from '../../../services/common.service';
import gql from 'graphql-tag';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { GraphqlService } from '../../../services/graphql.service';
import { CampUserEnrols, EnrolStatus } from './models/holiday_camp.model';
import { CommonInputTypeDefs_V3 } from '../../../shared/model/common.model';
import { UsersListInput } from '../member/model/member';
//import { UsersModel } from '../../../shared/model/users_list.model';

@IonicPage()
@Component({
  selector: 'addmembertocamp-page',
  templateUrl: 'addmembertocamp.html'
})

export class Type2AddMemberHolidayCamp {

  session_capacity: number = 0;
  selectedSessionId: any
  holidayCampDetails: any
  filteredMembers: UsersModel[] = [];
  totUsers: UsersModel[] = [];
  enrolledMembers: CampUserEnrols[] = [];
  enrolled_count:number = 0;
  updateCampUserEnrolStatusResponse: EnrolStatus;

  userEnrolStatusDTO: UserEnrolStatusDTO = {
    getPaymentDetails: false,
    ActionType: 1,
    AppType: 0,
    camp_postgre_fields: {
      parentclub_id: '',
      camp_id: '',
      enrol_dets: [],
      agreed_camp_terms: []
    },
    parent_firebase_id: '',
    updated_by: ''
  }
  getCampSessionEnrollmentDto: GetCampSessionEnrollmentDto = {
    sessionId: ''
  }

  venus_user_input:UsersListInput = {
    parentclub_id:"",
    club_id:"",
    search_term:"",
    limit:18,
    offset:0,
    member_type:1
  }
  private searchTerms = new Subject<string>();
  themeType: any;
  parentClubKey: string = "";
  campDetails: any;
  sessionDetails = [];
  memberList: UsersModel[] = [];
  allselectedMembersForSessions = [];
  allMembers = [];
  selectedMemberList = [];
  activeSessions = 0;
  campSessions = [];
  campSessionsDateWise = {};
  selectedSessionsForEnrolledDateWise = {};
  limit: number = 18;
  offset: number = 0;
  search_term: string = '';
  allMemebers = [];
  schoolMemberSubscriber: any;

  constructor(public graphqlService: GraphqlService, public comonService: CommonService, private toastCtrl: ToastController,
    public loadingCtrl: LoadingController, public alertCtrl: AlertController,
    private navParams: NavParams, public navCtrl: NavController,
    storage: Storage, public fb: FirebaseService,
    public sharedservice: SharedServices,
    platform: Platform, public popoverCtrl: PopoverController,
  ) {
    this.holidayCampDetails = this.navParams.get('holidayCampDetails');
    this.selectedSessionId = this.navParams.get('selectedSessionId');
    this.session_capacity = this.navParams.get('selectedSessionCapacity');
    storage.get('userObj').then((val) => {
      val = JSON.parse(val);
      if (val.$key != "") {
        this.parentClubKey = val.UserInfo[0].ParentClubKey;
      }
    });
    this.getCampSessionEnrollmentDto.sessionId = this.selectedSessionId
    this.userEnrolStatusDTO.camp_postgre_fields.parentclub_id = this.sharedservice.getPostgreParentClubId();
    this.userEnrolStatusDTO.camp_postgre_fields.camp_id = this.holidayCampDetails.id
    this.venus_user_input.parentclub_id = this.sharedservice.getPostgreParentClubId();
    this.getEnrolledMebers();
    //this.getParentClubUsers(1);
    this.themeType = sharedservice.getThemeType();
    this.sessionDetails = this.navParams.get('Sessions');
    this.searchTerms.pipe(
      //filter(search_term => search_term.length > 2), // Filter out search terms with length less than 2
      debounceTime(400), // Wait for 500ms after the user stops typing
      distinctUntilChanged() // Only emit if the search term has changed
    ).subscribe(search_term => {
      // Call your API here using the term
      this.venus_user_input.offset = 0
      this.venus_user_input.limit = 18;
      
      if(search_term){
        this.venus_user_input.search_term = search_term!='' ? search_term:""; //search_term.replace(/ /g, '')
      }else{
        this.venus_user_input.search_term = '';
      }
      this.getParentClubUsers(2);
    })
  }




  // memberList = [];
  // holidayCampMember = [];
  // schoolMember = [];
  // presentPopover(myEvent) {
  //   let popover = this.popoverCtrl.create("PopoverPage");
  //   popover.present({
  //     ev: myEvent
  //   });
  // }

  getAge(DOB) {
    let age = this.comonService.getAgeFromYYYY_MM(DOB);
    if (isNaN(Number(age))) {
      return "N.A";
    } else {
      return age;
    }
  }

  goToDashboardMenuPage() {
    this.navCtrl.setRoot("Dashboard");
  }

  
  doInfinite(infiniteScroll) {
    this.venus_user_input.offset += this.venus_user_input.limit + 1;
    //this.search_term = "";
    this.venus_user_input.search_term != "" ? this.getParentClubUsers(2) : this.getParentClubUsers(1);
    setTimeout(() => {
      infiniteScroll.complete();
    }, 200);
  }

  // isEnrolled(member) {
  //   return this.enrolledMembers.find(em => em.user.Id === member.Id);
  // }

  isEnrolledAndDisabled(member: any): boolean {
    if (this.enrolledMembers.find(em => em.user.Id === member.Id))
      return true;
    else
      return false;
  }


  getEnrolledMebers() {
    const enroled_query = gql`
  query getCampSessionEnrollments($input: GetCampSessionEnrollmentDto!){
    getCampSessionEnrollments(input:$input){
      id
      user {
        DOB
        Id
        FirstName
        LastName
      }
      amount_pay_status
      passcode
    }
  }
  `;
    this.graphqlService.query(enroled_query, { input: this.getCampSessionEnrollmentDto }, 0)
      .subscribe((res: any) => {
        this.enrolledMembers = res.data.getCampSessionEnrollments;
        this.enrolled_count = this.enrolledMembers.length;
        this.getParentClubUsers(1);
        console.log("ENROLLED MEMBERS:", JSON.stringify(this.enrolledMembers));
      },
      (error) => {
          //this.commonService.hideLoader();
          console.error("Error in fetching:", error);
      })
  }

  updateCampUserEnrolStatus() {
    this.comonService.showLoader("Please wait");
    const enroll_query = gql`
    mutation updateCampUserEnrolStatus($campUserEnrol: UserEnrolStatusDTO!){
    updateCampUserEnrolStatus(campUserEnrol:$campUserEnrol){
      enrol_status
    }
  }
  `;
    this.graphqlService.mutate(enroll_query, { campUserEnrol: this.userEnrolStatusDTO }, 0)
      .subscribe((res: any) => {
        this.comonService.hideLoader();
        this.updateCampUserEnrolStatusResponse = res.data.updateCampUserEnrolStatus;
        console.log("ENROLLED MEMBERS:", JSON.stringify(this.updateCampUserEnrolStatusResponse));
        if (this.updateCampUserEnrolStatusResponse != null) {
          this.comonService.toastMessage("Successfully Enroled the member(s)", 2500, ToastMessageType.Success, ToastPlacement.Bottom);
          this.comonService.updateCategory('update_camps_list') ;
          this.navCtrl.pop();
        } else {
          this.comonService.toastMessage("Enrolment failed", 2500, ToastMessageType.Error)
        }
      },
        (error) => {
          this.comonService.hideLoader();
          console.error("Error in fetching:", error);
        })
  }

  updateMemberList() {
    // Create alert with appropriate message and options
    const alert = this.alertCtrl.create({
      title: 'Add Member',
      message: 'Are you sure you want to add member?',
      buttons: [
        {
          text: 'No',
          handler: () => {
            this.navCtrl.pop();
          }
        },
        {
          text: 'Yes',
          handler: () => {
            this.updateCampUserEnrolStatus();
          }
        }
      ]
    });

    // Present the alert
    alert.present();
  }




  selectedMembers: any[] = [];
  // Array to store selected members
  selectMembers(member:UsersModel,index:number) {
    member.isSelected = !member.isSelected;
    if (this.userEnrolStatusDTO.camp_postgre_fields.enrol_dets.length > 0) {
      const userIndex = this.userEnrolStatusDTO.camp_postgre_fields.enrol_dets.findIndex(enrol_user => enrol_user.member_id === member.Id);
      if (userIndex == -1) { //if user not found then push
        if(this.checkCapacityAvailability()){
          this.enrolled_count++;
          member.isSelected = true;
          this.saveUser(member)
        }else{
          if (member.isSelected){
            member.isSelected = false;
            this.comonService.toastMessage("Group size is full",2500,ToastMessageType.Error,ToastPlacement.Bottom);
            //event.srcEvent.stopPropagation();
            return 
          } 
        }
      }else{
        this.userEnrolStatusDTO.camp_postgre_fields.enrol_dets.splice(userIndex,1);
        member.isSelected = false;
        this.enrolled_count--;
      }
    }else {
      if(this.checkCapacityAvailability()){
        this.enrolled_count++;
        member.isSelected = true;
        this.saveUser(member)
      }else{
        if (member.isSelected){
          member.isSelected = false;
          this.comonService.toastMessage("Group size is full",2500,ToastMessageType.Error,ToastPlacement.Bottom);
          //event.srcEvent.stopPropagation();
          return 
        } 
      }
    }
    // if (this.isEnrolledAndDisabled(member)) {
    //   // this.selectedMembers.push(member);
    //   this.saveUser(member);
    // }
    // if (this.capacity_left <= 0 || this.userEnrolStatusDTO.camp_postgre_fields.enrol_dets.length >= this.selectedSessionCapacity) {
    //   this.comonService.toastMessage("Capacity limit reached", 2500, ToastMessageType.Info, ToastPlacement.Bottom);
    //   return; // Exit the function early
    // }

    // member.isSelected = !member.isSelected;

    // if (member.isSelected) {
    //   this.saveUser(member);
    // } else {
    //   const memberIndex = this.userEnrolStatusDTO.camp_postgre_fields.enrol_dets.findIndex(member => member.member_id === member.member_id)
    //   //const memberIndex = this.selectedMembers.findIndex(m => m === member);
    //   if (memberIndex !== -1) {
    //     this.userEnrolStatusDTO.camp_postgre_fields.enrol_dets.splice(memberIndex, 1);
    //   }
    // }
    // console.log("selectedMembers:", this.userEnrolStatusDTO.camp_postgre_fields.enrol_dets);
  }

  checkCapacityAvailability(){
    if(this.enrolled_count >= this.session_capacity){
      return false;
    }
    return true;
  }

  saveUser(member) {
    // this.userEnrolStatusDTO.camp_postgre_fields.parentclub_id = this.sharedservice.getPostgreParentClubId();
    // this.userEnrolStatusDTO.camp_postgre_fields.camp_id = this.holidayCampDetails.id
    // this.userEnrolStatusDTO.camp_postgre_fields.enrol_dets[member] = [];
    this.userEnrolStatusDTO.camp_postgre_fields.enrol_dets.push({
      session_id: this.selectedSessionId,
      member_id: member.Id,
      is_earlydrop_opted: false,
      is_latepickup_opted: false,
      is_lunch_opted: false,
      is_snacks_opted: false,
    });
  }

 
  getParentClubUsers(type:number) {
    this.allMemebers = [];
    //this.newSelectedMemberArray = [];
    //this.commonService.showLoader("Fetching users...")
    const userQuery = gql`
    query getAllMembersByParentClubNMemberType($list_input:UsersListInput!) {
      getAllMembersByParentClubNMemberType(userInput:$list_input){
            Id
            FirebaseKey,
            FirstName,
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
        this.totUsers = [];
        //this.members = data["getAllMembersByParentClubNMemberType"] as UsersModel[];
        if(data["getAllMembersByParentClubNMemberType"].length > 0){
          this.totUsers = data["getAllMembersByParentClubNMemberType"].map((member: UsersModel) => ({
            ...member,
            isSelected: false,
            isAlreadExisted: false
          }));
        }

        if(type === 2){
          this.filteredMembers = JSON.parse(JSON.stringify(this.totUsers))
        }else{
          this.filteredMembers = [...this.filteredMembers,...JSON.parse(JSON.stringify(this.totUsers))];
        }

       //console.log("Getting Staff Data", this.members);
       if(this.enrolledMembers.length > 0){
        this.checkForExistingUsers();
       }
      }, (err) => {
        this.comonService.toastMessage("Users fetch failed", 3000, ToastMessageType.Error, ToastPlacement.Bottom);
      });
  }


  checkForExistingUsers() {
    this.enrolledMembers.forEach((enrolled_member:CampUserEnrols) => {
      const matchingMember = this.filteredMembers.find((member) => member.Id === enrolled_member.user.Id);
      if (matchingMember) {
        matchingMember['isSelected'] = true;
        matchingMember['isAlreadExisted'] = true;
      }
    });

    this.userEnrolStatusDTO.camp_postgre_fields.enrol_dets.forEach((enrolled_member:CampSessionEnrolDets) => {
      const matchingMember = this.filteredMembers.find((member) => member.Id === enrolled_member.member_id);
      if (matchingMember) {
        matchingMember['isSelected'] = true;
        //matchingMember['isAlreadExisted'] = true;
      }
    });
  }

  getFilterItems(ev: any) {
    this.initializeItems();
    // set val to the value of the searchbar
    let val = ev.target.value;
    const searchTerm = ev.target.value;
    this.searchTerms.next(searchTerm);
    // if the value is an empty string don'
  }


  initializeItems() {
    this.totUsers = this.allMemebers;
  }


  ionViewWillLeave() {
    // if (this.holidaycampMemberSubscriber! = null || this.holidaycampMemberSubscriber != undefined) {
    //   this.holidaycampMemberSubscriber.unsubscriber();
    // }
    // if (this.clubMemberSubscriber! = null || this.clubMemberSubscriber != undefined) {
    //   //this.clubMemberSubscriber.unsubscriber();
    //   this.clubMemberSubscriber.unsubscriber();
    // }
    // if (this.schoolMemberSubscriber! = null || this.schoolMemberSubscriber != undefined) {
    //   // this.schoolMemberSubscriber.unsubscriber();
    //   this.schoolMemberSubscriber.unsubscriber();
    // }
  }
}

export class UserEnrolStatusDTO extends CommonInputTypeDefs_V3 {
  camp_postgre_fields: camp_enrol_id_fields
  getPaymentDetails: boolean
  parent_firebase_id: String
  updated_by: String
}

export class camp_enrol_id_fields {
  parentclub_id: String
  camp_id: String
  enrol_dets: CampSessionEnrolDets[]
  agreed_camp_terms: []
}
export class CampSessionEnrolDets {
  session_id: string
  member_id: string
  is_earlydrop_opted: boolean
  is_latepickup_opted: boolean
  is_lunch_opted: boolean
  is_snacks_opted: boolean
}
export class GetCampSessionEnrollmentDto {
  sessionId: string
}

export class UsersModel {
  isSelect: boolean;
  Id: string
  FirebaseKey: string;
  FirstName: string;
  LastName: string;
  ClubKey: string;
  IsChild: string;
  DOB: string;
  EmailID: string;
  EmergencyContactName: string;
  EmergencyNumber: string;
  Gender: string;
  MedicalCondition: string;
  ParentClubKey: string;
  ParentKey: string;
  PhoneNumber: string;
  IsEnable: string;
  IsActive: string;
  IsDisabled: string;
  isSelected?:boolean;
  isAlreadExisted?:boolean;
  //Source
}