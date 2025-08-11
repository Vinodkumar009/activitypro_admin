import { Component, ViewChild } from "@angular/core";
import { IonicPage,NavController,NavParams,Slides,AlertController,ActionSheetController, Checkbox} from "ionic-angular";
//import * as moment from "moment";
import { Storage } from "@ionic/storage";
import { FirebaseService } from "../../../../services/firebase.service";
import { CommonService, ToastMessageType, ToastPlacement } from "../../../../services/common.service";
import { ToastController } from "ionic-angular/components/toast/toast-controller";
import $ from "jquery";
import { SharedServices } from "../../../services/sharedservice";
import { IClubDetails } from "../../../../shared/model/club.model";
import gql from "graphql-tag";
import { GraphqlService } from "../../../../services/graphql.service";
import { HttpService } from "../../../../services/http.service";
import { API } from "../../../../shared/constants/api_constants";
import { Membership, MembershipTiersSetupDto, TemplatesDto } from "../dto/membershi.dto";
import { AppType, ModuleTypes, ParentclubAccountType } from "../../../../shared/constants/module.constants";
import { title } from "process";
@IonicPage()
@Component({
  selector: "page-membershipupdate",
  templateUrl: "update_membership.html",
  providers:[HttpService]
})
export class UpdateMembershipPage {
  @ViewChild("slides") slides: Slides;
  ParentClubKey: any;
  Venues:IClubDetails[] = [];
  templates:TemplatesDto[] = [];
  description = false;
  selectedClubKey = "";
  membership_dets:Membership;
  templatePresent = false;
  isPaymentgatewayAvail: boolean = false;
  master_templates:TemplatesDto[] = []
  
  YearlyFixedEndDate = {
    // IsActive: false,
    FinancialYear: {
      Option: "FinancialYear",
      StartMonth: "",
      EndMonth: "",
      ExpireDate: 0,
      IsActive: false,
    },
    TwelvemonthrollingMonthBefore: {
      Option: "TwelvemonthrollingMonthBefore",
      ExpireDate: 0,
      StartMonth: "",
      EndMonth: "",
      IsActive: false,
    },
    TwelvemonthrollingAtThatMonth: {
      Option: "TwelvemonthrollingAtThatMonth",
      ExpireDate: 0,
      StartMonth: "",
      EndMonth: "",
      IsActive: false,
    },
  };


  MinNoOfMember: number;
  MaxNoOfMember: number;
  currencyDetails: any;

  templateData: any[];
  modal: boolean = false;
  templateEditOpen = false;
  postgre_parentclub_id:string = "";
  can_edit_monthly:boolean = false;
  can_edit_yearly:boolean = false;
  membership_id:string = "";
  can_max_edit:boolean = false;
  can_min_edit:boolean = false;
  constructor(
    public alertCtrl: AlertController,
    public sharedservice: SharedServices,
    public toastCtrl: ToastController,
    public navParams: NavParams,
    public navCtrl: NavController,
    public actionSheetCtrl: ActionSheetController,
    public storage: Storage,
    private httpService:HttpService,
    public comonService: CommonService,
    private graphqlService: GraphqlService,
  ) {
    this.membership_id = this.navParams.get("membership_id")
    this.getStorageData();
  }

  async getStorageData(){
    const [login_obj,postgre_parentclub,currencyDetails] = await Promise.all([
      this.storage.get('userObj'),
      this.storage.get('postgre_parentclub'),
      this.storage.get('Currency'),
    ])

    if (login_obj) {
      this.ParentClubKey = JSON.parse(login_obj).UserInfo[0].ParentClubKey;
    }
    if(postgre_parentclub){
      this.postgre_parentclub_id = postgre_parentclub.Id;
      this.getMembershipDets(this.membership_id);
    }
    if(currencyDetails){
      this.currencyDetails = JSON.parse(currencyDetails);
    }
    
  }

  //showing toaster for info
  showHintToast(msg:string){
    this.comonService.toastMessage(msg,2500,ToastMessageType.Info);
  }

