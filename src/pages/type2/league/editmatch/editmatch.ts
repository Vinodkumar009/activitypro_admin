import { Component, Renderer2 } from '@angular/core';
import { IonicPage, NavController, NavParams, Events } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { CommonService, ToastMessageType, ToastPlacement } from '../../../../services/common.service';
import { SharedServices } from '../../../services/sharedservice';
import { HttpService } from '../../../../services/http.service';
import { API } from '../../../../shared/constants/api_constants';
import { AppType } from '../../../../shared/constants/module.constants';
import { ThemeService } from '../../../../services/theme.service';
import { AllMatchData, MatchDuration } from '../../../../shared/model/match.model';
import { RoundTypeInput, RoundTypesModel } from '../../../../shared/model/league.model';
import { CatandType } from '../models/location.model';
import moment from 'moment';

@IonicPage()
@Component({
  selector: 'page-editmatch',
  templateUrl: 'editmatch.html',
  providers: [HttpService]
})
export class EditmatchPage {
  isDarkTheme: boolean = true;
  data: AllMatchData;
  start_date: string;
  start_time: string;
  min: string;
  max: string = '2049-12-31';
  publicType: boolean = true;
  isChecked: boolean = false;
  currency: string = '£';
  roundTypes: RoundTypesModel[] = [];
  durations: MatchDuration[] = [];
  selectedDuration: number;
  leagueType: CatandType[] = [];
  mapLocationAddress: string = '';

