import { Component } from "@angular/core";
import { IonicPage,NavController,NavParams, ToastController,} from "ionic-angular";
import { Storage } from "@ionic/storage";
import { FirebaseService } from "../../services/firebase.service";
import { CommonService, ToastMessageType, ToastPlacement } from "../../services/common.service";
import { DefaultMenus } from "../services/defaultmenus";
import { Menu } from "../services/sharedservice";
/**
 * Generated class for the AddsubadminPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: "page-addsubadmin",
  templateUrl: "addsubadmin.html",
})
export class AddsubadminPage {
  DefaultMenus: Menu[] = [];
  Menus = [];
  selectedParentClubKey: any;
  clubList: Array<Object> = new Array();
  roleObj = roleObj;
  menuObj = menuObj;
  selectedRole: any = 0;
  saveObj = {
    FirstName: "",
    LastName: "",
    EmailID: "",
    Password: "",
  };
  selectedClubSet: Set<any> = new Set();
  constructor(
    public toastCtrl: ToastController,
    public navCtrl: NavController,
    public navParams: NavParams,
    storage: Storage,
    public fb: FirebaseService,
    public CommonService: CommonService
  ) {
    storage
      .get("userObj")
      .then((val) => {
        val = JSON.parse(val);
        for (let user of val.UserInfo) {
          if (val.$key != "") {
            this.selectedParentClubKey = user.ParentClubKey;
            //this.CommonService.toastMessage("Please select Role, Venue and Module(s).",2500,ToastMessageType.Error,ToastPlacement.Bottom);
          }
        }
        this.getClubList();
      })
      .catch((error) => {});
  }
  addClub(club) {
    if (this.selectedClubSet.has(club)) {
      this.selectedClubSet.delete(club);
    } else {
      this.selectedClubSet.add(club);
    }
  }
  addMenu(menu, index) {
    this.menuObj[index].IsEnable = !this.menuObj[index].IsEnable;
  }

  getClubList() {
    this.fb
      .getAllWithQuery("Club/Type2", {
        orderByKey: true,
        equalTo: this.selectedParentClubKey,
      })
      .subscribe((data: Array<any>) => {
        this.clubList = [];
        if (data.length > 0) {
          data = this.CommonService.convertFbObjectToArray(data[0]);
          data.forEach((club) => {
            if (club.IsEnable && club.IsActive) {
              this.clubList.push(club);
            }
          });
        }
      });
  }
  ionViewDidLoad() {
    console.log("ionViewDidLoad AddsubadminPage");
    this.DefaultMenus = DefaultMenus.getSubAdminMenus();
    this.Menus = this.DefaultMenus.filter((menu) => menu.Level == 1);
  }
  saveUser() {
    let selectedClubLength = this.selectedClubSet.size;
    if (
      selectedClubLength > 0 &&
      this.saveObj.EmailID != "" &&
      this.saveObj.Password &&
      this.saveObj.EmailID != undefined &&
      this.saveObj.FirstName != "" &&
      this.saveObj.FirstName &&
      this.saveObj.LastName != "" &&
      this.saveObj.LastName
    ) {
      let obj = {
        EmailID: this.saveObj.EmailID.trim().toLowerCase(),
        Name: this.saveObj.FirstName + " " + this.saveObj.LastName,
        Password: this.saveObj.Password,
        RoleType: this.roleObj[this.selectedRole].RoleType,
        RoleTypeName: this.roleObj[this.selectedRole].Name,
        Type: this.roleObj[this.selectedRole].Type,
        UserType: this.roleObj[this.selectedRole].UserType,
      };
      let saveObjKey = this.fb.saveReturningKey("User/SubAdmin", obj);
      //saving userinfo
      this.fb.save(
        {
          ParentClubKey: this.selectedParentClubKey,
        },
        "User/SubAdmin/" + saveObjKey + "/UserInfo"
      );
      //saving selectedClubs
      this.selectedClubSet.forEach((club) => {
        this.fb.save(
          {
            ClubKey: club.Key,
            ClubName: club.ClubName,
            IsActive: true,
            IsEnable: true,
          },
          "User/SubAdmin/" + saveObjKey + "/Clubs"
        );
      });

      this.Menus.forEach((visiblemenu) => {
        this.DefaultMenus.forEach((defaultmenu) => {
          if (visiblemenu.MobComponent == defaultmenu.MobComponent) {
            defaultmenu.MobileAccess = visiblemenu.MobileAccess;
          }
        });
      });
      this.DefaultMenus.forEach((newmenu) => {
        this.fb.saveReturningKey(
          `UserMenus/${this.selectedParentClubKey}/${saveObjKey}/Menu`,
          newmenu
        );
        console.log("subscribed in add subadmin");
      });
      this.CommonService.toastMessage("User created successfully.",2500,ToastMessageType.Success,ToastPlacement.Bottom);
      this.CommonService.updateCategory("coach_list");
      this.navCtrl.pop();
    } else {
      this.CommonService.toastMessage("Provide all information.",2500,ToastMessageType.Error,ToastPlacement.Bottom);
    }
  }
  
}

let menuObj = [
  {
    DisplayText: "Member",
    IsEnable: true,
    title: "Member",
    component: "Type2Member",
    icon: "people",
    role: 2,
    type: 2,
    Level: 1,
  },
  {
    DisplayText: "Group",
    IsEnable: true,
    title: "Group",
    component: "Type2ManageSession",
    icon: "people",
    role: 2,
    type: 2,
    Level: 1,
  },
  {
    DisplayText: "School Session",
    IsEnable: true,
    title: "School Session",
    component: "Type2SchoolSessionList",
    icon: "school",
    role: 2,
    type: 2,
    Level: 1,
  },
  {
    DisplayText: "Holiday Camp",
    IsEnable: true,
    title: "Holiday Camp",
    component: "Type2HolidayCamp",
    icon: "tennisball",
    role: 2,
    type: 2,
    Level: 1,
  },
  // { DisplayText:"Member Attnd",IsEnable:true,title: 'Member Attnd', component: "Type2ManageAttendance", icon: "clipboard", role: 2, type: 2, Level: 1 },
  // { DisplayText:"Staff Attendence",IsEnable:true,title: 'Staff Attendence', component: "StaffattendancePage", icon: "clipboard", role: 2, type: 2, Level: 1 },
  {
    DisplayText: "Notification",
    IsEnable: true,
    title: "Notification",
    component: "Type2notification",
    icon: "md-notifications",
    role: 2,
    type: 2,
    Level: 1,
  },
  {
    DisplayText: "Payment",
    IsEnable: true,
    title: "Payment",
    component: "InnerPaymentMenu",
    icon: "cash",
    role: 2,
    type: 2,
    Level: 1,
  },
  {
    DisplayText: "Booking",
    IsEnable: true,
    title: "Booking",
    component: "BookingcontainerPage",
    icon: "bookmark",
    role: 2,
    type: 2,
    Level: 1,
  },
  {
    DisplayText: "Setup",
    IsEnable: false,
    title: "Setup",
    component: "Setup",
    icon: "settings",
    role: 2,
    type: 2,
    Level: 1,
  },
  {
    DisplayText: "Videos",
    IsEnable: true,
    title: "Videos",
    component: "VideomenueslistingPage",
    icon: "videocam",
    role: 2,
    type: 2,
    Level: 1,
  },
  {
    DisplayText: "Report",
    IsEnable: true,
    title: "Report",
    component: "Type2Report",
    icon: "paper",
    role: 2,
    type: 2,
    Level: 1,
  },
  // { DisplayText:"Direct Debit",IsEnable:true,title: 'Direct Debit', component: "DirectdebitchoosememberPage", icon: "paper", role: 2, type: 2, Level: 1 },
  {
    DisplayText: "News & Events",
    IsEnable: true,
    title: "News & Events",
    component: "EventsandnewsPage",
    icon: "paper",
    role: 2,
    type: 2,
    Level: 1,
  },
  {
    DisplayText: "Tournaments",
    IsEnable: true,
    title: "Tournaments",
    component: "TournamentPage",
    icon: "trophy",
    role: 2,
    type: 2,
    Level: 1,
  },
  {
    DisplayText: "Events",
    IsEnable: true,
    title: "Events",
    component: "EventsPage",
    icon: "calendar",
    role: 2,
    type: 2,
    Level: 1,
  },
  {
    DisplayText: "Membership",
    IsEnable: true,
    title: "Membership",
    component: "MembershipRecord",
    icon: "contacts",
    role: 2,
    type: 2,
    Level: 1,
  },
];
let roleObj = [
  { Name: "Receptionist", RoleType: 6, Type: 2, UserType: 2 },
  { Name: "Admin", RoleType: 2, Type: 2, UserType: 2 },
  { Name: "Parents", RoleType: 7, Type: 2, UserType: 2 },
  { Name: "Finance", RoleType: 8, Type: 2, UserType: 2 },
];
