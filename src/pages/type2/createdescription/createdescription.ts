import { Component, ViewChild } from '@angular/core';
import { NavController, PopoverController, AlertController, NavParams, ToastController, Navbar } from 'ionic-angular';
import { SharedServices } from '../../services/sharedservice';
import { FirebaseService } from '../../../services/firebase.service';
import { Storage } from '@ionic/storage';
import $ from 'jquery'
import { IonicPage } from 'ionic-angular';
import { CommonService, ToastMessageType, ToastPlacement } from '../../../services/common.service';
import { MembershipTemplateMasterModal, TemplatesDto } from '../membership/dto/membershi.dto';
import { HttpService } from '../../../services/http.service';
import { API } from '../../../shared/constants/api_constants';
@IonicPage()
@Component({
  selector: 'createdescription-page',
  templateUrl: 'createdescription.html',
  providers:[HttpService]
})
export class CreateDescription {

  memership_template_input:MembershipTemplateMasterModal = {
    parentclubId: "",
    clubId: "",
    action_type: 1,
    device_type: 1,
    app_type: 1,
    created_by: "",
    templates:[]
  }

  default_descriptions = [
    { header: 'Summary', title:"", description: '',id:"" },
    { header: 'Description', title:"", description: '',id:"" },
  ]

  descriptions:TemplatesDto[] = []
  is_existed:boolean = false;
  divheight;
  clubs = [];
  parentClubKey: any;
  templateType: any;
  trailingDescription = [];
  postgre_parentclub_id:string = "";
  @ViewChild(Navbar) navBar: Navbar;
  selectedClubKey: any;
  readyForUpdate: boolean = false;
  constructor(public storage: Storage, 
    public alertCtrl: AlertController,
    public comonService: CommonService, 
    public toastCtrl: ToastController, 
    public navCtrl: NavController, 
    public navParams: NavParams,
    public sharedservice: SharedServices, 
    private httpService:HttpService,
    public fb: FirebaseService, public popoverCtrl: PopoverController) {
    // storage.get('userObj').then((val) => {
    //   val = JSON.parse(val);
    //   for (let club of val.UserInfo)
    //     if (val.$key != "") {
    //       this.templateType = this.navParams.get('templateType')
    //       this.selectedClubKey = this.navParams.get('selectedClubKey')
    //       this.parentClubKey = club.ParentClubKey
    //       this.clubs = [];
    //       this.fb.getAllWithQuery("/Club/Type2/" + club.ParentClubKey, { orderByChild: "IsEnable", equalTo: true }).subscribe((data) => {
    //         this.clubs = data;
    //         this.getTemplate()
    //       });

    //     }
    // }).catch(error => { })
    this.getStorageData();
  }


  async getStorageData(){
    const [login_obj,postgre_parentclub] = await Promise.all([
      this.storage.get('userObj'),
      this.storage.get('postgre_parentclub'),
    ])

    if (login_obj) {
      this.parentClubKey = JSON.parse(login_obj).UserInfo[0].ParentClubKey;
    }
    if(postgre_parentclub){
      this.postgre_parentclub_id = postgre_parentclub.Id;
      this.memership_template_input.parentclubId = postgre_parentclub.Id;
      this.memership_template_input.clubId = this.navParams.get("selected_clubid");
      //this.getAllVenue();
    }
    
    this.memership_template_input.device_type = this.sharedservice.getPlatform() == "android" ? 1:2;
    this.memership_template_input.app_type = 0;//for admin
    this.memership_template_input.created_by = this.sharedservice.getLoggedInId();
    this.getTemplates();
  }

  ionViewWillLeave() {
    this.navBar.backButtonClick  = (e: UIEvent) => {
      console.log("todo something");
      this.comonService.commonAlter('Are You Sure?', 'Your changes will get dicarded', ()=>{
        this.navCtrl.pop()
      })
    }
  }