  private commonInput = {
    parentclubId: '',
    clubId: '',
    activityId: '',
    memberId: '',
    action_type: 0,
    device_type: 0,
    app_type: 0,
    device_id: '',
    updated_by: ''
  };

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public commonService: CommonService,
    public storage: Storage,
    public sharedservice: SharedServices,
    private httpService: HttpService,
    private renderer: Renderer2,
    private themeService: ThemeService,
    private events: Events
  ) {
    this.min = new Date().toISOString();
    this.data = this.navParams.get('match');

    // Parse date/time from MatchStartDate (format: "YYYY-MM-DD HH:mm")
    const parsed = moment(this.data.MatchStartDate, 'YYYY-MM-DD HH:mm');
    this.start_date = parsed.isValid() ? parsed.format('YYYY-MM-DD') : moment().format('YYYY-MM-DD');
    this.start_time = parsed.isValid() ? parsed.format('HH:mm') : '09:00';

    this.publicType = (this.data as any).MatchVisibility === 0;
    this.isChecked = parseFloat(this.data.MemberFees) > 0 || parseFloat(this.data.NonMemberFees) > 0;
    this.selectedDuration = this.data.MatchDuration ? Number(this.data.MatchDuration) : 0;
    this.mapLocationAddress = (this.data as any).location || '';

    this.commonInput.parentclubId = this.sharedservice.getPostgreParentClubId();
    this.commonInput.memberId = this.sharedservice.getLoggedInUserId();
    this.commonInput.device_type = this.sharedservice.getPlatform() == 'android' ? 1 : 2;
    this.commonInput.app_type = AppType.ADMIN_NEW;
    this.commonInput.updated_by = this.sharedservice.getLoggedInUserId();

    this.getRoundTypes();
    this.getDurations();
    this.getMatchTypes();

    this.storage.get('Currency').then(c => {
      if (c) this.currency = JSON.parse(c).CurrencySymbol;
    });
  }

  ionViewDidLoad() { this.loadTheme(); }

  ionViewWillEnter() {
    this.loadTheme();
    this.themeService.isDarkTheme$.subscribe(isDark => this.applyTheme(isDark));
    this.events.subscribe('theme:changed', isDark => this.applyTheme(isDark));
  }

  ionViewWillLeave() { this.events.unsubscribe('theme:changed'); }

  private async loadTheme() {
    const isDarkTheme = await this.storage.get('dashboardTheme');
    const isDark = isDarkTheme !== null ? isDarkTheme : true;
    this.isDarkTheme = isDark;
    this.applyTheme(isDark);
  }

  private applyTheme(isDark: boolean) {
    this.isDarkTheme = isDark;
    const el = document.querySelector('page-editmatch');
    if (el) {
      isDark ? this.renderer.removeClass(el, 'light-theme')
        : this.renderer.addClass(el, 'light-theme');
    }
  }

  getRoundTypes() {
    const input: RoundTypeInput = { ...this.commonInput } as any;
    this.httpService.post(`${API.Get_Round_Types}`, input).subscribe({
      next: (res: any) => { this.roundTypes = res.data || []; }
    });
  }

  getDurations() {
    this.httpService.post(`${API.GET_DURATIONS}`, { ...this.commonInput, app_type: AppType.ADMIN_NEW }).subscribe({
      next: (res: any) => {
        this.durations = res.data || [];
        if (this.data.MatchDuration) {
          const match = this.durations.find(d => d.duration === Number(this.data.MatchDuration));
          if (match) this.selectedDuration = match.id;
        }
      }
    });
  }

  getMatchTypes() {
    this.httpService.post(`${API.GET_LEAGUE_OR_MATCH_TYPES}`, this.commonInput).subscribe({
      next: (res: any) => { this.leagueType = res.data || []; }
    });
  }

  changeType(val: string) {
    this.publicType = val === 'public';
  }

  onMapLocationSelected(location: any) {
    this.mapLocationAddress = location.address || '';
  }

  updateMatchPaymentType(isChecked: boolean) {
    this.isChecked = isChecked;
  }

  validateInput(): boolean {
    if (!this.start_date) {
      this.commonService.toastMessage('Please enter a valid start date', 2500, ToastMessageType.Error);
      return false;
    }
    if (!this.data.MatchTitle) {
      this.commonService.toastMessage('Please enter match title', 2500, ToastMessageType.Error);
      return false;
    }
    if (this.isChecked && (parseFloat(this.data.MemberFees) <= 0)) {
      this.commonService.toastMessage('Enter member fee', 2500, ToastMessageType.Error);
      return false;
    }
    if (this.isChecked && (parseFloat(this.data.NonMemberFees) <= 0)) {
      this.commonService.toastMessage('Enter non-member fee', 2500, ToastMessageType.Error);
      return false;
    }
    return true;
  }

  updateMatchConfirm() {
    this.commonService.commonAlert_V4('Update Match', 'Are you sure you want to update the match?', 'Yes:Update', 'No', () => {
      this.updateMatch();
    });
  }

  updateMatch() {
    if (!this.validateInput()) return;

    this.commonService.showLoader('Updating match...');
    const selectedDur = this.durations.find(d => d.id === this.selectedDuration);
    const startDateTime = moment(new Date(this.start_date + ' ' + this.start_time).getTime()).format('YYYY-MM-DD HH:mm');
    const endDateTime = moment(new Date(this.start_date + ' 23:59').getTime()).format('YYYY-MM-DD HH:mm');

    const payload = {
      ...this.commonInput,
      matchId: this.data.MatchId,
      matchTitle: this.data.MatchTitle,
      matchDetails: this.data.Details || '',
      matchStartDate: startDateTime,
      matchEndDate: endDateTime,
      venueName: this.data.VenueName || '',
      venueFirebaseKey: '',
      matchVisibility: this.publicType ? 0 : 1,
      capacity: this.data.Capacity || 0,
      memberFees: this.isChecked ? Number(this.data.MemberFees) || 0 : 0,
      nonMemberFees: this.isChecked ? Number(this.data.NonMemberFees) || 0 : 0,
      matchPaymentType: this.isChecked ? 1 : 0,
      matchStatus: this.data.MatchStatus || 0,
      gameType: Number(this.data.GameType),
      matchType: Number(this.data.MatchType),
      matchDuration: selectedDur ? String(selectedDur.duration) : '',
      refreeFirebaseKey: '',
      refreeName: '',
      parentclub_id: this.sharedservice.getPostgreParentClubId(),
      venue_id: '',
      location: this.mapLocationAddress || '',
      location_type: 0,
      Round: this.data.Round ? (this.roundTypes.find(r => r.name === this.data.Round) || {} as any).id || 0 : 0
    };

    this.httpService.put(`${API.EDIT_MATCH}`, payload).subscribe({
      next: (res: any) => {
        this.commonService.hideLoader();
        this.commonService.toastMessage(res.message || 'Match updated successfully', 2500, ToastMessageType.Success, ToastPlacement.Bottom);
        this.events.publish('match:refresh');
        this.navCtrl.pop();
      },
      error: (err) => {
        this.commonService.hideLoader();
        const msg = (err.error && err.error.message) ? err.error.message : 'Match update failed';
        this.commonService.toastMessage(msg, 2500, ToastMessageType.Error, ToastPlacement.Bottom);
      }
    });
  }
}
