import { Component } from "@angular/core";
import { IonicPage, LoadingController, NavController, NavParams } from "ionic-angular";
import { Storage } from "@ionic/storage";
import { CommonService, ToastMessageType, ToastPlacement } from "../../../../services/common.service";
import { SharedServices } from "../../../services/sharedservice";
import { FirebaseService } from "../../../../services/firebase.service";
import gql from "graphql-tag";
import { Apollo } from "apollo-angular";
import { LadderModel } from "../models/match.model";
import { HttpLink } from "apollo-angular-link-http";
import { first } from "rxjs/operators";
import { GraphqlService } from "../../../../services/graphql.service";
import { HttpService } from "../../../../services/http.service";
import { ThemeService } from "../../../../services/theme.service";
import { API } from "../../../../shared/constants/api_constants";

@IonicPage()
@Component({
  selector: "page-matchladder",
  templateUrl: "matchladder.html",
  providers: [HttpService]
})
export class MatchladderPage {
  // ─── Tab State ───
  activeTab: number = 0; // 0=Points, 1=BumpRank, 2=Challenges
  searchInput: string = "";

  // ─── Points Tab ───
  ladders: LadderModel[] = [];
  filteredLadder: LadderModel[] = [];
  fetchLadderInput: FetchLadderInput = { ParentClubId: "", AgeFrom: 0, AgeTo: 0, userId: "", AppType: 0 };
  ageCategories: any[] = [];
  selectedcat: string = "";
  headtohead: any[] = [];
  filteredLadderHead: any[] = [];
  parentclubKey: string = "";

  // ─── Bump Rank Tab ───
  ladderOptions: any[] = [];
  selectedLadderId: string = "";
  rankings: any[] = [];
  filteredRankings: any[] = [];
  bumpLoading: boolean = false;

  // ─── Challenges Tab ───
  challenges: any[] = [];
  challengeStatusFilter: string = "";
  challengeFilters = [
    { label: 'All', value: '' },
    { label: 'Pending', value: 'pending' },
    { label: 'Accepted', value: 'accepted' },
    { label: 'Completed', value: 'completed' },
    { label: 'Declined', value: 'declined' },
    { label: 'Cancelled', value: 'cancelled' }
  ];

  // ─── Dialogs ───
  showChallengeDialog: boolean = false;
  challengeTarget: any = null;
  showCancelDialog: boolean = false;
  cancelTarget: any = null;
  showApproveDialog: boolean = false;
  approveTarget: any = null;
  showConfigDialog: boolean = false;
  configMode: string = 'edit'; // 'edit' or 'create'

  // ─── Config Form ───
  ladderConfig = {
    id: null,
    matchType: 1,
    ageBandFrom: 0,
    ageBandTo: 99,
    challengeRangeUp: 30,
    challengeRangeDown: 30,
    challengeDeadlineDays: 14,
    responseDeadlineHours: 48,
    inactivityDays: 365,
    wildcardEnabled: false,
    wildcardsPerPlayer: 1,
    wildcardEarnAfterMatches: 5,
    affectsLadderFromTournament: true
  };

  // ─── Theme ───
  isDarkTheme: boolean = true;
  private parentClubId: string = "";

