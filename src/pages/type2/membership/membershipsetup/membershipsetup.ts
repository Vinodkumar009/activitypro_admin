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
import { CommonRestApiDto } from "../../../../shared/model/common.model";
import { CreateMembership, MembershipTiersSetupDto, TemplatesDto } from "../dto/membershi.dto";
import { AppType, ModuleTypes, ParentclubAccountType } from "../../../../shared/constants/module.constants";
import { ClubActivity } from "../../../../shared/model/activity.model";
@IonicPage()
@Component({
  selector: "page-membershipsetup",
  templateUrl: "membershipsetup.html",
  providers:[HttpService]
})
export class MembershipSetupPage {
  @ViewChild("slides") slides: Slides;
  ParentClubKey: any;
  Venues:IClubDetails[] = [];
  templates:TemplatesDto[] = [];
  description = false;
  selectedClubKey = "";
  Membership = "";
  myRadio = "";
  templatePresent = false;
  selectedTime: string = "Nope";
  selectedActivity: string = "Nope";
  selectedCtg: string = "Nope";
  selectedSubCtg: string = "Nope";
  isPaymentgatewayAvail: boolean = false;
  master_templates:TemplatesDto[] = [];
  Activities:ClubActivity[] = [];
  ageGroupArr = [
    { GroupName: "Tier1", Label: "Adult", Value: false, Key: null },
    { GroupName: "Tier1", Label: "Junior", Value: false, Key: null },
    { GroupName: "Tier1", Label: "Sr. Citizen", Value: false, Key: null },
    { GroupName: "Tier1", Label: "Family", Value: false, Key: null },
  ];
  GroupArr = [
    { GroupName: "Tier2", Label: "Single", Value: false, Key: null },
    { GroupName: "Tier2", Label: "Couple", Value: false, Key: null },
    { GroupName: "Tier2", Label: "VIP", Value: false, Key: null },
    { GroupName: "Tier2", Label: "Family with Jr.", Value: false, Key: null },
    { GroupName: "Tier2", Label: "Adult Student", Value: false, Key: null },
  ];
  activityArr = [
    {
      GroupName: "Tier3",
      Label: "All",
      Value: false,
      Key: null,
      ActivityCode: "",
    },
    {
      GroupName: "Tier3",
      Label: "Indoor",
      Value: false,
      Key: null,
      ActivityCode: "",
    },
    {
      GroupName: "Tier3",
      Label: "Outdoor",
      Value: false,
      Key: null,
      ActivityCode: "",
    },
    // { GroupName: "Tier3", Label: "Tennis", Value: false, Key: null },
    // { GroupName: "Tier3", Label: "Wet Only", Value: false, Key: null },
    // { GroupName: "Tier3", Label: "Dry Only", Value: false, Key: null },
    //{ GroupName: "Tier3", Label: "Gym", Value: false, Key: null }
  ];
  timeArr = [
    { GroupName: "Tier4", Label: "Anytime", Value: false, Key: null },
    { GroupName: "Tier4", Label: "Peak", Value: false, Key: null },
    { GroupName: "Tier4", Label: "Off-Peak", Value: false, Key: null },
    { GroupName: "Tier4", Label: "Weekends", Value: false, Key: null },
  ];

  dataExists = false;

  tier1Key: string;
  tier2Key: string;
  tier3Key: string;
  tier4Key: string;

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

  paymentOptions = {
    Monthly: {
      Price: 0,
      DiscountPercentage: 0,
      DiscountAbsolute: 0,
      IsActive: false,
    },
    Quaterly: {
      Price: 0,
      DiscountPercentage: 0,
      DiscountAbsolute: 0,
      IsActive: false,
    },
    Yearly: {
      Price: 0,
      DiscountPercentage: 0,
      DiscountAbsolute: 0,
      IsActive: false,
    },
  };
  selectedSetupKey: any;
  setupName: string;
  MinNoOfMember: number;
  MaxNoOfMember: number;
  currencyDetails: any;
  tier1Name: string;
  tier2Name: string;
  tier3Name: string;
  tier4Name: string;
  isDirectedEdit: boolean;
  MembershipYearExist: boolean = false;

