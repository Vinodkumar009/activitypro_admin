import { Component, ElementRef, Renderer2,ViewChild } from '@angular/core';
import { Platform, ActionSheetController, LoadingController, ToastController, NavController, NavParams, Checkbox } from 'ionic-angular';
import { PopoverController } from 'ionic-angular';
import { SharedServices } from '../../services/sharedservice';
import * as moment from 'moment';
import { FirebaseService } from '../../../services/firebase.service';
import { AlertController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { IonicPage } from 'ionic-angular';
import { CommonService, ToastMessageType, ToastPlacement } from '../../../services/common.service';
import gql from 'graphql-tag';
import { debounceTime, distinctUntilChanged, filter } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { UsersModel } from '../holidaycamp/addmembertocamp';
import { GraphqlService } from '../../../services/graphql.service';
import { MonthlySessionMember,SessionMonths } from './monthlysession/model/monthly_session.model';
import { MonthlySessionEnrolInput, enrol_info } from './monthlysession/model/monthly_session_enrol.model';
import { user_status_update_v1 } from './model/session.model';
import { UsersListInput } from '../member/model/member';
import { Content } from 'ionic-angular';


@IonicPage()
@Component({
  selector: 'editmembershipsession-page',
  templateUrl: 'editmembershipsession.html'
})

export class Type2EditMembershipSession {
  @ViewChild(Content) content: Content;
  shouldShowCancel:boolean = false;
  memberSize = 0; //added by vinod for while enrolling check the session size capacity 
  themeType: number;
  
  startTime: any = 10;
  duration: any = 2;
  musicAlertOpts: { title: string, subTitle: string };
  //
  //variables declarations
  //
  modal: any;
  parentClubKey: any;
  clubKey: any;
  CoachKey: any;
  SessionKey: any;
  members:UsersModel[]=[];
  filteredMembers:UsersModel[]=[];
  allMemebers = [];
  selectedMembersForTheSession = [];
  SessionName: any;
  sessionMonths = [];
  updated_by:string = "";
  
  session_id:string = '';
  enrol_input:MonthlySessionEnrolInput = {
    session_postgre_fields: {
      monthly_session_id:""
    },
    user_device_metadata:{ UserActionType:1 }, //1
    enroll_users:[],
    updated_by:""
  };
  session_months:SessionMonths[] = [];
  monthly_enrolled_users:MonthlySessionMember[] = [];
  term_ses_user_update:user_status_update_v1 = {
    user_device_metadata:{
      UserAppType:0,
      UserDeviceType:this.sharedservice.getPlatform() == "android" ? 1:2
    },
    user_postgre_metadata:{
      UserMemberId:this.sharedservice.getLoggedInId(),
    },
    session_id: "", 
    enrol_users:[],
    action_type: 1, // 1 for enrol, 0 for unenrol
    updated_by: "",
    //parent_fireabse_id:"",
    get_payments: false
  };
  private searchTerms = new Subject<string>();
  type:number;
  session_days:{
    status: 0,
    day: string,
    is_selected:boolean
    day_short_name:string
  }[] = [];
  selectedMonthIndex = -1;
  selectedDayForMonthlySession = "";
  capacity_left:number;
  session_members:string[] = []; //for term sessions;
  venus_user_input:UsersListInput = {
    parentclub_id:"",
    club_id:"",
    search_term:"",
    member_type:1,
    limit:18,
    offset:0,
  }
  constructor(public commonService: CommonService,
      public platform: Platform, public actionSheetCtrl: ActionSheetController,
      public loadingCtrl: LoadingController, private alertCtrl: AlertController,
       public fb: FirebaseService, public navParams: NavParams, public navCtrl: NavController, 
       public sharedservice: SharedServices, 
      public popoverCtrl: PopoverController,public storage: Storage,
      private graphqlService: GraphqlService,
      private renderer: Renderer2, private elementRef: ElementRef
    ) {
    
    this.themeType = sharedservice.getThemeType();
    this.session_id = navParams.get('session_id');
    this.term_ses_user_update.session_id = this.session_id;
    this.venus_user_input.parentclub_id = this.sharedservice.getPostgreParentClubId();
    this.searchTerms.pipe(
      //filter(search_term => search_term.length > 2), // Filter out search terms with length less than 2
      debounceTime(400), // Wait for 500ms after the user stops typing
      distinctUntilChanged() // Only emit if the search term has changed
    ).subscribe(search_term => {
      // Call your API here using the term
      this.venus_user_input.offset = 0;
      this.venus_user_input.limit = 18;
      
      if(search_term){
        this.venus_user_input.search_term = search_term!='' ? search_term:"";
      }else{
        this.venus_user_input.search_term = '';
      }
      this.getParentClubUsers(2);
    });
  }

  getSessionDays(){
    const days  = this.navParams.get("session_days");
    this.session_days = days.map(item => {
      return {
        ...item,
        is_selected: false,
        day_short_name: item.day.charAt(0)
      };
    });
    this.session_months = this.session_months.map(item => {
      return {
        ...item,
        is_selected:item.status == 1 ? true:false,
      };
    });
  }

  ionViewDidLoad() {
  
  }


  ionViewWillEnter(){
    this.type = this.navParams.get('type'); //to know wheather it's term_session or monthly_session
    this.capacity_left = this.navParams.get('capacity_left');
    this.storage.get('userObj').then((val) => {
      val = JSON.parse(val);
      if (val.$key != "") {
        this.updated_by = val.$key;
        this.term_ses_user_update.updated_by = val.$key;
        this.enrol_input.updated_by = val.$key;
        this.parentClubKey = val.UserInfo[0].ParentClubKey;
        if(this.type ===101){
          this.session_months = this.navParams.get('session_months');
          this.enrol_input.session_postgre_fields.monthly_session_id = this.session_id;
          this.getSessionDays();
          this.getEnrolledMembers();
        }else{
          this.session_members = this.navParams.get("session_members");
          this.getParentClubUsers(1);
        }
      }
    })
    this.members = [];
    this.filteredMembers = [];
  }
  
  selectSessionDays(index) {
    this.session_days[index].is_selected = !this.session_days[index].is_selected;
    this.selectedDayForMonthlySession = "";
    for (let i = 0; i < this.session_days.length; i++) {
      if (this.session_days[i].is_selected) {
        if (this.selectedDayForMonthlySession == "") {
          this.selectedDayForMonthlySession = this.session_days[i].day;
        } else {
          this.selectedDayForMonthlySession += "," + this.session_days[i].day;
        }
      }
    }
  }

  //infinite scroll when want to load more users
  doInfinite(infiniteScroll) {
    this.venus_user_input.offset += this.venus_user_input.limit + 1;
    //this.search_term = "";
    this.getParentClubUsers(1);
    setTimeout(() => {
      infiniteScroll.complete();
    }, 200);
  }


  getEnrolledMembers = () => {
    const get_enrols_input = {
      user_device_metadata:{
          UserAppType:0,
          UserDeviceType:this.sharedservice.getPlatform() == "android" ? 1:2
      },
      session_postgre_fields:{
          parentclub_id:this.sharedservice.getPostgreParentClubId(),
          monthly_session_id:this.session_id
      },
      user_postgre_metadata:{
        UserMemberId: this.updated_by
      }
    }
    // subscription_id
    // subscribed_date
    // last_payment_day
    // trial_days
    //plan
    const userQuery = gql`
    query getAllMonthlySessionEnrolledMember($getEnrols:MonthlySessionMemberInput!) {
      getAllMonthlySessionEnrolledMember(sessionMemberInput:$getEnrols){
        id
        start_month
        user {
          Id
          FirstName
          LastName
        }
        session {
          id
        }
      }
    }
  `;
    this.graphqlService.query(userQuery,{getEnrols:get_enrols_input},0)
      .subscribe(({ data }) => {
        console.log("member data" + JSON.stringify(data["getAllMonthlySessionEnrolledMember"]));
        this.monthly_enrolled_users = data["getAllMonthlySessionEnrolledMember"] as MonthlySessionMember[];
        this.getParentClubUsers(1);
      }, (err) => {
        this.commonService.toastMessage("Users fetch failed", 3000, ToastMessageType.Error, ToastPlacement.Bottom);
    });
  }


  getParentClubUsers = (type:number) => {
    this.allMemebers = [];
    //this.commonService.showLoader("Please wait");
    console.time();
    const userQuery = gql`
    query getAllMembersByParentClubNMemberType($list_input: UsersListInput!) {
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
    this.graphqlService.query(
        userQuery,
        {list_input:this.venus_user_input},
        0
      )
      .subscribe(({ data }) => {
        console.log("member data" + JSON.stringify(data["getAllMembersByParentClubNMemberType"]));
        //this.members = data["getAllMembersByParentClubNMemberType"] as UsersModel[];
        this.members =[];
        if(data["getAllMembersByParentClubNMemberType"].length > 0){
          this.members = data["getAllMembersByParentClubNMemberType"].map((member: UsersModel) => ({
            ...member,
            isSelected: false,
            isAlreadyExisted: false,
          }));
        }

        if(type === 2){
          this.filteredMembers = JSON.parse(JSON.stringify(this.members))
        }else{
          this.filteredMembers = [...this.filteredMembers,...JSON.parse(JSON.stringify(this.members))];
        }

        this.checkForExistingUsers();
        //this.commonService.hideLoader();
      }, (err) => {
        this.commonService.toastMessage("Users fetch failed", 3000, ToastMessageType.Error, ToastPlacement.Bottom);
      });
  }

  //find existing users in sessions and make them disable
  checkForExistingUsers(){
    if(this.type === 101){//MonthlySelectUsersForEnrol
      this.monthly_enrolled_users.forEach((enrolled_member:MonthlySessionMember) => {
        const matchingMember = this.filteredMembers.find((member) => member.Id === enrolled_member.user.Id);
        if (matchingMember) {
          matchingMember['isSelected'] = true;
          matchingMember['isAlreadyExisted'] = true;
        }
      });
      this.enrol_input.enroll_users.forEach((enrolled_member:enrol_info) => {
        const matchingMember = this.filteredMembers.find((member) => member.Id === enrolled_member.member_id);
        if (matchingMember) {
          matchingMember['isSelected'] = true;
          //matchingMember['isAlreadyExisted'] = true;
        }
      });
    }else{ //term session
      this.session_members.forEach((enrolled_member_id) => {
        const matchingMember = this.filteredMembers.find((member) => member.Id === enrolled_member_id);
        if (matchingMember) {
          matchingMember['isSelected'] = true;
          matchingMember['isAlreadyExisted'] = true;
        }
      });
      this.term_ses_user_update.enrol_users.forEach((enrolled_member) => {
        const matchingMember = this.filteredMembers.find((member) => member.Id === enrolled_member.member_id);
        if (matchingMember) {
          matchingMember['isSelected'] = true;
          //matchingMember['isAlreadyExisted'] = true;
        }
      });
    }
    console.table(this.filteredMembers);
  }

  
  selectMonth(index) {
    const presentMon_Year = moment();
      this.selectedMonthIndex = this.selectedMonthIndex == index ? -1 : index;
      for (let i = 0; i < this.session_months.length; i++) {
        this.session_months[i].is_selected = false;
        if (i >= this.selectedMonthIndex && this.selectedMonthIndex != -1) {
          this.session_months[i].is_selected = true;
        }
      }
      for (let j = 0; j < this.session_days.length; j++) {
        this.session_days[j].is_selected = true;
      }
      
      this.selectedDayForMonthlySession = "";
      for (let i = 0; i < this.session_days.length; i++) {
        if (this.session_days[i].is_selected) {
          if (this.selectedDayForMonthlySession == "") {
            this.selectedDayForMonthlySession = this.session_days[i].day;
          } else {
            this.selectedDayForMonthlySession += "," + this.session_days[i].day;
          }
        }
      }
  }

   getFilterItems(ev: any) {
    // Reset items back to all of the items
    this.initializeItems();
    // set val to the value of the searchbar
    let val = ev.target.value;
    const searchTerm = ev.target.value;
    this.searchTerms.next(searchTerm);
  }


  presentPopover(myEvent) {
    let popover = this.popoverCtrl.create("PopoverPage");
    popover.present({
      ev: myEvent
    });
  }

  //selecting or unselecting members
  selecteMembers(member:UsersModel,cbox:Checkbox) {
    if(this.type === 101){ //monthly session validation
      let isPresent = false;
      if (this.enrol_input.enroll_users.length > 0) {
        const userIndex = this.enrol_input.enroll_users.findIndex(user => user.member_id === member.Id);
        if (userIndex == -1) { //if user not found then push
          if(this.checkGroupSize()){
            this.capacity_left--;
            this.MonthlySelectUsersForEnrol(member);
          }else{
            if (cbox.checked){
              cbox.checked = false;
              this.commonService.toastMessage("Group size is full, Please increase the capacity",2500,ToastMessageType.Error,ToastPlacement.Bottom);
              //event.srcEvent.stopPropagation();
              return 
            } 
          }
        }else{
          this.enrol_input.enroll_users.splice(userIndex,1);
          this.capacity_left++;
        }
      }
      else if(this.enrol_input.enroll_users.length == 0) {
        if(this.checkGroupSize()){
          this.capacity_left--;
          this.MonthlySelectUsersForEnrol(member);
        }else{
          if (cbox.checked){
            cbox.checked = false;
            this.commonService.toastMessage("Group size is full, Please increase the capacity",2500,ToastMessageType.Error,ToastPlacement.Bottom);
            //event.srcEvent.stopPropagation();
            return 
          } 
        }
      }
    }else{ //term session validation
      let isPresent = false;
      if (this.term_ses_user_update.enrol_users.length > 0) {
        const userIndex = this.term_ses_user_update.enrol_users.findIndex(user => user.member_id === member.Id);
        if (userIndex == -1) { //if user not found then push
          if(this.checkGroupSize()){
            this.term_ses_user_update.enrol_users.push({
              member_id:member.Id,
              is_amended:false,
              amount_due:'0.00'
            });
          }else{
            if (cbox.checked){
              cbox.checked = false;
              this.commonService.toastMessage("Group size is full, Please increase the capacity",2500,ToastMessageType.Error,ToastPlacement.Bottom);
              //event.srcEvent.stopPropagation();
              return 
            } 
          }
        }else{
          this.term_ses_user_update.enrol_users.splice(userIndex,1);
          this.capacity_left++;
        }
      }
      else if(this.enrol_input.enroll_users.length == 0) {
        if(this.checkGroupSize()){
          this.capacity_left--;
          this.term_ses_user_update.enrol_users.push({
            member_id:member.Id,
            is_amended:false,
            amount_due:'0.00'
          });
        }else{
          if (cbox.checked){
            cbox.checked = false;
            this.commonService.toastMessage("Group size is full, Please increase the capacity",2500,ToastMessageType.Error,ToastPlacement.Bottom);
            //event.srcEvent.stopPropagation();
            return 
          } 
        }
      }
    } 
  }

  //monthly session enrol user insert
  MonthlySelectUsersForEnrol(member:UsersModel){
    this.enrol_input.enroll_users.push({
      member_id:member.Id,
      subscription_date: "",
      subscription_status:1,
      enrolled_days: this.selectedDayForMonthlySession,
      enrolled_date: moment().format("DD-MMM-YYYY"),//"DD-MMM-2024" not required for enrol
      is_active: true
    })
  }

  checkGroupSize(){
    switch(Number(this.type)){
      case 100:{
        return this.capacity_left > 0 ? true : false;
        break;
      }
      case 101:{
        return this.capacity_left > 0 ? true : false;
        break;
      }
      case 102:{
        // if(this.OldSessionDetails.ApplyCapacityRestriction) {
        //   return this.memberSize >= Number(this.OldSessionDetails.Capacity) ? false : true;
        // }else{
        //     return true;
        // }
        // break;
      }
      default:{
        return true;
      }
    }
  }
  

  updateMemberList() {
    console.clear();
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
            if(this.type === 101){
              this.modal = document.getElementById('myModal');
              const modalElement = this.elementRef.nativeElement.querySelector('.modal');
              // const viewportHeight = window.innerHeight;
              // const modalHeight = modalElement.scrollHeight;
              // const topPosition = `calc(10% + ${window.scrollY}px)`;
              this.renderer.setStyle(modalElement, 'display', 'block');
              //this.renderer.setStyle(modalElement, 'top', topPosition);
              //this.renderer.setStyle(modalElement, 'transform', 'translateY(-30%)');
              //this.modal.style.display = "block";
            }else{//term or school session enrol
              this.updateMemberListForGroup();
            }
          }
        }
      ]
    });
    confirm.present();

  }

  


  initializeItems() {
    this.members = this.allMemebers;
  }

  goToDashboardMenuPage() {
    this.navCtrl.setRoot("Dashboard");
  }

  confirmAlert() {
      let confirm = this.alertCtrl.create({
        subTitle: "Notification",
        message: 'Do you want to send a notification to the added member?',
        buttons: [
          {
            text: 'No',
            handler: () => {
              let message = "Member(s) for the session updated successfully...";
              this.commonService.toastMessage(message,2000,ToastMessageType.Success,ToastPlacement.Bottom);
              //this.commonService.updateCategory("sessions");
              //this.navCtrl.pop();
              this.navCtrl.pop();
            }
          },
          {
            text: 'Yes',
            handler: () => {
              this.gotoNotify();
            }
          }
        ]
      });
      confirm.present();
  }

  gotoNotify(){
    let ClubName = "";
    // for (let i = 0; i < this.clubs.length; i++) {
    //   if (this.clubs[i].Key == this.sessionDetailsObj.ClubKey) {
    //     ClubName = this.clubs[i].ClubName;
    //   }
    // }
    // let message = "Member(s) for the session updated successfully...";
    // this.commonService.toastMessage(message,2000,ToastMessageType.Success,ToastPlacement.Bottom);
    // this.navCtrl.push("Type2MemberEnrolementToActivitiesNotification", {
    //   ClubName: ClubName,
    //   MemberDetails: this.newSelectedMemberArray,
    //   SessionDetails: this.sessionDetailsObj,
    //   Purpose: "MemberEnrollementToSession"
    // });
  }

  saveMember() {
    // this.commonService.showLoader("Please wait");
  }

  updateMemberListForGroup(){
    if(this.term_ses_user_update.enrol_users.length > 0){
      this.commonService.showLoader("Please wait");
      const enrol_ses_mutation = gql`
      mutation updateMembersEnrolStaus($enrolInput: TermSesEnrolDets!) {
        updateMembersEnrolStaus(session_enrol_members: $enrolInput){
            status
            enrolled_ids
        }
      }` 
      
      const enrol_mutation_variable = { enrolInput: this.term_ses_user_update };
      this.graphqlService.mutate(
        enrol_ses_mutation, 
        enrol_mutation_variable,
        0
      ).subscribe((response)=>{
        this.commonService.hideLoader();
        const message = "Users enrolled successfully";
        this.commonService.toastMessage(message, 2500, ToastMessageType.Success,ToastPlacement.Bottom);
        this.navCtrl.pop();
        this.commonService.updateCategory("update_session_list");
      },(err)=>{
        this.commonService.hideLoader();
        this.commonService.toastMessage("User(s) enrolment failed",2500,ToastMessageType.Error,ToastPlacement.Bottom);
      });         
    }else{
      this.commonService.toastMessage("Please select atleast one member", 2500, ToastMessageType.Error);
      return;
    }
  }

  //monthly session member enrolment in postgre
  enrolMembersPostgreMonthly(){
    if (this.addMemberMonthlySessionValidation()) {
      if (this.enrol_input.enroll_users.length > 0) {
        // this.modal = document.getElementById('myModal');
        // this.modal.style.display = "none";
        const modalElement = this.elementRef.nativeElement.querySelector('.modal');
        this.renderer.setStyle(modalElement, 'display', 'none');
        this.commonService.showLoader("Please wait");
        const selected_date = this.session_months[this.selectedMonthIndex].month
        this.enrol_input.enroll_users.forEach((user) => {
          user.subscription_date = selected_date,
          user.enrolled_days = this.selectedDayForMonthlySession
        });
        const enrol_ses_mutation = gql`
        mutation updateMonthlyUserEnrolStatus($enrolInput: MonthlySessionMemberEnrollInput!) {
          updateMonthlyUserEnrolStatus(session_enrol_members: $enrolInput){
                id
          }
        }` 
        
        const enrol_mutation_variable = { enrolInput: this.enrol_input };
          this.graphqlService.mutate(
            enrol_ses_mutation, 
            enrol_mutation_variable,
            0
          ).subscribe((response)=>{
            this.commonService.hideLoader();
            const message = "Users enrolled successfully";
            this.commonService.toastMessage(message, 2500, ToastMessageType.Success,ToastPlacement.Bottom);
            this.navCtrl.pop();
            this.commonService.updateCategory("update_session_list");
          },(err)=>{
            this.commonService.hideLoader();
            this.commonService.toastMessage("User(s) enrolment failed",2500,ToastMessageType.Error,ToastPlacement.Bottom);
          }); 
      }else {
        let message = "Please select atleast one member...";
        this.commonService.toastMessage(message, 2500,ToastMessageType.Error);
      }
    }
    
  }

  cancelSessionCreation() {
    //this.modal.style.display = "none";
    const modalElement = this.elementRef.nativeElement.querySelector('.modal');
    this.renderer.setStyle(modalElement, 'display', 'none');
  }
  
  


  addMemberMonthlySessionValidation() {
    let isSelectedMonth = false;
    let isSelectedDay = false;
    for (let sessionMonthIndex = 0; sessionMonthIndex < this.session_months.length; sessionMonthIndex++) {
      if (this.session_months[sessionMonthIndex].is_selected) {
        isSelectedMonth = true;
        break;
      }
    }
    for (let selectSessionDaysIndex = 0; selectSessionDaysIndex < this.session_days.length; selectSessionDaysIndex++) {
      if (this.session_days[selectSessionDaysIndex].is_selected) {
        isSelectedDay = true;
        break;
      }
    }

    if (!isSelectedMonth) {
      let message = "Please select starting month";
      this.commonService.toastMessage(message, 2500,ToastMessageType.Error);
      return false;
    } else if (!isSelectedDay) {
      let message = "Please select a day";
      this.commonService.toastMessage(message, 2500,ToastMessageType.Error);
      return false;
    } else {
      return true;
    }

  }


  //this is added for weeklysession to know member node already existed or not
  


  //Adding a weeklysession
  

}


