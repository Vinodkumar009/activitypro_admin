import { Component } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { ActionSheetController, IonicPage, LoadingController, NavController, NavParams } from 'ionic-angular';
import { CommonService, ToastMessageType, ToastPlacement } from '../../../../services/common.service';
import { Storage } from "@ionic/storage";
import { AlertController } from 'ionic-angular/components/alert/alert-controller';
import gql from 'graphql-tag';
import { UserLevelHistoryForApprovalModel } from '../../levels/models/levels.model';
import { UsersModel } from '../../tournament/addmembertournament/addmembertournament';
import { ToastController } from 'ionic-angular/components/toast/toast-controller';
import { GraphqlService } from '../../../../services/graphql.service';

/**
 * Generated class for the ApprovalPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-approval',
  templateUrl: 'approval.html',
  providers:[GraphqlService]
})
export class ApprovalPage {

  updateUserLevelHistoryInput: UpdateUserLevelHistoryInput = {
    ParentClubKey: '',
    ClubKey: '',
    MemberKey: '',
    AppType: 0,
    ActionType: 0,
    DeviceType: 1,
    approval_id: '',
    comments: ''
  }

  approveUserlevelsInput: ApproveUserlevelsInput = {
    ParentClubKey: '',
    ClubKey: '',
    MemberKey: '',
    AppType: 0,
    ActionType: 0,
    DeviceType: 1,
  }

  approvalStatusList: UserLevelHistoryForApprovalModel[] = [];
  filteredApprovalStatusList: UserLevelHistoryForApprovalModel[] = [];

  // parentClubKey: string = "";
  campDetails: any;
  sessionDetails = [];
  // memberList = [];
  allselectedMembersForSessions = [];
  allMembers = [];
  selectedMemberList = [];
  activeSessions = 0;
  campSessions = [];
  campSessionsDateWise = {};
  selectedSessionsForEnrolledDateWise = {};
  limit: number = 18;
  offset: number = 0;
  search_term: string = '';
  allMemebers = [];
  memberList = [];



  constructor(public navCtrl: NavController, public navParams: NavParams,
    public actionSheetCtrl: ActionSheetController,
    private apollo: Apollo,
    private toastCtrl: ToastController,
    public commonService: CommonService,
    public loadingCtrl: LoadingController,
    public storage: Storage,
    private alertCtrl: AlertController,
    private graphqlService:GraphqlService,
  ) {

    this.storage.get("userObj").then((val) => {

      val = JSON.parse(val);
      if (val.$key != "") {
        // this.parentClubKey = val.UserInfo[0].ParentClubKey;
        this.approveUserlevelsInput.ParentClubKey = val.UserInfo[0].ParentClubKey;
        this.approveUserlevelsInput.MemberKey = val.$key;
        this.updateUserLevelHistoryInput.ParentClubKey = val.UserInfo[0].ParentClubKey;
        this.updateUserLevelHistoryInput.MemberKey = val.$key;
      }
      this.getApprovalStatus();
    });
  }

  getFilterItems(ev: any) {
    let val = ev.target.value;
    if (val && val.trim() != "") {
      this.filteredApprovalStatusList = this.approvalStatusList.filter((item) => {
        if (item.FirstName != undefined) {
          if (item.FirstName.toLowerCase().indexOf(val.toLowerCase()) > -1) return true;
        }
        if (item.LastName != undefined) {
          if (item.LastName.toLowerCase().indexOf(val.toLowerCase()) > -1) return true;
        }
        if (item.DOB != undefined) {
          if (item.DOB.toLowerCase().indexOf(val.toLowerCase()) > -1) return true;
        }
        if (item.focus_area_name != undefined) {
          if (item.focus_area_name.toLowerCase().indexOf(val.toLowerCase()) > -1) return true;
        }
        if (item.LastName != undefined) {
          if (item.LastName.toLowerCase().indexOf(val.toLowerCase()) > -1) return true;
        }
      });
    } else this.initializeItems();
  }
  initializeItems() {
    this.filteredApprovalStatusList = this.approvalStatusList;
  }

  calculateAgeFromDOB(dobString: string): string {
    if (!dobString) {
      return 'N/A'; // Return 'N/A' if DOB is not provided or invalid
    }

    const dob = new Date(dobString);
    const today = new Date();
    const age = today.getFullYear() - dob.getFullYear();

    // Check if the birthday has already occurred this year
    if (
      today.getMonth() < dob.getMonth() ||
      (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate())
    ) {
      // If not, subtract 1 from the age
      return (age - 1).toString();
    }

    return age.toString();
  }

  // Add this function to your ApprovalPage class
  formatCompletedOn(completedOnTimestamp: string): string {
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    const date = new Date(Number(completedOnTimestamp));
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    return `${day} ${month} ${year}`;
  }



  ionViewDidLoad() {
    console.log('ionViewDidLoad ApprovalPage');
  }


  async presentPopUpRej(app: UserLevelHistoryForApprovalModel) {
    let alert = this.alertCtrl.create({
      title: 'Need more work',
      cssClass: 'comments_text',
      inputs: [
        {
          name: 'comments',
          placeholder: 'Leave your comments here',
          type: 'text',
          // cssClass :'comments_text',
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: data => { }
        },
        {
          text: 'Ok',
          handler: (data) => {
            const comment = data.comments.trim();
            if (comment === '') {
              this.commonService.toastMessage(
                "Comment(s) cannot be empty",
                2500,
                ToastMessageType.Info,
                ToastPlacement.Bottom
              );
            } else {
              this.updateUserLevelHistoryInput.comments = comment;
              this.updateUserLevelHistoryInput.ActionType = 3;
              this.approvalStatusChangeUserLevelChallenge(app);
            }
          }
        }
      ]
    });
    alert.present();
  }
  async presentPopUpApp(app: UserLevelHistoryForApprovalModel) {
    let alert = this.alertCtrl.create({
      title: 'Approve',
      inputs: [
        {
          name: 'comments',
          placeholder: 'Leave your comments here(Optional)',
          type: 'text'
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: data => {
            // console.log('Cancel clicked');
          },
          // cssClass: 'approve-option'
        },
        {
          text: 'Ok',
          handler: (data) => {
            this.updateUserLevelHistoryInput.comments = data.comments;
            this.updateUserLevelHistoryInput.ActionType = 2;
            this.approvalStatusChangeUserLevelChallenge(app);
          }
        }
      ]
    });
    alert.present();
  }


  presentActionSheet(app: UserLevelHistoryForApprovalModel) {
    let actionSheet = this.actionSheetCtrl.create({
      title: "Select",
      buttons: [
        {
          text: "Approve",
          role: "destructive",
          icon: "checkmark",
          handler: () => {
            this.presentPopUpApp(app);
          },
        },
        {
          text: "Need more work",
          role: "destructive",
          icon: "close",
          handler: () => {
            this.presentPopUpRej(app);
          },
        },
      ],
    });

    actionSheet.present();
  }

  approvalStatusChangeUserLevelChallenge(app: UserLevelHistoryForApprovalModel) {
    this.updateUserLevelHistoryInput.approval_id = app.id
    const actionMessage = this.updateUserLevelHistoryInput.ActionType == 2 ? 'Approved' : 'Rejected';

    const user_level_mutation = gql`
    mutation approvalStatusChangeUserLevelChallenge(
      $approveUserlevelsInput: updateUserLevelHistoryInput!
    ) {
      approvalStatusChangeUserLevelChallenge(approveUserlevelsInput: $approveUserlevelsInput) 
    }`

    this.graphqlService
      .mutate(user_level_mutation, { approveUserlevelsInput: this.updateUserLevelHistoryInput },1)
      .subscribe(
        ({ data }) => {
          // this.commonService.hideLoader();
          console.log(
            "approvalStatusChangeUserLevelChallenge DATA" + data["approvalStatusChangeUserLevelChallenge"]
          );

          this.commonService.toastMessage(
            `${actionMessage} successfully`,
            2500,
            ToastMessageType.Success,
            ToastPlacement.Bottom
          );
          this.getApprovalStatus();
        },
        (err) => {
          // this.commonService.hideLoader();
          console.log(JSON.stringify(err));
          this.commonService.toastMessage(
            `Failed to ${actionMessage} challenge`,
            2500,
            ToastMessageType.Error,
            ToastPlacement.Bottom
          );
        }
      );
  }



  getApprovalStatus = () => {
    // this.commonService.showLoader("Fetching Details...");
    const getApprovalStatusQuery = gql`
      query getApprovalStatus(
        $approveUserlevelsInput: ApproveUserlevelsInput!
      ) {
        getApprovalStatus(
          approveUserlevelsInput: $approveUserlevelsInput
        ) {
          id
          FirstName
          LastName
          DOB
          focus_area_name
          target_area_name
          approval
          approval_desciption
          completed_on
          level_name
          challenge_name
        }
      }
    `;
    this.apollo
      .query({
        query: getApprovalStatusQuery,
        fetchPolicy: "network-only",
        variables: {
          approveUserlevelsInput: this.approveUserlevelsInput,
        },
      })
      .subscribe(
        ({ data }) => {
          console.log(
            "getApprovalStatus DATA" +
            JSON.stringify(data["getApprovalStatus"])
          );
          // this.commonService.hideLoader();
          this.approvalStatusList = data["getApprovalStatus"];
          this.filteredApprovalStatusList = JSON.parse(JSON.stringify(this.approvalStatusList));
        },
        (err) => {
          // this.commonService.hideLoader();
          console.log(JSON.stringify(err));
          this.commonService.toastMessage(
            "Failed to fetch approval status",
            2500,
            ToastMessageType.Error,
            ToastPlacement.Bottom
          );
        }
      );
  };
}

export class ApproveUserlevelsInput {
  ParentClubKey: string;
  ClubKey: string;
  MemberKey: string;
  AppType: number;
  ActionType: number;
  DeviceType: number;
}

export class UpdateUserLevelHistoryInput {
  ParentClubKey: string;
  ClubKey: string;
  MemberKey: string;
  AppType: number;
  ActionType: number;
  DeviceType: number;
  approval_id: string;
  comments: string;
}