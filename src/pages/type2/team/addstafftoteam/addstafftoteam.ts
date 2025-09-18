import { Component } from '@angular/core';
import {
  IonicPage,
  NavController,
  NavParams,
  ViewController,
  LoadingController,
  AlertController,
  PopoverController
} from "ionic-angular";
import {
  CommonService,
  ToastMessageType,
  ToastPlacement,
} from "../../../../services/common.service";
import { FirebaseService } from "../../../../services/firebase.service";
import { SharedServices } from "../../../services/sharedservice";
import { Storage } from "@ionic/storage";
import gql from "graphql-tag";
import { Apollo } from "apollo-angular";
import { MembersModel } from "../../match/models/match.model";
import { GetStaffModel, StaffModel } from '../models/team.model';
import { membershipPaymentSetupPage } from '../../../dashboard/membershippaymentsetup/membershippaymentsetup';
import { GraphqlService } from '../../../../services/graphql.service';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

interface GetStaffListInput {
  ParentClubKey: string;
  MemberKey: string;
  AppType: number;
  ActionType: number;
}

interface AddStaffInput {
  ParentClubKey: string;
  MemberKey: string;
  AppType: number;
  ActionType: number;
  staffDetails: StaffDetails[];
  parentClubteamId: string;
}

interface StaffDetails {
  userPostGresId: string;
  userType: number;
}

/**
 * Component for adding staff to team.
 * Handles staff search, selection, and team staff management.
 */

@IonicPage()
@Component({
  selector: 'page-addstafftoteam',
  templateUrl: 'addstafftoteam.html',
})
export class AddstafftoteamPage {


  themeType: number;
  staff: StaffModel[] = [];
  filteredStaff: StaffModel[] = [];

  private searchTerms = new Subject<string>();
  private selectedStaffSet = new Set<string>(); // 🚀 Performance optimization for staff selection
  private existingStaffSet = new Set<string>(); // 🚀 Performance optimization for existing staff check
  private subscriptions: any[] = []; // 🧹 Subscription management

  addStaffInput: AddStaffInput = {
    ParentClubKey: '',
    MemberKey: '',
    AppType: 0,
    ActionType: 0,
    staffDetails: [],
    parentClubteamId: ''
  }

  getStaffListInput: GetStaffListInput = {
    ParentClubKey: '',
    MemberKey: '',
    AppType: 0,
    ActionType: 0
  }