  getMembershipDets(membership_id:string) {
    const get_membership_payload = {
      parentclubId:this.postgre_parentclub_id,
      membership_id:membership_id,
      //clubId:this.Venues.find(venue => venue.FirebaseId === this.selectedClubKey).Id,
      action_type:1,
      device_type:this.sharedservice.getPlatform() == "android" ? 1:2,
      app_type:AppType.ADMIN_NEW//new admin
    }      
    
    this.httpService.post(API.MEMBERSHIP_DETAILS,get_membership_payload).subscribe((res: any) => {
      this.membership_dets = res.data;
      if(this.membership_dets.membership_template.length > 0){
        this.readTemplates(this.membership_dets.membership_template)
      }
      this.getAllVenue();
    },
   (error) => {
        //this.commonService.hideLoader();
        console.error("Error in fetching:", error);
        this.comonService.toastMessage("Membership tiers fetch failed", 2500,ToastMessageType.Error,ToastPlacement.Bottom);
       // Handle the error here, you can display an error message or take appropriate action.
   })    
  }


  readTemplates(templates:TemplatesDto[]){
    this.templates = templates.map((template) => {
      return {
        header: template.header,
        description: template.description,
        title: template.title,
        id:template.id,
        is_selected:true
      }
     });
     if(this.templates.length > 0)this.templateEditOpen = true;
     
     this.description = true;
  }
  
  
  getAllVenue() {
    this.Venues = [];
      const clubs_input = {
        parentclub_id:this.postgre_parentclub_id,
        user_postgre_metadata:{
          UserMemberId:this.sharedservice.getLoggedInId()
        },
        user_device_metadata:{
          UserAppType:AppType.ADMIN_NEW,
          UserDeviceType:this.sharedservice.getPlatform() == "android" ? 1:2
        }
      }
      const clubs_query = gql`
          query getVenuesByParentClub($clubs_input: ParentClubVenuesInput!){
            getVenuesByParentClub(clubInput:$clubs_input){
                  Id
                  ClubName
                  FirebaseId
                  MapUrl
                  sequence
              }
          }`;
          this.graphqlService.query(clubs_query,{clubs_input: clubs_input},0)
          .subscribe((res: any) => {
            this.Venues = res.data.getVenuesByParentClub as IClubDetails[];
            //console.log("clubs lists:", JSON.stringify(this.clubs));
            if(this.Venues.length > 0) this.selectedClubKey = this.Venues.find(venue => venue.Id === this.membership_dets.club.Id).FirebaseId;
          },
         (error) => {
              //this.commonService.hideLoader();
              console.error("Error in fetching:", error);
              this.comonService.toastMessage(error.message, 2500,ToastMessageType.Error, ToastPlacement.Bottom);
             // Handle the error here, you can display an error message or take appropriate action.
         })    
  }

  onVenueChange() {
    console.log(this.selectedClubKey);
    this.checkPaymentSetup();
    if(this.membership_dets.membership_template.length == 0){
      this.getMembershipMasterTemplates();
    }
  }
  //cheking payment gateway is avaiable for selected club
  checkPaymentSetup() {
    const get_tiers_list = {
      parentclubId:this.postgre_parentclub_id,//this.postgre_parentclub_id,
      clubId:this.Venues.find(venue => venue.FirebaseId === this.selectedClubKey).Id,
      app_type:AppType.ADMIN_NEW,
      device_id:this.sharedservice.getDeviceId(),
      device_type:this.sharedservice.getPlatform() == "android" ? 1:2,
      module:ModuleTypes.MEMBERSHIP,
      account_type:ParentclubAccountType.MEMBERSHIP
    }
    this.httpService.post(API.CHECK_STRIPE_AVAILABILITY,get_tiers_list).subscribe((res: any) => {
      this.isPaymentgatewayAvail = res.data;
      if(!this.isPaymentgatewayAvail){
        this.showPaymentInfoPrompt();
      }else{
        this.checkforSetup();
      }
    },
   (error) => {
        //this.commonService.hideLoader();
        console.error("Error in fetching:", error);
        this.comonService.toastMessage("Membership tiers fetch failed", 2500,ToastMessageType.Error,ToastPlacement.Bottom);
       // Handle the error here, you can display an error message or take appropriate action.
   })    
  }