  tire3Code: string = "";
  templateData: any[];
  modal: boolean = false;
  templateEditOpen = false;
  nodeUrl: any;
  originalPaymentOption = {};
  postgre_parentclub_id:string = "";
  membership_tiers:MembershipTiersSetupDto;
  MembershipObj = {
    parentclub_id:"",
    club_id:"",
    membership_name: "",
    min_member: 0,
    max_member: 0,
    membership_disclaimer: "",
    membership_setup_id: "",
    monthly: false,
    yearly: false,
    monthly_price: "",
    yearly_price: "",
    description: "",
    status: 1,
    created_by: "",
    tier_category_id: "",
    tier_subcategory_id: "",
    tier_activity_id: "",
    tier_time_id: "",
    tier_name: "",
    yearly_discount_absolute:"",
    yearly_discount_percentage:"",
    selected_activities:[]
  }

  constructor(
    public alertCtrl: AlertController,
    public sharedservice: SharedServices,
    public toastCtrl: ToastController,
    public navParams: NavParams,
    public navCtrl: NavController,
    private fb: FirebaseService,
    public actionSheetCtrl: ActionSheetController,
    public storage: Storage,
    private httpService:HttpService,
    public comonService: CommonService,
    private graphqlService: GraphqlService,
  ) {
    this.nodeUrl = this.sharedservice.getnodeURL();
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
      // if ((this.selectedClubKey = this.navParams.get("ClubKey")) &&
      //   (this.selectedSetupKey = this.navParams.get("SetupKey"))
      // )

      this.Membership = "firstpage";
      if (this.navParams.get("ClubKey") && this.navParams.get("SetupKey")){
        this.isDirectedEdit = true;
      } else {
        //this.Membership = "firstpage";
      }
      this.getAllVenue();
      //this.getEndYear(this.ParentClubKey, this.selectedClubKey);
    }
    if(currencyDetails){
      this.currencyDetails = JSON.parse(currencyDetails);
    }
    
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
          }
          `;
          this.graphqlService.query(clubs_query,{clubs_input: clubs_input},0)
          .subscribe((res: any) => {
            this.Venues = res.data.getVenuesByParentClub as IClubDetails[];
            //console.log("clubs lists:", JSON.stringify(this.clubs));
            this.selectedClubKey = this.Venues[0].FirebaseId;
            //this.checkPaymentSetup();
          },
         (ex) => {
              //this.commonService.hideLoader();
              console.error("Error in fetching:", ex);
              this.comonService.toastMessage(ex.error.message, 2500,ToastMessageType.Error, ToastPlacement.Bottom);
             // Handle the error here, you can display an error message or take appropriate action.
         })     
  }

  onVenueChange() {
    console.log(this.selectedClubKey);
    this.getClubActivities();
    this.checkPaymentSetup();
    this.getTiersSetup();
    this.getMembershipMasterTemplates();
  }
  //cheking payment gateway is avaiable for selected club
  checkPaymentSetup() {
    const get_tiers_list = {
      parentclubId:this.postgre_parentclub_id,
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
        this.comonService.toastMessage("No payment setup available for the selected venue", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
      }
    },
   (ex) => {
        //this.commonService.hideLoader();
        console.error("Error in fetching:", ex);
        this.comonService.toastMessage(ex.error.message, 2500,ToastMessageType.Error,ToastPlacement.Bottom);
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
       this.master_templates = res.map((template) => {
        return {
          header: template.header,
          description: template.description,
          title: template.title,
          id:template.id,
          is_selected:true
        }
       });
      }
    },
   (error) => {
        //this.commonService.hideLoader();
        console.error("Error in fetching:", error);
        this.comonService.toastMessage("No templates found", 2500,ToastMessageType.Error,ToastPlacement.Bottom);
       // Handle the error here, you can display an error message or take appropriate action.
   })  
  }

  getClubActivities() {
    this.Activities = [];
    const club_activity_input:CommonRestApiDto = {
      parentclubId:this.postgre_parentclub_id,
      clubId:this.Venues.find(venue => venue.FirebaseId === this.selectedClubKey).Id,
      app_type:AppType.ADMIN_NEW,
      device_id:this.sharedservice.getDeviceId(),
      device_type:this.sharedservice.getPlatform() == "android" ? 1:2
    }
    this.httpService.post(API.CLUB_ACTIVITIES,club_activity_input).subscribe((res: any) => {
      if(res.data && res.data.club_activities.length > 0){
        res.data.club_activities.forEach(obj => {
          Object.assign(obj, { is_selected: false });
        });
        this.Activities = res.data.club_activities;
      }else{
        this.comonService.toastMessage("No activities available for the selected venue", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
      }
    },
   (error) => {
        //this.commonService.hideLoader();
        console.error("Error in fetching:", error);
        this.comonService.toastMessage("Membership tiers fetch failed", 2500,ToastMessageType.Error,ToastPlacement.Bottom);
       // Handle the error here, you can display an error message or take appropriate action.
   })
  }

  getTiersSetup() {//get tiers setup call
    const get_tiers_list:CommonRestApiDto = {
      parentclubId:this.postgre_parentclub_id,
      clubId:this.Venues.find(venue => venue.FirebaseId === this.selectedClubKey).Id,
      app_type:AppType.ADMIN_NEW,
      device_id:this.sharedservice.getDeviceId(),
      device_type:this.sharedservice.getPlatform() == "android" ? 1:2
    }
    this.httpService.post(API.MEMBERSHIP_TIERS_LIST,get_tiers_list).subscribe((res: any) => {
      this.membership_tiers = res;
      if(this.membership_tiers.categories && this.membership_tiers.categories.length > 0){
        this.membership_tiers.categories.forEach(obj => {
          Object.assign(obj, { is_selected: false });
        });
      }
      if(this.membership_tiers.subcategories && this.membership_tiers.subcategories.length > 0){
        this.membership_tiers.subcategories.forEach(obj => {
          Object.assign(obj, { is_selected: false });
        });
      }
      // if(this.membership_tiers.activities && this.membership_tiers.activities.length > 0){
      //   this.membership_tiers.activities.forEach(obj => {
      //     Object.assign(obj, { is_selected: false });
      //   });
      // }
      if(this.membership_tiers.times && this.membership_tiers.times.length > 0){
        this.membership_tiers.times.forEach(obj => {
          Object.assign(obj, { is_selected: false });
        });
      }
    },
   (error) => {
        //this.commonService.hideLoader();
        console.error("Error in fetching:", error);
        this.comonService.toastMessage("Membership tiers fetch failed", 2500,ToastMessageType.Error,ToastPlacement.Bottom);
       // Handle the error here, you can display an error message or take appropriate action.
   })
  }
  

  selectAge(index:number) {
    this.selectedCtg = this.membership_tiers.categories[index].label;
    this.MembershipObj.tier_category_id = this.membership_tiers.categories[index].id;
    // this.ageGroupArr.forEach((ageGroup) => {
    //   if (ageGroup.Label == label && ageGroup.Value) {
    //     ageGroup.Value = !ageGroup.Value;
    //     this.tier1Key = "";
    //   } else if (ageGroup.Label == label && !ageGroup.Value) {
    //     ageGroup.Value = !ageGroup.Value;
    //     this.tier1Key = ageGroup.Key;
    //     this.tier1Name = ageGroup.Label;
    //   } else {
    //     ageGroup.Value = false;
    //   }
    // });
    this.membership_tiers.categories.forEach((category,i) =>{
      if(i === index){
        category.is_selected = !category.is_selected;
      }else{
        category.is_selected = false;
      }
    })
  }

  selectGroup(index:number) {
    this.selectedSubCtg = this.membership_tiers.subcategories[index].label;
    this.MembershipObj.tier_subcategory_id = this.membership_tiers.subcategories[index].id;
    this.membership_tiers.subcategories.forEach((sub_category,i) =>{
      if(i === index){
        sub_category.is_selected = !sub_category.is_selected;
      }else{
        sub_category.is_selected = false;
      }
    })
  }

  selectActivity(index:number) {
    const activity_index = this.MembershipObj.selected_activities.findIndex(activity_id => activity_id === this.Activities[index].id)
    if(activity_index > -1) {
      this.Activities[index].is_selected = false;
      this.MembershipObj.selected_activities.splice(activity_index, 1);
      if(this.selectedActivity.includes(this.Activities[index].activity_name)){
        if(this.selectedActivity.split(",").length > 1){
          this.selectedActivity = this.selectedActivity.replace(","+this.Activities[index].activity_name,"");
        }else{
          this.selectedActivity = this.selectedActivity.replace(this.Activities[index].activity_name,"");
        }
      }
      this.selectedActivity = this.MembershipObj.selected_activities.length == 0 ? "Nope" : this.selectedActivity;
    }else{
      this.Activities[index].is_selected = true;
      this.MembershipObj.selected_activities.push(this.Activities[index].id);
      if(this.selectedActivity!="Nope"){
        this.selectedActivity = this.selectedActivity+","+this.Activities[index].activity_name;
      }else{
        this.selectedActivity = this.Activities[index].activity_name;
      }
    }
  }

  selectTime(index:number) {
    this.selectedTime = this.membership_tiers.times[index].label;
    this.MembershipObj.tier_time_id = this.membership_tiers.times[index].id;
    this.membership_tiers.times.forEach((time,i) =>{
      if(i === index){
        time.is_selected = !time.is_selected;
      }else{
        time.is_selected = false;
      }
    })
  }
  
  

  addOption(option: number) {
    if(option!=3){
      let alert = this.alertCtrl.create({
        title: "Add Option",
        message: " Want to add an Option?",
        inputs: [{ name: "Label", type: "text", value: "" }],
        buttons: [
          { text: "Cancel", role: "cancel" },
          {
            text: "Add",
            handler: (data) => {
              if (data.Label === ""){
                this.comonService.toastMessage("Option shouldn't be empty", 2500, ToastMessageType.Error, ToastPlacement.Bottom)
                return false
              }
              // // Saves the options in the Db ans pushes it to the respective array for display// //
             this.saveMembershipTier(option,data.Label);
            },
          },
        ],
      });
      alert.present();
    }else{
      const club = this.Venues.find(venue => venue.FirebaseId === this.selectedClubKey);
      this.navCtrl.push("AssignActivityPage",{venue:{
        $key: this.selectedClubKey,
        ClubID: club.Id,
        ClubKey: this.selectedClubKey,
        ClubName: club.ClubName,
        ClubShortName: club.ClubName,
        sequence: club.sequence
      }})
    }
  }

  saveMembershipTier(option:number,label:string){
    const membership_tier_create = {
      parentclubId:this.postgre_parentclub_id,
      clubId:this.Venues.find(venue => venue.FirebaseId === this.selectedClubKey).Id,
      app_type:AppType.ADMIN_NEW,
      option,//1:age,2:group,3:activity,4:time
      label,
      device_id:this.sharedservice.getDeviceId(),
      device_type:this.sharedservice.getPlatform() == "android" ? 1:2
    }
    this.httpService.post(API.MEMBERSHIP_TIERS_ADD,membership_tier_create).subscribe((res: any) => {
      this.comonService.toastMessage("Membership tier updated", 2500,ToastMessageType.Success,ToastPlacement.Bottom);
      if(option === 1){
        this.membership_tiers.categories.push(res);
      }
      if(option === 2){
        this.membership_tiers.subcategories.push(res);
      }
      // if(option === 3){
      //   this.membership_tiers.activities.push(res);
      // }
      if(option === 4){
        this.membership_tiers.times.push(res);
      }
    },
   (error) => {
        //this.commonService.hideLoader();
        console.error("Error in fetching:", error);
        this.comonService.toastMessage("Membership tier save failed", 2500,ToastMessageType.Error,ToastPlacement.Bottom);
       // Handle the error here, you can display an error message or take appropriate action.
   })
  }

  async next() {
    if(this.isPaymentgatewayAvail){
      //await this.save();
      // if (!this.dataExists) {
      //     this.save()
      //     // console.log(this.dataExists)
      // }
      
      this.getMembershipSetup();//call for setup based on parentclub&club, u need that in creation api
      
      if (this.selectedClubKey == "") {
        this.comonService.toastMessage("Please choose a venue",2500,ToastMessageType.Error);
      } else if(this.selectedTime!="Nope" && this.MembershipObj.selected_activities.length > 0 && this.selectedCtg!="Nope" && this.selectedSubCtg!="Nope") {
        this.Membership = "secondpage";
        this.MembershipObj.tier_name = this.selectedCtg +"-" +this.selectedSubCtg + "-" + this.selectedActivity + "-" + this.selectedTime;
        this.MembershipObj.membership_name = this.selectedCtg +"-" +this.selectedSubCtg + "-" + this.selectedActivity + "-" + this.selectedTime;
        this.MembershipObj.min_member = 1;
        this.MembershipObj.max_member = 1;
        console.table(this.MembershipObj);
        this.search(); //this is used to check it's already created/nothing but we'r in edit flow
      } else {
        this.comonService.toastMessage("Please choose an option from all the tiers",2500,ToastMessageType.Error);
      }
    }else{
      this.showPaymentInfoPrompt();
    }
  }

  //showing toaster for info
  showHintToast(msg:string){
    this.comonService.toastMessage(msg,2500,ToastMessageType.Info);
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
        this.MembershipObj.membership_setup_id = res[0].id;
      }
    },
   (error) => {
        //this.commonService.hideLoader();
        console.error("Error in fetching:", error);
        this.comonService.toastMessage("No setups found", 2500,ToastMessageType.Error,ToastPlacement.Bottom);
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


  searchOptions(selectedClubKey, selectedSetupKey) {
    this.Membership = "secondpage";
    // this.getAllOptions(selectedClubKey)

    // this.fb
    //   .getAllWithQuery(
    //     "Membership/MembershipSetup/" +
    //     this.ParentClubKey +
    //     "/" +
    //     selectedClubKey +
    //     "/Setup",
    //     { orderByKey: true, equalTo: selectedSetupKey }
    //   )
    //   .subscribe((data) => {
    //     this.paymentOptions = data[0].PaymentOptions;
    //     this.originalPaymentOption = JSON.parse(
    //       JSON.stringify(data[0].PaymentOptions)
    //     );
    //     this.ageGroupArr.forEach((element) => {
    //       if (element.Key == data[0].Tier1) {
    //         this.selectAge(element.Label);
    //       }
    //     });
    //     this.GroupArr.forEach((element) => {
    //       if (element.Key == data[0].Tier2) this.selectGroup(element.Label);
    //     });
    //     this.activityArr.forEach((element) => {
    //       if (element.Key == data[0].Tier3) this.selectActivity(element.Label);
    //     });
    //     this.timeArr.forEach((element) => {
    //       if (element.Key == data[0].Tier4) this.selectTime(element.Label);
    //     });
    //     this.setupName = data[0].Name;
    //     this.MinNoOfMember = data[0].MinNoOfMember;
    //     this.MaxNoOfMember = data[0].MaxNoOfMember;

    //     if (data[0].Description) {
    //       this.templateData = [];
    //       this.comonService
    //         .convertFbObjectToArray(data[0].Description)
    //         .forEach((data) => {
    //           if (data.isActive) {
    //             data["$key"] = data.Key;
    //             delete data.Key;
    //             this.templateData.push(data);
    //           }
    //           this.templateEditOpen = true;
    //         });
    //     }

    //     this.dataExists = true;
    //   });
  }

  search() {
    this.fb
      .getAllWithQuery(
        "Membership/MembershipSetup/" +
        this.ParentClubKey +
        "/" +
        this.selectedClubKey +
        "/Setup",
        { orderByChild: "IsActive", equalTo: true }
      )
      .subscribe((data) => {
        data.forEach((eachSetup) => {
          if (
            eachSetup.Tier1 == this.tier1Key &&
            eachSetup.Tier2 == this.tier2Key &&
            eachSetup.Tier3 == this.tier3Key &&
            eachSetup.Tier4 == this.tier4Key
          ) {
            console.log("Selected data : ", eachSetup);
            this.selectedSetupKey = eachSetup.$key;
            this.paymentOptions = eachSetup.PaymentOptions;
          }
        });
        //console.log(data)
      });
  }

  createMembershipConfirmation(){
    const alert_text = "Membership create"
    const alert_msg = "Are you sure want to create membership?";
    this.comonService.commonAlert_V4(alert_text,alert_msg,"Yes:Create","Cancel",()=>{
      this.saveSetup();
    })
  }

  //creating membership
  saveSetup() {
    if (this.validateMembership()) {
      try{
          this.comonService.showLoader("Please wait")
          const membership = new CreateMembership(this.MembershipObj);
          membership.parentclubId = this.postgre_parentclub_id;
          membership.clubId = this.Venues.find(venue => venue.FirebaseId === this.selectedClubKey).Id;
          membership.device_id = this.sharedservice.getDeviceId(),
          membership.device_type = this.sharedservice.getPlatform() == "android" ? 1:2;
          membership.app_type = AppType.ADMIN_NEW;
          membership.created_by = this.sharedservice.getLoggedInId();
          if(this.master_templates.length > 0 && this.templateEditOpen){
            membership.membership_templates = this.master_templates.map(template => ({
              title:template.title,
              header:template.header,
              message:template.description
           }))
          }
          console.table(membership);
          this.httpService.post(API.MEMBERSHIP_ADD,membership).subscribe((res: any) => {
            this.comonService.hideLoader();
            this.comonService.toastMessage("Membership created successfully", 2500, ToastMessageType.Success, ToastPlacement.Bottom);
            this.comonService.updateCategory("update_membership_list");
            this.navCtrl.pop();
          },
          (error) => {
              this.comonService.hideLoader();
              console.error("Error in fetching:", error.message);
              if(error.error && error.error.message){
                this.comonService.toastMessage(error.error.message, 2500, ToastMessageType.Error, ToastPlacement.Bottom);
              }else{
                this.comonService.toastMessage("Membership creation failed", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
              }
          })
      }catch(err){
        this.comonService.hideLoader();
        this.comonService.toastMessage(err.message, 2500,ToastMessageType.Error,ToastPlacement.Bottom);
      }
    }
  }

  // validating membership
  validateMembership() {
    if (this.MembershipObj.membership_name === "") {
      const msg = "Please enter membership name"
      this.comonService.toastMessage(msg,2500,ToastMessageType.Error);
      return false;
    }
    else if (this.MinNoOfMember > this.MaxNoOfMember) {
      const msg = "Max number of members for membership should not exceeds minimum number of members"
      this.comonService.toastMessage(msg,2500,ToastMessageType.Error);
      return false;
    }
    else if (this.MembershipObj.monthly &&  (this.MembershipObj.monthly_price == '' || this.MembershipObj.monthly_price == '0') ) {
      const msg = "Please enter monthly price"
      this.comonService.toastMessage(msg,2500,ToastMessageType.Error);
      return false;
    }
    else if (this.MembershipObj.yearly &&  (this.MembershipObj.yearly_price == '' || this.MembershipObj.yearly_price == '0') ) {
      const msg = "Please enter yearly price"
      this.comonService.toastMessage(msg,2500,ToastMessageType.Error);
      return false;
    }
    return true;
  }

  // save() {
  //   if (!this.dataExists) {
  //     //venue update
  //     this.fb.update(
  //       this.selectedClubKey,
  //       "Membership/MembershipSetup/" + this.ParentClubKey,
  //       {
  //         ParentClubKey: this.ParentClubKey,
  //         ClubKey: this.selectedClubKey,
  //         Options: null,
  //         Discount: null,
  //       }
  //     );

  //     //options update
  //     this.ageGroupArr.forEach((ageGroup) => {
  //       const key = this.fb.saveReturningKey(
  //         "Membership/MembershipSetup/" +
  //         this.ParentClubKey +
  //         "/" +
  //         this.selectedClubKey +
  //         "/Options/Tier1",
  //         { GroupName: ageGroup.GroupName, Label: ageGroup.Label }
  //       );
  //       ageGroup.Key = key;
  //       if (this.tier1Name == ageGroup.Label) {
  //         this.tier1Key = ageGroup.Key;
  //       }
  //     });

  //     this.GroupArr.forEach((group) => {
  //       const key = this.fb.saveReturningKey(
  //         "Membership/MembershipSetup/" +
  //         this.ParentClubKey +
  //         "/" +
  //         this.selectedClubKey +
  //         "/Options/Tier2",
  //         { GroupName: group.GroupName, Label: group.Label }
  //       );
  //       group.Key = key;
  //       if (this.tier2Name == group.Label) {
  //         this.tier2Key = group.Key;
  //       }
  //     });

  //     this.activityArr.forEach((activity) => {
  //       const key = this.fb.saveReturningKey(
  //         "Membership/MembershipSetup/" +
  //         this.ParentClubKey +
  //         "/" +
  //         this.selectedClubKey +
  //         "/Options/Tier3",
  //         {
  //           GroupName: activity.GroupName,
  //           Label: activity.Label,
  //           ActivityCode: activity.ActivityCode,
  //         }
  //       );
  //       activity.Key = key;
  //       if (this.tier3Name == activity.Label) {
  //         this.tier3Key = activity.Key;
  //       }
  //     });

  //     this.timeArr.forEach((time) => {
  //       const key = this.fb.saveReturningKey(
  //         "Membership/MembershipSetup/" +
  //         this.ParentClubKey +
  //         "/" +
  //         this.selectedClubKey +
  //         "/Options/Tier4",
  //         { GroupName: time.GroupName, Label: time.Label }
  //       );
  //       time.Key = key;
  //       if (this.tier4Name == time.Label) {
  //         this.tier4Key = time.Key;
  //       }
  //     });
  //     return (this.dataExists = true);
  //   } else {
  //     return this.dataExists;
  //   }
  //   // // if the Options data doesnot exists this block creates the basic shell for the venue and adds the default options
  // }

  //templates checking
  openDescriptionModal(cbox:Checkbox) {
    if (cbox.checked){
      //cbox.checked = false;
      if (this.master_templates.length == 0 && this.description) {
        this.navCtrl.push("CreateDescription", {
          templateType: "Membership Template",
          selectedClubKey: this.Venues.find(venue => venue.FirebaseId === this.selectedClubKey).Id,
        });
      } else if (this.master_templates.length > 0 && this.description) {
        // this.modal = true
        // $(".scroll-content").css("overflow", "hidden")
        this.templateEditOpen = true;
      }
    }else{
      this.templateEditOpen = false;
    } 
  }

  //templates assigning
  // copy() {
  //   try {
  //     this.templateData.forEach((desc) => {
  //       delete desc.$key;
  //       delete desc.IsSelect;
  //       this.fb.saveAndReturnData(
  //         "Membership/MembershipSetup/" +
  //         this.ParentClubKey +
  //         "/" +
  //         this.selectedClubKey +
  //         "/Setup/" +
  //         this.selectedSetupKey +
  //         "/Description",
  //         desc
  //       );
  //     });
  //     this.modal = false;
  //     $(".scroll-content").css("overflow", "scroll");
  //     this.fb
  //       .getAllWithQuery(
  //         "Membership/MembershipSetup/" +
  //         this.ParentClubKey +
  //         "/" +
  //         this.selectedClubKey +
  //         "/Setup/" +
  //         this.selectedSetupKey +
  //         "/Description",
  //         { orderByChild: "isActive", equalTo: true }
  //       )
  //       .subscribe((data) => {
  //         if (data.length > 0) {
  //           data.forEach((temp) => {
  //             temp["IsSelect"] = false;
  //           });
  //           this.templateData = data;
  //         }
  //       });
  //     this.templateEditOpen = true;
  //   } catch (err) { }
  // }

  closeModal() {
    this.modal = false;
    $(".scroll-content").css("overflow", "scroll");
    this.templateEditOpen = true;
  }

  ionViewWillLeave(){
    //this.comonService.updateCategory("");
  }


}
