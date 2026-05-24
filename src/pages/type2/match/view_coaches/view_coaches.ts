import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Events, AlertController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { CommonService, ToastMessageType, ToastPlacement } from '../../../../services/common.service';
import { ThemeService } from '../../../../services/theme.service';
import { SharedServices } from '../../../services/sharedservice';
import { HttpService } from '../../../../services/http.service';
import { API } from '../../../../shared/constants/api_constants';
import { CoachList } from '../../league/leaguemodels/creatematchforleague.dto';
import { UpdateLeagueCoachResponse, UpdateLeagueCoachData } from '../models/match.model';
import { AppType } from '../../../../shared/constants/module.constants';

@IonicPage()
@Component({
  selector: 'page-view-coaches',
  templateUrl: 'view_coaches.html',
  providers: [HttpService]
})
export class ViewCoachesPage {
  isDarkTheme: boolean = true;
  coaches: CoachList[] = [];
  filteredCoaches: CoachList[] = [];
  selectedCoachIds: string[] = [];
  existingCoachIds: string[] = [];
  searchInput: string = '';
  matchId: string = '';

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
    private themeService: ThemeService,
    private events: Events,
    private alertCtrl: AlertController
  ) {
    this.matchId = this.navParams.get('match_id') || '';
  }

  ionViewDidLoad() {
    setTimeout(() => this.loadTheme(), 100);
  }

  ionViewWillEnter() {
    this.loadTheme();
    this.themeService.isDarkTheme$.subscribe(isDark => {
      this.isDarkTheme = isDark;
      this.applyTheme(isDark);
    });
    this.events.subscribe('theme:changed', isDark => {
      this.isDarkTheme = isDark;
      this.applyTheme(isDark);
    });

    this.commonInput.parentclubId = this.sharedservice.getPostgreParentClubId();
    this.commonInput.memberId = this.sharedservice.getLoggedInUserId();
    this.commonInput.device_type = this.sharedservice.getPlatform() == 'android' ? 1 : 2;
    this.commonInput.app_type = AppType.ADMIN_NEW;
    this.commonInput.updated_by = this.sharedservice.getLoggedInUserId();

    this.fetchCoaches();
  }

  ionViewDidEnter() {
    setTimeout(() => this.forceThemeCheck(), 50);
    setTimeout(() => this.forceThemeCheck(), 200);
    setTimeout(() => this.forceThemeCheck(), 500);
  }

  ionViewWillLeave() {
    this.events.unsubscribe('theme:changed');
  }

  private loadTheme(): void {
    this.storage.get('dashboardTheme').then(isDarkTheme => {
      const isDark = isDarkTheme !== null && isDarkTheme !== undefined ? isDarkTheme : true;
      this.isDarkTheme = isDark;
      this.applyTheme(isDark);
    }).catch(() => {
      this.isDarkTheme = true;
      this.applyTheme(true);
    });
  }

  private applyTheme(isDark: boolean): void {
    this.isDarkTheme = isDark;
    const applyThemeToElement = () => {
      const el = document.querySelector('page-view-coaches');
      if (el) {
        if (isDark) {
          el.classList.remove('light-theme');
          document.body.classList.remove('light-theme');
        } else {
          el.classList.add('light-theme');
          document.body.classList.add('light-theme');
        }
        return true;
      }
      return false;
    };
    if (!applyThemeToElement()) {
      let retryCount = 0;
      const retryApply = () => {
        if (retryCount < 5 && !applyThemeToElement()) {
          retryCount++;
          setTimeout(retryApply, 100 * retryCount);
        }
      };
      setTimeout(retryApply, 50);
    }
  }

  private forceThemeCheck(): void {
    this.storage.get('dashboardTheme').then(storageTheme => {
      const bodyHasLightTheme = document.body.classList.contains('light-theme');
      let isDark = true;
      if (storageTheme !== null && storageTheme !== undefined) {
        isDark = storageTheme;
      } else if (bodyHasLightTheme) {
        isDark = false;
      }
      this.isDarkTheme = isDark;
      this.applyTheme(isDark);
    });
  }

  fetchCoaches() {
    this.commonService.showLoader('Fetching coaches...');
    const payload = { ...this.commonInput, id: '', email_id: '', fetch_from: 1 };
    this.httpService.post(`${API.FETCH_COACHES}`, payload).subscribe({
      next: (res: any) => {
        this.coaches = res.data || [];
        this.filteredCoaches = [...this.coaches];
        this.getMatchCoaches();
      },
      error: () => {
        this.commonService.hideLoader();
        this.commonService.toastMessage('Failed to fetch coaches', 2500, ToastMessageType.Error);
      }
    });
  }

  private getMatchCoaches() {
    const matchPayload = { ...this.commonInput, match_id: this.matchId };
    this.httpService.post(`${API.GET_MATCH_COACHES}`, matchPayload).subscribe({
      next: (res: any) => {
        this.commonService.hideLoader();
        const matchCoaches = res.data || [];
        const matchCoachIds = matchCoaches.map(c => c.coach.Id);
        this.existingCoachIds = this.coaches.filter(c => matchCoachIds.indexOf(c.Id) > -1).map(c => c.Id);
        this.selectedCoachIds = [...this.existingCoachIds];
      },
      error: () => this.commonService.hideLoader()
    });
  }

  onSearch(ev: any) {
    const val = ev.target.value;
    if (val && val.trim() !== '') {
      const q = val.toLowerCase();
      this.filteredCoaches = this.coaches.filter(c =>
        (c.first_name && c.first_name.toLowerCase().includes(q)) ||
        (c.last_name && c.last_name.toLowerCase().includes(q)) ||
        (c.email_id && c.email_id.toLowerCase().includes(q))
      );
    } else {
      this.filteredCoaches = [...this.coaches];
    }
  }

  // 🎨 Avatar helpers
  getInitials(coach: any): string {
    return (((coach.first_name ? coach.first_name.charAt(0) : '') + (coach.last_name ? coach.last_name.charAt(0) : ''))).toUpperCase();
  }

  hasProfileImage(coach: any): boolean {
    return coach.profile_image && coach.profile_image.trim() !== '';
  }

  // 📊 Summary counts
  getAddedCount(): number {
    return this.existingCoachIds.filter(id => this.selectedCoachIds.indexOf(id) > -1).length;
  }

  getNewCount(): number {
    return this.selectedCoachIds.filter(id => this.existingCoachIds.indexOf(id) === -1).length;
  }

  getRemovedCount(): number {
    return this.existingCoachIds.filter(id => this.selectedCoachIds.indexOf(id) === -1).length;
  }

  toggleCoach(coachId: string) {
    const idx = this.selectedCoachIds.indexOf(coachId);
    idx > -1 ? this.selectedCoachIds.splice(idx, 1) : this.selectedCoachIds.push(coachId);
  }

  isSelected(coachId: string): boolean {
    return this.selectedCoachIds.indexOf(coachId) > -1;
  }

  isExisting(coachId: string): boolean {
    return this.existingCoachIds.indexOf(coachId) > -1;
  }

  isMarkedForRemoval(coachId: string): boolean {
    return this.isExisting(coachId) && !this.isSelected(coachId);
  }

  hasChanges(): boolean {
    if (this.selectedCoachIds.length !== this.existingCoachIds.length) return true;
    return this.selectedCoachIds.some(id => this.existingCoachIds.indexOf(id) === -1);
  }

  getButtonLabel(): string {
    const hasNew = this.selectedCoachIds.some(id => this.existingCoachIds.indexOf(id) === -1);
    const hasRemoved = this.existingCoachIds.some(id => this.selectedCoachIds.indexOf(id) === -1);
    if (hasNew && !hasRemoved) return 'Add Coaches';
    if (hasRemoved && !hasNew) return 'Remove Coaches';
    return 'Update Coaches';
  }

  getButtonClass(): string {
    const label = this.getButtonLabel();
    if (label === 'Add Coaches') return 'btn-add';
    if (label === 'Remove Coaches') return 'btn-remove';
    return 'btn-update';
  }

  onButtonClick() {
    if (this.getButtonLabel() === 'Remove Coaches') {
      const count = this.getRemovedCount();
      const alert = this.alertCtrl.create({
        title: 'Remove Coaches',
        message: `Are you sure you want to remove ${count} coach${count > 1 ? 'es' : ''} from this match?`,
        buttons: [
          { text: 'Cancel', role: 'cancel' },
          { text: 'Remove', handler: () => this.updateCoachAssignment() }
        ]
      });
      alert.present();
    } else {
      this.updateCoachAssignment();
    }
  }

  updateCoachAssignment() {
    if (this.selectedCoachIds.length === 0) {
      this.commonService.toastMessage('Please select at least one coach', 2500, ToastMessageType.Error);
      return;
    }
    this.commonService.showLoader('Updating coaches...');
    const payload = {
      ...this.commonInput,
      match_id: this.matchId,
      coach_ids: this.selectedCoachIds
    };
    this.httpService.post(`${API.UPDATE_LEAGUE_COACH}`, payload).subscribe({
      next: (res: UpdateLeagueCoachResponse) => {
        this.commonService.hideLoader();
        this.commonService.toastMessage(res.message || 'Coaches updated successfully', 2500, ToastMessageType.Success, ToastPlacement.Bottom);
        this.navCtrl.pop();
      },
      error: (err) => {
        this.commonService.hideLoader();
        const msg = err.error && err.error.message ? err.error.message : 'Failed to update coaches';
        this.commonService.toastMessage(msg, 2500, ToastMessageType.Error, ToastPlacement.Bottom);
      }
    });
  }

  goBack() {
    this.navCtrl.pop();
  }
}
