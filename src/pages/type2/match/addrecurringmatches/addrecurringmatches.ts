import { Component } from "@angular/core";
import { IonicPage, NavController, NavParams, Events } from "ionic-angular";
import { Storage } from "@ionic/storage";
import { CommonService, ToastMessageType, ToastPlacement } from "../../../../services/common.service";
import { SharedServices } from "../../../services/sharedservice";
import { HttpService } from "../../../../services/http.service";
import { API } from "../../../../shared/constants/api_constants";
import { AppType } from "../../../../shared/constants/module.constants";
import { ThemeService } from "../../../../services/theme.service";
import { AllMatchData } from "../../../../shared/model/match.model";
import moment from "moment";

@IonicPage()
@Component({
  selector: "page-addrecurringmatches",
  templateUrl: "addrecurringmatches.html",
  providers: [HttpService]
})
export class AddrecurringmatchesPage {
  isDarkTheme: boolean = true;
  match: AllMatchData;
  untilWhen: string = '';
  minDate: string = '';
  maxDate: string = moment().add(10, 'years').format('YYYY-MM-DD');

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public commonService: CommonService,
    public storage: Storage,
    public sharedservice: SharedServices,
    private httpService: HttpService,
    private themeService: ThemeService,
    private events: Events
  ) {
    this.match = JSON.parse(this.navParams.get("match"));
    this.minDate = moment(this.match.MatchStartDate, "YYYY-MM-DD HH:mm").add(1, 'day').format('YYYY-MM-DD');
    this.untilWhen = moment(this.match.MatchStartDate, "YYYY-MM-DD HH:mm").add(1, 'week').toISOString();
  }

  ionViewWillEnter() {
    this.loadTheme();
    this.themeService.isDarkTheme$.subscribe(isDark => this.applyTheme(isDark));
    this.events.subscribe('theme:changed', isDark => this.applyTheme(isDark));
  }

  ionViewWillLeave() {
    this.events.unsubscribe('theme:changed');
  }

  private loadTheme() {
    this.storage.get('dashboardTheme').then(isDarkTheme => {
      this.applyTheme(isDarkTheme !== null ? isDarkTheme : true);
    });
  }

  getRecurringDayName(): string {
    return moment(this.match.MatchStartDate, "YYYY-MM-DD HH:mm").format('dddd');
  }

  private applyTheme(isDark: boolean) {
    this.isDarkTheme = isDark;
    const el = document.querySelector('page-addrecurringmatches');
    if (el) {
      isDark ? el.classList.remove('light-theme') : el.classList.add('light-theme');
    }
  }

  createRecurringMatches() {
    if (!this.untilWhen) {
      this.commonService.toastMessage("Select until when date", 2500, ToastMessageType.Error);
      return;
    }
    if (moment(this.untilWhen).isSameOrBefore(moment())) {
      this.commonService.toastMessage("Until when date must be in the future", 2500, ToastMessageType.Error);
      return;
    }
    if (moment(this.untilWhen).isSameOrBefore(moment(this.match.MatchStartDate, "YYYY-MM-DD HH:mm"))) {
      this.commonService.toastMessage("Until when must be after match start date", 2500, ToastMessageType.Error);
      return;
    }

    this.commonService.showLoader("Creating recurring matches...");

    const memberId = this.sharedservice.getLoggedInUserId();

    const payload = {
      parentclubId: this.sharedservice.getPostgreParentClubId(),
      clubId: '',
      activityId: '',
      memberId: memberId,
      action_type: 0,
      app_type: AppType.ADMIN_NEW,
      device_id: '',
      updated_by: memberId,
      parentclubTeamId: '',
      Round: parseInt(this.match.Round) || 0,
      MatchType: this.match.MatchType,
      MatchVenueName: this.match.VenueName,
      MatchVenueId: this.match.VenueId || '',
      GameType: this.match.GameType,
      MatchTitle: this.match.MatchTitle,
      CreatedBy: memberId,
      MatchCreator: 2,
      MatchStartDate: this.match.MatchStartDate,
      MatchEndDate: this.match.MatchEndDate,
      MatchVisibility: 0,
      Hosts: [{ UserId: memberId, RoleType: 2, UserType: 2 }],
      MatchStatus: 0,
      MatchDetails: this.match.Details || '',
      MatchPaymentType: 0,
      MemberFees: Number(this.match.MemberFees) || 0,
      NonMemberFees: Number(this.match.NonMemberFees) || 0,
      location_type: 1,
      location_id: this.match.VenueId || '',
      location: this.match.location || '',
      MatchDuration: this.match.MatchDuration != null ? String(this.match.MatchDuration) : '',
      UserParentClubId: this.sharedservice.getPostgreParentClubId(),
      UserActivityId: this.match.activityId,
      UserActionType: 0,
      untilWhen: moment(this.untilWhen).format("YYYY-MM-DD")
    };

    this.httpService.post(`${API.CREATE_RECURRING_MATCHES}`, payload).subscribe(
      (res: any) => {
        this.commonService.hideLoader();
        this.commonService.toastMessage("Recurring matches created successfully", 2500, ToastMessageType.Success, ToastPlacement.Bottom);
        this.events.publish('match:refresh');
        this.navCtrl.pop();
      },
      (err) => {
        this.commonService.hideLoader();
        const msg = (err.error && err.error.message) ? err.error.message : "Failed to create recurring matches";
        this.commonService.toastMessage(msg, 2500, ToastMessageType.Error, ToastPlacement.Bottom);
      }
    );
  }
}