  getTemplates(){
    const get_templates_payload = {
      parentclubId:this.postgre_parentclub_id,
      clubId:this.navParams.get("selected_clubid"),
      action_type:1,
      device_type:this.sharedservice.getPlatform() == "android" ? 1:2,
      app_type:1
    }
    this.httpService.post(API.MEMBERSHIP_MASTER_TEMPLATES,get_templates_payload).subscribe((res: any) => {
      if(res && res.length > 0) {
       this.is_existed = true;
       this.descriptions = res.map((template) => {
        return {
          header: template.header,
          description: template.description,
          title: template.title,
          id:template.id
        }
      });
      }else{
        this.is_existed = false;
        this.descriptions = this.default_descriptions;
      }
    },
   (error) => {
        //this.commonService.hideLoader();
        console.error("Error in fetching:", error);
        this.comonService.toastMessage("No templates found", 2500,ToastMessageType.Error,ToastPlacement.Bottom);
       // Handle the error here, you can display an error message or take appropriate action.
   })
  }   

  ionViewDidLoad() {
    this.divheight = $('div').height()
    $('fab').css('margin-top', `${this.divheight}px`)
  }

  //removing a template
  poping(template:TemplatesDto){
    const template_index = this.descriptions.findIndex(existed_tem => existed_tem.id === template.id);
    if(template.id == '' || !template.id){
      this.descriptions.splice(template_index, 1);
    }else{
      const memership_template_input = {
        parentclubId: this.postgre_parentclub_id,
        action_type: 1,
        device_type: 1,
        app_type: 1,
        updated_by: "",
        template_id:template.id
      }
      this.httpService.post(API.MEMBERSHIP_REMOVE_MASTER_TEMPLATE,memership_template_input).subscribe((res: any) => {
        this.descriptions.splice(template_index, 1);
        this.comonService.toastMessage(res.message, 2500,ToastMessageType.Success,ToastPlacement.Bottom);
      },(error) => {
        if(error.error && error.error.message){
          console.error("Error in fetching:", error);
          this.comonService.toastMessage(error.error.message, 2500,ToastMessageType.Error,ToastPlacement.Bottom);
        }else{
          this.comonService.toastMessage("template removal failed", 2500, ToastMessageType.Error, ToastPlacement.Bottom); 
        }    
      });
    }
  }

  addSection() {
    this.descriptions.push({
      header: 'header',
      title: "",
      description: '',
      id:""
    })
  }

  createTemplate() {
    try{
      const is_descriptions_avail = this.descriptions.some((desc) => desc.header!='' || desc.description!='');
      if(is_descriptions_avail){ 
        if(!this.is_existed){//then creating templates first time
          this.memership_template_input.templates = this.descriptions.map((desc, index) => {
            return {
              header: desc.header,
              description: desc.description,
              title: desc.title,
            }
          })
          console.log(this.memership_template_input)
          this.httpService.post(API.MEMBERSHIP_MASTER_TEMPLATES_CREATE,this.memership_template_input).subscribe((res: any) => {
          this.comonService.toastMessage("Templates created", 2500,ToastMessageType.Success,ToastPlacement.Bottom);
          this.navCtrl.pop();
          },
         (error) => {
              //this.commonService.hideLoader();
              console.error("Error in fetching:", error);
              this.comonService.toastMessage("Template creation failed", 2500,ToastMessageType.Error,ToastPlacement.Bottom);
             // Handle the error here, you can display an error message or take appropriate action.
         });
        }else{ //then updating templates
          this.memership_template_input.templates = this.descriptions.map((desc, index) => {
            return {
              header: desc.header,
              description: desc.description,
              title: desc.title,
              id:desc.id
            }
          })
          console.log(this.memership_template_input)
          this.httpService.put(API.MEMBERSHIP_MASTER_TEMPLATES_UPDATE,this.memership_template_input).subscribe((res: any) => {
            this.comonService.toastMessage("Templates updated", 2500,ToastMessageType.Success,ToastPlacement.Bottom);
            this.navCtrl.pop();
          },
         (error) => {
              //this.commonService.hideLoader();
              console.error("Error in fetching:", error);
              this.comonService.toastMessage("Templates updation failed", 2500,ToastMessageType.Error,ToastPlacement.Bottom);
             // Handle the error here, you can display an error message or take appropriate action.
         });
        }
      }else{
        this.comonService.toastMessage("Please enter all fields", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
      }
    }catch(err){
      console.error(JSON.stringify(err));
      this.comonService.toastMessage("Something went wrong", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
    }
  }

  

  

 


}
