import { Component } from "@angular/core";
import { ActionSheetController, IonicPage, LoadingController, NavController, NavParams, AlertController, ModalController } from "ionic-angular";
import { Storage } from "@ionic/storage";
import { SharedServices } from "../../../services/sharedservice";
import { FirebaseService } from "../../../../services/firebase.service";
import { CommonService, ToastMessageType, ToastPlacement } from "../../../../services/common.service";
import { Apollo } from "apollo-angular";
import moment from "moment";
import gql from "graphql-tag";
import { GraphqlService } from "../../../../services/graphql.service";
import { AllMatchData } from "../../../../shared/model/match.model";
/**
 * Generated class for the MatchdetailsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: "page-matchdetails",
  templateUrl: "matchdetails.html",
})
export class MatchdetailsPage {
  activeType: boolean = true;
  invitedType: boolean = true;
  UserInvitationStatus = {
    MatchId: "",
    MemberId: "",
  };
  participants: ParticipantModel[] = [];
  teams: TeamsModal[];
  winner_team = {
    index: 0,
    comments: "",
    comments_date: ""
  }

  match: AllMatchData;
  history: any;

  InvitationResponseInput = {
    MatchId: "",
    MemberKey: "",
    ParticipationStatus: 0,
    InviteStatus: 3,
  };
  parentClubKey: string;
  isCanEditTeams: boolean = false;
  isTeamParticipantsAvail: boolean = true;
  isHistory = false;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private apollo: Apollo,
    public commonService: CommonService,
    public loadingCtrl: LoadingController,
    public alertCtrl: AlertController,
    public storage: Storage,
    public fb: FirebaseService,
    public sharedservice: SharedServices,
    public actionSheetCtrl: ActionSheetController,
    public modalCtrl: ModalController,
    private graphqlService: GraphqlService
  ) {
    console.log(
      `${this.navParams.get("selectedmatchId")}:${this.navParams.get(
        "selectedmemberkey"
      )}`
    );


    this.match = this.navParams.get("match");
    this.isHistory = this.navParams.get('isHistory')
    if (!this.isHistory) {
      this.isHistory = false
    }
    // Note: AllMatchData doesn't have Result property, so commenting out these lines
    // this.winner_team.comments = this.match.Result && this.match.Result.resultDescription ? this.match.Result.resultDescription : "";
    // this.winner_team.comments_date = this.match.Result && this.match.Result.CreatedAt ? this.match.Result.CreatedAt : "";
    console.log(this.match);
    this.UserInvitationStatus.MatchId = this.match.MatchId;
    this.InvitationResponseInput.MatchId = this.match.MatchId;
    // this.UserInvitationStatus.MemberKey = this.navParams.get("selectedmemberkey");
    console.log(this.UserInvitationStatus);
    this.getActiveTeams();
    this.getInvitedPlayers();
    this.storage.get("userObj").then((val) => {
      val = JSON.parse(val);
      if (val.$key != "") {
        this.parentClubKey = val.UserInfo[0].ParentClubKey
        //this.UserInvitationStatus.MemberKey = val.UserInfo[0].ParentClubKey;
        this.UserInvitationStatus.MemberId = "476fd04d-4d42-42d4-865d-331c12a2a418";
      }
    });
  }

  ionViewDidLoad() {
    console.log("ionViewDidLoad MatchdetailsPage");

  }

  getFormattedDate(date: any) {
    return moment(+date).format("DD MMM YYYY, hh:mm A");
  }

  gotoMatchInvitePlayers() {
    let profileModal = this.modalCtrl.create("MatchinviteplayersPage", {
      selectedmatchId: this.UserInvitationStatus.MatchId,
      selectedmemberId: this.UserInvitationStatus.MemberId,
      existed_members: this.participants
    });
    profileModal.onDidDismiss(data => {
      console.log(data);
      if (data.canRefreshData) this.getInvitedPlayers();
    });
    profileModal.present();

  }

  formatMatchStartDate(date) {
    return moment(date, "YYYY-MM-DD HH:mm").local().format("DD-MMM-YYYY hh:mm A");
  }

  getColor(index: number) {
    switch (index) {
      case 0:
        return 'green';
      case 1:
        return 'red';
    }
  }

  manipulateUser(user: User, teamIndex: number, userIndex: number) {
    if (user.isUserAvailable) {
      // User is already added, so we remove them
      user.isUserAvailable = !user.isUserAvailable;
      this.teams[teamIndex].Participants[userIndex].User.FirebaseKey = "";
      this.teams[teamIndex].Participants[userIndex].User.FirstName = "";
      this.teams[teamIndex].Participants[userIndex].User.LastName = "";
      this.teams[teamIndex].Participants[userIndex].User.isUserAvailable = false;

      // Check if all participants are valid after the removal
      this.checkIsTeamValid();
      // Update team data after modification
      this.teamsUpdateConfirmation(teamIndex, userIndex);
    } else {
      // User is not added, so we add them by showing available members to choose from
      this.showAvailableMembers(user, teamIndex, userIndex);
    }

  }

  getAvailableUsers() {
    let availbleUsers: UserModel[] = [];
    let team_participants: User[] = [];
    for (let i = 0; i < this.teams.length; i++) {
      if (this.teams[i].Participants.length > 0) {
        for (let j = 0; j < this.teams[i].Participants.length; j++) {
          team_participants.push(this.teams[i].Participants[j].User);
        }
      }
    }
    console.log(`parts::${JSON.parse(JSON.stringify(team_participants))}`);
    for (let i = 0; i < this.participants.length; i++) {
      let user = team_participants.find(participant => participant.Id == this.participants[i].User.Id);

      if (user) { //check if user there
        if ((user.isUserAvailable) && (this.participants[i].InviteStatus == 0 || this.participants[i].InviteStatus == 1)) {
          availbleUsers.push(this.participants[i].User);
        }
      } else {
        if (this.participants[i].InviteStatus == 0 || this.participants[i].InviteStatus == 1) availbleUsers.push(this.participants[i].User);
      }

      // if((!user) && (this.participants[i].InviteStatus == 0 || this.participants[i].InviteStatus == 1)){
      //   availbleUsers.push(this.participants[i].User);
      // }else{
      //   if(user.isUserAvailable)availbleUsers.push(this.participants[i].User);
      // }
    }

    return availbleUsers;
  }

  showAvailableMembers(member: User, teamIndex: number, userIndex: number) {
    let availableUsers = this.getAvailableUsers();

    // Filter out users who are already in the team
    // const selectedUserIds = this.teams[teamIndex].Participants.map(participant => participant.User.Id);
    // availableUsers = availableUsers.filter(user => !selectedUserIds.includes(user.Id));

    if (availableUsers.length > 0) {
      console.log(availableUsers)
      let alert = this.alertCtrl.create();
      alert.setTitle(`Add member to the ${this.teams[teamIndex].TeamName}`);

      for (let userIndex = 0; userIndex < availableUsers.length; userIndex++) {
        alert.addInput({
          type: 'radio',
          label: `${availableUsers[userIndex].FirstName} ${availableUsers[userIndex].LastName}`,
          value: availableUsers[userIndex].Id,
          checked: false
        });
      }

      alert.addButton('Cancel');
      alert.addButton({
        text: 'OK',
        handler: userpostgresId => {
          console.log(userpostgresId);
          const participant = this.participants.find(participant => participant.User.Id === userpostgresId);
          this.teams[teamIndex].Participants[userIndex].User.Id = participant.User.Id;
          this.teams[teamIndex].Participants[userIndex].User.FirstName = participant.User.FirstName;
          this.teams[teamIndex].Participants[userIndex].User.LastName = participant.User.LastName;
          this.teams[teamIndex].Participants[userIndex].User.isUserAvailable = true;
          this.teamsUpdateConfirmation(teamIndex, userIndex);
        }
      });

      alert.present();

    } else {
      this.commonService.toastMessage("No users", 3000, ToastMessageType.Error, ToastPlacement.Bottom);
    }

  }

  changeType(val) {
    this.activeType = val;
    this.invitedType = !val;
    this.activeType ? this.getActiveTeams() : this.getInvitedPlayers();
  }



  getInvitedPlayers() {
    //this.commonService.showLoader("Fetching invited players...");
    const participantsStatusQuery = gql`
      query checkAllParticipantsStatus($UserInput: UserInvitationStatus!) {
        checkAllParticipantsStatus(UserInput: $UserInput) {
          Id
          User {
            Id
            FirstName
            LastName
            Gender
            DOB
            FirebaseKey
          }
          ParticipationStatus
          InviteStatus
          InviteType
          TotalPoints
        }
      }
    `;
    this.graphqlService.query(participantsStatusQuery, { UserInput: this.UserInvitationStatus }, 0).subscribe((res: any) => {
      // this.commonService.hideLoader()
      this.participants = res.data.checkAllParticipantsStatus;
      this.canEditTeams();
    }, (error) => {
      this.commonService.hideLoader();
      this.commonService.toastMessage("Failed to fetch invited players list", 2500, ToastMessageType.Error);
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
    )


  };

  canEditTeams() {

    const isUserInParticipants = this.participants.some(participant => participant.User && participant.User.Id === this.UserInvitationStatus.MemberId);
    if (isUserInParticipants) {
      this.isCanEditTeams = true;
      return;
    }


    // Note: AllMatchData doesn't have Hosts property, so commenting out host check
    // const isUserHostOfMatch = this.match.Hosts.some(host => host.User
    //   && host.User.Id === this.UserInvitationStatus.MemberId);
    // if (isUserHostOfMatch) {
    //   this.isCanEditTeams = true;
    //   return;
    // }

    this.isCanEditTeams = false;
  }

  // canEditTeams() {
  //   if (this.participants.length > 0) { // check the logged in user is in invite list
  //     const user = this.participants.find(participant => participant.User.Id === this.UserInvitationStatus.MemberId);
  //     if (user) this.isCanEditTeams = true;
  //   }
  //   else if (this.match.length > 0) { // check the logged in user is the host of match
  //     const user = this.match.Hosts(host => host.User.Id === this.UserInvitationStatus.MemberId);
  //     if (user) this.isCanEditTeams = true;
  //   }

  // }

  getActiveTeams() {
    //this.commonService.showLoader("Fetching teams...");
    this.teams = [];
    const getTeamsQuery = gql`
      query getTeamsByMatch($matchDetailsInput: FetchTeamsInput!) {
        getTeamsByMatch(matchDetailsInput: $matchDetailsInput) {
          Id
          TeamName
          TeamPoint
          ResultStatus
          Participants{
          PaymentStatus
          InviteStatus
          InviteType
          ParticipationStatus
            User{
              Id
              FirstName
              LastName
              FirebaseKey
            }
          }
      }
    }`;
    this.graphqlService.query(getTeamsQuery, { matchDetailsInput: { MatchId: this.UserInvitationStatus.MatchId } }, 0).subscribe((res: any) => {

      this.teams = res.data.getTeamsByMatch;
      console.log(this.teams.length);
      const participants_length = this.match.MatchType == 0 ? 1 : 2;
      this.teams = this.sortByTeamName(this.teams);

      if (this.teams.length > 0) {
        for (let i = 0; i < this.teams.length; i++) {
          this.teams[i]["IsWinner"] = false;
          this.teams[i]['Sets_Points'] = [];
          // Note: AllMatchData doesn't have Result property, so commenting out result-related logic
          // if (this.match.Result && this.match.Result.ResultStatus == 1) {
          //   this.teams[i]["IsWinner"] = this.match.Result.Winner.Id === this.teams[i].Id ? true : false;
          //   this.teams[i]["Sets_Points"] = this.match.Result && this.match.Result.ResultDetails ? JSON.parse(this.match.Result.ResultDetails.split(":")[i]) : [];
          // }

          for (let j = 0; j < participants_length; j++) {
            console.log(`${j}:${this.teams[i].Participants[j]}`);
            if (this.teams[i].Participants[j] && this.teams[i].Participants[j].User && this.teams[i].Participants[j].User.FirebaseKey != '') {
              this.teams[i].Participants[j].User["isUserAvailable"] = true;
            }
            else {
              let participant_obj = {
                InviteStatus: 0,
                InviteType: 0,
                ParticipationStatus: 0,
                PaymentStatus: 0,
                User: {
                  Id: '',
                  FirstName: '',
                  LastName: '',
                  FirebaseKey: '',
                  isUserAvailable: false
                }
              }
              this.teams[i].Participants[j] = participant_obj;
              console.log(this.teams[i].Participants[j]["User"]);
            }
          }
        }
        console.log("teams data" + JSON.stringify(this.teams));
        this.checkIsTeamValid();
        //console.log(this.isTeamParticipantsAvail);
      }
    }, (error) => {
      this.commonService.toastMessage("Failed to fetch teams", 2500, ToastMessageType.Error);
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
    )

  }

  //sorting teams by teamname
  sortByTeamName(teams: any) {
    return teams.sort((a, b) => (a.TeamName > b.TeamName) ? 1 : ((b.TeamName > a.TeamName) ? -1 : 0))
  }

  presentActionSheet(selectedparticipant: ParticipantModel) {
    if (!this.isHistory && selectedparticipant.InviteStatus < 2) {
      let actionSheet = this.actionSheetCtrl.create({
        title: "Do you want to cancel the invite?",
        buttons: [
          {
            text: "Yes",
            role: "destructive",
            icon: "checkmark",
            handler: () => {
              this.invite(selectedparticipant);
            },
          },
          {
            text: "No",
            role: "cancel",
            icon: "close",
            handler: () => {
              console.log("Cancel clicked");
            },
          },
        ],
      });

      actionSheet.present();
    }
  }

  invite(selectedparticipant) {

    // this.apollo
    //   .mutate({
    //     mutation: gql`
    //       mutation inviteResponse(
    //         $InvitationResponseInput: UserInviteResponseInput!
    //       ) {
    //         inviteResponse(InvitationResponseInput: $InvitationResponseInput)
    //       }
    //     `,
    //     variables: { InvitationResponseInput: this.InvitationResponseInput },
    //   })
    //   .subscribe(
    //     ({ data }) => {
    //       this.commonService.hideLoader();
    //       console.log("invite data" + data["inviteResponse"]);
    //       this.commonService.toastMessage("Invite cancelled successfully", 2500, ToastMessageType.Success, ToastPlacement.Bottom);
    //       this.getInvitedPlayers();
    //     },
    //     (err) => {
    //       this.commonService.hideLoader();
    //       console.log(JSON.stringify(err));
    //       this.commonService.toastMessage("Invite cancellation failed", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
    //     }
    //   );

    try {

      this.InvitationResponseInput.MemberKey =
        selectedparticipant.User.FirebaseKey;
      const invite_User = gql`
        mutation  inviteResponse( $InvitationResponseInput: UserInviteResponseInput!){
          inviteResponse(InvitationResponseInput: $InvitationResponseInput)
        }
        `;
      const deleteVariable = { InvitationResponseInput: this.InvitationResponseInput }

      this.graphqlService.mutate(invite_User, deleteVariable, 1).subscribe((response) => {
        const message = "Invite cancelled successfully";
        this.commonService.toastMessage(message, 2500, ToastMessageType.Success, ToastPlacement.Bottom);
        this.getInvitedPlayers();
      }, (err) => {
        console.error("GraphQL mutation error:", err);
        this.commonService.toastMessage("Invite cancellation failed", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
      }
      )
    } catch (error) {

      console.error("An error occurred:", error);

    }

  }

  checkIsTeamValid() {
    let isAllUserAvailStatus: boolean = true;
    for (let i = 0; i < this.teams.length; i++) {
      if (this.teams[i].Participants.length > 0) {
        for (let j = 0; j < this.teams[i].Participants.length; j++) {
          let participant = this.teams[i].Participants[j];
          if (!participant.User || !participant.User.isUserAvailable) {
            isAllUserAvailStatus = false;
            console.log(`about to break in if`);
            break;
          }
        }
        if (!isAllUserAvailStatus) break;
      }
    }
    this.isTeamParticipantsAvail = isAllUserAvailStatus;
  }

  teamsUpdateConfirmation(teamIndex: number, userIndex: number) {
    let team_updateInput = {
      TeamId: this.teams[teamIndex].Id,
      MatchId: this.match.MatchId,
      Players: []
    }

    this.teams[teamIndex].Participants.filter(participant => participant.User.isUserAvailable).map((participant) => {
      team_updateInput.Players.push(participant.User.Id);
    });

    this.updateTeams(team_updateInput);
  }

  updateTeams(update_team_input) {
    try {


      const update_Team = gql`
      mutation  updateTeam($ModifyTeamDetailsInput: TeamInput!){
        updateTeam(ModifyTeamDetailsInput: $ModifyTeamDetailsInput){
         TeamName
          Description
          ResultStatus
        }
      }
      `;
      const deleteVariable = { ModifyTeamDetailsInput: update_team_input }

      this.graphqlService.mutate(update_Team, deleteVariable, 0).subscribe((response) => {
        const message = "teams updated successfully";
        this.commonService.toastMessage(message, 2500, ToastMessageType.Success, ToastPlacement.Bottom);
        this.checkIsTeamValid();
        this.getInvitedPlayers();

      }, (err) => {
        console.error("GraphQL mutation error:", err);
        this.commonService.toastMessage("teams updation failed", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
      }
      )
    } catch (error) {

      console.error("An error occurred:", error);

    }
    // this.apollo
    //   .mutate({
    //     mutation: gql`
    //     mutation updateTeam($ModifyTeamDetailsInput: TeamInput!) {
    //       updateTeam(ModifyTeamDetailsInput: $ModifyTeamDetailsInput){
    //         TeamName
    //         Description
    //         ResultStatus
    //       }
    //     }
    //   `,
    //     variables: { ModifyTeamDetailsInput: update_team_input },
    //   })
    //   .subscribe(
    //     ({ data }) => {
    //       console.log("invite data" + data["updateTeam"]);
    //       this.commonService.toastMessage("teams updated successfully", 2500, ToastMessageType.Success, ToastPlacement.Bottom);
    //       this.checkIsTeamValid();
    //       this.getInvitedPlayers(); //to refresh the available invite players
    //     },
    //     (err) => {
    //       console.log(JSON.stringify(err));
    //       this.commonService.toastMessage("teams updation failed", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
    //     }
    //   );
  }


  goto_publishresult() {
    const todays_date = moment().format("YYYY-MM-DD hh:mm A");
    // if (moment(this.match.MatchStartDate, "YYYY-MM-DD hh:mm A").isAfter(todays_date)) {
    //   this.commonService.toastMessage("cannot publish future match", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
    //   return false;
    // }
    const teams = JSON.parse(JSON.stringify(this.teams));
    this.navCtrl.push("PublishresultPage", { matchId: this.match.MatchId, teams: teams });
  }


  deleteConfirm() {
    let match_delete_alert = this.alertCtrl.create({
      title: "Do you want to delete the match?",
      buttons: [
        {
          text: "Delete",
          // icon: "checkmark",
          handler: () => {
            this.delete();
          },
        },
        {
          text: "No",
          role: "cancel",
          // icon: "close",
          handler: () => {
            console.log("Cancel clicked");
          },
        },
      ],
    });

    match_delete_alert.present();
  }



  delete() {

    this.commonService.showLoader("Please wait...");
    try {


      const delete_Match = gql`
       mutation deleteMatch($deleteMatchInput: DeleteMatchInput!) {
        deleteMatch(deleteMatchInput: $deleteMatchInput)
      }`
        ;
      const deleteVariable = { deleteMatchInput: { ParentClubKey: this.parentClubKey, MatchId: this.match.MatchId } }

      this.graphqlService.mutate(delete_Match, deleteVariable, 1).subscribe((response) => {
        this.commonService.hideLoader();
        const message = "match deleted successfully";
        this.commonService.toastMessage(message, 2500, ToastMessageType.Success, ToastPlacement.Bottom);
        this.commonService.updateCategory("matchlist");
        this.navCtrl.pop().then(() => this.navCtrl.pop().then());

      }, (err) => {
        this.commonService.hideLoader();
        console.error("GraphQL mutation error:", err);
        this.commonService.toastMessage("match deletion failed", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
      }
      )
    } catch (error) {

      console.error("An error occurred:", error);

    }
  }

}
export class UserInvitationStatus {
  MatchId: string;
  MemberKey: string;
}

export class InvitationResponseInput {
  MatchId: String;
  MemberKey: String;
  ParticipationStatus: number;
  InviteStatus: number;
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
  Hosts: UserModel;
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
  IsSelf?: Boolean;
}
//invite players
export class MembersModel {
  FirstName: string;
  LastName: string;
  Gender: string;
  DOB: string;
  FirebaseKey: string;
}


export class TeamsModal {
  Id: string;
  TeamName: string;
  Participants: TeamParticipants[]
}

export class TeamParticipants {
  PaymentStatus: number
  InviteStatus: number
  InviteType: number
  ParticipationStatus: number
  User: User

}

export class User {
  Id: string
  FirstName: string
  LastName: string
  FirebaseKey: string
  isUserAvailable?: boolean
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