  async showPaymentInfoPrompt(){
    let alert = this.alertCtrl.create({
      title: 'Missing Stripe',
      message: 'Please setup Stripe and setup the Membership.',
      buttons: [
        {
          text: 'Close',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        },
        {
          text: "Let's Setup Now!",
          handler: () => {
            this.navCtrl.push("StripeConnectPage");
          }
        }
      ]
    });
    alert.present();
  }


  checkforSetup(){
    const get_memberships_payload = {
        parentclubId:this.postgre_parentclub_id,
        clubId:this.Venues.find(venue => venue.FirebaseId === this.selectedClubKey).Id,
        action_type:1,
        device_type:this.sharedservice.getPlatform() == "android" ? 1:2,
        app_type:AppType.ADMIN_NEW
      }
      this.httpService.post(API.MEMBERSHIP_SETUP_LIST,get_memberships_payload).subscribe((res: any) => {
        if(res.length == 0 || !res[0].hasOwnProperty('admin_fees')) {
            this.comonService.commonAlter2('No membership year setup', 'Membership year setup is mandatory.', ()=>{
              this.navCtrl.push("AddmembershipYearPage");
            })
        }
      },
     (error) => {
          //this.commonService.hideLoader();
          console.error("Error in fetching:", error);
          this.comonService.toastMessage("No setups found", 2500,ToastMessageType.Error,ToastPlacement.Bottom);
         // Handle the error here, you can display an error message or take appropriate action.
     })        
  }

  //getting mester templates, these are used while creation
  getMembershipMasterTemplates() {
    const get_templates_payload = {
      parentclubId:this.postgre_parentclub_id,
      clubId:this.Venues.find(venue => venue.FirebaseId === this.selectedClubKey).Id,
      action_type:1,
      device_type:this.sharedservice.getPlatform() == "android" ? 1:2,
      app_type:AppType.ADMIN_NEW
    }
    this.httpService.post(API.MEMBERSHIP_MASTER_TEMPLATES,get_templates_payload).subscribe((res: any) => {
      if(res && res.length > 0) {
       //this.is_existed = true;
       this.readTemplates(this.master_templates);
      }
    },
   (error) => {
        //this.commonService.hideLoader();
        console.error("Error in fetching:", error);
        this.comonService.toastMessage("No templates found", 2500,ToastMessageType.Error,ToastPlacement.Bottom);
       // Handle the error here, you can display an error message or take appropriate action.
   })  
  }

  editMembershipInfo(prop_index:number){
    
    const prompt_options:{title:string,message:string,inputs:any[],buttons:any[]} = {
      title:"", 
      message:"",
      inputs:[],
      buttons:[]
    };
    
      if(prop_index == 0){
        prompt_options.title = "Membership Name",
        prompt_options.message = "";
        prompt_options.inputs.push({
          type: 'text',
          name: 'membership_name',
          //placeholder: 'group size',
          value:this.membership_dets.membership_name,
        })
        
      }
      if(prop_index == 1){
        prompt_options.title = "Min Member Allowed",
        prompt_options.message = "";
        prompt_options.inputs.push({
          type: 'text',
          name: 'min_member_allowed',
          //placeholder: 'group size',
          value:this.membership_dets.min_member,
        })
        
      }
      if(prop_index == 2){
        prompt_options.title = "Max Member Allowed",
        prompt_options.message = "";
        prompt_options.inputs.push({
          type: 'text',
          name: 'max_member_allowed',
          //placeholder: 'group size',
          value:this.membership_dets.max_member,
        })
      }
      
    prompt_options.buttons.push(
    {
      text: 'Cancel',
      handler: data => {}
    },{
      text: 'Update',
      handler: data => {
        console.log(`selected_input:${data}`);
        if(prop_index == 0){
          this.updateMembership({membership_id:this.membership_id,membership_name:data.membership_name})
        }
        if(prop_index == 1){
          this.updateMembership({membership_id:this.membership_id,min_member:Number(data.min_member)})
        }
        if(prop_index == 2){
          this.updateMembership({membership_id:this.membership_id,max_member:Number(data.max_member)})
        }
      }
    }
  )
    const prompt = this.alertCtrl.create(prompt_options);
    prompt.present();
   
  }


