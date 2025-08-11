import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams ,ToastController, AlertController} from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { FirebaseService } from '../../../services/firebase.service';
import { CommonService, ToastMessageType, ToastPlacement } from '../../../services/common.service';
import { DefaultMenus } from '../../services/defaultmenus';
import { SharedServices, Menu } from '../../services/sharedservice';
import { HttpClient } from '@angular/common/http';
/**
 * Generated class for the EditothermemberPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-editothermember',
  templateUrl: 'editothermember.html',
})
export class EditothermemberPage {
  nestUrl:string;
  userInfo:any;
  selectedParentClubKey:any;
  clubList:Array<Object> = new Array();
  roleObj = roleObj;
  menuObj = menuObj;
  selectedRole:any = 0;
  can_refresh_coachs:boolean = false;
  saveObj = {
    FirstName:'',
    LastName:'',
    EmailID:'',
    Password:'',
  }
  selectedClubSet:Set<any> = new Set();
  Menus = [];
  isUserMenusAvailable = true;
  DefaultMenus = [];
  constructor(public toastCtrl:ToastController,public navCtrl: NavController, public alertCtrl: AlertController, public navParams: NavParams,public storage: Storage,public fb:FirebaseService,public CommonService:CommonService, public sharedservice: SharedServices, public http: HttpClient,) {
    this.nestUrl = sharedservice.getnestURL();
    storage.get('userObj').then((val) => {
      val = JSON.parse(val);
      for (let user of val.UserInfo) {
        if (val.$key != "") {
          this.selectedParentClubKey = user.ParentClubKey;
          //this.showToast("Please select Role, Venue and Module(s).")
        }
      }
      this.getClubList();
    }).catch(error => {

    });
  }
  addClub(club){
    if(this.selectedClubSet.has(club)){
      this.selectedClubSet.delete(club)
      console.log(this.selectedClubSet);
    }else{
      this.selectedClubSet.add(club);
      console.log(this.selectedClubSet);
    }
  }
  addMenu(menu,index){
    // if(this.Menus.length > 0){
    //   this.Menus[index].MobileAccess = !this.Menus[index].MobileAccess;
    // }else{
    //   this.DefultMenus[index].MobileAccess = !this.DefultMenus[index].MobileAccess;
    // }
  }
  
  getClubList(){
    this.fb.getAllWithQuery("Club/Type2",{orderByKey:true,equalTo:this.selectedParentClubKey}).subscribe((data:Array<any>)=>{
      this.clubList = [];
      if(data.length > 0){
        data = this.CommonService.convertFbObjectToArray(data[0]);
        data.forEach((club)=>{
          if(club.IsEnable && club.IsActive){
            this.clubList.push(club)
          }
        });
      }
    })
  }
  
  
  ionViewDidLoad() {
    this.userInfo = this.navParams.get('userInfo');
    this.saveObj.FirstName = this.userInfo.Name.split(" ")[0];
    this.saveObj.LastName = this.userInfo.Name.split(" ")[1];
    this.saveObj.EmailID = this.userInfo.EmailID;
    // this.userInfo.Menu = this.CommonService.convertFbObjectToArray(this.userInfo.Menu);
    // this.Menus = JSON.parse(JSON.stringify(this.userInfo.Menu));
    
    //console.log(this.userInfo.Menu);
    //console.log(this.Menus);
    console.log(this.userInfo);
    this.getSubAdminMenus();
  }

  getSubAdminMenus(){
    let menuData$Obs = this.fb.getAllWithQuery(`UserMenus/${this.userInfo.UserInfo[0].ParentClubKey}`, { orderByKey: true, equalTo: this.userInfo.$key}).subscribe((menuData) => {
      if(menuData.length > 0){
        this.Menus = this.CommonService.convertFbObjectToArray(menuData[0].Menu).filter(menu => menu.Level == 1 );
        console.log(this.Menus);
        menuData$Obs.unsubscribe();
      }else{
        this.isUserMenusAvailable = false;
        this.DefaultMenus = DefaultMenus.getSubAdminMenus();
        this.Menus = this.DefaultMenus.filter(menu => menu.Level == 1 );
      }
    });
  }



  updateUser(){
    let selectedClubLength = this.selectedClubSet.size;
    if(
     this.saveObj.FirstName != "" && this.saveObj.FirstName && this.saveObj.LastName != "" && this.saveObj.LastName){
      let obj = {
        "EmailID":this.userInfo.EmailID,
        "Name":this.saveObj.FirstName +" "+this.saveObj.LastName,
        "Password":this.userInfo.Password,
        "RoleType":this.userInfo.RoleType,
        "RoleTypeName":this.userInfo.Name,
        "Type":this.userInfo.Type,
        "UserType":this.userInfo.UserType,
      }
      //let saveObjKey = this.fb.saveReturningKey("User/SubAdmin",obj)
      this.fb.update(this.userInfo.$key,"User/SubAdmin",obj).then(()=>{
        //saving selectedClubs
        if(this.isUserMenusAvailable){
          this.Menus.forEach((newmenu)=>{
            //this.fb.update(newmenu.Key,`User/SubAdmin/${this.userInfo.$key}/Menu`,newmenu);
            this.fb.update(newmenu.Key,`UserMenus/${this.selectedParentClubKey}/${this.userInfo.$key}/Menu`, newmenu);
          });
        }else{
          this.Menus.forEach((visiblemenu)=>{
            this.DefaultMenus.forEach((defaultmenu)=>{
              if(visiblemenu.MobComponent == defaultmenu.MobComponent){
                defaultmenu.MobileAccess = visiblemenu.MobileAccess
              }              
            });
          });
          this.DefaultMenus.forEach((defaultmenu)=>{
            this.fb.saveReturningKey(`UserMenus/${this.selectedParentClubKey}/${this.userInfo.$key}/Menu`, defaultmenu);
            console.log("subscribed in edit other member");
          });
        }
        this.can_refresh_coachs = true;
        this.CommonService.toastMessage("Updated Successfully",2500);
        this.navCtrl.pop();
      })
     }else{
       this.CommonService.toastMessage("Provide all information.",2500,ToastMessageType.Error);
     }

  }
  

  resetAlertConfirmation(){
    let alert = this.alertCtrl.create({
      title: 'Reset Password',
      message: `Are you sure want to reset password ?`,
      buttons: [
        {
          text: "Yes: Reset",
          handler: () => {
            this.resetPassword();
          }
        },
        {
          text: 'No: Cancel',
          role: 'cancel',
          handler: data => {}
        }
      ]
    });
    alert.present();
  }


  resetPassword(){
    const userObj = {
      Parentclub:this.selectedParentClubKey,
      UserKey:this.userInfo.$key,
      UserName:this.userInfo.Name,
      UserEmail:this.userInfo.EmailID
    }
    
    this.CommonService.showLoader("Please wait");
      //this.nestUrl = "https://activitypro-nest-261607.appspot.com";
      //this.nestUrl = "http://localhost:3000";
      this.http.post(`${this.nestUrl}/subadmin/resetpassword`, userObj)
        .subscribe((res: any) => {
          this.CommonService.hideLoader();
          this.can_refresh_coachs = true;
          if (res) {
            this.CommonService.toastMessage("Password sent to your mail successfully", 2500, ToastMessageType.Success, ToastPlacement.Bottom);
          }
        }, err => {
          this.CommonService.hideLoader();
          this.CommonService.toastMessage("Password reset failed", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
        });
  }
  
  ionViewWillLeave(){
    if(this.can_refresh_coachs){
      this.CommonService.updateCategory("coach_list");
    }
  }

  
}


let menuObj = [
  { DisplayText:"Member",IsEnable:true,title: 'Member', component: "Type2Member", icon: "people",  role: 2, type: 2, Level: 1 },
  { DisplayText:"Group",IsEnable:true,title: 'Group', component: "Type2ManageSession",  icon: "people", role: 2, type: 2, Level: 1 },
  { DisplayText:"School Session",IsEnable:true,title: 'School Session', component: "Type2SchoolSessionList", icon: "school", role: 2, type: 2, Level: 1 },
  { DisplayText:"Holiday Camp",IsEnable:true,title: 'Holiday Camp', component: "Type2HolidayCamp", icon: "tennisball", role: 2, type: 2, Level: 1 },
  // { DisplayText:"Member Attnd",IsEnable:true,title: 'Member Attnd', component: "Type2ManageAttendance", icon: "clipboard", role: 2, type: 2, Level: 1 },
  // { DisplayText:"Staff Attendence",IsEnable:true,title: 'Staff Attendence', component: "StaffattendancePage", icon: "clipboard", role: 2, type: 2, Level: 1 },
  { DisplayText:"Notification",IsEnable:true,title: 'Notification', component: "Type2notification", icon: "md-notifications", role: 2, type: 2, Level: 1 },
  { DisplayText:"Payment",IsEnable:true,title: 'Payment', component: "InnerPaymentMenu", icon: "cash", role: 2, type: 2, Level: 1 },
  { DisplayText:"Booking",IsEnable:true,title: 'Booking', component: "BookingcontainerPage", icon: "bookmark", role: 2, type: 2, Level: 1},
  { DisplayText:"Setup",IsEnable:false,title: 'Setup', component: "Setup", icon: "settings", role: 2, type: 2, Level: 1 },
  { DisplayText:"Videos",IsEnable:true,title: 'Videos', component: 'VideomenueslistingPage', icon: "videocam", role: 2, type: 2, Level: 1 },
  { DisplayText:"Report",IsEnable:true,title: 'Report', component: "Type2Report", icon: "paper", role: 2, type: 2, Level: 1 },
  // { DisplayText:"Direct Debit",IsEnable:true,title: 'Direct Debit', component: "DirectdebitchoosememberPage", icon: "paper", role: 2, type: 2, Level: 1 },
  { DisplayText:"News & Events",IsEnable:true,title: 'News & Events', component: "EventsandnewsPage", icon: "paper", role: 2, type: 2, Level: 1 },
  { DisplayText:"Tournaments",IsEnable:true,title: 'Tournaments', component: 'TournamentPage', icon: "trophy", role: 2, type: 2, Level: 1 },
]
let roleObj = [
  {"Name":"Receptionist","RoleType":6,"Type":2,"UserType":2},
  {"Name":"Parents","RoleType":7,"Type":2,"UserType":2},
  {"Name":"Finance","RoleType":8,"Type":2,"UserType":2},
]
