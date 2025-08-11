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
import { MembersModel, TeamsForParentClubModel } from "../models/team.model";
import { GraphqlService } from "../../../../services/graphql.service";
import { Role } from "../team.model";

/**
 * Generated class for the AddroleforplayernstaffPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-addroleforplayernstaff',
  templateUrl: 'addroleforplayernstaff.html',
})
export class AddroleforplayernstaffPage {

  team: TeamsForParentClubModel;
  parentClubKey: string;
  // teamRoles: [];
  roles: Role[];

  teamRolesInput: TeamRolesInput = {
    ParentClubKey: '',
    MemberKey: '',
    AppType: 0,
    ActionType: 0,
    activityCode: 0,
  }

  modifyMember: ModifyMember = {
    playerTeamId: "",
    roleId: ""
  }

  playerId: string; //this is for catching the memberid

  constructor(
    public navCtrl: NavController,
    private graphqlService: GraphqlService,
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
    public navParams: NavParams) {

    this.team = this.navParams.get("team");
    this.playerId = this.navParams.get("memberId");
    console.log(this.playerId);
    console.log(this.team.activity.ActivityCode);
    this.storage.get("userObj").then((val) => {
      val = JSON.parse(val);
      if (val.$key != "") {
        this.parentClubKey =
          val.UserInfo[0].ParentClubKey;
        this.teamRolesInput.ParentClubKey =
          val.UserInfo[0].ParentClubKey;
        this.teamRolesInput.MemberKey = val.$key;
        this.teamRolesInput.activityCode =
          parseInt(this.team.activity.ActivityCode);

        // this.teamRolesInput.activityCode=this.team.activity.activityCode;

      }
      console.log(this.team);
      this.getRoleForPlayers();
      // this. getInvitedPlayers();
    });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad AddroleforplayernstaffPage');
  }

  selectRoleToUpdate(role) {
    let isPresent = false;
    if (!isPresent) {
      this.modifyMember.playerTeamId = this.playerId;
      this.modifyMember.roleId = role.id;
    }



    console.log(this.modifyMember);
    return this.modifyMember;
  }

  getRoleForPlayers() {

    this.commonService.showLoader("Fetching Role...")
    const playernstaffrole = gql`
      query getTeamRoles($activityDetails:TeamRolesInput!) { 
       getTeamRoles(activityDetails:$activityDetails){
        teamRoles {
          id
          role_type
          role_name
        }

         }
       }
     `;
    this.graphqlService.query(playernstaffrole, { activityDetails: this.teamRolesInput }, 0).subscribe((data: any) => {
      this.commonService.hideLoader();
      this.roles = data.data.getTeamRoles.teamRoles;
      console.log("Roles getting for player:", JSON.stringify(this.roles));
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
    // this.apollo
    //   .query({
    //     query: playernstaffrole,
    //     fetchPolicy: "network-only",
    //     variables: {
    //       activityDetails: this.teamRolesInput,
    //     },
    //   })
    //   .subscribe(
    //     ({ data }) => {
    //       console.log(
    //         "playerrole data" + JSON.stringify(data["getTeamRoles"])
    //       );
    //       this.roles = data["getTeamRoles"]["teamRoles"];
    //       console.log("Getting Player Roles", this.roles);
    //       this.commonService.hideLoader();

    //     },
    //     (err) => {
    //       console.log(JSON.stringify(err));
    //       this.commonService.toastMessage(
    //         "failed to fetch role",
    //         2500,
    //         ToastMessageType.Error,
    //         ToastPlacement.Bottom
    //       );
    //     })
  }


  //mutation for updating the role

  savePlayers = async () => {
    console.log(JSON.stringify(this.modifyMember));

    this.modifyMember.playerTeamId = this.modifyMember.playerTeamId;
    this.modifyMember.roleId = this.modifyMember.roleId;
    //mutation 


    try {
      const addRole = gql`
             mutation updatePlayerRoleInTeam($teamMemberRoleUpdate: ModifyMember!){
              updatePlayerRoleInTeam(teamMemberRoleUpdate: $teamMemberRoleUpdate)
              
         }
        `;
      const mutationVariable = { teamMemberRoleUpdate: this.modifyMember }
      this.graphqlService.mutate(
        addRole,
        mutationVariable,
        0,
        // 1
      ).subscribe((response) => {
        const message = "Roles updated successfully";
        this.commonService.toastMessage(message, 2500, ToastMessageType.Success, ToastPlacement.Bottom);
        this.navCtrl.pop();

      }, (err) => {


        //  this.commonService.toastMessage("video creation  failed", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
        console.error("GraphQL mutation error:", err);
        if (err.error && err.error.errors) {

          const errorMessage = err.error.errors[0].message;
          this.commonService.toastMessage(errorMessage, 2500, ToastMessageType.Error, ToastPlacement.Bottom);
        } else {

          this.commonService.toastMessage("Roles updation failed", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
        }
      });
    }

    catch (err) {
      console.error(err)
    }
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

export class ModifyMember {
  playerTeamId: string
  roleId: string
}