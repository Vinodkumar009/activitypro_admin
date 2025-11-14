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
import { Subject } from "rxjs";
import { debounceTime, distinctUntilChanged } from "rxjs/operators";

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

  private searchTerms = new Subject<string>();
  private selectedTeamsSet = new Set<string>(); // 🚀 Performance optimization for team selection
  private existingTeamsSet = new Set<string>(); // 🚀 Performance optimization for existing teams check
  private subscriptions: any[] = []; // 🧹 Subscription management

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

    // 🔍 Initialize existing teams set for performance
    if (this.existingteam && this.existingteam.length > 0) {
      this.existingTeamsSet = new Set(this.existingteam.map(t => t.id));
    }

    // 🔍 Setup search with debouncing
    const searchSubscription = this.searchTerms.pipe(
      debounceTime(400), // 🕐 Wait for 400ms after user stops typing
      distinctUntilChanged() // 🔄 Only emit if search term changed
    ).subscribe(searchTerm => {
      this.filterTeams(searchTerm);
    });

    this.subscriptions.push(searchSubscription);
    this.getTeam();
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



  getTeam() {
    this.commonService.showLoader("Fetching teams...");

    const teamSubscription = this.httpService.post('league/getActivitySpecificTeam', this.inputObj).subscribe({
      next: (res: any) => {
        this.commonService.hideLoader();
        this.teamsForParentClub = res.data;

        if (this.teamsForParentClub.length > 0) {
          this.teamsForParentClub = this.teamsForParentClub.map(team => ({
            ...team,
            isSelected: false,
            isAlreadyExisted: false
          }));
        }

        this.filteredteams = [...this.teamsForParentClub];
        this.updateTeamStates();
      },
      error: (error) => {
        this.commonService.hideLoader();
        this.handleError(error, "Failed to fetch teams");
      }
    });

    this.subscriptions.push(teamSubscription);
  }

  selectTeam(team) {
    if (this.selectedTeamsSet.has(team.id)) {
      // 🗑️ Remove team
      this.selectedTeamsSet.delete(team.id);
      const teamIndex = this.leagueParticipantInput.parentclubteamIds.findIndex(id => id === team.id);
      if (teamIndex > -1) {
        this.leagueParticipantInput.parentclubteamIds.splice(teamIndex, 1);
      }
    } else {
      // ➕ Add team
      this.selectedTeamsSet.add(team.id);
      this.leagueParticipantInput.parentclubteamIds.push(team.id);
    }
    
    // Update team selection state immediately
    team.isSelected = this.selectedTeamsSet.has(team.id);
    this.updateTeamStates();
  }

  getFilterItems(ev: any) {
    const searchTerm = ev.target.value;
    this.searchTerms.next(searchTerm);
  }

  private filterTeams(searchTerm: string) {
    if (!searchTerm || searchTerm.trim() === '') {
      this.filteredteams = [...this.teamsForParentClub];
    } else {
      const term = searchTerm.toLowerCase().trim();
      this.filteredteams = this.teamsForParentClub.filter(team =>
        team.teamName && team.teamName.toLowerCase().includes(term)
      );
    }
    this.updateTeamStates();
  }

  // 🔍 Update team states based on existing teams and selected teams
  private updateTeamStates() {
    if (!this.filteredteams.length) return;

    this.filteredteams.forEach(team => {
      team.isSelected = this.selectedTeamsSet.has(team.id) || this.existingTeamsSet.has(team.id);
      team.isAlreadyExisted = this.existingTeamsSet.has(team.id);
    });
  }

  // 🚨 Centralized error handling
  private handleError(error: any, userMessage: string) {
    let errorMsg = userMessage;

    if (error.error && error.error.message) {
      errorMsg = error.error.message;
    } else if (error.status === 0) {
      errorMsg = "Network connection error. Please check your internet connection.";
    } else if (error.status >= 500) {
      errorMsg = "Server error. Please try again later.";
    }

    this.commonService.toastMessage(errorMsg, 3000, ToastMessageType.Error, ToastPlacement.Bottom);
  }


  assignTeams() {
    const selectedTeamsCount = this.leagueParticipantInput.parentclubteamIds.length;

    if (selectedTeamsCount === 0) {
      this.commonService.toastMessage("Please select at least one team", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
      return;
    }

    try {
      this.commonService.showLoader("Please wait");

      const submitMembersMutation = gql`
         mutation addParticipantToLeague($leagueParticipant: LeagueParticipantInput!) {
           addParticipantToLeague(leagueParticipant: $leagueParticipant) {
             id
             participant_name
             participant_type
           }
         }
       `;

      const variables = { leagueParticipant: this.leagueParticipantInput };

      const assignSubscription = this.graphqlService.mutate(
        submitMembersMutation,
        variables,
        0
      ).subscribe((response) => {
        this.commonService.hideLoader();
        const message = "Teams added successfully";
        this.commonService.toastMessage(message, 2500, ToastMessageType.Success, ToastPlacement.Bottom);
        this.navCtrl.pop();
      }, (error) => {
        this.commonService.hideLoader();
        this.handleError(error, "Failed to assign teams");
      });

      this.subscriptions.push(assignSubscription);

    } catch (error) {
      this.commonService.hideLoader();
      this.handleError(error, "Failed to assign teams");
    }
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