import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { CommonService, ToastMessageType, ToastPlacement } from '../../../../services/common.service';
import { SharedServices } from '../../../services/sharedservice';
import gql from 'graphql-tag';
import { GraphqlService } from '../../../../services/graphql.service';
import { LeagueParticipantModel } from '../models/league.model';
import { CreateLeagueMatchInputV1, UserDeviceMetadataField, UserPostgreMetadataField } from '../leaguemodels/creatematchforleague.dto';
import moment from 'moment';
import { HttpService } from '../../../../services/http.service';
import { RoundTypesModel } from '../../../../shared/model/league.model';
import { API } from '../../../../shared/constants/api_constants';
import { AppType } from '../../../../shared/constants/module.constants';


/**
 * Generated class for the AutocreatematchPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-autocreatematch',
  templateUrl: 'autocreatematch.html',
  providers: [GraphqlService, HttpService]
})
export class AutocreatematchPage {
  min: any;
  max: any;
  selectedRound:number = 0;
  leagueId: string;
  matchDate: string;
  matchTime: string;
  players: LeagueParticipantModel[] = [];
  generatedMatches: GeneratedMatch[] = [];
  selectedPlayers: LeagueParticipantModel[] = [];
  publicType: boolean = true;
  privateType: boolean = true;
  location_id: string;
  location_type: number;
  isLoading: boolean = false;
  isChecked: boolean = false;

  // Initialize the input object
  inputObj: CreateLeagueMatchInputV1 = {
    league_id: '',
    participant_ids: [],
    round: 0,
    match_status: 1,
    match_name: '',
    group_id: '',
    stage: 0,
    match_details: '',
    start_date: '',
    start_time: '',
    location_id: '',
    location_type: '',
    end_date: '',
    match_payment_type: 0,
    member_fees: 0.00,
    non_member_fees: 0.00,
  };
  roundTypes: RoundTypesModel[] = [];

  roundTypeInput: RoundTypeInput = {
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
  numberofMatches: number;
  numberofPlayers: number;
  matchType: string = 'singles';
  team1Players: LeagueParticipantModel[] = [];
  team2Players: LeagueParticipantModel[] = [];

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public commonService: CommonService,
    public sharedservice: SharedServices,
    private graphqlService: GraphqlService,
    private httpService: HttpService,
  ) {
    this.leagueId = this.navParams.get('leagueId');
    this.matchDate = this.navParams.get('leagueDate');
    this.matchTime = this.navParams.get('leagueTime');
    this.location_id = this.navParams.get('location_id');
    this.location_type = this.navParams.get('location_type');
    
    this.min = new Date().toISOString();
    this.max = "2049-12-31";

    this.roundTypeInput = new RoundTypeInput();
    this.roundTypeInput.parentclubId = this.sharedservice.getPostgreParentClubId();
    this.roundTypeInput.action_type = 0;
    this.roundTypeInput.device_type = this.sharedservice.getPlatform() == "android" ? 1 : 2;
    this.roundTypeInput.app_type = AppType.ADMIN_NEW;
    this.inputObj = new CreateLeagueMatchInputV1();
    this.inputObj.parentclub_id = this.sharedservice.getPostgreParentClubId();
    this.inputObj.activity_id = this.navParams.get('activity_id');
    this.inputObj.updated_by = this.sharedservice.getLoggedInUserId();
    this.inputObj.match_status = 1; // Default to public match
    this.inputObj.location_id = this.location_id;
    this.inputObj.location_type = this.location_type.toString();
    this.getRoundTypes();
    this.getPlayers();
  }


  getRoundTypes() {
    this.httpService.post(`${API.Get_Round_Types}`, this.roundTypeInput).subscribe((res: any) => {
      if (res) {
        this.roundTypes = res.data || [];
        this.selectedRound = this.roundTypes.length > 0 ? this.roundTypes[0].id : 0; // Default to first round type
        console.log("Get_Round_Types RESPONSE", JSON.stringify(res.data));
      } else {
        this.commonService.hideLoader();
        console.log("error in fetching",)
      }
    },(error) => {
      console.error("Error fetching round types:", error);
      if (error && error.error && error.error.message) {
        this.commonService.toastMessage(error.error.message, 2500, ToastMessageType.Error, ToastPlacement.Bottom);
      } else {
        this.commonService.toastMessage('Failed to fetch round types', 2500, ToastMessageType.Error, ToastPlacement.Bottom);
      }
    });
  }

  getPlayers() {
    const parentclubId = this.sharedservice.getPostgreParentClubId();
    const GetLeagueParticipantInput = {
      user_postgre_metadata: {
        UserParentClubId: parentclubId
      },
      leagueId: this.leagueId
    }
    const participantsStatusQuery = gql`
      query getLeagueParticipants($leagueParticipantInput: GetLeagueParticipantInput!) {
        getLeagueParticipants(leagueParticipantInput:$leagueParticipantInput) { 
          id
          participant_name
           participant_details{
           user_id
           is_child
           is_enable
           parent_id
           email
           contact_email
           parent_email
           media_consent
           is_enable
           first_name
          last_name
          dob
          parent_phone_number
          medical_condition
      
        }
        }
      }
    `;

    this.graphqlService.query(participantsStatusQuery, { leagueParticipantInput: GetLeagueParticipantInput }, 0)
      .subscribe((data: any) => {
        this.players = data.data.getLeagueParticipants.map(player => ({
          ...player,
          isSelected: false
        }));
      },
      (error) => {
          // this.handleError(error);
          console.error("Error fetching league participants:", error);
          if (error && error.error && error.error.message) {
            this.commonService.toastMessage(error.error.message, 2500, ToastMessageType.Error, ToastPlacement.Bottom);
          } else {
            this.commonService.toastMessage('Failed to fetch match participants', 2500, ToastMessageType.Error, ToastPlacement.Bottom);
          }
      });
  }

  getSelectedPlayersCount(): number {
    return this.players.filter(player => player.isSelected).length;
  }


  changeType(val) {
    this.publicType = val == 'public' ? true : false;
    this.inputObj.match_status = val == 'public' ? 1 : 0; // 1 for public, 0 for private
  }

  updateMatchPaymentType(isChecked: boolean): void {
    this.inputObj.match_payment_type = isChecked ? 1 : 0;
  }


  // async selectPlayer(player: LeagueParticipantModel, event: any) {
  //   //  player.isSelected = event.detail.checked;
  //   const index = this.players.findIndex(p => p.participant_details.user_id === player.participant_details.user_id);
  //   if (index !== -1) {
  //     this.players[index].isSelected = event.checked;

  //     this.updateMatchCounts();

  //     const selectedPlayers = this.players.filter(player => player.isSelected);
  //     if (
  //       selectedPlayers.length >= 2 && 
  //       this.selectedRound && 
  //       this.matchDate && 
  //       this.matchTime &&
  //       !this.isLoading
  //     ) {
  //       await this.generateMatches();
  //     }
  //   }
  // }

  async selectPlayer(player: LeagueParticipantModel, event: any) {
    const index = this.players.findIndex(p => p.participant_details.user_id === player.participant_details.user_id);
    if (index !== -1) {
      this.players[index].isSelected = event.checked;
      this.updateMatchCounts(); // Update player and match counts locally
    }
  }

  updateMatchCounts() {
    if (this.matchType === 'doubles') {
      this.updateDoublesMatchCounts();
      return;
    }
    
    // Count selected players for singles
    const selectedPlayers = this.players.filter(player => player.isSelected);
    this.numberofPlayers = selectedPlayers.length;

    // Calculate number of matches
    if (selectedPlayers.length >= 2) {
      this.numberofMatches = this.calculateNumberOfMatches(this.numberofPlayers);
    } else {
      this.numberofMatches = 0;
    }
  }

  calculateNumberOfMatches(numberOfPlayers: number): number {
    // Formula for round-robin tournament: (n * (n-1)) / 2
    // where n is the number of players
    return Math.floor((numberOfPlayers * (numberOfPlayers - 1)) / 2);
  }

  resetMatch() {
    this.navCtrl.pop();
  }

  onMatchTypeChange() {
    this.team1Players = [];
    this.team2Players = [];
    this.players.forEach(player => player.isSelected = false);
    this.updateMatchCounts();
  }

  isPlayerInTeam1(player: LeagueParticipantModel): boolean {
    return this.team1Players.some(p => p.participant_details.user_id === player.participant_details.user_id);
  }

  isPlayerInTeam2(player: LeagueParticipantModel): boolean {
    return this.team2Players.some(p => p.participant_details.user_id === player.participant_details.user_id);
  }

  isPlayerDisabledForTeam1(player: LeagueParticipantModel): boolean {
    return this.team1Players.length >= 2 && !this.isPlayerInTeam1(player) || this.isPlayerInTeam2(player);
  }

  isPlayerDisabledForTeam2(player: LeagueParticipantModel): boolean {
    return this.team2Players.length >= 2 && !this.isPlayerInTeam2(player) || this.isPlayerInTeam1(player);
  }

  selectPlayerForTeam1(player: LeagueParticipantModel, event: any) {
    if (event.checked) {
      if (this.team1Players.length < 2 && !this.isPlayerInTeam2(player)) {
        this.team1Players.push(player);
      }
    } else {
      this.team1Players = this.team1Players.filter(p => p.participant_details.user_id !== player.participant_details.user_id);
    }
    this.updateDoublesMatchCounts();
  }

  selectPlayerForTeam2(player: LeagueParticipantModel, event: any) {
    if (event.checked) {
      if (this.team2Players.length < 2 && !this.isPlayerInTeam1(player)) {
        this.team2Players.push(player);
      }
    } else {
      this.team2Players = this.team2Players.filter(p => p.participant_details.user_id !== player.participant_details.user_id);
    }
    this.updateDoublesMatchCounts();
  }

  updateDoublesMatchCounts() {
    this.numberofPlayers = this.team1Players.length + this.team2Players.length;
    this.numberofMatches = (this.team1Players.length === 2 && this.team2Players.length === 2) ? 1 : 0;
  }


  private isValidToCreateMatch(): boolean {
    if (this.matchType === 'doubles') {
      if (this.team1Players.length !== 2 || this.team2Players.length !== 2) {
        this.commonService.toastMessage('Please select 2 players for each team', 2500, ToastMessageType.Error, ToastPlacement.Bottom);
        return false;
      }
    } else {
      const selectedPlayers = this.players.filter(player => player.isSelected);
      if(!selectedPlayers || selectedPlayers.length < 2) {
        this.commonService.toastMessage('Please select at least 2 players', 2500, ToastMessageType.Error, ToastPlacement.Bottom);
        return false;
      }
    }
    
    if(!this.matchDate || !this.matchTime) {
      this.commonService.toastMessage('Please select match date and time', 2500, ToastMessageType.Error, ToastPlacement.Bottom);
      return false;
    }
    if(!this.selectedRound || +this.selectedRound <= 0) {
      this.commonService.toastMessage('Please select a valid round', 2500, ToastMessageType.Error, ToastPlacement.Bottom);
      return false;
    }
    if(this.inputObj.match_payment_type == 1 && (!this.inputObj.member_fees || this.inputObj.non_member_fees <= 0)) {
      this.commonService.toastMessage('Please enter valid fees for members and non-members', 2500, ToastMessageType.Error, ToastPlacement.Bottom);
      return false;
    }

    return true;
  }


  async createMatch() {
    try {
      if(!this.isValidToCreateMatch()) {
        this.commonService.toastMessage('Please select match date, time, and at least 2 players',2500,ToastMessageType.Error,ToastPlacement.Bottom);
        return;
      }
      this.commonService.showLoader('Creating matches...');

      
      let selectedPlayers;
      if (this.matchType === 'doubles') {
        selectedPlayers = [...this.team1Players, ...this.team2Players];
      } else {
        selectedPlayers = this.players.filter(player => player.isSelected);
      }
      
      this.inputObj.league_id = this.leagueId,
      this.inputObj.participant_ids = selectedPlayers.map(player => player.id)
      this.inputObj.round = Number(this.selectedRound),
      this.inputObj.match_name = '',
      this.inputObj.start_date = moment(new Date(this.matchDate + ' ' + this.matchTime).getTime()).format('YYYY-MM-DD'),
      this.inputObj.start_time = moment(new Date(this.matchDate + ' ' + this.matchTime).getTime()).format('HH:mm'),
      this.inputObj.end_date = moment(new Date(this.matchDate + ' ' + this.matchTime).getTime()).format('YYYY-MM-DD'),
      this.inputObj.group_id = '',
      this.inputObj.stage = this.selectedRound,
      this.inputObj.match_details = '',
      this.inputObj.match_payment_type = this.isChecked ? 1 : 0; //
    
      this.inputObj.app_type = AppType.ADMIN_NEW;
      this.inputObj.action_type = 1; // Assuming 1 is the action type for creating matches
      this.inputObj.device_type = this.sharedservice.getPlatform() == "android" ? 1 : 2;
      this.inputObj.device_id = this.sharedservice.getDeviceId() || '';

      this.httpService.post(`${API.GENERATE_MATCHES}`, this.inputObj).subscribe({
            next: (res: any) => {
              this.commonService.hideLoader();
              this.commonService.toastMessage('Matches created successfully',2500,ToastMessageType.Success,ToastPlacement.Bottom);
              this.numberofPlayers = res.data.numberOfPlayers;
              this.numberofMatches = res.data.numberOfMatches;
              this.generatedMatches = res.data.matches.map(match => ({
                ...match,
                match_date: this.matchDate,
                match_time: this.matchTime
              }));
              this.navCtrl.pop();
            },
            error: (error) => {
              if (error && error.error && error.error.message) {
                this.commonService.toastMessage(error.error.message, 2500, ToastMessageType.Error, ToastPlacement.Bottom);
              }
              else {
                this.commonService.toastMessage('Failed to create matches', 2500, ToastMessageType.Error, ToastPlacement.Bottom);
              }
              console.error('Error creating matches:', error);
              this.commonService.hideLoader();
            }
      });
    } catch (error) {
      console.error('Error creating matches:', error);
      this.commonService.toastMessage(error.message || 'Failed to create matches',2500,ToastMessageType.Error,ToastPlacement.Bottom);
    } finally {
      this.commonService.hideLoader();
    }
  }

  
}





interface GeneratedMatch {
  league_id: string;
  player1_id: string;
  player2_id: string;
  player1_name: string;
  player2_name: string;
  match_date: string;
  match_time: string;
}

interface GenerateMatchesInput {
  leagueId: string;
  playerIds: string[];
  round: number;
  isPublic: boolean;
}



export class RoundTypeInput {
  parentclubId: string;
  clubId: string;
  activityId: string;
  memberId: string;
  action_type: number;
  device_type: number;
  app_type: number;
  device_id: string;
  updated_by: string;
}