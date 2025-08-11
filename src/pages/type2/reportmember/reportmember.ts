// import { Dashboard } from '../../dashboard/dashboard';
import { FirebaseService } from '../../../services/firebase.service';
import { Component, ViewChild } from '@angular/core';
import { NavController, PopoverController, LoadingController, FabContainer } from 'ionic-angular';
import { SharedServices } from '../../services/sharedservice';
import { Storage } from '@ionic/storage';
import { Events } from 'ionic-angular';
import { LanguageService } from '../../../services/language.service';
import { IonicPage } from 'ionic-angular';
import { CommonService, ToastMessageType, ToastPlacement } from "../../../services/common.service";
import * as moment from 'moment';
import { HttpService } from '../../../services/http.service';
import { GraphqlService } from '../../../services/graphql.service';
import gql from 'graphql-tag';
import { UsersListInput } from '../member/model/member';
import { EmailModalForModule } from '../mailtomemberbyadmin/mailtomemberbyadmin';
import { ParentClub } from '../../../shared/model/club.model';

@IonicPage()
@Component({
  selector: 'reportmember-page',
  templateUrl: 'reportmember.html',
  providers: [HttpService],
})

export class Type2ReportMember {
  @ViewChild('fab') fab: FabContainer;
  LangObj: any = {};//by vinod
  themeType: number;
  loading: any;
  coachKey: any;
  parentClubKey: any;
report_obj = {
    parentclub_image: "",
    parentclub_name: "",
    club_name:"Not Available",
    to_address:"",
    from_address:"Not Available",
    cc_address:"Not Available",
    subject:"Not Available",
    reply_to_address:"",
    memer_list:[],
    msg_body:"",
    attachment_name:""
  }
  obj = {
    Message: ''
  }
  allMemberArr = [];
  allMemberArrofClub = [];
  preparedAllClubMemberArr = [];
  parentMember = 0;
  memberschild = 0;
  toalMember = 0;
  parentMemberNum = 0;
  memberschildNum = 0;
  toalMemberNum = 0;
  activeParentMemberNum = 0;
  activeTotalNum = 0;
  activeChildNum = 0;
  allClubFromParent = [];
  allClubs = [];
  showMemberArr = [];
  preparedMemberArr = [];
  parentMemberArr = [];
  memberImgURL = "assets/imgs/memberreport.svg";
  selectedEmailproperties: any = "";
  selectedEmailMemberArray = [];
  checkVar: any = "";
  selectedClubName: any = {};
  ActiveSetups: any;
  ClubKey: any;
  TotalSetup: any[];
  SetupDisplay: any[];
  allMemebers: UsersModel[] = [];
  clubData: ClubReportDetails[] = []

  venus_user_input: UsersListInput = {
    parentclub_id: "",
    club_id: "",
    // search_term: "",
    // limit: 18,
    // offset: 0,
    member_type: 1,
    action_type:1
  }
  member_status_count:number = 0;
  non_member_status_count:number = 0;
  postgre_parentclub_id:string;
  constructor(public events: Events, 
    public commonService: CommonService, 
    public loadingCtrl: LoadingController, 
    public storage: Storage, public fb: FirebaseService, 
    public navCtrl: NavController, public sharedservice: SharedServices,
    public popoverCtrl: PopoverController, 
    private langService: LanguageService,
    private httpService: HttpService, 
    private graphqlService: GraphqlService
  ) {
    this.obj.Message = "Paid by cash to the coach on " + new Date().getFullYear() + "-" + (new Date().getMonth() + 1) + "-" + new Date().getDate();
  
    this.themeType = sharedservice.getThemeType();
    // storage.get('userObj').then((val) => {
    //   val = JSON.parse(val);
    //   if (val.$key != "") {
    //     this.parentClubKey = val.UserInfo[0].ParentClubKey;
    //     this.ClubKey = val.UserInfo[0].ClubKey;
    //     this.getMemberDetails();
    //     this.getAllClub();
    //   }
    // })
    this.setupInitialConfig();
  }

  async setupInitialConfig() {
    const [login_obj,postgre_parentclub]:[any,ParentClub]= await Promise.all([
      this.storage.get('userObj'),
      this.storage.get('postgre_parentclub'),
    ])
    if(postgre_parentclub){
      this.postgre_parentclub_id = postgre_parentclub.Id
      this.getClubPaymentRecord();
    }
    if(login_obj){

    }
  }