  get searchCount(): number {
    if (this.activeTab === 0) return this.filteredLadder ? this.filteredLadder.length : 0;
    if (this.activeTab === 1) return this.filteredRankings ? this.filteredRankings.length : 0;
    return this.challenges ? this.challenges.length : 0;
  }

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private apollo: Apollo,
    private httpLink: HttpLink,
    public commonService: CommonService,
    public loadingCtrl: LoadingController,
    public storage: Storage,
    public fb: FirebaseService,
    public sharedservice: SharedServices,
    private graphqlService: GraphqlService,
    private httpService: HttpService,
    private themeService: ThemeService
  ) {
    this.commonService.category.pipe(first()).subscribe((data) => {
      if (data == "ladderlist") {
        setTimeout(() => { this.loadTheme(); }, 100);
        this.storage.get("userObj").then((val) => {
          val = JSON.parse(val);
          if (val.$key != "") {}
          this.fetchLadderInput.ParentClubId = this.sharedservice.getPostgreParentClubId();
          this.parentClubId = this.sharedservice.getPostgreParentClubId();
          this.parentclubKey = val.UserInfo[0].ParentClubKey;
          this.getAgeCategories();
          this.loadLadderOptions();
        });
      }
    });
  }

  ionViewWillEnter() {
    this.loadTheme();
    this.themeService.isDarkTheme$.subscribe((isDark) => {
      this.isDarkTheme = isDark;
      this.applyTheme(isDark);
    });
  }

  ionViewDidEnter() {
    setTimeout(() => { this.loadTheme(); }, 200);
  }

  ionViewDidLoad() {
    setTimeout(() => { this.loadTheme(); }, 100);
  }

  // ─── Tab Navigation ───
  changeTab(index: number) {
    this.activeTab = index;
    this.searchInput = "";
    if (index === 1 && this.rankings.length === 0 && this.selectedLadderId) {
      this.loadRankings();
    }
    if (index === 2 && this.challenges.length === 0 && this.selectedLadderId) {
      this.loadChallenges();
    }
  }

  // ─── Search ───
  onSearch(ev: any) {
    var val = (ev && ev.target && ev.target.value) ? ev.target.value : this.searchInput;
    if (this.activeTab === 0) {
      if (val && val.trim() !== "") {
        this.filteredLadder = this.ladders.filter(function(item) {
          var q = val.toLowerCase();
          return (item.FirstName && item.FirstName.toLowerCase().indexOf(q) > -1) ||
            (item.LastName && item.LastName.toLowerCase().indexOf(q) > -1) ||
            (item.rank != undefined && String(item.rank).indexOf(q) > -1);
        });
      } else {
        this.filteredLadder = this.ladders;
      }
    } else if (this.activeTab === 1) {
      if (val && val.trim() !== "") {
        var q = val.toLowerCase();
        this.filteredRankings = this.rankings.filter(function(p) {
          return p.name.toLowerCase().indexOf(q) > -1;
        });
      } else {
        this.filteredRankings = this.rankings;
      }
    }
  }

  // ─── Points Tab ───
  ladderPeriod: number = 6; // 6=Current (rolling 12 months)
  periodOptions = [
    { label: 'Current', value: 6 },
    { label: 'This Month', value: 3 },
    { label: 'This Year', value: 2 },
    { label: 'Last Month', value: 7 },
    { label: 'Last 3 Months', value: 8 },
    { label: 'Last Year', value: 5 }
  ];

  onPeriodChange(period: number) {
    this.ladderPeriod = period;
    this.getLadderList();
  }

  getAgeCategories() {
    const ageCategoryQuery = gql`
      query getAgeCategories($parentClub: String!) {
        getAgeCategories(ParentClub: $parentClub) { Id CategoryName AgeFrom AgeTo Description }
      }
    `;
    this.graphqlService.query(ageCategoryQuery, { parentClub: this.parentclubKey }, 0).subscribe(
      (res: any) => {
        this.ageCategories = res.data["getAgeCategories"];
        if (this.ageCategories && this.ageCategories.length > 0) {
          this.selectedcat = this.ageCategories[0].Id;
        }
      },
      () => { this.commonService.toastMessage("Age categories fetch failed", 2500, ToastMessageType.Error, ToastPlacement.Bottom); }
    );
  }

  getLadderList() {
    this.commonService.showLoader("Fetching ladder...");
    var cat = this.ageCategories.filter((age) => age.Id == this.selectedcat)[0];
    if (!cat) { this.commonService.hideLoader(); return; }
    this.httpService.post(API.LEADERBOARD_GET_USER_LEADERBOARD, {
      parent_club_id: this.parentClubId,
      AgeFrom: cat.AgeFrom,
      AgeTo: cat.AgeTo,
      Duration: this.ladderPeriod
    }).subscribe({
      next: (res: any) => {
        this.commonService.hideLoader();
        var data = (res && res.data) ? res.data : [];
        this.ladders = data.map(function(entry, i) {
          return {
            Id: entry.Id,
            FirstName: entry.FirstName || '',
            LastName: entry.LastName || '',
            Points: entry.EarnedPoints || entry.Points || 0,
            rank: i + 1,
            TotalMatches: entry.TotalMatches || 0,
            LastMatchPlayed: entry.LastMatchPlayed ? new Date(entry.LastMatchPlayed).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : ''
          };
        }).sort(function(a, b) { return b.Points - a.Points; });
        this.ladders.forEach(function(entry, i) { entry.rank = i + 1; });
        this.filteredLadder = JSON.parse(JSON.stringify(this.ladders));
      },
      error: () => {
        this.commonService.hideLoader();
        this.commonService.toastMessage("Failed to fetch ladder", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
      }
    });
  }

  // ─── Bump Rank Tab ───
  loadLadderOptions() {
    this.httpService.post(API.LADDER_GET_CONFIGS, { parent_club_id: this.parentClubId }).subscribe({
      next: (res: any) => {
        var configs = (res && res.data) ? res.data : [];
        this.ladderOptions = configs.map(function(c) {
          return Object.assign({}, c, {
            label: (c.match_type === 1 ? 'Singles' : 'Doubles') + ' — Age ' + (c.age_band_from || 0) + '-' + (c.age_band_to || 99)
          });
        });
        if (this.ladderOptions.length > 0 && !this.selectedLadderId) {
          this.selectedLadderId = this.ladderOptions[0].id;
          this.loadRankings();
          this.loadChallenges();
        }
      },
      error: () => {}
    });
  }

  onLadderChange() {
    if (this.selectedLadderId) {
      this.loadRankings();
      this.loadChallenges();
    }
  }

  loadRankings() {
    this.bumpLoading = true;
    this.httpService.post(API.LADDER_GET_RANKINGS, { ladder_config_id: this.selectedLadderId }).subscribe({
      next: (res: any) => {
        var data = (res && res.data) ? res.data : [];
        this.rankings = data.map(function(r) {
          return {
            id: r.id,
            userId: r.user_id,
            name: ((r.FirstName || '') + ' ' + (r.LastName || '')).trim(),
            rank: r.rank,
            wins: r.wins || 0,
            losses: r.losses || 0,
            matchesPlayed: r.matches_played || 0,
            wildcardsRemaining: r.wildcards_remaining || 0,
            lastMatchDate: r.last_match_date
          };
        });
        this.filteredRankings = this.rankings;
        this.bumpLoading = false;
      },
      error: () => { this.rankings = []; this.filteredRankings = []; this.bumpLoading = false; }
    });
  }

  initRankings(mode: string) {
    this.commonService.showLoader("Seeding players...");
    this.httpService.post(API.LADDER_INIT_RANKINGS, {
      ladder_config_id: this.selectedLadderId,
      parent_club_id: this.parentClubId,
      mode: mode
    }).subscribe({
      next: (res: any) => {
        this.commonService.hideLoader();
        var count = (res && res.data) ? res.data.players_added || 0 : 0;
        if (count > 0) {
          this.commonService.toastMessage(count + ' players seeded (' + mode + ')', 2500, ToastMessageType.Success, ToastPlacement.Bottom);
        } else {
          this.commonService.toastMessage('No eligible players found', 2500, ToastMessageType.Info, ToastPlacement.Bottom);
        }
        this.loadRankings();
      },
      error: () => {
        this.commonService.hideLoader();
        this.commonService.toastMessage('Failed to seed rankings', 2500, ToastMessageType.Error, ToastPlacement.Bottom);
      }
    });
  }

  issueChallenge(player: any) {
    this.challengeTarget = player;
    this.showChallengeDialog = true;
  }

  confirmChallenge() {
    if (!this.challengeTarget) return;
    this.httpService.post(API.LADDER_ISSUE_CHALLENGE, {
      ladder_config_id: this.selectedLadderId,
      challenger_user_id: this.sharedservice.getLoggedInUserId(),
      challenged_user_id: this.challengeTarget.userId,
      parentclubId: this.parentClubId,
      app_type: 10,
      device_type: this.sharedservice.getPlatform() === 'android' ? 1 : 2
    }).subscribe({
      next: () => {
        this.showChallengeDialog = false;
        this.commonService.toastMessage('Challenge issued', 2500, ToastMessageType.Success, ToastPlacement.Bottom);
        this.loadChallenges();
      },
      error: (err) => {
        this.commonService.toastMessage((err && err.error && err.error.message) || 'Failed to issue challenge', 2500, ToastMessageType.Error, ToastPlacement.Bottom);
      }
    });
  }

  // ─── Challenges Tab ───
  loadChallenges() {
    if (!this.selectedLadderId) return;
    var payload: any = { ladder_config_id: this.selectedLadderId };
    if (this.challengeStatusFilter) payload.status = this.challengeStatusFilter;
    this.httpService.post(API.LADDER_GET_CHALLENGES, payload).subscribe({
      next: (res: any) => {
        var data = (res && res.data) ? res.data : [];
        this.challenges = data.map(function(c) {
          return {
            id: c.id,
            challengerName: ((c.challenger_first || '') + ' ' + (c.challenger_last || '')).trim(),
            challengedName: ((c.challenged_first || '') + ' ' + (c.challenged_last || '')).trim(),
            challengerRank: c.challenger_rank,
            challengedRank: c.challenged_rank,
            status: c.status,
            issuedAt: c.issued_at,
            deadlineAt: c.deadline_at
          };
        });
      },
      error: () => { this.challenges = []; }
    });
  }

  onChallengeFilterChange(status: string) {
    this.challengeStatusFilter = status;
    this.loadChallenges();
  }

  openApprove(ch: any) {
    this.approveTarget = ch;
    this.showApproveDialog = true;
  }

  confirmApprove() {
    if (!this.approveTarget) return;
    this.httpService.post(API.LADDER_RESPOND_CHALLENGE, { challenge_id: this.approveTarget.id, accept: true }).subscribe({
      next: () => {
        this.showApproveDialog = false;
        this.commonService.toastMessage('Challenge approved', 2500, ToastMessageType.Success, ToastPlacement.Bottom);
        this.loadChallenges();
      },
      error: () => { this.commonService.toastMessage('Failed to approve', 2500, ToastMessageType.Error, ToastPlacement.Bottom); }
    });
  }

  openCancel(ch: any) {
    this.cancelTarget = ch;
    this.showCancelDialog = true;
  }

  confirmCancel() {
    if (!this.cancelTarget) return;
    this.httpService.post(API.LADDER_CANCEL_CHALLENGE, { challenge_id: this.cancelTarget.id, cancelled_by: this.parentClubId }).subscribe({
      next: () => {
        this.showCancelDialog = false;
        this.commonService.toastMessage('Challenge cancelled', 2500, ToastMessageType.Success, ToastPlacement.Bottom);
        this.loadChallenges();
      },
      error: () => { this.commonService.toastMessage('Failed to cancel', 2500, ToastMessageType.Error, ToastPlacement.Bottom); }
    });
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'pending': return '#f59e0b';
      case 'accepted': return '#10b981';
      case 'completed': return '#3b82f6';
      case 'declined': return '#6b7280';
      case 'cancelled': return '#ef4444';
      default: return '#64748b';
    }
  }

  // ─── Config ───
  openConfig(mode: string) {
    this.configMode = mode;
    if (mode === 'edit' && this.selectedLadderId) {
      var existing = this.ladderOptions.find((l) => l.id === this.selectedLadderId);
      if (existing) {
        this.ladderConfig = {
          id: existing.id,
          matchType: existing.match_type || 1,
          ageBandFrom: existing.age_band_from || 0,
          ageBandTo: existing.age_band_to || 99,
          challengeRangeUp: existing.challenge_range_up || 30,
          challengeRangeDown: existing.challenge_range_down || 30,
          challengeDeadlineDays: existing.challenge_deadline_days || 14,
          responseDeadlineHours: existing.response_deadline_hours || 48,
          inactivityDays: existing.inactivity_days || 365,
          wildcardEnabled: existing.wildcard_enabled || false,
          wildcardsPerPlayer: existing.wildcards_per_player || 1,
          wildcardEarnAfterMatches: existing.wildcard_earn_after_matches || 5,
          affectsLadderFromTournament: existing.affects_ladder_from_tournament !== false
        };
      }
    } else {
      this.ladderConfig = {
        id: null, matchType: 1, ageBandFrom: 0, ageBandTo: 99,
        challengeRangeUp: 30, challengeRangeDown: 30, challengeDeadlineDays: 14,
        responseDeadlineHours: 48, inactivityDays: 365, wildcardEnabled: false,
        wildcardsPerPlayer: 1, wildcardEarnAfterMatches: 5, affectsLadderFromTournament: true
      };
    }
    this.showConfigDialog = true;
  }

  saveConfig() {
    var payload = {
      id: this.ladderConfig.id,
      parent_club_id: this.parentClubId,
      activity_id: null,
      match_type: this.ladderConfig.matchType,
      age_band_from: this.ladderConfig.ageBandFrom,
      age_band_to: this.ladderConfig.ageBandTo,
      challenge_range_up: this.ladderConfig.challengeRangeUp,
      challenge_range_down: this.ladderConfig.challengeRangeDown,
      challenge_deadline_days: this.ladderConfig.challengeDeadlineDays,
      response_deadline_hours: this.ladderConfig.responseDeadlineHours,
      inactivity_days: this.ladderConfig.inactivityDays,
      wildcard_enabled: this.ladderConfig.wildcardEnabled,
      wildcards_per_player: this.ladderConfig.wildcardsPerPlayer,
      wildcard_earn_after_matches: this.ladderConfig.wildcardEarnAfterMatches,
      affects_ladder_from_tournament: this.ladderConfig.affectsLadderFromTournament
    };
    this.httpService.post(API.LADDER_SAVE_CONFIG, payload).subscribe({
      next: () => {
        this.showConfigDialog = false;
        this.commonService.toastMessage('Configuration saved', 2500, ToastMessageType.Success, ToastPlacement.Bottom);
        this.loadLadderOptions();
      },
      error: (err) => {
        this.commonService.toastMessage((err && err.error && err.error.message) || 'Failed to save', 2500, ToastMessageType.Error, ToastPlacement.Bottom);
      }
    });
  }

  // ─── Theme ───
  private applyTheme(isDark: boolean): void {
    var el = document.querySelector("page-matchladder");
    if (el) {
      if (isDark) { el.classList.remove("light-theme"); document.body.classList.remove("light-theme"); }
      else { el.classList.add("light-theme"); document.body.classList.add("light-theme"); }
    }
  }

  private loadTheme(): void {
    this.storage.get("dashboardTheme").then((isDarkTheme) => {
      var isDark = isDarkTheme !== null && isDarkTheme !== undefined ? isDarkTheme : true;
      this.isDarkTheme = isDark;
      this.applyTheme(isDark);
    }).catch(() => { this.isDarkTheme = true; this.applyTheme(true); });
  }
}

export class FetchLadderInput {
  ParentClubId: string;
  userId: string;
  AppType: number;
  AgeFrom: number;
  AgeTo: number;
}