  existedstaff: GetStaffModel[];
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private apollo: Apollo,
    public commonService: CommonService,
    public loadingCtrl: LoadingController,
    public storage: Storage,
    public fb: FirebaseService,
    public sharedservice: SharedServices,
    private alertCtrl: AlertController,
    public viewCtrl: ViewController,
    public popoverCtrl: PopoverController,
    private graphqlService: GraphqlService,

  ) {
    this.existedstaff = this.navParams.get("existedstaff")
    this.themeType = sharedservice.getThemeType();
    console.log("addstafftoteam");
    this.addStaffInput.parentClubteamId = this.navParams.get("teamid")

    this.storage.get("userObj").then((val) => {
      if (val) {
        try {
          const userData = JSON.parse(val);
          if (userData && userData.$key && userData.UserInfo && userData.UserInfo[0]) {
            this.getStaffListInput.ParentClubKey = userData.UserInfo[0].ParentClubKey;
            this.getStaffListInput.MemberKey = userData.$key;
            this.addStaffInput.ParentClubKey = userData.UserInfo[0].ParentClubKey;
            this.addStaffInput.MemberKey = userData.$key;
            this.getStaff();
          }
        } catch (error) {
          this.handleError(error, "Failed to load user data");
        }
      }
    });

    // 🔍 Initialize existing staff set for performance
    if (this.existedstaff && this.existedstaff.length > 0) {
      this.existingStaffSet = new Set(this.existedstaff.map(s => s.StaffDetail.firebaseKey));
    }

    const searchSubscription = this.searchTerms.pipe(
      debounceTime(400), // 🕐 Wait for 400ms after user stops typing
      distinctUntilChanged() // 🔄 Only emit if search term changed
    ).subscribe(search_term => {
      this.filterStaff(search_term);
    });

    this.subscriptions.push(searchSubscription);
  }

  ionViewDidLoad() {
    // Component loaded
  }

  ionViewWillLeave() {
    // 🧹 Always cleanup subscriptions
    this.subscriptions.forEach(sub => {
      if (sub && !sub.closed) {
        sub.unsubscribe();
      }
    });
  }

  selectMembers(member) {
    if (this.selectedStaffSet.has(member.id)) {
      // 🗑️ Remove staff
      this.selectedStaffSet.delete(member.id);
      const memberIndex = this.addStaffInput.staffDetails.findIndex(m => m.userPostGresId === member.id);
      if (memberIndex > -1) {
        this.addStaffInput.staffDetails.splice(memberIndex, 1);
      }
    } else {
      // ➕ Add staff
      this.selectedStaffSet.add(member.id);
      this.addStaffInput.staffDetails.push({ userPostGresId: member.id, userType: member.user_type });
    }
  }


  getStaff() {
    // this.commonService.showLoader("Fetching Staff...");

    const userQuery = gql`
      query getStaffForParentClub($ParentClubDetails:GetStaffListInput!) {
        getStaffForParentClub(ParentClubDetails: $ParentClubDetails) {
          id
          name
          email
           role
           user_type
          postgres_parentclubId
          firebase_coachkey
          firebaseKey
        }
      }
    `;
    const staffSubscription = this.graphqlService.query(userQuery, { ParentClubDetails: this.getStaffListInput }, 0).subscribe((data) => {
      this.staff = data.data.getStaffForParentClub;

      if (this.staff.length > 0) {
        this.staff = this.staff.map(staffMember => ({
          ...staffMember,
          isSelect: this.existingStaffSet.has(staffMember.firebaseKey),
          isAlreadExisted: this.existingStaffSet.has(staffMember.firebaseKey)
        }));
      }

      this.filteredStaff = [...this.staff];
      this.commonService.hideLoader();
    }, (error) => {
      this.commonService.hideLoader();
      this.handleError(error, "Failed to fetch staff");
    });

    this.subscriptions.push(staffSubscription);

  }


  getFilterItems(ev: any) {
    const searchTerm = ev.target.value;
    this.searchTerms.next(searchTerm);
  }

  // 🔍 Filter staff based on search term
  private filterStaff(searchTerm: string) {
    if (searchTerm && searchTerm.trim() !== "") {
      this.filteredStaff = this.staff.filter((item) => {
        return item.name && item.name.toLowerCase().includes(searchTerm.toLowerCase());
      });
    } else {
      this.initializeItems();
    }
  }

  initializeItems() {
    this.filteredStaff = this.staff;
  }

  saveStaff = async () => {
    const staffLength = this.addStaffInput.staffDetails.length;
    if (staffLength > 0) {
      try {
        this.commonService.showLoader("Please wait...");
        console.log(JSON.stringify(this.addStaffInput));

        const addStaff = gql`
        mutation addStaffToParentClubTeam($addStaffInput: AddStaffInput!) {
          addStaffToParentClubTeam(addStaffInput: $addStaffInput) {
            id
            role {
              role_name
            }
            postgres_user_id
          }
        }
      `;

        const mutationVariables = { addStaffInput: this.addStaffInput };

        const saveSubscription = this.graphqlService
          .mutate(addStaff, mutationVariables, 0)
          .subscribe(
            (res: any) => {
              this.commonService.hideLoader();
              const message = "Staff Added Successfully";
              this.commonService.toastMessage(message, 2500, ToastMessageType.Success, ToastPlacement.Bottom);
              this.viewCtrl.dismiss({ canRefreshData: true });
            },
            (error) => {
              this.commonService.hideLoader();
              this.handleError(error, "Failed to save staff");
            }
          );

        this.subscriptions.push(saveSubscription);
      } catch (error) {
        this.commonService.hideLoader();
        this.handleError(error, "Failed to save staff");
      }
    } else {
      this.commonService.toastMessage("Please select a staff member", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
    }
  };

  // 🚨 Centralized error handling
  private handleError(error: any, userMessage: string) {
    let errorMsg = userMessage;

    if (error.graphQLErrors && error.graphQLErrors.length > 0) {
      errorMsg = error.graphQLErrors[0].message || userMessage;
    } else if (error.networkError) {
      errorMsg = "Network connection error. Please check your internet connection.";
    }

    this.commonService.toastMessage(errorMsg, 3000, ToastMessageType.Error);
  }

  dismiss() {
    this.viewCtrl.dismiss({ canRefreshData: true });
  }
}
