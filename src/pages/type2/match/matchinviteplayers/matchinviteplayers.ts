import { Component } from "@angular/core";
import {
  AlertController,
  ViewController,
  IonicPage,
  LoadingController,
  NavController,
  NavParams,
} from "ionic-angular";
import {
  CommonService,
  ToastMessageType,
  ToastPlacement,
} from "../../../../services/common.service";
import { SharedServices } from "../../../services/sharedservice";
import { Storage } from "@ionic/storage";
import gql from "graphql-tag";
import { MembersModel } from "../models/match.model";
import { GraphqlService } from "../../../../services/graphql.service";
// import { UsersListInput } from "../../member/model/member";
import { Subject } from "rxjs";
import { debounceTime, distinctUntilChanged } from "rxjs/operators";
import { AppType } from "../../../../shared/constants/module.constants";
// import { UsersModel } from "../../reportmember/reportmember";
//import { UsersModel } from "../../holidaycamp/addmembertocamp";

/**
 * Generated class for the MatchinviteplayersPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: "page-matchinviteplayers",
  templateUrl: "matchinviteplayers.html",
})
export class MatchinviteplayersPage {
  private searchTerms = new Subject<string>();
  themeType: number;
  FetchAPPlusMembers: FetchAPPlusMembers = {
    ParentClubKey: "",
  };
  members: MembersModel[] = [];
  // 476fd04d-4d42 - 42d4 - 865d - 331c12a2a418
  invitationInput: InvitationInput = {
    ParentClubId: "",
    MatchId: "",
    appType: 0,
    InvitedBy: "",
    Users: []
  };
  invitePlayers: [];
  search_term: string = '';

  venus_user_input: UsersListInput = {
    parentclub_id: "",
    club_id: "",
    search_term: "",
    member_type: 1,
    limit: 18,
    offset: 0,
  }

  filteredMembers: MembersModel[] = [];
  newSelectedMemberArray = [];
  existed_members: ParticipantModel[] = [];
  parentClubId: string;
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public commonService: CommonService,
    public loadingCtrl: LoadingController,
    public storage: Storage,
    private sharedservice: SharedServices,
    public viewCtrl: ViewController,
    private graphqlService: GraphqlService
  ) {

    console.log("MatchinviteplayersPage");

    this.invitationInput.MatchId = this.navParams.get("selectedmatchId");
    this.invitationInput.appType = AppType.ADMIN_NEW;

    this.existed_members = this.navParams.get('existed_members');
    console.log("existed member is", this.existed_members);

    this.getStorageDets();

    this.searchTerms.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe(search_term => {
      this.venus_user_input.offset = 0;
      this.venus_user_input.limit = 18;

      if (search_term) {
        this.venus_user_input.search_term = search_term != '' && search_term.length > 2 ? search_term.replace(/ /g, '') : '';
      } else {
        this.venus_user_input.search_term = '';
      }
      this.getParentClubAPPlusUsers();
    })


  }

  async getStorageDets() {
    const [login_obj, postgre_parentclub] = await Promise.all([
      this.storage.get('userObj'),
      this.storage.get('postgre_parentclub'),
    ])

    if (login_obj) {
      const val = JSON.parse(login_obj);
      if (val && val.$key) {
        this.FetchAPPlusMembers.ParentClubKey = val.UserInfo[0].ParentClubKey;
      }
    }
    if (postgre_parentclub) {
      this.invitationInput.InvitedBy = "476fd04d-4d42-42d4-865d-331c12a2a418";
      this.venus_user_input.parentclub_id = postgre_parentclub.Id;
      this.invitationInput.ParentClubId = postgre_parentclub.Id;
      this.getParentClubAPPlusUsers()//first time call to get users
    }
  }


  ionViewWillEnter() { }

  doInfinite(infiniteScroll) {
    this.venus_user_input.offset += this.venus_user_input.limit;
    this.getParentClubAPPlusUsers();
    setTimeout(() => {
      infiniteScroll.complete();
    }, 300);
  }


  getAge(DOB) {
    let age = this.commonService.getAgeFromYYYY_MM(DOB);
    if (isNaN(age)) {
      return "N.A";
    } else {
      return age;
    }
  }

  getFilterItems(ev: any) {
    const searchTerm = ev.target.value;
    this.searchTerms.next(searchTerm);
  }

  initializeItems() {
    this.filteredMembers = this.members;
  }

  dismiss() {
    this.viewCtrl.dismiss({ canRefreshData: true });
  }

  selectMembers(member: MembersModel) {
    let isPresent = false;
    if (this.invitationInput.Users.length > 0) {
      for (let i = 0; i < this.invitationInput.Users.length; i++) {
        if (this.invitationInput.Users[i] == member.Id) {
          isPresent = true;
          this.invitationInput.Users.splice(i, 1);
          // this.newSelectedMemberArray.push(member);
          break;
        }
      }
      if (!isPresent) {
        this.invitationInput.Users.push(member.Id);
      }
    } else if (this.invitationInput.Users.length == 0) {
      this.invitationInput.Users.push(member.Id);
    }

    console.log(this.invitationInput.Users);
  }



  inviteUsers() {
    //this.InvitationInput.Users = this.newSelectedMemberArray;
    const inviteUsers = gql`
    mutation invitePlayers($InvitationInput: InvitationInput!){
      invitePlayers(InvitationInput: $InvitationInput)
    }`;
    const mutationVariable = { InvitationInput: this.invitationInput };
    this.graphqlService.mutate(inviteUsers, mutationVariable, 0).subscribe((res: any) => {
      this.commonService.hideLoader();
      const message = "Player(s) invited successfully";
      //this.commonService.updateCategory("leagueteamlisting");
      this.commonService.toastMessage(message, 2500, ToastMessageType.Success, ToastPlacement.Bottom);
      this.viewCtrl.dismiss({ canRefreshData: true });
      // this.navCtrl.pop();
    },
      (error) => {
        this.commonService.hideLoader();
        this.commonService.toastMessage("Player invite failed", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
        console.error("Error in fetching:", error);
      })

  }

  getParentClubAPPlusUsers() {

    this.commonService.showLoader("Fetching users...");
    const userQuery = gql`
    query getAllMembersByParentClubNMemberType($list_input: UsersListInput!) {
      getAllMembersByParentClubNMemberType(userInput:$list_input) {
        Id
        FirstName
        LastName
        DOB
      }
    }
  `;

    this.graphqlService.query(userQuery, { list_input: this.venus_user_input }, 0).subscribe(
      (res: any) => {
        this.commonService.hideLoader();
        console.log("members are", res)
        this.members = [];
        if (res.data["getAllMembersByParentClubNMemberType"].length > 0) {
          this.members = res.data["getAllMembersByParentClubNMemberType"].map((member: UsersModel) => ({
            ...member,
            isSelected: false,
            isAlreadyExisted: false,
          }));
        }


        this.filteredMembers = [...this.filteredMembers, ...JSON.parse(JSON.stringify(this.members))];

        this.checkForExistingUsers();
        // this.members = res.data.getAllMembersByParentClubNMemberType as MembersModel[];
        // console.log("Member data is:", this.members);

        // if (this.members.length > 0) {
        //   for (let i = 0; i < this.members.length; i++) {
        //     this.members[i]["isSelect"] = false;
        //     this.members[i]["isAlreadExisted"] = false;

        //     if (this.existed_members && this.existed_members.length > 0) {
        //       for (let j = 0; j < this.existed_members.length; j++) {
        //         if (
        //           this.existed_members[j] &&
        //           this.existed_members[j].User &&
        //           this.members[i].Id === this.existed_members[j].User.Id
        //         ) {
        //           this.members[i]["isSelect"] = true;
        //           this.members[i]["isAlreadExisted"] = true;
        //           break; // Optional: If you want to exit the inner loop when a match is found
        //         }
        //       }
        //     }
        //   }
        // }

        // this.filteredMembers = JSON.parse(JSON.stringify(this.members));
      },
      (error) => {
        this.commonService.hideLoader();
        this.commonService.toastMessage("Fetching failed for member", 2500, ToastMessageType.Error);
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
      }
    );
  };


  //find existing users in sessions and make them disable
  checkForExistingUsers() {

    if (!this.existed_members || this.existed_members.length === 0) {
      console.error("existedMember is not defined or empty");
      return;
    }

    // Check against filteredMembers and update properties if IDs match
    this.existed_members.forEach((user) => {
      const matchingMember = this.filteredMembers.find(member => member.Id === user.User.Id);
      console.log("Checking for existing member:", user);
      if (matchingMember) {
        matchingMember.isSelected = true;
        matchingMember.isAlreadyExisted = true;
      }
    });

    // Also check leagueParticipantInput.participantsIds against filteredMembers
    this.invitationInput.Users.forEach((enrolledUserId) => {
      const matchingMember = this.filteredMembers.find(member => member.Id === enrolledUserId);
      if (matchingMember) {
        matchingMember.isSelected = true;
        matchingMember.isAlreadyExisted = true;
      }
    });

  }

}

export class FetchAPPlusMembers {
  ParentClubKey: string;
}
export class InvitationInput {
  ParentClubId: string;
  MatchId: string;
  appType: number;
  InvitedBy: string;
  Users: string[];
}
export class MatchModel {
  VenueKey: string;
  Id: string;
  Message: string;
  CreatedAt: any;
  UpdatedAt: string;
  CreatedBy: string;
  IsActive: boolean;
  IsEnable: boolean;
  MatchCreator: string; //APP Name
  Activity: ActivityModel; //Which activity it is inside the member App
  MatchVisibility: number;
  GameType: number;
  MatchType: number;
  PaymentType: number;
  ResultStatus: number;
  MatchStatus: number;
  VenueName: string;
  Details: string;
  MemberFees: number;
  NonMemberFees: number;
  MatchStartDate: any;
  Result: ResultModel;
  Capacity: number;
  MatchTitle: string;
  Teams: TeamModel[];
  Hosts: Host[];
}

export class Host {
  Name: string;
  firebaseKey: string;
  roleType: number;
  userType: number;
}

export class ActivityModel {
  ActivityKey: string;
  IsActive: boolean;
  IsEnable: boolean;
  ActivityCode: string;
  ActivityName: string;
  ActivityImageURL: string;
}

export class ResultModel {
  ResultDetails: string;
  ResultStatus: number;
  PublishedByApp: string;
  Winner: TeamModel;
}

export class TeamModel {
  Id: string;
  TeamName: string;
  ResultStatus: number;
  TeamPoint: number;
  Description: string;
  CoachName: string;
  IsWinner?: boolean;
  Sets_Points?: any;
  Participants: ParticipantModel[];
}

export class ParticipantModel {
  ParticipationStatus: number;
  PaymentStatus: number;
  PaymentTracking: string;
  InviteStatus: number;
  TotalPoints: number;
  User: UserModel;
  CreatedAt: string;
  UpdatedAt: string;
  InviteType: number;
  TotalPonumbers: number;
  Team: TeamModel[];
  Match: MatchModel;
}

export class UserModel {
  Id: string;
  FirstName: string;
  LastName: string;
  Gender: string;
  DOB: string;
  FirebaseKey: string;
}

//ladder model

export class LadderModel {
  IsActive: boolean;
  IsEnable: boolean;
  FirstName: string;
  LastName: string;
  rank: number;
  Points: number;
  IsSelf?: boolean;
  LastMatchPlayed: string;
  TotalMatches: any;
}



export class TeamsModal {
  Id: string;
  TeamName: string;
  IsWinner?: boolean;
  Sets_Points?: any;
  ResultDescription: string;
  Participants: TeamParticipants[]
}

export class TeamParticipants {
  PaymentStatus: number
  InviteStatus: number
  InviteType: number
  ParticipationStatus: number
  User: { FirstName: string, LastName: string, FirebaseKey: string, isUserAvailable?: boolean }
}

export class PublishResultInput {
  CreatedBy: string; //MemberKey
  ResultDetails: string; //MemberKey
  resultDescription: string; //MemberKey
  ResultStatus: number; //MemberKey
  MatchId: string; //matchId
  WinnerId: string; //Always a Team ID
  PublishedBy: string; //MemberKey
}

export class MatchSetupModel {
  IsActive: string;
  IsEnable: true;
  DisplayName: string;
  Name: string;
  CreateDate: string;
  Member: boolean;
  NonMember: boolean;
  Code: number
}

export class UsersModel {
  isSelect: boolean;
  Id: string
  FirebaseKey: string;
  FirstName: string;
  LastName: string;
  ClubKey: string;
  IsChild: boolean;
  Age?: string;
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
  isSelected?: boolean;
  isAlreadExisted?: boolean;
  //Source
}
export class UsersListInput {//this one is new for new nextgen backend
  parentclub_id: string;
  club_id: string;
  search_term?: string;
  limit?: number;
  offset?: number;
  member_type?: number
  action_type?: number
}