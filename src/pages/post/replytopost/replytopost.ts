import { Component, ViewChild } from '@angular/core';
import { IonicPage, Content, NavController, NavParams, AlertController, ToastController, LoadingController } from 'ionic-angular';
import { HttpClient } from '@angular/common/http';
import { SharedServices } from '../../services/sharedservice';
import { CommonService } from "../../../services/common.service";
import { Storage } from '@ionic/storage';
import { FirebaseService } from '../../../services/firebase.service';

/**
 * Generated class for the ReplytopostPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-replytopost',
  templateUrl: 'replytopost.html',
  providers: [CommonService, SharedServices,]
})
export class ReplytopostPage {
  messages: Array<any> = [];
  ChatObj: any = { ParentClubKey: "", Userkey: "", IsActive:true, chatKey: "", ReqKey:"",ansmsg:"",Username:"",ProfileImgUrl:"", isAdmin:true, repliedAt:new Date().getTime()};
  reqObj: any = { ReqMsg: "", IsActive:true, CreatedAt: undefined,Username:"" }
  isStopConversation: boolean = false;
  newMsg = '';
  user: string = "";
  recChatObj: any;
  parentClubKey: string;
  parentClubName: string;
  nodeUrl: string = "";
  userdata:any;
  isShowCloseIcon:boolean = false;
  @ViewChild(Content) content: Content;
  studentkey: string = "";
  userData: any;
  LoggedOnUserkey: string;
  LoggedOnUsername:string;
  showPop:boolean = true;
  
  constructor(public navCtrl: NavController, public navParams: NavParams, public loadingCtrl: LoadingController, public alertController: AlertController, public toastController: ToastController, public fb: FirebaseService, public commonService: CommonService, public sharedservice: SharedServices, private storage: Storage, public http: HttpClient) {
    let data = this.navParams.get("chatObj");
    this.recChatObj = data;
    this.userdata = data;
    console.log(this.recChatObj);
    this.ChatObj.ReqKey = this.recChatObj["Request"][this.recChatObj["Request"].length-1].Key;
    console.log(this.ChatObj.ReqKey);
    this.user = data.Username;
    this.ChatObj.Username = data.Username;
    this.ChatObj.chatKey = data.Key;
    this.ChatObj.Userkey = data.Userkey;
    
    this.ChatObj.ParentClubKey = data.ParentClubKey; //need to uncomment
   // this.ChatObj.ParentClubKey = "-Ls1FuWmUWcO-kDy5p_R"; //need to remove
    this.nodeUrl = SharedServices.getTempNodeUrl();
    this.isStopConversation = data.Chat_Status == "closed" ? true : false;
    console.log(this.recChatObj["Request"]);
    this.recChatObj["Request"].forEach((chat) => {
      chat["showPop"] = false;
      if (chat.Response) {
        chat.Response = this.commonService.convertFbObjectToArray(chat.Response);
        chat.Response.forEach((res)=> res["showPop"]=false);
      }
    });
    //console.log(this.recChatObj);
    this.storage.get('userObj').then((val) => {
      let userinfo = JSON.parse(val);
      this.content.scrollToBottom(300);
      if (userinfo.$key != "") {
        this.LoggedOnUserkey = userinfo.$key;
        this.LoggedOnUsername = userinfo.Name;
        if(this.LoggedOnUserkey == this.ChatObj.Userkey){
          this.isShowCloseIcon = true;
        }
      }
    });
    //this.ChangeChatStatus();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ComposePage');
    setTimeout(() => {
      this.content.scrollToBottom(200);
    },100);
    //this.userData = this.sharedservice.getUserData();
  }

  DeleteReqMsg(index:number){
    console.log(this.recChatObj.Request[index]);
    this.fb.$post(`${this.nodeUrl}/posts/chat/deleteReq`, this.ChatObj).subscribe((result) => {
      this.storage.remove('Posts').then((res)=>{
        this.recChatObj.Request[index].showPop = false;
        this.recChatObj.Request[index].IsActive = false;
        this.toastMessage("Message deleted", 1);
      });
    }, (err) => {
      console.log("err", err);
    });
  }

  DeleteRespMsg(reqIndex:number,respIndex:number){
    console.log(this.recChatObj.Request[reqIndex].Response[respIndex]);
    //this.ChatObj["RespKey"] = 
    this.fb.$post(`${this.nodeUrl}/posts/chat/deleteResp`, this.ChatObj).subscribe((result) => {
      this.storage.remove('Posts').then((res)=>{
        this.recChatObj.Request[reqIndex].Response[respIndex].IsActive = false;
      });
    }, (err) => {
      console.log("err", err);
    });
  }

  //to change the status to read
  ChangeChatStatus(){
    this.fb.$post(`${this.nodeUrl}/posts/chat/statustoread`, this.ChatObj).subscribe((result) => {
      console.log("status chnaged ro read");
    }, (err) => {
      console.log("err", err);
    });
  }


  loading:any;
  sendMessage() {
    this.loading = this.loadingCtrl.create({
      content: 'Please wait...'
    });
    this.loading.present();
    if (this.LoggedOnUserkey == this.ChatObj.Userkey) { //if user same it'a request only
      let chatInfoObj = {};
      chatInfoObj["OtherInfo"] = this.ChatObj;
      this.reqObj.Username = this.LoggedOnUsername;
      this.reqObj.ReqMsg = this.newMsg;
      this.reqObj.CreatedAt = new Date().getTime();
      chatInfoObj["ChatObj"] = this.reqObj;

      this.fb.$post(`${this.nodeUrl}/posts/chat/sendmembermsg`, chatInfoObj).subscribe((result) => {
        this.recChatObj.Request.push(this.reqObj);
          this.storage.remove('Posts').then((res)=>{
            this.loading.dismiss();
            this.toastMessage("Message sent", 1);
            this.reqObj.ReqMsg ="";
            this.newMsg = "";
          })
        setTimeout(() => {
          this.content.scrollToBottom(200); 
          this.navCtrl.pop();
        });
      }, (err) => {
        console.log("err", err);
      });
    } else {  // if user not same then it's a reply
    //ReqKey:"",repliedAt:new Date().getTime(),ansmsg
    this.ChatObj.ansmsg = this.newMsg ;
    this.ChatObj.Userkey = this.LoggedOnUserkey;
    this.ChatObj.Username = this.LoggedOnUsername;
    this.fb.$post(`${this.nodeUrl}/posts/chat/reply`, this.ChatObj).subscribe((result) => {
        if(this.recChatObj.Request[this.recChatObj.Request.length-1].Response){
          this.recChatObj.Request[this.recChatObj.Request.length-1].Response.push(this.ChatObj);
        }else{
          this.recChatObj["Request"][0]["Response"] = [];
          this.recChatObj["Request"][0]["Response"].push(this.ChatObj);
        }
        this.storage.remove('Posts').then((res)=>{
          this.loading.dismiss();
          this.toastMessage("Replied Successfully", 1);
          this.ChatObj.Userkey = this.userdata.Userkey;
          this.newMsg = "";
        });
        
      setTimeout(() => {
        this.content.scrollToBottom(200);
        this.navCtrl.pop();
      },100);
    }, (err) => {
      console.log("err", err);
    });
    }
  }

  //closing a conversation
  closeConversation() {
    const alert = this.alertController.create({
      title: 'Close Conversation',
      message: 'You want to close the conversation ?',
      cssClass: "alertCustom",
      buttons: [
        {
          text: 'No',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            console.log('Confirm Cancel: blah');
          }
        }, {
          text: 'Yes',
          handler: () => {
            console.log('Confirm Okay');
            this.changeStatus();
          }
        }
      ]
    });
    alert.present();
  }

  //closing conversation
  changeStatus() {
    this.ChatObj["chatstatus"] = "closed";
    this.fb.$post(`${this.nodeUrl}/posts/chat/statuschange`, this.ChatObj).subscribe((result) => {
      this.storage.remove('Posts').then((res)=>{
        this.toastMessage("Your conversation has been closed", 1);
        this.navCtrl.pop();
        this.isStopConversation = true;
      });
    }, (err) => {
      console.log("err", err);
    });
  }


  // toast controller show & dismiss
  toastMessage(msg: string, value: number) {
    let toast = this.toastController.create({
      message: msg,
      duration: 1700,
      cssClass: value ? "Success" : "Error",
      //showCloseButton: true
    });
    toast.present();
  }


}
