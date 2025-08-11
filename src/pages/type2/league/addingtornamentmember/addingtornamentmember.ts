import { Component } from '@angular/core';
import { Checkbox, IonicPage, NavController, NavParams, PopoverController } from 'ionic-angular';
import gql from 'graphql-tag';
import { Storage } from "@ionic/storage";
import { debounceTime, distinctUntilChanged, filter } from 'rxjs/operators';
import { Subject } from 'rxjs'
import { GraphqlService } from '../../../../services/graphql.service';
import { SharedServices } from '../../../services/sharedservice';
import { CommonService, ToastMessageType, ToastPlacement } from '../../../../services/common.service';
import { LeagueParticipantModel, LeaguesForParentClubModel } from '../models/league.model';
import { UsersListInput, UsersModel } from '../../../../shared/model/league.model';


/**
 * Generated class for the AddingtornamentmemberPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-addingtornamentmember',
  templateUrl: 'addingtornamentmember.html',
})
export class AddingtornamentmemberPage {

  themeType: any;

  members: MemberModel[] = [];

  filteredMembers: MemberModel[] = [];
  selectedMembers: MemberModel[] = [];

  isSelect: boolean;


  parentClubId: string



  shouldShowCancel: boolean = true;
  limit: number = 18;
  offset: number = 0;
  search_term: string = '';
  league: LeaguesForParentClubModel;
  parentClubKey: string;
  leagueID: string;
  private searchTerms = new Subject<string>();
  existedMember: string[];
  venus_user_input: UsersListInput = {
    parentclub_id: "",
    club_id: "",
    search_term: "",
    member_type: 1,
    limit: 18,
    offset: 0,
  }

  leagueParticipantInput: LeagueParticipantInput = {
    user_postgre_metadata: {
      UserParentClubId: ''
    },
    user_device_metadata: {
      UserActionType: 0,
      UserAppType: 0,
      UserDeviceType: 0
    },
    leagueId: '',
    parentclubteamIds: [],
    userIds: [],
    participantsIds: [],
    groups: 0
  }

  capacity_left: number = 0;
  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    private graphqlService: GraphqlService,
    public popoverCtrl: PopoverController,
    private sharedService: SharedServices,
    public storage: Storage,
    private commonService: CommonService
  ) {
    this.themeType = sharedService.getThemeType();

    this.leagueID = this.navParams.get("league");

    this.capacity_left = this.navParams.get("capacity_left");

    this.existedMember = this.navParams.get("league_member");

    this.parentClubId = this.sharedService.getPostgreParentClubId();


    console.log("existing Members are:", this.existedMember);

    this.venus_user_input.parentclub_id = this.sharedService.getPostgreParentClubId();
    this.leagueParticipantInput.user_postgre_metadata.UserParentClubId = this.parentClubId;
    this.leagueParticipantInput.user_device_metadata.UserActionType = 1;
    this.leagueParticipantInput.user_device_metadata.UserAppType = 0;
    this.leagueParticipantInput.user_device_metadata.UserDeviceType = this.sharedService.getPlatform() == "android" ? 1 : 2

    this.leagueParticipantInput.leagueId = this.leagueID;

    this.storage.get("userObj").then((val) => {
      val = JSON.parse(val);
      if (val.$key != "") {
        this.parentClubKey = val.UserInfo[0].ParentClubKey;
        console.log("parentClubKey is:", this.parentClubKey)

        // this.leagueParticipantInput.ParentClubKey = val.UserInfo[0].ParentClubKey;
        // this.leagueParticipantInput.MemberKey = val.$key;
        this.leagueParticipantInput.groups = 0;


        //this.leagueParticipantInput.ActionType = 1;
        //this.leagueParticipantInput.DeviceType = 0;
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

      if (search_term) {
        this.venus_user_input.search_term = search_term != '' ? search_term : "";
      } else {
        this.venus_user_input.search_term = '';
      }
      this.getMembersData(2);
    });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad AddingtornamentmemberPage');
  }

  ionViewWillEnter() {
    this.getMembersData(1);
  }


  goToDashboardMenuPage() {
    this.navCtrl.setRoot("Dashboard");
  }

  doInfinite(infiniteScroll) {
    this.venus_user_input.offset += this.venus_user_input.limit;
    this.getMembersData(1);
    setTimeout(() => {
      infiniteScroll.complete();
    }, 300);
  }

  getFilterItems(ev: any) {
    // Reset items back to all of the items
    this.initializeItems();
    let val = ev.target.value;
    const searchTerm = ev.target.value;
    this.searchTerms.next(searchTerm);
  }

  initializeItems() {
    this.filteredMembers = this.members;
  }

  presentPopover(myEvent) {
    let popover = this.popoverCtrl.create("PopoverPage");
    popover.present({
      ev: myEvent
    });
  }
  getMembersData(type: number) {
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
      { list_input: this.venus_user_input },
      0
    ).subscribe(({ data }) => {
      this.members = [];
      // Optionally, you may log or process the data here
      if (data["getAllMembersByParentClubNMemberType"].length > 0) {
        this.members = data["getAllMembersByParentClubNMemberType"].map((member: UsersModel) => ({
          ...member,
          isSelected: false,
          isAlreadyExisted: false,
        }));
      }
      if (type === 2) {
        this.filteredMembers = JSON.parse(JSON.stringify(this.members))
      } else {
        this.filteredMembers = [...this.filteredMembers, ...JSON.parse(JSON.stringify(this.members))];
      }
      console.log("filterd memer shown")
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
  checkForExistingUsers() {

    if (!this.existedMember || this.existedMember.length === 0) {
      console.error("existedMember is not defined or empty");
      return;
    }

    // Check against filteredMembers and update properties if IDs match
    this.existedMember.forEach((userId) => {
      const matchingMember = this.filteredMembers.find(member => member.Id === userId);
      console.log("Checking for existing member:", userId);
      if (matchingMember) {
        matchingMember.isSelected = true;
        matchingMember.isAlreadyExisted = true;
      }
    });

    // Also check leagueParticipantInput.participantsIds against filteredMembers
    this.leagueParticipantInput.participantsIds.forEach((enrolledUserId) => {
      const matchingMember = this.filteredMembers.find(member => member.Id === enrolledUserId);
      if (matchingMember) {
        matchingMember.isSelected = true;
        matchingMember.isAlreadyExisted = true;
      }
    });

  }

  onMemberSelectionChange(member: MemberModel, cbox: Checkbox) {
    if (this.leagueParticipantInput.participantsIds.length > 0) {
      const userIndex = this.leagueParticipantInput.participantsIds.findIndex(userId => userId === member.Id);
      if (userIndex == -1) { //if user not found then push
        if (this.checkCapacityAvailability()) {
          this.capacity_left--;
          this.leagueParticipantInput.participantsIds.push(member.Id)
        } else {
          if (cbox.checked) {
            cbox.checked = false;
            this.commonService.toastMessage("Group size is full,Please increase the capacity", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
            //event.srcEvent.stopPropagation();
            return
          }
        }
      } else {
        this.leagueParticipantInput.participantsIds.splice(userIndex, 1);
        this.capacity_left++;
      }
    }
    else if (this.leagueParticipantInput.participantsIds.length == 0) {
      if (this.checkCapacityAvailability()) {
        this.capacity_left--;
        this.leagueParticipantInput.participantsIds.push(member.Id)
      } else {
        if (cbox.checked) {
          cbox.checked = false;
          this.commonService.toastMessage("Group size is full,Please increase the capacity", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
          //event.srcEvent.stopPropagation();
          return
        }
      }
    }

    // if (member.isSelected) {
    //   if (this.capacity_left > 0) {
    //     this.selectedMembers.push(member);
    //     this.capacity_left--;
    //   } else {
    //     if (cbox.checked) {
    //       cbox.checked = false;
    //       this.commonService.toastMessage("League size is full, Please increase the capacity", 2500, ToastMessageType.Error, ToastPlacement.Bottom);

    //       return
    //     }

    //   }
    // } else {
    //   const index = this.selectedMembers.findIndex(selectedMember => selectedMember.Id === member.Id);
    //   if (index !== -1) {
    //     this.selectedMembers.splice(index, 1);
    //     this.capacity_left++;
    //   }


    // if(member.isSelected){
    //   if(this.capacity_left>0){
    //     this.leagueParticipantInput.participantsIds.push(member.Id);
    //     this.capacity_left--;
    //   }
    // }
  }

  //check capacity available or not
  checkCapacityAvailability() {
    if (this.capacity_left > 0) {
      return true;
    }
    return false;
  }



  onMemberConfirm() {
    this.commonService.commonAlert_V4("Add Member(s)", "Are you sure you want to add the member(s)?", "Yes:Add", "No", () => {
      this.submitMembers();
    })
  }

  submitMembers() {
    this.commonService.showLoader("Please wait");
    //this.leagueParticipantInput.leagueId = this.leagueID;
    //this.leagueParticipantInput.participantsIds = this.selectedMembers.map(member => member.Id);
    console.log('input giving for adding members:', this.leagueParticipantInput);
    const submitMembersMutation = gql`
      mutation addParticipantToLeague($leagueParticipant: LeagueParticipantInput!) {
        addParticipantToLeague(leagueParticipant: $leagueParticipant) {
          id
          participant_name
          participant_type
      
        }
      }
    `;

    const variables = { leagueParticipant: this.leagueParticipantInput }

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

export class LeagueParticipantInput {
  user_postgre_metadata: {
    UserParentClubId: string

  }
  user_device_metadata: {
    UserActionType: number
    UserAppType: number

    UserDeviceType: number

  }

  leagueId: string
  parentclubteamIds: string[]
  userIds: string[]
  participantsIds: string[]
  groups: number
}

// console.log('particpant status is:' + member.isSelected);
// console.log('selected data is:' + member.Id);
// if (member.isSelected) {
//   this.leagueParticipantInput.userIds.push(member.Id)
// }