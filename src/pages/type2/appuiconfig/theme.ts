import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { FirebaseService } from '../../../services/firebase.service';
import { CommonService, ToastPlacement, ToastMessageType } from '../../../services/common.service';

/**
 * Generated class for the ThemePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-theme',
  templateUrl: 'theme.html',
})
export class Theme {
  IsShowModal:boolean = false;
  SetupObj = {HeaderBG:"#17445b",TabBG:"#17445b",HeaderText:"#f4f4f4",TabText:"#f4f4f4",DashboardBG:"#17445b",HomepageBG:"#f4f4f4"};
  ParentClubKey:string = "";
  selectedColor="";
  InputIndex:any;
  constructor(public navCtrl: NavController, public navParams: NavParams, public storage: Storage,public fb: FirebaseService,
    public commonService: CommonService,) {
    this.storage.get('userObj').then((val) => {
      val = JSON.parse(val);
      this.ParentClubKey = val.UserInfo[0].ParentClubKey;
      this.getParentClbDets();
    })
      
  }
  showPop(val:any,index:number){
    this.IsShowModal = true;
    //console.log(event.target.value);
    //this.selectedColor = event.target.value;
    this.selectedColor = val;
    this.InputIndex = index;
  }

  ionViewDidLoad() {
    this.IsShowModal = false;
  }

  CaptureColor(ev:any){
    this.IsShowModal = false;
    switch(this.InputIndex){
      case 1: 
        this.SetupObj.HeaderBG = ev;
        this.selectedColor = ev;
      break;
      case 2: 
        this.SetupObj.HeaderText = ev;
        this.selectedColor = ev;
      break;
      case 3: 
        this.SetupObj.TabBG = ev;
        this.selectedColor = ev;
      break;
      case 4: 
        this.SetupObj.TabText = ev;
        this.selectedColor = ev;
      break;
      case 5: 
        this.SetupObj.DashboardBG = ev;
        this.selectedColor = ev;
      break;
      case 6: 
        this.SetupObj.HomepageBG = ev;
        this.selectedColor = ev;
      break;
    }
    console.log(ev);
  }

  

  getParentClbDets() {
    this.fb.getAllWithQuery("ParentClub/Type2/", { orderByKey: true, equalTo: this.ParentClubKey }).subscribe((data) => {
      console.log(data[0]);
      if(data[0]["Theme"]!=undefined){
        //SetupObj = SetupObj = {HeaderBG:"#17445b",TabBG:"#17445b",HeaderText:"#f4f4f4",TabText:"#f4f4f4",DashboardBG:"#17445b",HomepageBG:"#f4f4f4"};
        this.SetupObj.HeaderBG = data[0]["Theme"].HeaderBG || "#17445b"
        this.SetupObj.TabBG = data[0]["Theme"].TabBG || "#17445b";
        this.SetupObj.HeaderText = data[0]["Theme"].HeaderText || "#f4f4f4";
        this.SetupObj.TabText = data[0]["Theme"].TabText || "#f4f4f4";
        this.SetupObj.DashboardBG = data[0]["Theme"].DashboardBG || "#17445b";
        this.SetupObj.HomepageBG = data[0]["Theme"].HomepageBG || "#f4f4f4";
      };
    })
  }

  //updating  theme config
  UpdateConfig(){
    this.fb.update("Theme",`ParentClub/Type2/${this.ParentClubKey}`,this.SetupObj).then((data)=>{
      this.commonService.toastMessage("Updated successfully",2500,ToastMessageType.Success);
    }).catch((err)=>{
      this.commonService.toastMessage("Updated successfully",2500,ToastMessageType.Error);
    })
  }
}
