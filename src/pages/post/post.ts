import { Component, ViewChild } from '@angular/core';
import { IonicPage, Content, NavController, NavParams, ToastController, LoadingController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { CommonService } from "../../services/common.service";
import { SharedServices } from '../services/sharedservice';
import { FirebaseService } from '../../services/firebase.service';


/**
 * Generated class for the PostPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-post',
  templateUrl: 'post.html',
  providers: [CommonService, SharedServices, FirebaseService,]
})
export class PostPage {
  clubs: any;
  chatImg:string="https://firebasestorage.googleapis.com/v0/b/activityprouk-b5815/o/ActivityPro%2FActivityIcons%2Fchat.png?alt=media&token=39c120b9-7c27-4609-bb86-9fbbaa560565";
  themeType: number;
  selectedVenue:any;
  isInboxempty: boolean = false;
  isCompose: boolean = true;
  userkey: string = "";
  messages: Array<any> = [];
  nodeUrl: string = "";
  Venues: Array<any> = [];
  ChatOtherInfo = { ParentClubKey: "", Userkey: "", Username: "", Subject: "", ProfileImgUrl: "", AssignedTo: "", Status: "unread", Chat_Status: "active", CreatedAt: new Date().getTime(), UpdatedAt: new Date().getTime() };
  ChatObj = { ReqMsg: "", IsActive:true, CreatedAt: new Date().getTime(), Username: "" };
  newMsg = '';

  @ViewChild(Content) content: Content;
  constructor(public navCtrl: NavController, public navParams: NavParams, public loadingCtrl: LoadingController, public toastCtrl: ToastController, public commonService: CommonService, public fb: FirebaseService, public storage: Storage, public sharedService: SharedServices, ) {


  }

  doRefresh(event) {
    setTimeout(() => {
      this.getChat();
      event.complete();
    }, 3000)

  }

  ionViewDidLoad() {

  }

  ionViewWillEnter() {
    this.themeType = this.sharedService.getThemeType();
    this.nodeUrl = SharedServices.getTempNodeUrl();
    this.selectedVenue = "all";
    this.storage.get('userObj').then((data) => {
      let val = JSON.parse(data);
      for (let club of val.UserInfo)
        if (val.$key != "") {
          this.ChatOtherInfo.Userkey = val.$key;
          this.ChatOtherInfo.Username = val.Name;
          this.ChatObj.Username = val.Name;
          this.ChatOtherInfo.ParentClubKey = val.UserInfo[0].ParentClubKey; //need to uncommen
          if (val.UserType == "2") {
            this.clubs = [];
            //"/Club/Type2/" + club.ParentClubKey
            this.fb.getAll(`/Club/Type2/${club.ParentClubKey}`).subscribe((data) => {
              for (let i = 0; i < data.length; i++) {
                if (data[i].IsEnable) {
                  this.clubs.push(data[i]);
                }
              }
              //console.log(this.clubs);
              this.ChatOtherInfo["VenueKey"] = "all";
              this.storage.get('Posts').then((posts) => {
                if (posts != undefined) {
                  this.messages = posts;
                  this.getChat();
                  // this.storage.get('posts_latest_refresh').then((time) => {
                  //   if (time != undefined) {
                  //     let dt1 = new Date().getMinutes();
                  //     let dt2 = new Date(time).getMinutes();
                  //     let diff = (dt1 - dt2);
                  //     console.log(diff)
                  //     if (diff >= 1) {
                  //       this.getChat();
                  //     } else {
                  //       this.messages = posts;
                  //     }
                  //   }
                  // }).catch(error => {
                  //   console.log(error)
                  // })
                } else {
                  this.getChat();
                }
              });
            });
          }
        }
      
    });

  }

  changeVenue(VenueKey: string) {
    console.log(VenueKey);
    this.ChatOtherInfo["VenueKey"] = VenueKey;
    this.getChat();
  }
  loading: any;
  getChat() {
    
    // this.loading = this.loadingCtrl.create({
    //   content: 'Please wait...'
    // });
    // this.loading.present();
    
    this.fb.$post(`${this.nodeUrl}/posts/chat/listposts`, this.ChatOtherInfo).subscribe((result) => {
      this.messages = [];
      this.messages = result.data;
      console.log(this.messages);
      if (this.messages.length > 0) {
        this.messages.reverse();
        this.isInboxempty = false;
        this.getOtherInfo();
      } else {
        //this.loading.dismiss();
        this.isInboxempty = true;
      }
    }, (err) => {
      console.log("err", err);
    });//sampl
  }

  getOtherInfo() {
    this.messages = this.messages.sort(function (a, b) {
      return b.UpdatedAt - a.UpdatedAt;
    });
    this.messages.forEach(async (req) => {
      if (req.Request) {
        req.Request = await this.commonService.convertFbObjectToArray(req.Request);
        if (req.Request.length > 0) {
          req.Request.forEach((res: any) => {
            res.Response = this.commonService.convertFbObjectToArray(res.Response);
            //console.log(req.Request);
            if (res.Response.length > 0 && res.Response) {
              req["lastconveruser"] = res.Response[res.Response.length - 1].Username;
              //let lastRes = req.Request[req.Request.length-1];
              req["lastmsg"] = res.Response[res.Response.length - 1].ansmsg;
              req["lastconversion"] = res.Response[res.Response.length - 1].repliedAt;
            } else {
              req["lastconveruser"] = req.Request[req.Request.length - 1].Username;
              req["lastmsg"] = req.Request[req.Request.length - 1].ReqMsg;
              req["lastconversion"] = req.Request[req.Request.length - 1].CreatedAt;
            }
          });
        }
      }
    });
    this.storage.set('Posts', this.messages);
    //this.loading.dismiss();
    console.log(this.messages);
  }


  sendMessage() {
    this.loading = this.loadingCtrl.create({
      content: 'Please wait...'
    });
    this.loading.present();
    if (this.ChatOtherInfo.Subject == "") {
      this.toastMessage("Please enter subject", 0);
      return false;
    }
    let chatInfoObj = {};
    chatInfoObj["OtherInfo"] = this.ChatOtherInfo;
    this.ChatObj.ReqMsg = this.newMsg;
    chatInfoObj["ChatObj"] = this.ChatObj;
    //this.ChatOtherInfo["VenueKey"]
    if (this.selectedVenue === "all") {
      this.clubs.forEach((venue: any) => {
        this.Venues.push({ VenueKey: venue.$key, VenueName: venue.ClubName });
      });
      //delete this.ChatOtherInfo['VenueKey']; // deleting a venuekey property
    } else {
      let venueIndex = this.clubs.findIndex(club => club.$key == this.selectedVenue);
      this.Venues.push({ VenueKey: this.clubs[venueIndex].$key, VenueName: this.clubs[venueIndex].ClubName });
      //delete this.ChatOtherInfo['VenueKey']; // deleting a venuekey property
    }

    chatInfoObj["Venues"] = [...this.Venues];

    //${this.nodeUrl}messege/chat/send //url
    this.fb.$post(`${this.nodeUrl}/posts/chat/send`, chatInfoObj).subscribe((result) => {
      this.isCompose = true;
      this.loading.dismiss();
      this.toastMessage("Message sent successfully", 1);
      this.isInboxempty = false;
      this.newMsg = "";
      this.messages.push(this.ChatOtherInfo);
      this.messages[this.messages.length-1]["Request"] = [];
      this.messages[this.messages.length-1]["Request"].push(this.ChatObj);
      this.ChatOtherInfo = { ParentClubKey: "", Userkey: "", Username: "", Subject: "", ProfileImgUrl: "", AssignedTo: "", Status: "unread", Chat_Status: "active", CreatedAt: new Date().getTime(), UpdatedAt: new Date().getTime() };
      this.ChatObj = { ReqMsg: "", IsActive:true, CreatedAt: new Date().getTime(), Username: "" };
      console.log(this.messages);
      this.storage.remove("Posts").then(res=>this.getOtherInfo());
    }, (err) => {
      console.log("err", err);
      this.loading.dismiss();
      this.toastMessage("There is some problem,Please try again", 0);
    });

  }

  gotoFullDets(chatObj: any) {
    this.navCtrl.push("ReplytopostPage", { chatObj: chatObj });
  }

  // toast controller show & dismiss
  toastMessage(msg: string, value: number) {
    let toast = this.toastCtrl.create({
      message: msg,
      duration: 1700,
      cssClass: value ? "Success" : "Error",
      //showCloseButton: true
    });
    toast.present();
  }

}