  ionViewDidLoad() {
    this.getLanguage();
    this.events.subscribe('language', (res) => {
      this.getLanguage();
    });
  }

  getLanguage() {
    this.storage.get("language").then((res) => {
      console.log(res["data"]);
      this.LangObj = res.data;
    })
  }
  cancel() {
    this.navCtrl.pop();
  }

  pay() {}

  presentPopover(myEvent) {
    let popover = this.popoverCtrl.create("PopoverPage");
    popover.present({
      ev: myEvent
    });
  }

  goToDashboardMenuPage() {
    this.navCtrl.setRoot("Dashboard");
  }

  getSortedArrayWithDate(info) {
    for (let i = 0; i < info.length; i++) {
      let x = new Date(Number(info[i]["CreateDate"])).getTime();
      for (let j = i; j < info.length; j++) {
        let y = new Date(Number(info[j]["CreateDate"])).getTime();
        if (x < y) {
          let temp = info[i];
          info[i] = info[j];
          info[j] = temp;
        }
      }
    }
    return info;
  }
  

  getClubsParentMember(parentMembers) {
    this.navCtrl.push("Type2MemberlistShow", { parentMembers: parentMembers.parentMemberArr, ClubName: parentMembers.FullClubName });
  }

  getClubsChildMember(totalMembers) {
    this.navCtrl.push("Type2MemberlistShow", { totalMembers: totalMembers.MemberArr, ClubName: totalMembers.FullClubName });
  }

  goToSendEmailpage() {
    try{
      const email_members = this.allMemebers.map(user =>{
        return {
          FirstName: user.FirstName,
          LastName: user.LastName,
          Age: user.DOB,
          EmailID:user.EmailID,
          PhoneNumber:user.PhoneNumber,
          MemberType: user.IsEnable ? "Member":"Non-Member"
        }
      })
      this.navCtrl.push("Type2ChoiceProperty", { totalMembersArr: email_members, ClubName: this.selectedClubName });
      //this.navCtrl.push("Type2ChoiceProperty",{parentMembersArr:this.selectedEmailMemberArray,ClubName:this.selectedEmailproperties.ClubName});
      this.fab.close();
    }catch(err){
      console.log(err);
    }
  }

  getAge(info) {
    if (info != undefined && info != '') {
      let year = info.split("-")[0];
      let currentYear = new Date().getFullYear();
      return (Number(currentYear) - Number(year)) + ' yrs';
    } else {
      return 'N.A'
    }

  }
  renewalPendingReport() {
    this.navCtrl.push("RenewalMembershipReportPage");
    this.fab.close();
  }
  getCustomDate(dt) {
    let date = moment(Number(dt)).format('DD-MMM-YYYY')
    if (date == "Invalid date") {
      date = "";
    } else {
      date = 'Since: ' + date;
    }
    return date;
  }


  getClubPaymentRecord() {
    console.log("getClubPaymentRecord called");
    // Fetch and log the parent club ID

    console.log("Fetched parentclubId from sharedservice:", this.postgre_parentclub_id);
    // Validate parentclubId before making the request
    if (!this.postgre_parentclub_id) {
      console.error("Invalid parentclubId. Cannot proceed with the request.");
      return;
    }
    // Make the GET request using the custom service method
    this.httpService.get(`user/usercount/${this.postgre_parentclub_id}`).subscribe(
      (res: any) => {
        console.log("club response data", res);
        // Extract and log the clubData
        this.clubData = res["data"]["club"];
        this.member_status_count = res["data"].member_status_count;
        this.non_member_status_count = res["data"].non_member_status_count;
        this.selectedClubName = res["data"]["club"][0]["clubname"];
        this.parentMemberNum = res.data.member_count;
        this.toalMemberNum = res.data.child_count;
        console.log("Extracted clubData:", this.clubData);
        if (this.clubData.length > 0) {
          this.getParentClubUsers(this.clubData[0])
        }
      },
      (error) => {
        console.error("Error occurred during user/usercount GET request", error);
        // Check for specific error types and status codes
        if (error.status === 404) {
          console.error("Endpoint not found (404). Please verify the URL and HTTP method.");
        } else if (error.status === 500) {
          console.error("Server error (500). Please check the backend for more details.");
        } else {
          console.error(`Unexpected error: ${error.message}`);
        }
        // Display a toast message in case of error
        this.commonService.toastMessage(`Request failed: ${error.message}`,2500,ToastMessageType.Error,ToastPlacement.Bottom);
      }
    );
  }

