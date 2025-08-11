
import { Component } from "@angular/core";
import {
  IonicPage,
  LoadingController,
  NavController,
  NavParams,
  ActionSheetController,
  Platform,
  ToastController,
  AlertController,
} from "ionic-angular";
import {
  CommonService,
  ToastMessageType,
  ToastPlacement,
} from "../../../../services/common.service";
import { Storage } from "@ionic/storage";
import { Apollo } from "apollo-angular";
import { HttpLink } from "apollo-angular-link-http";
import { FirebaseService } from "../../../../services/firebase.service";
import moment from "moment";
import gql from "graphql-tag";
import { SharedServices } from "../../../services/sharedservice";
import {  TeamsForParentClubModel } from "../models/team.model";

/**
 * Generated class for the TeamsquadPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-teamsquad',
  templateUrl: 'teamsquad.html',
})
export class TeamsquadPage {


  teamType:boolean=true;
  nteamType:boolean=true;
  items=[];
  reOrderToggle = false;
  navText: string = "Re-order";nestUrl: any;
  ;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private apollo: Apollo,
    private httpLink: HttpLink,
    public actionSheetCtrl: ActionSheetController,
     public loadingCtrl: LoadingController,
    public storage: Storage,
    public platform: Platform,
    public fb: FirebaseService,
    public alertCtrl: AlertController,
    public commonService: CommonService,
    private toastCtrl: ToastController,
    public sharedservice: SharedServices
  ) {

    
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad TeamsquadPage');
  }

  allowDrop(ev) {
    ev.preventDefault();
  }
  
  

  changeType(val){
    this.teamType=val;
    this.nteamType=!val;
  }

  getColor(status) { 
    switch (status) {
      case 'Pending':
        return '#353030';
      case 'Rejected':
        return 'red';
      case 'Accepted':
        return 'green';
    }
  }

  requestplayerPage(){
    this.navCtrl.push("RequestplayerPage");
  }

  enableReorder() {
    this.reOrderToggle = !this.reOrderToggle;
    this.navText = this.reOrderToggle ? "Done" : "Re-order";
  }

  reorderItems(indexes) {
    let element = this.items[indexes.from];
    this.items.splice(indexes.from, 1);
    this.items.splice(indexes.to, 0, element);
  }

  squad=[
    {
      pName:"Suresh Raina",
      role:"Batsman",
      status:"Pending",
    },
    {
      pName:"MS Dhoni",
      role:"Wicket-Keeper",
      status:"Accepted",
    },
    {
      pName:"Dinesh Kartik",
      role:"Batsman",
      status:"Accepted",
    }, 
    {
      pName:"Zaheer Khan",
      role:"Bowler",
      status:"Rejected",
    },
  ]

  presentActionSheet(club) {
    // this.myIndex = -1;
    let actionSheet
    // if (this.platform.is('android')) {
    actionSheet = this.actionSheetCtrl.create({
      buttons: [
        {
        text: 'Assign Role',
        //icon: 'pen',
        handler: () => {
          this.navCtrl.push("AssignrolePage");
        },
      },
      {
        text: 'Cancel Invite',
        //icon: 'pen',
        handler: () => {
          this.navCtrl.push("AssignrolePage");
        },
      },
    ]
    })

    actionSheet.present();
  }
}
