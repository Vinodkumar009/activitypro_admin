import { Component } from '@angular/core';
import { Checkbox, IonicPage, NavController, NavParams } from 'ionic-angular';
//import { FirebaseService } from '../../../../../services/firebase.service';
import { CommonService, ToastMessageType, ToastPlacement } from '../../../../../services/common.service';
import { Storage } from '@ionic/storage';
import moment, { Moment } from 'moment';
import { GraphqlService } from '../../../../../services/graphql.service';
import { IClubDetails } from "../../../../../shared/model/club.model";
import gql from "graphql-tag";
import { SharedServices } from '../../../../services/sharedservice';
import { HttpService } from '../../../../../services/http.service';
import { API } from '../../../../../shared/constants/api_constants';
import { MembershipSetupList, MembershipSetupModal } from '../../dto/membershi.dto';
import { AppType } from '../../../../../shared/constants/module.constants';
/**
 * Generated class for the MembershipModalPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-addmembershipyear',
  templateUrl: 'addmembershipyear.html',
  providers:[HttpService]
})
export default class AddmembershipYearPage {
  membership_setups:MembershipSetupList[] = [];
  membership_setup_input:MembershipSetupModal = {
    parentclubId :"",
    clubId :"",
    //activityId :"",
    memberId :"",
    action_type: 1,
    device_type: 0,
    app_type: 0,
    created_by :"",
    admin_fees :"0.00",
    start_date:new Date().toISOString(),
    end_date:new Date().toISOString(),
    setup_type: 0,
    apply_admin_fees_on_renewal: false,
    membership_disclaimer: "",
    allow_cash: false,
    allow_bacs: false,
    charge_prorata:1,
    auto_renewal:1
  }
  parentClubKey: any;
  dataexists = false;
  selectedClubKey:string = '';
  isAdded = false;
  twelvemonthrolling = false;
  today = moment().format('YYYY-MM-DD');

  YearlyFixedEndDate = {
   // IsActive: false,
    FinancialYear: {
      Option: "FinancialYear",
      StartMonth: "",
      EndMonth: "",
      ExpireDate: 0,
      IsActive: false
    },
    // TwelvemonthrollingMonthBefore:
    //    {
    //     Option: "TwelvemonthrollingMonthBefore",
    //     ExpireDate: 0,
    //     StartMonth: "",
    //     EndMonth: "",
    //     IsActive: false
    //   },
      TwelvemonthrollingAtThatMonth: {
        Option: "TwelvemonthrollingAtThatMonth",
        ExpireDate: 0,
        StartMonth: "",
        EndMonth: "",
        IsActive: false
      }
  }
  
  months= { "jan": { "num": 0, "last": 31 }, "feb": { "num": 1, "last": 28 }, 'mar': { "num": 2, "last": 31 }, 'apr': { "num": 3, "last": 30 }, "may": { "num": 4, "last": 31 }, "jun": { "num": 5, "last": 30 }, "jul": { "num": 6, "last": 31 }, "aug": { "num": 7, "last": 31 }, "sep": { "num": 8, "last": 30 }, 'oct': { "num": 9, "last": 31 }, 'nov': { "num": 10, "last": 30 }, "dec": { "num": 11, "last": 31 } }
  FinancialYearDetails: any;
  endYearKey: any;
  endDateArr: any;
  Enddate: any;
  MembershipYear: any;
  TwelvemonthrollingAtThatMonth: any;
  TwelvemonthrollingMonthBefore: string;
  MonthBefore: string;
  AtThatMonth: string;
  disclaimer:string ;
  //creationdate: number;
  isAllowCash:boolean = false;
  isAllowBacs:boolean = false;
  isAdminFeesRenewal = false;
  AdminFees:number = 0;
  currencyDetails: any;
  Venues:IClubDetails[] = [];
  istemplateChecked = false;
  postgre_parentclub_id:string = "";
  charge_prorata:boolean = true;
  auto_renewal:boolean = true;
  setup_type:number = 0;
  financial_years:FinancialYearDto;
  constructor(public navCtrl: NavController, 
    public navParams: NavParams, 
    //private fb: FirebaseService,
    private storage: Storage, 
    public comonService: CommonService,
    public sharedservice: SharedServices, 
    private graphqlService: GraphqlService,
    private httpService:HttpService,
  ) {
      this.getStorageData();
  }

  async getStorageData(){
    const [login_obj,postgre_parentclub,currencyDetails] = await Promise.all([
      this.storage.get('userObj'),
      this.storage.get('postgre_parentclub'),
      this.storage.get('Currency'),
    ])

    if (login_obj) {
      this.parentClubKey = JSON.parse(login_obj).UserInfo[0].ParentClubKey;
    }
    if(postgre_parentclub){
      this.postgre_parentclub_id = postgre_parentclub.Id;
      this.membership_setup_input.parentclubId = postgre_parentclub.Id;
      this.getAllVenue();
    }
    if(currencyDetails){
      this.currencyDetails = JSON.parse(currencyDetails);
    }
    this.membership_setup_input.device_type = this.sharedservice.getPlatform() == "android" ? 1:2;
    this.membership_setup_input.app_type = 0;//for admin
    this.membership_setup_input.memberId = this.sharedservice.getLoggedInId();
    this.membership_setup_input.created_by = this.sharedservice.getLoggedInId();
    this.membership_setup_input.membership_disclaimer = "You will be charged monthly as per the price indicated against the card being used to pay the membership fee. Please make sure the card is valid until the end of the membership.";
    this.disclaimer = "You will be charged monthly as per the price indicated against the card being used to pay the membership fee. Please make sure the card is valid until the end of the membership."
  }

  getAllVenue() {
    this.Venues = [];
    const clubs_input = {
      parentclub_id:this.postgre_parentclub_id,
      user_postgre_metadata:{
        UserMemberId:this.sharedservice.getLoggedInId()
      },
      user_device_metadata:{
        UserAppType:0,
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
          this.selectedClubKey = this.navParams.get("club_id");
          //this.getYearlyEndDate();
        },
       (error) => {
            //this.commonService.hideLoader();
            console.error("Error in fetching:", error);
            this.comonService.toastMessage(error.message, 2500,ToastMessageType.Error, ToastPlacement.Bottom);
           // Handle the error here, you can display an error message or take appropriate action.
       })              
  }

  

  getYearlyEndDate() {
    this.endDateArr = []
    // this.fb.getAll("Membership/MembershipSetup/" + this.parentClubKey + "/" + selectedClubKey + "/MembershipYear/").subscribe(data => {
    // //this.fb.getAll("Membership/MembershipSetup/" + this.ParentClubKey + "/" + selectedClubKey + "/MembershipYear/").subscribe(data => {
    //   if (data.length > 0) {
    //     data.forEach(endYear=>{
    //       //console.log(endYear,"i")
    //       this.endDateArr = []
    //       if(endYear.IsActive){
    //           if (endYear.Option == "FinancialYear") {
    //             endYear['OptionName'] = "Financial Year"
    //             this.endDateArr.push(endYear)
    //             this.dataexists = true;
    //           }
    //           if (endYear.Option == "TwelvemonthrollingMonthBefore") {
    //             endYear["OptionName"] = "Twelve month rolling"
    //             endYear["subOption"] = 'finish a month before'
    //             endYear["Date"] = moment(new Date(endYear.ExpireDate)).format("DD-MMM-YYYY")
    //             this.endDateArr.push(endYear)
    //             this.dataexists = true;
    //           }
    //           if (endYear.Option == "TwelvemonthrollingAtThatMonth") {
    //             endYear["OptionName"] = "Twelve month rolling"
    //             endYear["subOption"] = 'finish at that month'
    //             endYear["Date"] = moment(new Date(endYear.ExpireDate)).format("DD-MMM-YYYY")
    //             this.endDateArr.push(endYear)
    //             this.dataexists = true;
    //           }
    //         }
    //     })
    //     if(this.endDateArr.length > 0){
    //       this.Enddate = this.endDateArr[0]
    //       this.getEndYearData( this.endDateArr[0]) 
    //     }
    //   } else {
    //     this.dataexists = false
    //   }
      
    // })

    const get_memberships_payload = {
      parentclubId:this.postgre_parentclub_id,
      clubId:this.Venues.find(venue => venue.FirebaseId === this.selectedClubKey).Id,
      action_type:1,
      device_type:this.sharedservice.getPlatform() == "android" ? 1:2,
      app_type:1
    }
    this.httpService.post(API.MEMBERSHIP_SETUP_LIST,get_memberships_payload).subscribe((res: any) => {
      if(res && res.length > 0) {
        this.membership_setups = res;
        this.dataexists = true;
        this.getEndYearData(res[0]);

      }else{
        
        this.getEndYearData();
        this.dataexists = false;
        this.comonService.toastMessage("Setup not found", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
      }
    },
   (error) => {
        //this.commonService.hideLoader();
        console.error("Error in fetching:", error);
        this.comonService.toastMessage("No setups found", 2500,ToastMessageType.Error,ToastPlacement.Bottom);
       // Handle the error here, you can display an error message or take appropriate action.
   })
  }
  
  getEndYearData(endYear?) {
    if (endYear) {
      this.setup_type = endYear.setup_type;
      if (endYear.setup_type == 0) {
        this.YearlyFixedEndDate.FinancialYear.IsActive = true//this.Enddate.IsActive
        this.MembershipYear = 'FinancialYear'
      } 
      // else if (endYear.setup_type == 1) {//"TwelvemonthrollingMonthBefore" && this.Enddate.subOption == "finish a month before"
      //   this.twelvemonthrolling = true
      //   this.YearlyFixedEndDate.TwelvemonthrollingMonthBefore.IsActive = true//this.Enddate.IsActive
      //   this.MembershipYear = 'TwelvemonthrollingMonthBefore'
      // }
       else if (endYear.setup_type == 2) {
        this.twelvemonthrolling = true
        this.YearlyFixedEndDate.TwelvemonthrollingAtThatMonth.IsActive = true//this.Enddate.IsActive
        this.MembershipYear = 'TwelvemonthrollingAtThatMonth'
      }
      if(endYear.admin_fees != undefined)
      this.AdminFees = endYear.admin_fees;

      if(endYear.membership_disclaimer != undefined)
      this.disclaimer = endYear.membership_disclaimer;

      if(endYear.allow_bacs != undefined)
      this.isAllowBacs = endYear.allow_bacs;

      if(endYear.allow_cash != undefined)
      this.isAllowCash = endYear.allow_cash

      if(endYear.apply_admin_fees_on_renewal != undefined)
      this.isAdminFeesRenewal = endYear.apply_admin_fees_on_renewal
      
      if(endYear.membership_disclaimer!= undefined)
        this.disclaimer = endYear.membership_disclaimer;

      if(endYear.charge_prorata != undefined)
        this.charge_prorata = endYear.charge_prorata == 1 ? true:false;
      
      if(endYear.auto_renewal != undefined)
        this.auto_renewal = endYear.auto_renewal == 1 ? true:false;
    }else{
      this.YearlyFixedEndDate.FinancialYear.IsActive = true//this.Enddate.IsActive
      this.MembershipYear = 'FinancialYear'
    }
    this.getEndYear()
  }
  
  getEndYear() {
    // let EndDateF
    // let EndDateMB
    let EndDateMT
    // this.fb.getAll("/FinancialYear/Type2/" + this.parentClubKey).subscribe((data) => {
    //   if (data.length > 0) {
    //     this.YearlyFixedEndDate.FinancialYear.StartMonth = data[0].StartMonth
    //     this.YearlyFixedEndDate.FinancialYear.EndMonth = data[0].EndMonth
    //   }
    // })
    this.httpService.get(`${API.PARENTCLUB_FINANCIAL_YEAR}/${this.postgre_parentclub_id}`).subscribe((res: any) => {
      console.table(`financial_years:${res}`)
      if(res){
        this.financial_years = res as FinancialYearDto;
        this.YearlyFixedEndDate.FinancialYear.StartMonth = moment(res.financial_year_start,"YYYY-MM").format("MMM")
        this.YearlyFixedEndDate.FinancialYear.EndMonth = moment(res.financial_year_end,"YYYY-MM").format("MMM")
        
      }
    },
   (error) => {
        //this.commonService.hideLoader();
        console.error("Error in fetching:", error);
        this.comonService.toastMessage("No setups found", 2500,ToastMessageType.Error,ToastPlacement.Bottom);
       // Handle the error here, you can display an error message or take appropriate action.
   })

    let year = new Date().getFullYear()
    if (year % 400 == 0) {
        this.months['feb']['last'] = 29
    }
    else if (year % 100 == 0) {
        this.months.feb.last = 28
    }
    else if (year % 4 == 0) {
        this.months.feb.last = 29
    }
    else {
        this.months.feb.last = 28
    }
    for (let key in this.months) {
      let MonthBefore = new Date()   
      let Month = moment(MonthBefore).add(11, 'month').format("DD-MMM-YYYY")
      // if ( key.toLowerCase() == moment(Month).format('MMM').toLowerCase()){
      //   let monthBefore = new Date(Month)
      //   monthBefore.setDate(this.months[key]["last"])
      //   this.MonthBefore = moment(monthBefore).format("DD-MMM-YYYY")
      //   this.YearlyFixedEndDate.TwelvemonthrollingMonthBefore.ExpireDate = new Date(this.MonthBefore ).getTime()
      // }
    }

    EndDateMT = moment().add(12, 'month')
    this.YearlyFixedEndDate.TwelvemonthrollingAtThatMonth.ExpireDate = new Date(EndDateMT).getTime()
    this.AtThatMonth = moment().add(12, 'month').format("DD-MMM-YYYY")
    //console.log(this.YearlyFixedEndDate)
   
  }


  //aalow_bacs/cash/prorata/auto_renewal can be updated
  updateMicroEvent(item_no:number,event:Event){
    if(this.dataexists){
      event.stopPropagation();
      console.log(item_no);
      let input_obj = {
        setup_type:this.setup_type,
        parentclubId:this.postgre_parentclub_id,
        clubId:this.Venues.find(venue => venue.FirebaseId === this.selectedClubKey).Id,
        action_type:1,
        device_type:this.sharedservice.getPlatform() == "android" ? 1:2,
        app_type:AppType.ADMIN_NEW,
        updated_by:this.sharedservice.getLoggedInId()
      }
      
      if(Number(item_no) === 1){
        this.isAdminFeesRenewal = !this.isAdminFeesRenewal
        Object.assign(input_obj,{
          apply_admin_fees_on_renewal:this.isAdminFeesRenewal
        })
      }
      else if(Number(item_no) === 2){
        this.isAllowCash = !this.isAllowCash
        Object.assign(input_obj,{
          allow_cash:this.isAllowCash
        })
      }
      else if(Number(item_no) === 3){
        this.isAllowBacs = !this.isAllowBacs
        Object.assign(input_obj,{
          allow_bacs:this.isAllowBacs 
        })
      }
      else if(Number(item_no) === 4){
        this.charge_prorata = !this.charge_prorata
        Object.assign(input_obj,{
          charge_prorata:this.charge_prorata ? 1:0
        })
      }
      else if(Number(item_no) === 5){
        this.auto_renewal = !this.auto_renewal
        Object.assign(input_obj,{
          auto_renewal:this.auto_renewal ? 1:0
        })
      }

      this.updateMembershipYear(input_obj,1);
    }
  }

  //updating membership as micropart/microservice
  updateMembershipYear(setup_payload,type:number) {//get 
    this.httpService.put(`${API.MEMBERSHIP_SETUP_UPDATE}/${this.membership_setups[0].id}`,setup_payload).subscribe((res: any) => {
      //let key = this.fb.saveReturningKey("Membership/MembershipSetup/" + this.parentClubKey + "/" + this.selectedClubKey + "/MembershipYear", this.YearlyFixedEndDate)
      this.isAdded = true;
      this.comonService.toastMessage("Setup updated successfully", 2500,ToastMessageType.Success,ToastPlacement.Bottom);
      if(type == 2){
        this.navCtrl.pop();
      }
    },
   (error) => {
        //this.commonService.hideLoader();
        console.error("Error in fetching:", error);
        this.comonService.toastMessage("Setup update failed", 2500,ToastMessageType.Error,ToastPlacement.Bottom);
       // Handle the error here, you can display an error message or take appropriate action.
   })
  }

  selectEndDate() {}

  //confirm pop just before creation/update
  validateAndConfirm(){
    const alert_title = this.dataexists ? "Setup Create" : "Setup Update"
    const msg = this.dataexists ? "Continue with setup create?" : "Continue with setup update?"
    this.comonService.commonAlert_V4(alert_title, msg, "Yes", "No", (res) => {
      this.addFinancialYear();
    })
  }

  addFinancialYear() {
    console.log("YearlyFixedEndDate", this.YearlyFixedEndDate)
    if (this.dataexists && this.validate()) {
     // this.YearlyFixedEndDate.IsActive = true
     for(let key in this.YearlyFixedEndDate){
      if(key == this.MembershipYear){
        if(key == "FinancialYear"){
          this.membership_setup_input.start_date = new Date(this.financial_years.financial_year_start).toISOString();
          this.membership_setup_input.end_date = new Date(this.financial_years.financial_year_end).toISOString();
          this.membership_setup_input.setup_type = 0;
        }
        // else if(key == "TwelvemonthrollingMonthBefore"){
        //   this.membership_setup_input.start_date = moment().format('YYYY-MM-DD[T]HH:mm:ssZ');
        //   this.membership_setup_input.end_date = moment(this.MonthBefore,'DD-MMM-YYYY').format('YYYY-MM-DD[T]HH:mm:ssZ')
        //   this.membership_setup_input.setup_type = 1;
        // }
        else{ //full 365 days
          this.membership_setup_input.start_date = moment().format('YYYY-MM-DD[T]HH:mm:ssZ');
          this.membership_setup_input.end_date = moment(this.AtThatMonth,'DD-MMM-YYYY').format('YYYY-MM-DD[T]HH:mm:ssZ')
          this.membership_setup_input.setup_type = 2;
        }
        
        this.membership_setup_input.admin_fees = this.AdminFees.toString();
        this.membership_setup_input.allow_bacs = this.isAllowBacs;
        this.membership_setup_input.allow_cash = this.isAllowCash;
        this.membership_setup_input.apply_admin_fees_on_renewal = this.isAdminFeesRenewal;
        this.membership_setup_input.membership_disclaimer = this.disclaimer;
        this.membership_setup_input.charge_prorata = this.charge_prorata ? 1 : 0;
        this.membership_setup_input.auto_renewal = this.auto_renewal ? 1 : 0;
        this.updateMembershipYear(this.membership_setup_input,2);
      }
    }
  } else if (this.validate()) {
      //this.YearlyFixedEndDate.IsActive = true
      try{
        for(let key in this.YearlyFixedEndDate){
          if(key == this.MembershipYear){   
            if(key == "FinancialYear"){
              this.membership_setup_input.start_date = new Date(this.financial_years.financial_year_start).toISOString();
              this.membership_setup_input.end_date = new Date(this.financial_years.financial_year_end).toISOString();
              this.membership_setup_input.setup_type = 0;
            }
            // else if(key == "TwelvemonthrollingMonthBefore"){
            //   this.membership_setup_input.start_date = moment().format('YYYY-MM-DD[T]HH:mm:ssZ');
            //   this.membership_setup_input.end_date = moment(this.MonthBefore,'DD-MMM-YYYY').format('YYYY-MM-DD[T]HH:mm:ssZ')
            //   this.membership_setup_input.setup_type = 1;
            // }
            else{ //full 365 days
              this.membership_setup_input.start_date = moment().format('YYYY-MM-DD[T]HH:mm:ssZ');
              this.membership_setup_input.end_date = moment(this.AtThatMonth,'DD-MMM-YYYY').format('YYYY-MM-DD[T]HH:mm:ssZ')
              this.membership_setup_input.setup_type = 2;
            }
            this.membership_setup_input.clubId = this.Venues.find(venue => venue.FirebaseId == this.selectedClubKey).Id;
            this.membership_setup_input.admin_fees = this.AdminFees.toString();
            this.membership_setup_input.allow_bacs = this.isAllowBacs;
            this.membership_setup_input.allow_cash = this.isAllowCash;
            this.membership_setup_input.apply_admin_fees_on_renewal = this.isAdminFeesRenewal;
            this.membership_setup_input.membership_disclaimer = this.disclaimer;
            this.membership_setup_input.charge_prorata = this.charge_prorata ? 1 : 0;
            this.membership_setup_input.auto_renewal = this.auto_renewal ? 1 : 0;
            this.httpService.post(API.MEMBERSHIP_SETUP_CREATION,this.membership_setup_input).subscribe((res: any) => {
              //let key = this.fb.saveReturningKey("Membership/MembershipSetup/" + this.parentClubKey + "/" + this.selectedClubKey + "/MembershipYear", this.YearlyFixedEndDate)
              this.isAdded = true;
              this.comonService.toastMessage("Membership setup created", 2500,ToastMessageType.Success,ToastPlacement.Bottom);
              this.navCtrl.pop()
            },
           (error) => {
                //this.commonService.hideLoader();
                console.error("Error in fetching:", error);
                this.comonService.toastMessage("Membership setup creation failed", 2500,ToastMessageType.Error,ToastPlacement.Bottom);
               // Handle the error here, you can display an error message or take appropriate action.
           })
          }
        }
      }catch(err){
        console.error("Error in fetching:", err);
      }
    } else {
      this.isAdded = false;
    }
  }
 
  validate() {
    if (!this.MembershipYear && !this.disclaimer) {
      this.comonService.toastMessage("Please enter all fields", 2500,ToastMessageType.Error,ToastPlacement.Bottom)
      return false;
    } else {
      return true
    }
  }

  gototemplate(){
    this.navCtrl.push('CreateDescription',{templateType: 'Membership Template', selected_clubid: this.Venues.find(venue => venue.FirebaseId == this.selectedClubKey).Id })
  }
            

  

  getISOStringFromMonth(input_month) {
    // Ensure month string is uppercase for case-insensitive comparison
    const month = input_month.toUpperCase();

    // Create a moment object representing the start of the current year
    const currentYearStart = moment().startOf('year');

    // Try parsing the month string using moment.parseZone()
    const parsedDate = moment.parseZone(month, ["MMM", "MMMM"], true); // Allow both 3-letter and full month names

    // Check if parsing was successful
    if (!parsedDate.isValid()) {
      console.error(`Invalid month provided: ${input_month}`);
      return null; // Or handle the error differently
    }

    // Extract month from the parsed date
    const monthIndex = parsedDate.month();

    // Set the month of the current year moment object
    const date = currentYearStart.clone().month(monthIndex);

    // Format the date as ISOString
    return date.format("YYYY-MM-DD[T]HH:mm:ss.SSS[Z]"); // Optional: adjust format as needed
  }

}




export class FinancialYearDto{
  Id: string;
  financial_year_start_month: number;
  financial_year_start: string
  financial_year_end: string
}