  // selectedClub(club:ClubReportDetails, type){
  //   console.log("member and child count is:",club.member_count,club.child_count);
  //   this.checkVar = "";
  //   this.checkVar = club.clubname + type;
  //   this.getParentClubUsers(club);

  // }

  // Function to select a club
  selectClub(club: ClubReportDetails) {
    console.log('You clicked on a club card. Selected club:', club);
    this.selectedClubName = club.clubname;
    this.getParentClubUsers(club);
  }

  // Function to handle selecting individuals or family count
  selectClubType(club: ClubReportDetails, type: string, event: Event) {
    event.stopPropagation();  // Prevent the parent click handler from being triggered
    console.log(`You clicked on ${type} for the club:`, club);

    // Update the checkVar to track the selected type
    this.checkVar = `${club.clubname}${type}`;
    let isChild: boolean;

    if (type === 'Family') {
      isChild = true;
    } else {
      isChild = false;
    }
    this.selectedClubName = club.clubname;
    this.getParentClubUsers(club, isChild);  // Fetch users based on selected club
  }

  getParentClubUsers(club: ClubReportDetails, isChildFilter: boolean | null = null) {
    console.log(`Fetching users for club: ${club.clubname}`);
    this.venus_user_input.parentclub_id = this.postgre_parentclub_id;
    this.venus_user_input.club_id = club.club;
    this.allMemebers = [];
    //this.newSelectedMemberArray = [];
    //this.commonService.showLoader("Fetching users...")
    const userQuery = gql`
    query getAllMembersByParentClubNMemberType($list_input:UsersListInput!) {
      getAllMembersByParentClubNMemberType(userInput:$list_input){
            Id
            FirebaseKey,
            FirstName,
            LastName
            ClubKey
            IsChild
            DOB
            Age
            EmailID
            EmergencyContactName
            EmergencyNumber
            Gender
            MedicalCondition
            ParentClubKey
            ParentKey
            PhoneNumber
            IsEnable
            IsActive
            PromoEmailAllowed
      }
    }
  `;
    this.graphqlService.query(userQuery, { list_input: this.venus_user_input }, 0)
      .subscribe(({ data }) => {
        //console.log("member data" + JSON.stringify(data["getAllMembersByParentClubNMemberType"]));
        const members = data["getAllMembersByParentClubNMemberType"] as UsersModel[]
        this.allMemebers = data["getAllMembersByParentClubNMemberType"] as UsersModel[];
        //console.log("length of member is:", this.allMemebers.length);
        if (isChildFilter !== null) {
          this.allMemebers = members.filter(member => member.IsChild === isChildFilter);
        } else {
          // If no specific filter is provided (for general club selection), use all members
          this.allMemebers = [...members];
        }
      }, (err) => {
        console.error("Error fetching users for club:", club.clubname, err);
        this.commonService.toastMessage("Users fetch failed", 3000, ToastMessageType.Error, ToastPlacement.Bottom);
      });
  }


}




export class ClubPaymentReport {
  child_count: string
  member_count: string
  club: ClubReportDetails[]
}

export class ClubReportDetails {
  club: string
  clubname: string
  member_count: string
  child_count: string
  member_status_count:number;
  non_member_status_count:number;
}


export class UsersModel {
  isSelect: boolean;
  Id: string
  FirebaseKey: string;
  FirstName: string;
  LastName: string;
  ClubKey: string;
  IsChild: boolean;
  Age?:string;
  DOB: string;
  EmailID: string;
  EmergencyContactName: string;
  EmergencyNumber: string;
  Gender: string;
  MedicalCondition: string;
  ParentClubKey: string;
  ParentKey: string;
  PhoneNumber: string;
  IsEnable: string;
  IsActive: string;
  IsDisabled: string;
  isSelected?: boolean;
  isAlreadExisted?: boolean;
  //Source
}