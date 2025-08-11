// import { Component } from '@angular/core';
// import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Component, ViewChild } from "@angular/core";
import {
  IonicPage,
  LoadingController,
  NavController,
  NavParams,
  ActionSheetController,
  Platform,
  ToastController,
  AlertController,
  Content,
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
import { ChatModel, GetStaffModel, MembersModel, TeamsForParentClubModel } from "../models/team.model";
import { stringify } from "querystring";

/**
 * Generated class for the MemberchattPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-memberchatt',
  templateUrl: 'memberchatt.html',
})
export class MemberchattPage {
  parentclubKey: any;

  constructor(
    public actionSheetCtrl: ActionSheetController,
    private apollo: Apollo,
    public commonService: CommonService,
    public navCtrl: NavController,
    public navParams: NavParams,
    private fb: FirebaseService
  ) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad MemberchattPage');
  }

  presentActionSheet() {
    let actionSheet = this.actionSheetCtrl.create({
      title: "Are you sure?",
      buttons: [
        {
          text: "Delete",
          role: "destructive",
          icon: "trash",
          handler: () => {
            // this.deleteChat(selectedChat);
          },
        },
        {
          text: "Cancel",
          role: "cancel",
          icon: "close",
          handler: () => {
            console.log("Cancel clicked");
          },
        },
      ],
    });

    actionSheet.present();
  }

  messages=[{
    Title:"Abc" ,
    Message: "Prince",
    FromKey: "",
    FromName: "",
    IsActive: "",
    CreatedAt:"", 
    MessageKey:"" 
    }
    ]

    colorObj = {
      a: "green",
      b: "purple",
      c: "yellow",
      d: "brown",
      e: "pink",
      f: "cyan",
      g: "blue",
      h: "gray",
      i: "red",
      j: "green",
      k: "purple",
      l: "yellow",
      m: "brown",
      n: "pink",
      o: "cyan",
      p: "blue",
      q: "gray",
      r: "red",
      s: "green",
      t: "purple",
      u: "yellow",
      v: "brown",
      w: "pink",
      x: "cyan",
      y: "blue",
      z: "gray",
    };
  
    getColorCode(name: string) {
      let char = name.toLowerCase().charAt(0);
      return this.colorObj[char];
    }
  
    gotoadmingroupchatinfo() {
      this.navCtrl.push("AdmingroupchatinfoPage", {
        // selectedGroup: this.selectedGroup,
        parentclubKey: this.parentclubKey,
      });
    }
}
