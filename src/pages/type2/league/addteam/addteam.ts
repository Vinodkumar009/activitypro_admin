import { Component } from '@angular/core';
import {
  IonicPage,
  NavController,
  NavParams,
  LoadingController,
} from "ionic-angular";
import gql from "graphql-tag";
import { Storage } from "@ionic/storage";
import { CommonService, ToastMessageType, ToastPlacement } from '../../../../services/common.service';
import { SharedServices } from '../../../services/sharedservice';
import { TeamsForParentClubModel } from '../models/team.model';
import { LeagueParticipantModel, LeaguesForParentClubModel } from '../models/league.model';
import { GraphqlService } from '../../../../services/graphql.service';
import { MembersModel } from '../../match/models/match.model';
import { HttpService } from '../../../../services/http.service';
import { AppType } from '../../../../shared/constants/module.constants';

/**
 * Generated class for the AddteamPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-addteam',
  templateUrl: 'addteam.html',
  providers: [HttpService]
})
export class AddteamPage {

  league: LeaguesForParentClubModel;
  teamsForParentClub: TeamsForParentClubModel[] = [];
  filteredteams: TeamsForParentClubModel[] = [];

  inputObj = {
    parentclubId: '',
    clubId: '',
    activityId: '',
    memberId: '',
    action_type: 0,
    device_type: 0,
    app_type: 0,
    device_id: '',
    updated_by: ''
  }

  // existingteam: LeagueParticipantModel[];
  existingteam: TeamsForParentClubModel[];


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

  leagueId: string;

  capacity_left: number = 0;
  constructor(public navCtrl: NavController,
    private graphqlService: GraphqlService,
    public navParams: NavParams,
    public commonService: CommonService,
    public loadingCtrl: LoadingController,
    public storage: Storage,
    public sharedservice: SharedServices,
    private httpService: HttpService,
  ) {

    this.leagueId = this.navParams.get("leagueId");
    console.log("league id is:", this.leagueId);
    const activityId = this.navParams.get("activityId");
    this.existingteam = this.navParams.get("existingteam");
    this.inputObj.parentclubId = this.sharedservice.getPostgreParentClubId();
    this.inputObj.app_type = AppType.ADMIN_NEW;
    this.leagueParticipantInput.user_postgre_metadata.UserParentClubId = this.sharedservice.getPostgreParentClubId();
    this.leagueParticipantInput.user_device_metadata.UserActionType = 0;
    this.leagueParticipantInput.user_device_metadata.UserAppType = AppType.ADMIN_NEW;
    this.leagueParticipantInput.user_device_metadata.UserDeviceType = this.sharedservice.getPlatform() == "android" ? 1 : 2
    this.leagueParticipantInput.leagueId = this.leagueId;
    this.inputObj.activityId = activityId;
    this.getTeam();

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad AddteamPage');
  }



  getTeam() {
    this.commonService.showLoader("Fetching teams...");
    // Assuming you're using Angular's HttpClient
    this.httpService.post('league/getActivitySpecificTeam', this.inputObj).subscribe({
      next: (res: any) => {
        this.commonService.hideLoader();
        this.teamsForParentClub = res.data; // Adjust this if the response structure is different
        if (this.teamsForParentClub.length > 0) {
          for (let i = 0; i < this.teamsForParentClub.length; i++) {
            this.teamsForParentClub[i]["isSelect"] = false;
            this.teamsForParentClub[i]["isAlreadExisted"] = false;
            if (this.existingteam.length > 0) {
              for (let j = 0; j < this.existingteam.length; j++) {
                if (this.teamsForParentClub[i].id === this.existingteam[j].id) {
                  this.teamsForParentClub[i]["isSelect"] = true;
                  this.teamsForParentClub[i]["isAlreadExisted"] = true;
                }
              }
            }
          }
        }
        this.filteredteams = JSON.parse(JSON.stringify(this.teamsForParentClub));
      },
      error: (error) => {
        this.commonService.hideLoader();
        console.error("Error in fetching:", error);
        if (error.error) {
          console.error("Server Error:", error.error);
          this.commonService.toastMessage(error.error.message, 2500, ToastMessageType.Error, ToastPlacement.Bottom);
        } else {
          this.commonService.toastMessage("Teams fetch failed", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
        }
        // if (error.status) {
        //   console.error("Status Code:", error.status);
        //   console.error("Status Text:", error.statusText);
        // }
      }
    });
  }

  isSelect: boolean;


  selectTeam(e) {
    console.log('team new state:' + e.isSelect);
    console.log("selected data is:" + e.id);
    if (e.isSelect) {
      this.leagueParticipantInput.parentclubteamIds.push(e.id)
      console.log("selected team is:" + this.leagueParticipantInput.parentclubteamIds)
    }
  }


  assignTeams() {
    this.commonService.showLoader("Please wait");
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
        const message = "Teams added successfully";
        this.commonService.toastMessage(message, 2500, ToastMessageType.Success, ToastPlacement.Bottom);
        this.navCtrl.pop();
      }, (error) => {
        this.commonService.hideLoader();
        console.error("GraphQL mutation error:", error);
        if (error.error.message) {
          console.error("Server Error:", error.error);
          this.commonService.toastMessage(error.error.message, 2500, ToastMessageType.Error, ToastPlacement.Bottom);
        } else {
          this.commonService.toastMessage("Teams assign failed", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
        }
      });
  }


}

export class TeamactivityDetail {
  ParentClubKey: string
  MemberKey: string
  AppType: number
  ActionType: number
  activityCode: string
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