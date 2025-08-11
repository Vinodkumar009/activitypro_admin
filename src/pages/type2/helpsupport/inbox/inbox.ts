import { Component, ViewChild } from '@angular/core';
import { IonicPage, Content, NavController,Platform, NavParams,ToastController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { HttpClient } from '@angular/common/http';
import { CommonService } from "../../../../services/common.service";
import { SharedServices } from '../../../services/sharedservice';
import { FirebaseService } from '../../../../services/firebase.service';
/**
 * Generated class for the InboxPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-inbox',
  templateUrl: 'inbox.html',
  providers: [CommonService,FirebaseService,]
})
export class Inbox {
  isInboxempty:boolean = false;
  isCompose:boolean = true;
  userkey:string = "";
  messages:Array<any> = [];
  nodeUrl: string = "";
  ChatOtherInfo = {SuperAdminKey:"",ParentClubKey:"",Userkey:"",Username:"",Subject:"", AssignedTo:"",Status:"",Chat_Status:"pending",
  CreationDate:new Date().getTime(),UpdatationDate:new Date().getTime()};
  ChatObj = {ReqMsg:"",Username:"",CreatedAt:new Date().getTime(),};
  newMsg = '';
  isAndroid:boolean = true;
  @ViewChild(Content) content: Content;
  constructor(public navCtrl: NavController, public platform: Platform, public navParams: NavParams, public toastCtrl:ToastController,public commonService: CommonService, public fb: FirebaseService, public storage: Storage, public sharedService: SharedServices,public http: HttpClient,) {
      this.isAndroid = this.platform.is('android') ? true:false;
  }

  ionViewDidLoad() {
    //this.content.scrollToBottom(200);
  }
  ionViewWillEnter(){
    this.getUserData(true);
  }

  getUserData(isGetChat:boolean){
    this.storage.get('userObj').then((data) => {
      let userinfo = JSON.parse(data);
      //console.log(userinfo);
      console.log(userinfo.$key);
      this.ChatOtherInfo.SuperAdminKey = SharedServices.getTempSuperAdminKey();
      //this.ChatOtherInfo.SuperAdminKey = "-KoGLONcroK1vB02b9Gg"; // need to change production one if env is prod
      this.ChatOtherInfo.Userkey = userinfo.$key;
      this.ChatOtherInfo.Username = userinfo.Name;
      this.ChatObj.Username = userinfo.Name;
      this.ChatOtherInfo.ParentClubKey = userinfo.UserInfo[0].ParentClubKey;
      this.nodeUrl = SharedServices.getTempNodeUrl();
      console.log(`${this.nodeUrl}:${SharedServices.getTempSuperAdminKey()}`);
      if(isGetChat){
        this.getChat();
      }
      
    });
  }

  //hide msg compose modal
  hideModal(ev:any){
    // if(ev.target.className === "modal"){
    //   this.isCompose=true;
    // }
    this.isCompose=true;
  }

  getChat(){
    ///https://activitypro-node.appspot.com /${this.nodeUrl}//url//
    this.http.post(`${this.nodeUrl}/messege/chat/listchatmsgs`,this.ChatOtherInfo).subscribe((result) => {
      console.log(this.messages);
      this.messages = this.commonService.convertFbObjectToArray(result);
      
      if(this.messages.length == 0) this.isInboxempty = true;
      // let data = this.commonService.convertFbObjectToArray(result);
      // this.messages = data.filter(rec => rec.ParentClubKey === this.ChatOtherInfo.ParentClubKey);
      if(this.messages.length > 0){
        this.getOtherInfo();
      }
    },(err)=>{
         console.log("err", err);
    });//sampl
   }

  getOtherInfo(){
    this.messages = this.messages.sort(function(a, b){ 
      return b.UpdatationDate - a.UpdatationDate; 
    }); 
    this.messages.forEach(async(req) => {
      if(req.Request){
        req.Request = await this.commonService.convertFbObjectToArray(req.Request);
        if( req.Request.length > 0){
          req.Request.forEach((res:any)=>{
            res.Response = this.commonService.convertFbObjectToArray(res.Response);
            //console.log(req.Request);
            if(res.Response.length > 0 && res.Response){
              req["lastconveruser"] = "ActivityPro";
              req["lastmsg"] = res.Response[res.Response.length-1].ansmsg;
              req["lastconversion"] = res.Response[res.Response.length-1].repliedAt;
            }else{
              req["lastconveruser"] = this.messages[0].Username;
              req["lastmsg"] = req.Request[req.Request.length-1].ReqMsg;
              req["lastconversion"] = req.Request[req.Request.length-1].CreatedAt;
            }
          })
        }
      }
    });
    
    console.log(this.messages);
  }

  sendMessage() {
    let chatInfoObj={};
    chatInfoObj["OtherInfo"] = this.ChatOtherInfo;
    this.ChatObj.ReqMsg = this.newMsg;
    chatInfoObj["ChatObj"] = this.ChatObj;
    ///${this.nodeUrl}messege/chat/send //url
    console.log();
    this.http.post(`${this.nodeUrl}/messege/chat/send`,chatInfoObj).subscribe((result) => {
      this.isCompose=true;
      this.toastMessage("Message sent successfully",1);
      this.newMsg = "";
      this.isInboxempty = false;
      this.messages.push(this.ChatOtherInfo);
      this.messages[this.messages.length-1]["Request"]=[];
      this.messages[this.messages.length-1]["Request"].push(this.ChatObj);
      this.ChatOtherInfo = {SuperAdminKey:"",ParentClubKey:"",Userkey:"",Username:"",Subject:"", AssignedTo:"",Status:"",Chat_Status:"pending",CreationDate:new Date().getTime(),UpdatationDate:new Date().getTime()};
      this.ChatObj = {ReqMsg:"",Username:"",CreatedAt:new Date().getTime()};
      console.log(this.messages);
      this.getUserData(false);
      this.getOtherInfo();
      
    },(err)=>{
      console.log("err", err);
      this.toastMessage("There is some problem,Please try again",0);
    });
    
  }

  gotoFullDets(chatObj:any){
    this.navCtrl.push("ComposePage",{chatObj:chatObj});
  }

  // toast controller show & dismiss
  toastMessage(msg: string, value: number) {
    let toast =  this.toastCtrl.create({
        message: msg,
        duration: 1700,
        cssClass: value ? "Success" : "Error",
        //showCloseButton: true
    });
    toast.present();
  }
}
