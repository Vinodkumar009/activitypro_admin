import { Component, ComponentFactoryResolver } from "@angular/core";
import { IonicPage, NavController, NavParams } from "ionic-angular";
// import { MatchhistoryPage } from "../match/matchhistory/matchhistory";
// import { MatchladderPage } from "../match/matchladder/matchladder";

/**
 * Generated class for the TournamenttabsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: "page-tournamenttabs",
  templateUrl: "tournamenttabs.html",
})
export class TournamenttabsPage {
  // ladderPage: any;
  // historypage: any;
  // ladderPage = MatchladderPage;
  //historypage = MatchhistoryPage;
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams // componentFactoryResolver: ComponentFactoryResolver
  ) {}

  ionViewDidLoad() {
    console.log("ionViewDidLoad TournamenttabsPage");
  }
}
