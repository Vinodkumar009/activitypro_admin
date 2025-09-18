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
import { GraphqlService } from "../../../../services/graphql.service";
import { Subject } from "rxjs";
import { debounceTime, distinctUntilChanged } from "rxjs/operators";
import { UsersListInput, UsersModel } from "../../../../shared/model/league.model";

interface FetchAPPlusMembers {
  ParentClubKey: string;
}

interface InvitationInput {
  ParentClubKey: string;
  MatchId: string;
  InvitedBy: string;
  Users: any;
  appType: number;
}

interface TeamMembersInput {
  ParentClubKey: string;
  MemberKey: string;
  AppType: number;
  ActionType: number;
  members: TeamMember[];
  teamId: string;
}

interface TeamMember {
  memberKey: string;
  roleId: string;
}

/**
 * Component for adding players to team.
 * Handles player search, selection, and team member management.
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


  private searchTerms = new Subject<string>();
  private selectedMembersSet = new Set<string>(); // 🚀 Performance optimization for member selection
  private existingPlayersSet = new Set<string>(); // 🚀 Performance optimization for existing players check
  private readonly DEFAULT_ROLE_ID = "b221720f-a6dd-4782-b80f-0ba23ed7cbcf"; // 🔧 Extract hardcoded role ID
  private subscriptions: any[] = []; // 🧹 Subscription management

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
  };

  venus_user_input: UsersListInput = {
    parentclub_id: "",
    club_id: "",
    search_term: "",
    member_type: 1,
    limit: 18,
    offset: 0,
  };

  filteredMembers: MembersModel[] = [];
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
    this.teamMembersInput.teamId = this.navParams.get("teamid");

    this.storage.get("userObj").then((val) => {
      if (val && typeof val === 'string') {
        try {
          const userData = this.parseUserData(val);
          if (userData && userData.$key && userData.UserInfo && userData.UserInfo[0]) {
            this.FetchAPPlusMembers.ParentClubKey = userData.UserInfo[0].ParentClubKey;
            this.teamMembersInput.ParentClubKey = userData.UserInfo[0].ParentClubKey;
            this.teamMembersInput.MemberKey = userData.$key;
            this.venus_user_input.parentclub_id = this.sharedservice.getPostgreParentClubId();
            this.getMembersData();
          }
        } catch (error) {
          this.handleError(error, "Failed to load user data");
        }
      }
    });

    // 🔍 Initialize existing players set for performance
    if (this.existedPlayer && this.existedPlayer.length > 0) {
      this.existingPlayersSet = new Set(this.existedPlayer.map(p => p.user.Id));
    }

    const searchSubscription = this.searchTerms.pipe(
      debounceTime(400), // 🕐 Wait for 400ms after user stops typing
      distinctUntilChanged() // 🔄 Only emit if search term changed
    ).subscribe(search_term => {
      this.resetSearchState();
      this.venus_user_input.search_term = search_term || "";
      this.getMembersData();
    });

    this.subscriptions.push(searchSubscription);
  }



  ionViewDidLoad() {
    // Component loaded
  }

  ionViewWillLeave() {
    // 🧹 Always cleanup subscriptions
    this.subscriptions.forEach(sub => {
      if (sub && !sub.closed) {
        sub.unsubscribe();
      }
    });
  }

  doInfinite(infiniteScroll) {
    this.venus_user_input.offset += this.venus_user_input.limit;
    this.getMembersData();
    setTimeout(() => {
      infiniteScroll.complete();
    }, 300);
  }

  getFilterItems(ev: any) {
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
    if (this.selectedMembersSet.has(member.Id)) {
      // 🗑️ Remove member
      this.selectedMembersSet.delete(member.Id);
      const memberIndex = this.teamMembersInput.members.findIndex(m => m.memberKey === member.Id);
      if (memberIndex > -1) {
        this.teamMembersInput.members.splice(memberIndex, 1);
      }
    } else {
      // ➕ Add member
      this.selectedMembersSet.add(member.Id);
      this.teamMembersInput.members.push({ roleId: this.DEFAULT_ROLE_ID, memberKey: member.Id });
    }
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
    const querySubscription = this.graphqlService.query(userQuery, { parentclubid: this.FetchAPPlusMembers.ParentClubKey }, 0).subscribe((res: any) => {
      this.members = res.data.getAllMembersByParentClubNMemberType as MembersModel[];

      if (this.members.length > 0) {
        this.members = this.members.map(member => ({
          ...member,
          isSelect: this.existingPlayersSet.has(member.Id),
          isAlreadExisted: this.existingPlayersSet.has(member.Id)
        }));
      }
      this.filteredMembers = [...this.members];

      this.commonService.hideLoader();
    }, (error) => {
      this.commonService.hideLoader();
      this.handleError(error, "Failed to fetch players");
    });

    this.subscriptions.push(querySubscription);

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
    const membersSubscription = this.graphqlService.query(
      userQuery,
      { list_input: this.venus_user_input },
      0
    ).subscribe(({ data }) => {
      this.members = [];
      if (data["getAllMembersByParentClubNMemberType"].length > 0) {
        this.members = data["getAllMembersByParentClubNMemberType"].map((member: UsersModel) => ({
          ...member,
          isSelected: this.selectedMembersSet.has(member.Id),
          isAlreadyExisted: this.existingPlayersSet.has(member.Id)
        }));
        this.filteredMembers.push(...this.members);
      }
      this.updateMemberStates();
    },
      (error) => {
        this.handleError(error, "Failed to fetch members data");
      }
    );

    this.subscriptions.push(membersSubscription);

  }

  // 🔍 Update member states based on existing players and selected members
  private updateMemberStates() {
    if (!this.filteredMembers.length) return;

    this.filteredMembers.forEach(member => {
      member.isSelected = this.selectedMembersSet.has(member.Id);
      member.isAlreadyExisted = this.existingPlayersSet.has(member.Id);
    });
  }

  // 🔒 Safe JSON parsing with validation
  private parseUserData(data: string): any {
    if (!data || data.length > 10000) { // Basic size validation
      throw new Error('Invalid data format');
    }

    const parsed = JSON.parse(data);

    // Validate expected structure
    if (typeof parsed !== 'object' || parsed === null) {
      throw new Error('Invalid user data structure');
    }

    return parsed;
  }

  // 🔄 Reset search state for new search
  private resetSearchState() {
    this.venus_user_input.offset = 0;
    this.venus_user_input.limit = 18;
    this.members = [];
    this.filteredMembers = [];
  }

  // 🚨 Centralized error handling
  private handleError(error: any, userMessage: string) {
    let errorMsg = userMessage;

    if (error.graphQLErrors && error.graphQLErrors.length > 0) {
      errorMsg = error.graphQLErrors[0].message || userMessage;
    } else if (error.networkError) {
      errorMsg = "Network connection error. Please check your internet connection.";
    }

    this.commonService.toastMessage(errorMsg, 3000, ToastMessageType.Error);
  }



  //mutation for saving the player

  savePlayers = async () => {
    const memberlength = this.teamMembersInput.members.length;
    if (memberlength > 0) {
      try {
        this.commonService.showLoader("Please wait...");

        const addPlayer = gql`
    mutation addPlayerToTeam($addPlayer: TeamMembersInput!){
      addPlayerToTeam(addPlayer:$addPlayer)
        
       
    
  }
`;
        const mutationVariables = { addPlayer: this.teamMembersInput }

        const saveSubscription = this.graphqlService.mutate(addPlayer, mutationVariables, 0).subscribe((res: any) => {
          this.commonService.hideLoader();
          const message = "Player Added Successfully";

          this.commonService.toastMessage(message, 2500, ToastMessageType.Success, ToastPlacement.Bottom);
          // this.navCtrl.pop().then(() => this.navCtrl.pop());
          this.viewCtrl.dismiss({ canRefreshData: true });

        },
          (error) => {
            this.commonService.hideLoader();
            this.handleError(error, "Failed to save player");
          }
        );

        this.subscriptions.push(saveSubscription);

      } catch (error) {
        this.commonService.hideLoader();
        this.handleError(error, "Failed to save player");
      }
    }
    else {
      this.commonService.toastMessage("Please select a player", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
    }

  }

  dismiss() {
    this.viewCtrl.dismiss({ canRefreshData: true });
  }



}
