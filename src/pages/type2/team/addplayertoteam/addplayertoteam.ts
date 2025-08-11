import { Component } from "@angular/core";
import {
  IonicPage,
  NavController,
  NavParams,
  ViewController,
  LoadingController,
  AlertController
} from "ionic-angular";
import {
  CommonService,
  ToastMessageType,
  ToastPlacement,
} from "../../../../services/common.service";
import { FirebaseService } from "../../../../services/firebase.service";
import { SharedServices } from "../../../services/sharedservice";
import { Storage } from "@ionic/storage";
import gql from "graphql-tag";
import { Apollo } from "apollo-angular";
import { MembersModel } from "../../match/models/match.model";
import { GetPlayerModel } from "../models/team.model";
import { join } from "path";
import { GraphqlService } from "../../../../services/graphql.service";
//import { UsersModel } from "../../holidaycamp/addmembertocamp";
import { Subject } from "rxjs";
import { debounceTime, distinctUntilChanged } from "rxjs/operators";
import { UsersListInput, UsersModel } from "../../../../shared/model/league.model";

/**
 * Generated class for the TeaminvitePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: "page-addplayertoteam",
  templateUrl: "addplayertoteam.html",
})
export class Addplayertoteam {

  themeType: number;
  FetchAPPlusMembers: FetchAPPlusMembers = {
    ParentClubKey: "",
  };
  members: MembersModel[] = [];
  selectedMembers = [];

  private searchTerms = new Subject<string>();


  InvitationInput: InvitationInput = {
    ParentClubKey: "",
    MatchId: "",
    InvitedBy: "",
    appType: 0,
    Users: [],
  };

  teamMembersInput: TeamMembersInput = {
    ParentClubKey: "",
    MemberKey: "",
    AppType: 0,
    ActionType: 0,
    teamId: "",
    members: []

  }

  venus_user_input: UsersListInput = {
    parentclub_id: "",
    club_id: "",
    search_term: "",
    member_type: 1,
    limit: 18,
    offset: 0,
  }



  invitePlayers: [];

  filteredMembers: MembersModel[] = [];
  newSelectedMemberArray = [];
  //existed_members: GetPlayerModel[] = [];
  existedPlayer: GetPlayerModel[];
  constructor(
    public navCtrl: NavController,
    private graphqlService: GraphqlService,
    public navParams: NavParams,
    private apollo: Apollo,
    public commonService: CommonService,
    public loadingCtrl: LoadingController,
    public storage: Storage,
    public fb: FirebaseService,
    public sharedservice: SharedServices,
    private alertCtrl: AlertController,
    public viewCtrl: ViewController
  ) {
    this.themeType = sharedservice.getThemeType();
    this.existedPlayer = this.navParams.get("existedPlayer");
    console.log("TeaminvitePage");
    this.teamMembersInput.teamId = this.navParams.get("teamid");
    // this.existed_members = this.navParams.get('existed_members');
    this.storage.get("userObj").then((val) => {
      val = JSON.parse(val);
      if (val.$key != "") {
        this.FetchAPPlusMembers.ParentClubKey = val.UserInfo[0].ParentClubKey;
        this.teamMembersInput.ParentClubKey = val.UserInfo[0].ParentClubKey;
        this.teamMembersInput.MemberKey = val.$key;
        this.venus_user_input.parentclub_id = this.sharedservice.getPostgreParentClubId();
        // this.getPlayerList();
        this.getMembersData()
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
      this.members = [];
      this.filteredMembers = [];
      if (search_term) {
        this.venus_user_input.search_term = search_term != '' ? search_term : "";
      } else {
        this.venus_user_input.search_term = '';
      }
      this.getMembersData();
    });
  }

  ionViewWillEnter() { }

  ionViewDidLoad() {
    console.log("ionViewDidLoad TeaminvitePage");
  }

  doInfinite(infiniteScroll) {
    this.venus_user_input.offset += this.venus_user_input.limit;
    this.getMembersData();
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

  getAge(DOB) {
    let age = this.commonService.getAgeFromYYYY_MM(DOB);
    if (isNaN(age)) {
      return "N.A";
    } else {
      return age;
    }
  }

  selectMembers(member) {
    const memberIndex = this.teamMembersInput.members.findIndex(m => m.memberKey === member.Id);
    if (memberIndex > -1) {
      this.teamMembersInput.members.splice(memberIndex, 1);
    } else {
      this.teamMembersInput.members.push({ roleId: "b221720f-a6dd-4782-b80f-0ba23ed7cbcf", memberKey: member.Id });
    }
    console.log("Updated Team Members:", this.teamMembersInput.members);
  }

  getPlayerList() {
    this.commonService.showLoader("Fetching Players...");

    const userQuery = gql`
    query getAllMembersByParentClubNMemberType($parentclubid: String!) {
      getAllMembersByParentClubNMemberType(ParentClubKey: $parentclubid) {
        FirebaseKey
          FirstName
          LastName
          DOB
          EmailID
      }
    }
  `;
    this.graphqlService.query(userQuery, { parentclubid: this.FetchAPPlusMembers.ParentClubKey }, 0).subscribe((res: any) => {
      this.members = res.data.getAllMembersByParentClubNMemberType as MembersModel[];

      if (this.members.length > 0) {
        for (let i = 0; i < this.members.length; i++) {
          this.members[i]["isSelect"] = false;
          this.members[i]["isAlreadExisted"] = false;
          if (this.existedPlayer.length > 0) {
            for (let j = 0; j < this.existedPlayer.length; j++) {
              if (
                this.members[i].FirebaseKey ===
                this.existedPlayer[j].user.FirebaseKey
              ) {
                this.members[i]["isSelect"] = true;
                this.members[i]["isAlreadExisted"] = true;
              }
            }
          }
        }
      }
      this.filteredMembers = JSON.parse(JSON.stringify(this.members));
      console.log("Getting Staff Data", this.members);

      this.commonService.hideLoader();
    }, (error) => {
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

  }


  getMembersData() {

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
      // if(type === 2){
      //   this.filteredMembers = JSON.parse(JSON.stringify(this.members))
      // }else{
      this.filteredMembers = [...this.filteredMembers, ...JSON.parse(JSON.stringify(this.members))];
      // }
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

    if (!this.existedPlayer || this.existedPlayer.length === 0) {
      console.error("existedMember is not defined or empty");
      return;
    }

    // Check against filteredMembers and update properties if IDs match
    this.existedPlayer.forEach((team_user) => {
      const matchingMember = this.filteredMembers.find(member => member.Id === team_user.user.Id);
      console.log("Checking for existing member:", team_user);
      if (matchingMember) {
        matchingMember.isSelected = true;
        matchingMember.isAlreadyExisted = true;
      }
    });

    // Also check leagueParticipantInput.participantsIds against filteredMembers
    this.teamMembersInput.members.forEach((enrolledUser) => {
      const matchingMember = this.filteredMembers.find(member => member.Id === enrolledUser.memberKey);
      if (matchingMember) {
        matchingMember.isSelected = true;
        matchingMember.isAlreadyExisted = true;
      }
    });

  }



  //mutation for saving the player

  savePlayers = async () => {
    this.commonService.showLoader("Please wait...");
    try {
      const addPlayer = gql`
    mutation addPlayerToTeam($addPlayer: TeamMembersInput!){
      addPlayerToTeam(addPlayer:$addPlayer)
        
       
    
  }
`;
      const mutationVariables = { addPlayer: this.teamMembersInput }

      await this.graphqlService.mutate(addPlayer, mutationVariables, 0).subscribe((res: any) => {
        this.commonService.hideLoader();
        const message = "Player Added Successfully";

        this.commonService.toastMessage(message, 2500, ToastMessageType.Success, ToastPlacement.Bottom);
        // this.navCtrl.pop().then(() => this.navCtrl.pop());
        this.viewCtrl.dismiss({ canRefreshData: true });

      },
        (error) => {
          this.commonService.hideLoader();
          if (error.error) {
            console.error("Server Error:", error.error);
            this.commonService.toastMessage(error.error.message, 2500, ToastMessageType.Error, ToastPlacement.Bottom);
          } else
            this.commonService.toastMessage("Error in saving player:", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
        }
      );

    } catch (error) {
      console.error("Error in saving player:", error);
      if (error.error) {
        console.error("Server Error:", error.error);
        this.commonService.toastMessage(error.error.message, 2500, ToastMessageType.Error, ToastPlacement.Bottom);
      } else
        this.commonService.toastMessage("Error in saving player:", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
    }
  }

  dismiss() {
    this.viewCtrl.dismiss({ canRefreshData: true });
  }



}
export class FetchAPPlusMembers {
  ParentClubKey: string;
}
export class InvitationInput {
  ParentClubKey: String;
  MatchId: String;
  InvitedBy: String;
  Users: any;
  appType: number;
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
  Id?: string;
  FirstName: string;
  LastName: string;
  Gender: string;
  DOB: string;
  FirebaseKey?: string;
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
  Participants: TeamParticipants[];
}

export class TeamParticipants {
  PaymentStatus: number;
  InviteStatus: number;
  InviteType: number;
  ParticipationStatus: number;
  User: {
    FirstName: string;
    LastName: string;
    FirebaseKey: string;
    isUserAvailable?: boolean;
  };
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
  Code: number;
}

export class TeamMembersInput {
  ParentClubKey: string
  MemberKey: string
  AppType: number
  ActionType: number
  members: TeamMember[]
  teamId: string
}

export class TeamMember {
  memberKey: string
  roleId: string
}
