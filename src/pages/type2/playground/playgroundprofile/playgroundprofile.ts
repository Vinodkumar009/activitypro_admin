import { Component } from "@angular/core";
import {
  ActionSheetController,
  AlertController,
  IonicPage,
  NavController,
  NavParams,
  ToastController,
} from "ionic-angular";
import { FirebaseService } from "../../../../services/firebase.service";
import { Storage } from "@ionic/storage";
import { CommonService } from "../../../../services/common.service";

/**
 * Generated class for the PlaygroundprofilePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: "page-playgroundprofile",
  templateUrl: "playgroundprofile.html",
})
export class PlaygroundprofilePage {
  isTab: boolean = false;
  selectedFooterIndex = 0;
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public comonService: CommonService,
    public storage: Storage,
    public fb: FirebaseService,
    private toastCtrl: ToastController,
    public actionSheetCtrl: ActionSheetController,
    public alertCtrl: AlertController
  ) {}

  ionViewDidLoad() {
    console.log("ionViewDidLoad PlaygroundprofilePage");
  }

  selectedTab(index: number) {
    this.selectedFooterIndex = index;
    if (this.selectedFooterIndex == 0) {
    } else if (this.selectedFooterIndex == 1) {
      this.comonService.updateCategory("matchlist");
    } else if (this.selectedFooterIndex == 2) {
      this.comonService.updateCategory("ladderlist");
    } else if (this.selectedFooterIndex == 3) {
      this.comonService.updateCategory("match_history");
    } else if (this.selectedFooterIndex == 4) {
      this.comonService.updateCategory("leagueteamlisting");
    }
  }
}
