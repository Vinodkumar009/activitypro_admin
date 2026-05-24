import { Component, ViewChild, Renderer2 } from "@angular/core";
import { IonicPage, NavController, Events } from "ionic-angular";
import { Storage } from "@ionic/storage";
import { CommonService } from "../../../services/common.service";
import { CommonLeagueService } from "../league/commonleague.service";
import { LeagueteamlistingPage } from "../league/leagueteamlisting/leagueteamlisting";
import { ThemeService } from "../../../services/theme.service";

@IonicPage()
@Component({
  selector: "page-tournament",
  templateUrl: "tournament.html",
})
export class TournamentPage {
  @ViewChild("leagueTeamListingRef") leagueTeamListingComponent: LeagueteamlistingPage;

  Title: string = "Competition";
  selectedFooterIndex = 4;
  isDarkTheme: boolean = true;
  currentActiveType: number;

  tabs = [
    { label: "Competition", icon: "trophy", index: 4, category: "leagueteamlisting" },
    { label: "Match", icon: "football", index: 1, category: "matchlist" },
    { label: "Ladder", icon: "stats", index: 2, category: "ladderlist" },
    { label: "History", icon: "timer", index: 3, category: "match_history" },
  ];

  constructor(
    public navCtrl: NavController,
    public commonService: CommonService,
    public storage: Storage,
    public events: Events,
    private leagueService: CommonLeagueService,
    private themeService: ThemeService,
    private renderer: Renderer2
  ) {
    this.currentActiveType = this.leagueService.getActiveLeagueType();
    this.leagueService.activeTypeSubject.subscribe((type) => {
      this.currentActiveType = type;
    });
    this.commonService.updateCategory("leagueteamlisting");
  }

  ionViewWillEnter() {
    this.currentActiveType = this.leagueService.getActiveLeagueType();
    this.loadTheme();
    this.themeService.isDarkTheme$.subscribe(isDark => this.applyTheme(isDark));
    this.events.subscribe("theme:changed", (isDark) => this.applyTheme(isDark));
  }

  ionViewWillLeave() {
    this.events.unsubscribe("theme:changed");
  }

  async loadTheme() {
    const isDarkTheme = await this.storage.get("dashboardTheme");
    this.applyTheme(isDarkTheme !== null ? isDarkTheme : true);
  }

  applyTheme(isDark: boolean) {
    this.isDarkTheme = isDark;
    const el = document.querySelector("page-tournament");
    if (el) {
      isDark ? this.renderer.removeClass(el, "light-theme")
             : this.renderer.addClass(el, "light-theme");
    }
  }

  selectedTab(tab: any) {
    this.selectedFooterIndex = tab.index;
    this.Title = tab.label;
    this.commonService.updateCategory(tab.category);
  }

  onFabClick() {
    if (this.selectedFooterIndex === 4 && this.leagueTeamListingComponent) {
      this.leagueTeamListingComponent.createAction();
    } else if (this.selectedFooterIndex === 1) {
      this.navCtrl.push("CreatematchPage");
    }
  }
}
