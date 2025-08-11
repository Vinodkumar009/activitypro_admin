import { Component } from "@angular/core";
import {
  IonicPage,
  LoadingController,
  NavController,
  NavParams,
  ActionSheetController,
  Platform,
  ToastController,
  AlertController,
  ModalController,
} from "ionic-angular";
import {
  CommonService,
  ToastMessageType,
  ToastPlacement,
} from "../../../../services/common.service";
import { Storage } from "@ionic/storage";
import { Apollo } from "apollo-angular";
import { HttpLink } from "apollo-angular-link-http";
import { FirebaseService } from "../../../../services/firebase.service";
import moment from "moment";
import gql from "graphql-tag";
import { SharedServices } from "../../../services/sharedservice";
import { GetPlayerModel, GetStaffModel, MembersModel, TeamsForParentClubModel } from "../models/team.model";
import { stringify } from "querystring";
// import { teaminLeagueModel } from "../../league/models/league.model";
import { GraphqlService } from "../../../../services/graphql.service";


/**
 * Generated class for the TeamdetailsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: "page-teamdetails",
  templateUrl: "teamdetails.html",
})
export class TeamdetailsPage {

  //**Player related stuff start from line no 129 ***/

  //**staff related stuff start from line no 380 */

  //**Team related stuff(edit,delete) start from line no 312*/
  searchTerm: string;

  activeType: boolean = true;
  invitedType: boolean = true;
  playerType: boolean = true;
  staffType: boolean = true;
  team: TeamsForParentClubModel;
  // team:any;
  parentClubKey: string;
  teamRoles: GetRoles[];
  // participants: any[];
  // member: MembersModel[] = [];
  available_participants: PostGresUser[] = [];
  // filteredParticipant: MembersModel[] = [];
  roles: [];
  members: any[];

  staffs: GetStaffModel[];
  filteredStaff: GetStaffModel[] = [];
  participants: GetPlayerModel[];
  filteredParticipant: GetPlayerModel[] = [];
  participantCount: number = 0;
  staffCount: number;
  // lteam:teaminLeagueModel;
  lteam: TeamsForParentClubModel;


  teamsForParentClub: TeamsForParentClubModel;

  teamRolesInput: TeamRolesInput = {
    ParentClubKey: '',
    MemberKey: '',
    AppType: 0,
    ActionType: 1,
    activityCode: 0,
  }

  getStaffInput: GetStaffInput = {
    ParentClubKey: "",
    MemberKey: "",
    AppType: 0,
    ActionType: 0,
    parentClubteamId: ""
  }
  // teams: teaminLeagueModel

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private apollo: Apollo,
    private httpLink: HttpLink,
    public actionSheetCtrl: ActionSheetController,
    public loadingCtrl: LoadingController,
    public storage: Storage,
    public platform: Platform,
    public fb: FirebaseService,
    public alertCtrl: AlertController,
    public commonService: CommonService,
    private toastCtrl: ToastController,
    public sharedservice: SharedServices,
    public modalCtrl: ModalController,
    private graphqlService: GraphqlService
  ) {
    console.log(
      `${this.navParams.get("selectedteamId")}:${this.navParams.get(
        "selectedmemberkey"
      )}`
    );


  }

  ionViewDidLoad() {
    console.log("ionViewDidLoad TeamdetailsPage");
    // this.getInvitedStaff();
  }

  ionViewWillEnter() {
    // this.teams=this.navParams.get("team");

    this.team = this.navParams.get("team");
    console.log("team are", this.team);
    this.storage.get("userObj").then((val) => {
      val = JSON.parse(val);
      if (val.$key != "") {


        this.parentClubKey =
          val.UserInfo[0].ParentClubKey;

        this.getStaffInput.ParentClubKey =
          val.UserInfo[0].ParentClubKey;
        this.getStaffInput.MemberKey = val.$key;

        this.getStaffInput.parentClubteamId = String(this.team.id);
        console.log("team id is:", this.getStaffInput.parentClubteamId)

        // this.teamRolesInput.activityCode=this.team.activity.activityCode;

      }
      console.log(this.team);
      // this.getRoleForPlayers();
      this.getInvitedPlayers();
      this.getInvitedStaff();
      this.initializeItems();
      this.getTeamDetails();
    });

  }

  getTeamDetails() {
    //fetching leagues
    this.commonService.showLoader("Fetching data...");
    const leaguesforparentclubQuery = gql`
      query getTeamsById($teamId: String!) {
        getTeamsById(teamId: $teamId) {
          id
          short_name
          created_at
          created_by
          updated_at
          is_active
          activity {
            ActivityName
            ActivityCode
          }
          venueKey
          venueType
          ageGroup
          teamName
          teamStatus
          teamVisibility
          parentClub{
            FireBaseId
          }
          club{
           Id
           ClubName
           FirebaseId
         }
        }
      }
    `;
    this.graphqlService.query(leaguesforparentclubQuery, { teamId: this.team.id }, 0).subscribe((res: any) => {
      this.commonService.hideLoader();
      this.teamsForParentClub = res.data.getTeamsById;
    },
      (error) => {
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


  gotoMemberchattPage() {
    this.navCtrl.push("MemberchattPage");
  }

  gotoMemberemailPage() {
    this.navCtrl.push("MemberemailPage", { "staff": this.staffs });

  }


  gotoMultiplayeremailPage() {
    this.navCtrl.push("MultiplayeremailPage", { "players": this.participants })
  }

  //Change Type for selecting the tab

  changeType(val) {
    this.playerType = val;
    this.staffType = !val;
    // this.CreateMatchInput.MatchVisibility = val ? 0 : 1;
  }


  //*** 1.Here started Player Part  ***/

  //ActionSheet Controller
  presentActionSheet(member: GetPlayerModel) {
    let actionSheet = this.actionSheetCtrl.create({
      buttons: [
        {
          text: 'Update Role',
          icon: 'female',
          handler: () => {
            //for updating roles
            this.addRoleforPlayerandStaff(member)
          }
        },


        // {
        //   text: 'Profile',
        //   icon: 'ios-contact',
        //   handler: () => {
        //     this.getProfile();
        //   }
        // },
        // {
        //   text: 'Send Email',
        //   icon: 'md-mail',
        //   handler: () => {
        //     this.sendMailToPlayer(member)
        //     debugger
        //   }
        // },

        {
          text: 'Send Notification',
          icon: 'notifications',
          handler: () => {
            this.sendNotificationToPlayer(member)
          }
        },


        {
          text: 'Remove Player',
          icon: 'ios-trash',
          handler: () => {
            this.removePlayer(member);
          }
        },
      ]
    });
    actionSheet.present();
  }



  //b.Selected players will come here
  getInvitedPlayers = () => {
    //this.commonService.showLoader("Fetching invited players...");
    const participantsStatusQuery = gql`
      query getParentClubTeamMembers($teamId: String!,$roleType: Int!) {
        getParentClubTeamMembers(teamId:$teamId,roleType:$roleType) {
          id
          user {
            Id
            FirstName
            LastName
            Gender
            DOB
            FirebaseKey
            EmailID
            is_child
            parent_key
          }
         teamrole{
              role_type
              role_name
              role_description
         }
        }
      }
    `;
    this.graphqlService.query(participantsStatusQuery, { teamId: this.team.id, roleType: 1 }, 0).subscribe((res: any) => {
      this.participants = res.data["getParentClubTeamMembers"] as GetPlayerModel[];

      if (this.participants != null) this.participantCount = this.participants.length;

      console.log("Getting all participant", this.participants);
      this.filteredParticipant = JSON.parse(JSON.stringify(this.participants));


    },
      (error) => {
        console.error("Error in fetching:", error);
        if (error.graphQLErrors) {

          console.error("GraphQL Errors:", error.graphQLErrors);
          for (const gqlError of error.graphQLErrors) {
            console.error("Error Message:", gqlError.message);
            console.error("Error Extensions:", gqlError.extensions);

          }
        }
      }
    )

  };



  //a.this will goto (Add Players to team) Page

  gotoAddPlayer() {
    this.navCtrl.push("Addplayertoteam", { "teamid": this.team.id, "existedPlayer": this.participants });
  }

  sendMailToPlayer(member) {

  }
  //c.After Selection we can delete the players

  removePlayer(member: GetPlayerModel) {
    let name = member.user.FirstName + '' + member.user.LastName;
    let confirm = this.alertCtrl.create({
      title: 'Remove Player',
      message: `Are you sure you want to remove the ${name}? `,
      buttons: [
        {
          text: 'No',
          handler: () => {
            //console.log('Disagree clicked');
          }
        },
        {
          text: 'Yes',
          handler: () => {
            this.deletePlayer(member.id);
          }
        }
      ]
    });
    confirm.present();
  }

  //***search for players */

  getFilteredPlayer(ev: any) {
    // Reset items back to all of the items
    this.initializeItems();
    let val = ev.target.value;
    if (val && val.trim() != "") {
      this.filteredParticipant = this.participants.filter((item) => {
        if (item.user.FirstName != undefined) {
          if (item.user.FirstName.toLowerCase().indexOf(val.toLowerCase()) > -1)
            return true;
        }
        if (item.user.LastName != undefined) {
          if (item.user.LastName.toLowerCase().indexOf(val.toLowerCase()) > -1)
            return true;
        }
      });
    }
  }

  initializeItems() {
    this.filteredParticipant = this.participants;
  }

  //mutation for removing the player 
  //deletePlayer() is called from removeStaff()
  deletePlayer(memberid) {
    this.commonService.showLoader("Deleting Player")
    let memberids = {
      memberShipIds: []
    }

    memberids.memberShipIds.push(memberid);

    const delete_member = gql`
       
    mutation removeTeamPlayer($playerDetails: TeamPlayersDeleteInput!){
      removeTeamPlayer(playerDetails:$playerDetails)
    }
    
    `;
    const delete_player = { playerDetails: memberids }

    this.graphqlService.mutate(
      delete_member,
      delete_player,
      0
    ).subscribe((response) => {
      this.commonService.hideLoader();
      const message = "Player  removed successfully";
      this.commonService.toastMessage(message, 2500, ToastMessageType.Success, ToastPlacement.Bottom);
      this.getInvitedPlayers();
    }, (err) => {
      // Handle GraphQL mutation error
      console.error("GraphQL mutation error:", err);
      this.commonService.toastMessage("Player deletion failed", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
    });

  }

  ///****This Part is Separate for Team Related stuff like edit,delete etc */

  gotoEditTeam() {
    this.navCtrl.push("EditteamPage", { "team": this.teamsForParentClub });
  }

  gotoDeleteteam() {
    this.navCtrl.push("DeleteteamPage", { "teamid": this.team.id });
  }

  //this function is for deleting the team
  //After confirmation it will call the delete api ---deleteteam()
  removeteam() {
    let confirm = this.alertCtrl.create({
      title: 'Delete team',
      message: 'Are you sure you want to delete the team? ',
      buttons: [
        {
          text: 'No',
          handler: () => {
            //console.log('Disagree clicked');
          }
        },
        {
          text: 'Yes',
          handler: () => {
            this.deleteteam();
          }
        }
      ]
    });
    confirm.present();
  }

  //mutation for deletion of team
  deleteteam() {



    try {
      // Set the headers (optional)
      const delete_Team = gql`
        mutation deleteParentClubTeam($teamEditInput: String!) {
          deleteParentClubTeam(teamEditInput:$teamEditInput) 
            
        }`;

      const delete_team_variable = { teamEditInput: this.team.id };

      this.graphqlService.mutate(
        delete_Team,
        delete_team_variable,
        0
      ).subscribe((response) => {
        const message = "team deleted successfully";
        this.commonService.toastMessage(message, 2500, ToastMessageType.Success, ToastPlacement.Bottom);
        this.navCtrl.pop();
        // this.navCtrl.pop().then(() => this.navCtrl.pop().then());
      }, (err) => {
        // Handle GraphQL mutation error
        console.error("GraphQL mutation error:", err);
        this.commonService.toastMessage("team deletion failed", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
      });

    } catch (error) {

      console.error("An error occurred:", error);

    }


  }



  //*** 2.Here started Staff Part  ***/

  actionSheetforStaff(staff) {
    let actionSheet = this.actionSheetCtrl.create({
      buttons: [
        {
          text: 'Update Role',
          icon: 'female',
          handler: () => {
            //for updating roles
            this.updateroleforstaffPage(staff)
          }
        },
        // {
        //   text: 'Profile',
        //   icon: 'ios-contact',
        //   handler: () => {
        //     this.getProfile();
        //   }
        // },

        {
          text: 'Send Email',
          icon: 'md-mail',
          handler: () => {
            this.sendMailToStaff(staff)
          }
        },
        // {
        //   text: 'Send Notification',
        //   icon: 'notifications',
        //   handler: () => {
        //     this.sendNotificationToStaff(staff)
        //   }
        // },
        {
          text: 'Remove Staff',
          icon: 'ios-trash',
          handler: () => {
            this.removeStaff(staff.id);
          }
        },
      ]
    });
    actionSheet.present();
  }

  sendNotificationToStaff(staff) {
    this.navCtrl.push("StaffnotificationPage", { staff: staff })
  }


  getInvitedStaff = () => {
    const participantsStatusQuery = gql`
    query getStaffForTeam($getStaffInput: GetStaffInput!) {
      getStaffForTeam(getStaffInput:$getStaffInput) {
        id
        postgres_user_id
      
        role{
          role_name
        }
        user_type
        
        StaffDetail {
          name
          email
          firebaseKey
          firebase_coachkey
        }
      }
    }
  `;
    this.graphqlService.query(participantsStatusQuery, { getStaffInput: this.getStaffInput }, 0).subscribe((res: any) => {

      this.staffs = res.data["getStaffForTeam"] as GetStaffModel[];
      if (this.staffs != null) this.staffCount = this.staffs.length;
      console.log("Getting all staffs", this.staffs);
      this.filteredStaff = JSON.parse(JSON.stringify(this.staffs));

    },
      (error) => {
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




  //**a.Add Staff */
  gotoAddStaff() {
    this.navCtrl.push("AddstafftoteamPage", { "teamid": this.team.id, "existedstaff": this.staffs });
    console.log("id is:", this.team.id)
  }

  FilterStaffs(ev: any) {
    // Reset items back to all of the items
    this.iItems();
    let val = ev.target.value;
    if (val && val.trim() != "") {
      // this.staffs = this.staffs.filter((item) => {
      //   if (item.StaffDetail.name != undefined) {
      //     if (item.StaffDetail.name.toLowerCase().indexOf(val.toLowerCase()) > -1)
      //       return true;
      //   }
      this.filteredStaff = this.staffs.filter((item) => {
        if (item.StaffDetail.name != undefined) {
          if (item.StaffDetail.name.toLowerCase().indexOf(val.toLowerCase()) > -1)
            return true;
        }
      });
    }
  }

  iItems() {
    this.filteredStaff = this.staffs;
  }

  //**c.Staff Can Remove ***/
  removeStaff(staffid) {
    let confirm = this.alertCtrl.create({
      title: 'Delete Staff',
      message: 'Are you sure you want to delete the staff? ',
      buttons: [
        {
          text: 'No',
          handler: () => {
            //console.log('Disagree clicked');
          }
        },
        {
          text: 'Yes',
          handler: () => {
            this.deleteStaff(staffid);
          }
        }
      ]
    });
    confirm.present();
  }

  deleteStaff(staffid) {
    // this.commonService.showLoader("Deleting Staff")
    let staffids = {
      staffId: []
    }

    staffids.staffId.push(staffid);

    try {
      // Set the headers (optional)
      const delete_Team = gql`
        mutation removeTeamStaff($staffDetails: StaffDeleteInput!) {
          removeTeamStaff(staffDetails:$staffDetails) 
            
        }`;

      const delete_team_variable = { staffDetails: staffids };

      this.graphqlService.mutate(
        delete_Team,
        delete_team_variable,
        1
      ).subscribe((response) => {
        const message = "Staff  deleted successfully";
        this.commonService.toastMessage(message, 2500, ToastMessageType.Success, ToastPlacement.Bottom);
        this.getInvitedStaff();

      }, (err) => {
        // Handle GraphQL mutation error
        console.error("GraphQL mutation error:", err);
        this.commonService.toastMessage("Staff deletion failed", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
      });

    } catch (error) {

      console.error("An error occurred:", error);

    }


  }

  updateroleforstaffPage(staff) {
    this.navCtrl.push("UpdateroleforstaffPage", { "team": this.team, "staffId": staff.id });
  }

  // getProfile() {

  // }



  showToast(m: string, howLongToShow: number) {
    let toast = this.toastCtrl.create({
      message: m,
      duration: howLongToShow,
      position: 'bottom'
    });
    toast.present();
  }


  //sending an email to 
  async sendEmail(participants: GetPlayerModel) {
    //console.log(this.sessionDetails);         
    // if (this.term_ses_dets.session_members.length > 0) {
    //     const member_list = this.term_ses_dets.session_members.map((member,index) => {
    //         return {
    //             IsChild:member.is_child ? true:false,
    //             ParentId:member.is_child ? member.parent_id:"",
    //             MemberId:member.user_id,
    //             MemberEmail:member.email!="" && member.email!="-" && member.email!="n/a" ? member.email:(member.is_child ? member.parent_email:""),
    //             MemberName: member.first_name + " " + member.last_name
    //         }
    //     })
    //     const session = {
    //         module_booking_club_id:this.term_ses_dets.session.ClubDetails.Id,
    //         module_booking_club_name:this.term_ses_dets.session.ClubDetails.ClubName,
    //         module_booking_coach_id:this.term_ses_dets.session.CoachDetails[0].Id,
    //         module_booking_coach_name:this.term_ses_dets.session.CoachDetails[0].first_name + " " + this.term_ses_dets.session.CoachDetails[0].last_name,
    //         module_id:this.term_ses_dets.session.id,
    //         module_booking_name:this.term_ses_dets.session.session_name,
    //         module_booking_start_date:this.term_ses_dets.session.start_date,
    //         module_booking_end_date:this.term_ses_dets.session.end_date,
    //         module_booking_start_time:this.term_ses_dets.session.start_time,
    //         //module_booking_end_time:this.
    //         //module_booking_activity_id:this.term_ses_dets.session.ActivityDetails.Id,
    //         //module_booking_activity_name:this.term_ses_dets.session.ActivityDetails.ActivityName,
    //     }
    //     const email_modal = {
    //         module_info:session,
    //         email_users:member_list,
    //         type:100
    //     }
    //     this.navCtrl.push("MailToMemberByAdminPage", {email_modal});
    // } else {
    //     this.commonService.toastMessage("No member(s) found in current session",2500,ToastMessageType.Error);
    // }

    // const member_list =
    // {
    //   IsChild: participants.user.is_child ? true : false,
    //   ParentId: participants.user.is_child ? participants.user.parent_key : "",
    //   MemberId: participants.user.Id,
    //   // MemberEmail: participants.user.EmailID != "" && participants.user.EmailID != "-" && participants.user.EmailID != "n/a" ? participants.user.EmailID : (participants.user.is_child ? participants.parent_email : ""),
    //   MemberEmail: participants.user.EmailID && participants.user.EmailID !== "-" && participants.user.EmailID !== "n/a"
    //     ? participants.user.EmailID
    //     : participants.user.is_child
    //       ? participants.user.parent_email
    //       : "",
    //   MemberName: participants.user.FirstName + " " + participants.user.LastName
    // }

    // const session = {
    //   module_booking_club_id: this.teamsForParentClub.club.Id,
    //   module_booking_club_name: this.teamsForParentClub.club.ClubName,
    //   module_booking_coach_id: this.teamsForParentClub.session.CoachDetails[0].Id,
    //   module_booking_coach_name: this.teamsForParentClub.session.CoachDetails[0].first_name + " " + this.teamsForParentClub.session.CoachDetails[0].last_name,
    //   module_id: this.teamsForParentClub.id,
    //   module_booking_name: this.teamsForParentClub.teamName,
    //   module_booking_start_date: this.teamsForParentClub.session.start_date,
    //   module_booking_end_date: this.teamsForParentClub.session.end_date,
    //   module_booking_start_time: this.teamsForParentClub.session.start_time,
    //   //module_booking_end_time:this.
    //   //module_booking_activity_id:this.term_ses_dets.session.ActivityDetails.Id,
    //   //module_booking_activity_name:this.term_ses_dets.session.ActivityDetails.ActivityName,
    // }

    // const email_modal = {
    //   module_info: {},
    //   email_users: member_list,
    //   type: 100
    // }
  };

  //mail to staff
  sendMailToStaff(staff) {
    this.navCtrl.push("SenmailtostaffPage", { "staff": staff, "teamid": this.team.id });
    console.log(staff)
  }

  sendNotificationToPlayer(member) {
    // const mlist = [{ Key: "-Lx0T22IgEdGmhyBSnMK", UserName: "Barun T", DOB: "2000-12", }]
    this.navCtrl.push("SendnotificationteamPage", { "mlist": member, "ParentClubKey": "-KuAlAWygfsQX9t_RqNZ" });
    console.log(member);
  }

  //for update role
  addRoleforPlayerandStaff(member) {
    console.log("TEAM OBJ is", this.team);
    this.navCtrl.push("AddroleforplayernstaffPage", { "team": this.team, "memberId": member.id });
  }




  presentToast(msg) {
    let toast = this.toastCtrl.create({
      message: msg,
      duration: 2000
    });
    toast.present();
  }

}


export class TeamRolesInput {
  ParentClubKey: String
  MemberKey: String
  AppType: number
  ActionType: number
  activityCode: number
}

export class GetRoles {
  teamRoles: {
    role_type: string;
    role_name: string;
  }
  staffRoles:
    {
      role_type: string;
      role_name: string;

    }
}

export class PostGresUser {
  id: string;
  FirstName: string;
  LastName: string;
  Gender: string;
  DOB: string;
  FirebaseKey: string;
}

export class GetStaffInput {
  ParentClubKey: string
  MemberKey: string
  AppType: number
  ActionType: number
  parentClubteamId: string
}