  //updating min/max members
  updateMinMaxMembers(){
    if (Number(this.membership_dets.min_member) > Number(this.membership_dets.max_member)) {
      const msg = "Max number of members for membership should not exceeds minimum number of members"
      this.comonService.toastMessage(msg,2500,ToastMessageType.Error);
      return false;
    }
    this.updateMembership({
        membership_id:this.membership_id,
        max_member:Number(this.membership_dets.max_member),
        min_member:Number(this.membership_dets.min_member)
    })
  }

  //updating monthly price
  updateMonthly(){
    let can_update:boolean = false;
    if(this.membership_dets.monthly && this.membership_dets.monthly_price <= "0.00"){
      this.comonService.toastMessage("Please enter valid price", 2500, ToastMessageType.Error);
      return false;
    }
    if(!this.membership_dets.monthly){
      if(!this.membership_dets.yearly){
        this.comonService.toastMessage("membership must have one pay plan", 2500, ToastMessageType.Error);
        return false;
      }
      this.comonService.commonAlert_V4("Price update","Are you sure want to remove monthly plan?","Yes","Cancel",()=>{
        this.updateMembership({
          membership_id:this.membership_id, 
          monthly:this.membership_dets.monthly,
          monthly_price:this.membership_dets.monthly_price
        })
      })
    }else{
      this.updateMembership({
        membership_id:this.membership_id, 
        monthly:this.membership_dets.monthly,
        monthly_price:this.membership_dets.monthly_price
      })
    }

    // if(can_update){
    //   this.updateMembership({
    //     membership_id:this.membership_id, 
    //     monthly:this.membership_dets.monthly,
    //     monthly_price:this.membership_dets.monthly_price
    //   })
    // }
  }

  //updating yearly price
  updateYearly(){
    let can_update:boolean = false;
    if(this.membership_dets.yearly && this.membership_dets.yearly_price <= "0.00"){
      this.comonService.toastMessage("Please enter valid price", 2500, ToastMessageType.Error);
      return false;
    }
    if(!this.membership_dets.yearly){
      if(!this.membership_dets.monthly){
        this.comonService.toastMessage("membership must have one pay plan", 2500, ToastMessageType.Error);
        return false;
      }
      this.comonService.commonAlert_V4("Price update","Are you sure want to remove yearly plan?","Yes","Cancel",()=>{
        this.updateMembership({
          membership_id:this.membership_id, 
          yearly:this.membership_dets.yearly,
          yearly_price:this.membership_dets.yearly_price,
          yearly_discount_absolute:this.membership_dets.yearly_discount_absolute,
          yearly_discount_percentage:this.membership_dets.yearly_discount_percentage
        })
      })
    }else{
      this.updateMembership({
        membership_id:this.membership_id, 
        yearly:this.membership_dets.yearly,
        yearly_price:this.membership_dets.yearly_price,
        yearly_discount_absolute:this.membership_dets.yearly_discount_absolute,
        yearly_discount_percentage:this.membership_dets.yearly_discount_percentage
      })
    }

    // if(can_update){
    //   this.updateMembership({
    //     membership_id:this.membership_id, 
    //     yearly:this.membership_dets.yearly,
    //     yearly_price:this.membership_dets.yearly_price,
    //     yearly_discount_absolute:this.membership_dets.yearly_discount_absolute,
    //     yearly_discount_percentage:this.membership_dets.yearly_discount_percentage
    //   })
    // }
    
  }


  updateTemplates(){
    this.updateMembership({
      membership_id:this.membership_id, 
      membership_templates:this.templates.filter(template => template.is_selected).map(template => {
        return {
          template_id:template.id,
          header:template.header,
          title:template.title,
          message:template.description
        }
      })
    })
  }

