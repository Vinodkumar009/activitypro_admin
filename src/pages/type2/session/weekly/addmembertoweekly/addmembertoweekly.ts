import { Component } from '@angular/core';
import { Checkbox, IonicPage, NavController, NavParams, PopoverController } from 'ionic-angular';
import { WeeklySessionDays } from '../weekly.model';
import { GraphqlService } from '../../../../../services/graphql.service';
import gql from 'graphql-tag';
import { SharedServices } from '../../../../services/sharedservice';
import { Storage } from "@ionic/storage";
import { CommonService, ToastMessageType, ToastPlacement } from '../../../../../services/common.service';
import { WeeklySessionDateDetailsInput, WeeklySessionMember } from '../weeklydatedetails.model';
import { debounceTime, distinctUntilChanged, filter } from 'rxjs/operators';
import { Subject } from 'rxjs'
import { UsersListInput } from '../../../member/model/member';
import { UsersModel } from '../../../holidaycamp/addmembertocamp';
/**
 * Generated class for the AddmembertoweeklyPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-addmembertoweekly',
  templateUrl: 'addmembertoweekly.html',
  providers: [GraphqlService]
})
export class AddmembertoweeklyPage {
  themeType: any;
  checkboxStates: { [key: string]: boolean } = {};
  members: MemberModel[] = [];

  filteredMembers: MemberModel[] = [];
  selectedMembers: MemberModel[] = [];

  individualSessionId: string;

  parentClubId: string
  weeklySessionDates: string;

  allMemebers = [];
  shouldShowCancel: boolean = true;
  limit: number = 18;
  offset: number = 0;
  search_term: string = '';

  parentClubKey: string;
  weeklySessionId: string;
  input: WeeklySessionDateDetailsInput = {
    SessionDateId: ''
  }
  createEnrollment: CreateEnrollment = {
    weekly_session_days: [],
    weekly_session_id: '',
    MemberIds: []
  }
  private searchTerms = new Subject<string>();
  existedPlayer: WeeklySessionMember[] = []
  venus_user_input:UsersListInput = {
    parentclub_id:"",
    club_id:"",
    search_term:"",
    member_type:1,
    limit:18,
    offset:0,
  }
  capacity_left:number = 0;
  constructor(public navCtrl: NavController,
     public navParams: NavParams, 
     private graphqlService: GraphqlService,
     public popoverCtrl: PopoverController,
     private sharedService: SharedServices, 
     public storage: Storage,
     private commonService: CommonService) {

    this.themeType = sharedService.getThemeType();
    this.weeklySessionId = this.navParams.get("weeklySessionId"); //WeeklySession Ids
    this.individualSessionId = this.navParams.get("individualWeeklyId"); //this is the individual SessionI
    this.parentClubId = this.sharedService.getPostgreParentClubId();
    console.log("parentclub Id:", this.parentClubId)
    this.createEnrollment.weekly_session_id = this.weeklySessionId; //this is the complete weeklysessionid
    this.createEnrollment.weekly_session_days.push(this.individualSessionId)
    this.venus_user_input.parentclub_id = this.sharedService.getPostgreParentClubId();
    // Fetch members data
    this.weeklySessionDateDetails();
    //this.getMembersData(1);

    this.storage.get("userObj").then((val) => {
      val = JSON.parse(val);
      if (val.$key != "") {
        this.parentClubKey = val.UserInfo[0].ParentClubKey;
        console.log("parentClubKey is:", this.parentClubKey)
      }
    });

    this.searchTerms.pipe(
      //filter(search_term => search_term.length > 2), // Filter out search terms with length less than 2
      debounceTime(400), // Wait for 500ms after the user stops typing
      distinctUntilChanged() // Only emit if the search term has changed
    ).subscribe(search_term => {
      // Call your API here using the term
      this.venus_user_input.offset = 0;
      this.venus_user_input.limit = 18;
      if(search_term){
        this.venus_user_input.search_term = search_term!='' ? search_term.replace(/ /g, '') : '';
      }else{
        this.venus_user_input.search_term = '';
      }
      
      this.getMembersData(2);
    });

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad AddmembertoweeklyPage');
  }

  ionViewWillEnter() {
    //this.getMembersData();
  }

  goToDashboardMenuPage() {
    this.navCtrl.setRoot("Dashboard");
  }

  doInfinite(infiniteScroll) {
    this.venus_user_input.offset += this.venus_user_input.limit + 1;
    this.venus_user_input.search_term != "" ? this.getMembersData(2) : this.getMembersData(1);
    //this.getMembersData();
    setTimeout(() => {
      infiniteScroll.complete();
    }, 200);
  }

  getFilterItems(ev: any) {
    // Reset items back to all of the items
    this.initializeItems();
    let val = ev.target.value;
    const searchTerm = ev.target.value;
    this.searchTerms.next(searchTerm);
  }

  initializeItems() {
    //this.filteredMembers = this.members;
    this.members = this.allMemebers;
  }

  presentPopover(myEvent) {
    let popover = this.popoverCtrl.create("PopoverPage");
    popover.present({
      ev: myEvent
    });
  }

  

  weeklySessionDateDetails() {
    this.input.SessionDateId = this.individualSessionId
    this.commonService.showLoader("Please wait");
    console.log("Weekly Session Date Details API Called");
    const weeklySessionDateDetailsQuery = gql`
        query getWeeklySessionDateDetails($input: WeeklySessionDateDetailsInput!) {
            getWeeklySessionDateDetails(input: $input) {
                 id
                 capacity
                 capacity_left
                weeklySessionMember {
                    member {
                        Id
                        FirstName
                        LastName
                        IsChild
                        IsEnable
                        ParentEmailID
                        ParentPhoneNumber
                        EmailID
                    }
                }
            }
        }
    `;

    this.graphqlService
      .query(weeklySessionDateDetailsQuery, { input: this.input }, 0)
      .subscribe((res: any) => {
        this.commonService.hideLoader();
        try {
          this.existedPlayer = res.data.getWeeklySessionDateDetails.weeklySessionMember;
          this.capacity_left = res.data.getWeeklySessionDateDetails.capacity_left ? res.data.getWeeklySessionDateDetails.capacity_left : 0;
          this.getMembersData(1);
        } catch (error) {
          console.error("Error while processing data:", error);
          // Handle error gracefully here, such as displaying a message to the user.
        }
      },
        (error) => {
          this.commonService.hideLoader();
          console.error("Error in fetching:", error);
          if (error.graphQLErrors) {
            console.error("GraphQL Errors:", error.graphQLErrors);
            for (const gqlError of error.graphQLErrors) {
              console.error("Error Message:", gqlError.message);
              console.error("Error Extensions:", gqlError.extensions);
            }
          }
          if (error.networkError) {
            console.error("Network Error:", error.networkError);
          }
        });
  }

  
  getMembersData(type: number) {
    this.allMemebers = [];
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
  ).subscribe(({ data }) => {
        // Optionally, you may log or process the data here
        this.members = [];
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
       
       // this.filteredMembers = [...this.filteredMembers,...JSON.parse(JSON.stringify(this.members))];
       // console.log("Getting Staff Data", this.members);
        this.checkForExistingUsers();
      },
        (error) => {
          console.error("Error occurred while fetching data:");
          if (error.graphQLErrors && error.graphQLErrors.length > 0) {
            console.error("GraphQL Errors:");
            error.graphQLErrors.forEach((gqlError, index) => {
              console.error(`Error ${index + 1}:`);
              console.error("Message:", gqlError.message);
              console.error("Extensions:", gqlError.extensions);
            });
          }

          if (error.networkError) {
            console.error("Network Error:", error.networkError);
          }
        }
      )

  }

//find existing users in sessions and make them disable
checkForExistingUsers(){
  // Initialize properties
  // Check if the member is already selected
  this.existedPlayer.forEach(existedMember => {
    const matchingMember = this.filteredMembers.find((member) => member.Id === existedMember.member.Id);
        if (matchingMember) {
          matchingMember['isSelected'] = true;
          matchingMember['isAlreadyExisted'] = true;
        }
  });//createEnrollment
  this.selectedMembers.forEach(existedMember => {
    const matchingMember = this.filteredMembers.find((member) => member.Id === existedMember.Id);
        if (matchingMember) {
          matchingMember['isSelected'] = true;
        }
  });
  console.table(this.filteredMembers);
}


  onMemberSelectionChange(member: MemberModel,cbox:Checkbox) {
    if (member.isSelected) {
      if(this.capacity_left > 0){
        this.selectedMembers.push(member);
        this.capacity_left--;
      }else{
        if (cbox.checked){
          cbox.checked = false;
          this.commonService.toastMessage("Session size is full, Please increase the capacity",2500,ToastMessageType.Error,ToastPlacement.Bottom);
          //event.srcEvent.stopPropagation();
          return 
        }
        
      }
    } else {
      const index = this.selectedMembers.findIndex(selectedMember => selectedMember.Id === member.Id);
      if (index!== -1) {
        this.selectedMembers.splice(index, 1);
        this.capacity_left++;
      }
    }
  }
 
  

  // Function to submit selected members
  submitMembers() {
    this.commonService.showLoader("Please wait");
    this.createEnrollment.MemberIds = this.selectedMembers.map(member => member.Id);
    console.log('input giving for adding members:', this.createEnrollment);
    const submitMembersMutation = gql`
        mutation createWeeklySessionEnrollment($input: CreateEnrollment!) {
          createWeeklySessionEnrollment(input: $input) {
            id
            created_at
            member {
              Id
              FirstName
              LastName
            }
          }
        }
      `;

    const variables = { input: this.createEnrollment }

    this.graphqlService.mutate(
      submitMembersMutation,
      variables,
      0).
      subscribe((response) => {
        this.commonService.hideLoader();
        const message = "Member enrolled successfully";
        this.commonService.toastMessage(message, 2500, ToastMessageType.Success, ToastPlacement.Bottom);
        this.navCtrl.pop();
        // this.reinitializeSession();
      }, (err) => {
        this.commonService.hideLoader();
        // Handle GraphQL mutation error
        console.error("GraphQL mutation error:", err);
        this.commonService.toastMessage("User enrol failed", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
      });


  }
}


export class MemberModel {
  Id: string
  FirebaseKey: string
  FirstName: string
  LastName: string
  ClubKey: string
  IsChild: boolean
  DOB: string
  EmailID: string
  EmergencyContactName: string
  EmergencyNumber: string
  Gender: string
  MedicalCondition: string
  ParentClubKey: string
  ParentKey: string
  PhoneNumber: string
  IsEnable: boolean
  IsActive: boolean
  PromoEmailAllowed: boolean
  isSelected?: boolean; // Add the 'selected' property
  isAlreadyExisted?: boolean; // Add the 'isAlreadyExisted' property
}

export class CreateEnrollment {
  weekly_session_days: string[]
  weekly_session_id: string
  MemberIds: string[]
}