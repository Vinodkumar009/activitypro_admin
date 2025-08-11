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
  ViewController,
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
import { Role } from "../team.model";
import { GraphqlService } from "../../../../services/graphql.service";
/**
 * Generated class for the UpdateroleforstaffPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-updateroleforstaff',
  templateUrl: 'updateroleforstaff.html',
})
export class UpdateroleforstaffPage {


  team: TeamsForParentClubModel;
  parentClubKey: string;
  roles: Role[];

  teamRolesInput: TeamRolesInput = {
    ParentClubKey: '',
    MemberKey: '',
    AppType: 0,
    ActionType: 0,
    activityCode: 0,
  }

  modifyStaff: ModifyStaff = {
    staffId: "",
    roleId: ""
  }

  staffId: string;


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
    public navParams: NavParams,
    public viewCtrl: ViewController) {

    this.team = this.navParams.get("team");
    this.staffId = this.navParams.get("staffId");
    //this.playerId=this.navParams.get("memberId");
    // console.log(this.playerId);
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
      this.getroleforStaff();
      // this. getInvitedPlayers();
    });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad UpdateroleforstaffPage');
  }

  selectRoleToUpdate(role: Role) {
    let isPresent = false;
    if (!isPresent) {
      this.modifyStaff.staffId = this.staffId;
      this.modifyStaff.roleId = role.id;
    }



    console.log(this.modifyStaff);
    return this.modifyStaff;
  }


  getroleforStaff() {
    this.commonService.showLoader("Fetching Role...")

    const getRole = gql`
    
    query getTeamRoles($activityDetails:TeamRolesInput!){
      getTeamRoles(activityDetails:$activityDetails){

        staffRoles{
          id
           role_name
           role_type
         }
      }

    }

    `;
    this.graphqlService.query(getRole, { activityDetails: this.teamRolesInput }, 0).subscribe((data: any) => {
      this.commonService.hideLoader();
      this.roles = data.data.getTeamRoles.staffRoles;

      console.log("Roles getting for staff:", JSON.stringify(this.roles));
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


  }

  async updateroleforstaff() {


    this.modifyStaff.staffId = this.modifyStaff.staffId;
    this.modifyStaff.roleId = this.modifyStaff.roleId;


    const addRole = gql`
           mutation updateStaffRoleInTeam($staffRoleUpdate: ModifyStaff!){
            updateStaffRoleInTeam(staffRoleUpdate: $staffRoleUpdate)
            
       }
      `;
    const mutationVariable = { staffRoleUpdate: this.modifyStaff }
    this.graphqlService.mutate(
      addRole,
      mutationVariable,
      0
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


  // updateroleforstaff(){

  //   this.modifyStaff.staffId=this.modifyStaff.staffId;
  //   this.modifyStaff.roleId=this.modifyStaff.roleId;

  //   //mutation 
  //   this.apollo.mutate({
  //     mutation: gql`
  //     mutation updateStaffRoleInTeam($staffRoleUpdate: ModifyStaff!){
  //       updateStaffRoleInTeam(staffRoleUpdate:$staffRoleUpdate)
  //     }
  //     `,
  //     variables: {staffRoleUpdate: this.modifyStaff }
  //   }).
  //     subscribe( ({ data }) => {
  //       this.commonService.hideLoader();
  //       this.commonService.toastMessage(
  //         "Roles updated successfully",
  //         2500,
  //         ToastMessageType.Success,
  //         ToastPlacement.Bottom
  //       );

  //       console.log("role updation data" + data["updateStaffRoleInTeam"]);
  //       // this.getParentClubAPPlusUsers();
  //        this.navCtrl.pop();
  //     }
  //       ,
  //       (err) => {
  //         this.commonService.hideLoader();
  //         console.log(JSON.stringify(err));
  //         this.commonService.toastMessage(
  //           "Roles updation failed",
  //           2500,
  //           ToastMessageType.Error,
  //           ToastPlacement.Bottom
  //         );
  //       })

  // }

}

export class TeamRolesInput {
  ParentClubKey: String
  MemberKey: String
  AppType: number
  ActionType: number
  activityCode: number
}

export class ModifyStaff {
  staffId: string
  roleId: string
}