  //updating membership as micropart/microservice
  updateMembership(update_memberships_payload) {//get 
    Object.assign(update_memberships_payload,{
      parentclubId:this.postgre_parentclub_id,
      clubId:this.Venues.find(venue => venue.FirebaseId === this.selectedClubKey).Id,
      action_type:1,
      device_type:this.sharedservice.getPlatform() == "android" ? 1:2,
      app_type:AppType.ADMIN_NEW,
      updated_by:this.sharedservice.getLoggedInId()
    })
    this.httpService.post(API.MEMBERSHIP_UPDATE,update_memberships_payload).subscribe((res: any) => {
      this.comonService.updateCategory("update_membership_list");
      this.comonService.toastMessage("Updated successfully", 2500, ToastMessageType.Success, ToastPlacement.Bottom);
      this.getMembershipDets(this.membership_id);
    },
   (error) => {
        //this.commonService.hideLoader();
        console.error("Error in fetching:", error.message);
        if(error.error.message){
          this.comonService.toastMessage(`${error.error.message}`, 2500,ToastMessageType.Error,ToastPlacement.Bottom);
        }else{
          this.comonService.toastMessage("Update failed", 2500,ToastMessageType.Error,ToastPlacement.Bottom);
        }
       // Handle the error here, you can display an error message or take appropriate action.
   })
  }


  async next() {
    if(this.isPaymentgatewayAvail){ 
      if (this.selectedClubKey == "") {
        this.comonService.toastMessage("Please choose a venue",2500,ToastMessageType.Error);
      } 
    }
  }



  getMembershipSetup() {//get 
    const get_memberships_payload = {
      parentclubId:this.postgre_parentclub_id,
      clubId:this.Venues.find(venue => venue.FirebaseId === this.selectedClubKey).Id,
      action_type:1,
      device_type:this.sharedservice.getPlatform() == "android" ? 1:2,
      app_type:AppType.ADMIN_NEW
    }
    this.httpService.post(API.MEMBERSHIP_SETUP_LIST,get_memberships_payload).subscribe((res: any) => {
      if(res.length > 0) {
        //this.MembershipObj.membership_setup_id = res[0].id;
      }
    },
   (error) => {
        //this.commonService.hideLoader();
        console.error("Error in fetching:", error);
        this.comonService.toastMessage("No setups found", 2500,ToastMessageType.Error,ToastPlacement.Bottom);
       // Handle the error here, you can display an error message or take appropriate action.
   })
  }

  

  // validating membership
  validateMembership() {
    // if (this.MembershipObj.membership_name === "") {
    //   const msg = "Please enter membership name"
    //   this.comonService.toastMessage(msg,2500,ToastMessageType.Error);
    //   return false;
    // }
    // else if (this.MinNoOfMember > this.MaxNoOfMember) {
    //   const msg = "Max number of members for membership should not exceeds minimum number of members"
    //   this.comonService.toastMessage(msg,2500,ToastMessageType.Error);
    //   return false;
    // }
    // else if (this.MembershipObj.monthly &&  (this.MembershipObj.monthly_price == '' || this.MembershipObj.monthly_price == '0') ) {
    //   const msg = "Please enter monthly price"
    //   this.comonService.toastMessage(msg,2500,ToastMessageType.Error);
    //   return false;
    // }
    // else if (this.MembershipObj.yearly &&  (this.MembershipObj.yearly_price == '' || this.MembershipObj.yearly_price == '0') ) {
    //   const msg = "Please enter yearly price"
    //   this.comonService.toastMessage(msg,2500,ToastMessageType.Error);
    //   return false;
    // }
    return true;
  }

  

  //templates checking
  openDescriptionModal(cbox:Checkbox) {
    if (this.master_templates.length == 0 && this.membership_dets.membership_template.length == 0) {
      this.navCtrl.push("CreateDescription", {
        templateType: "Membership Template",
        selectedClubKey: this.Venues.find(venue => venue.FirebaseId === this.selectedClubKey).Id,
      });
    } else if (this.master_templates.length > 0 && this.description) {
      // this.modal = true
      // $(".scroll-content").css("overflow", "hidden")
      this.templateEditOpen = true;
    }
  }

  

  closeModal() {
    this.modal = false;
    $(".scroll-content").css("overflow", "scroll");
    this.templateEditOpen = true;
  }

  ionViewWillLeave(){
    //this.comonService.updateCategory("");
  }

  goBack() {
    this.navCtrl.pop();
  }
}
