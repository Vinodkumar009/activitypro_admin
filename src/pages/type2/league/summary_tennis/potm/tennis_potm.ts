import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import { CommonService, ToastMessageType } from '../../../../../services/common.service';
import { HttpService } from '../../../../../services/http.service';
import { API } from '../../../../../shared/constants/api_constants';
import { SharedServices } from '../../../../services/sharedservice';
import { AppType } from '../../../../../shared/constants/module.constants';

@IonicPage()
@Component({
  selector: 'page-tennis-potm',
  templateUrl: 'tennis_potm.html',
  providers: [HttpService]
})
export class TennisPotmPage {
  matchObj: any;
  homeTeamObj: any;
  awayTeamObj: any;
  participants: any[] = [];
  selectedPlayers: any[] = [];
  result_json: any;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public commonService: CommonService,
    private httpService: HttpService,
    public sharedservice: SharedServices,
    public viewCtrl: ViewController
  ) {
    this.matchObj = this.navParams.get('matchObj');
    this.homeTeamObj = this.navParams.get('homeTeamObj');
    this.awayTeamObj = this.navParams.get('awayTeamObj');
    this.participants = this.navParams.get('participants') || [];
    this.result_json = this.navParams.get('result_json') || {};
    
    this.initializeParticipants();
  }

  initializeParticipants() {
    this.participants = this.participants.map(participant => ({
      ...participant,
      isSelected: false
    }));

    if (this.result_json.POTM && this.result_json.POTM.length > 0) {
      this.result_json.POTM.forEach(potm => {
        const participant = this.participants.find(p => p.user && p.user.Id === potm.PLAYER_ID);
        if (participant) {
          participant.isSelected = true;
          this.selectedPlayers.push(participant);
        }
      });
    }
  }

  onPlayerSelect(participant: any) {
    if (participant.isSelected) {
      this.selectedPlayers.push(participant);
    } else {
      this.selectedPlayers = this.selectedPlayers.filter(p => p.user && p.user.Id !== (participant.user && participant.user.Id));
    }
  }

  savePotm() {
    if (!this.validatePotm()) {
      return;
    }

    this.commonService.toastMessage("POTM saved successfully", 2500, ToastMessageType.Success);
    this.viewCtrl.dismiss(this.selectedPlayers);
  }

  private validatePotm(): boolean {
    if (this.selectedPlayers.length === 0) {
      this.commonService.toastMessage('Please select at least one Player of the Match', 3000, ToastMessageType.Error);
      return false;
    }

    if (this.selectedPlayers.length > 2) {
      this.commonService.toastMessage('Maximum 2 players can be selected as POTM for tennis', 3000, ToastMessageType.Error);
      return false;
    }

    for (let player of this.selectedPlayers) {
      if (!(player.user && player.user.FirstName) && !(player.user && player.user.LastName)) {
        this.commonService.toastMessage('Selected player has invalid name', 3000, ToastMessageType.Error);
        return false;
      }
    }

    return true;
  }

  cancel() {
    this.viewCtrl.dismiss();
  }
}