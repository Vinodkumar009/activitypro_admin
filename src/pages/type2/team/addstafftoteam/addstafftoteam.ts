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
import { error } from 'console';


/**
 * Generated class for the LeagueinvitecoachPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
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
  allMemebers: StaffModel[] = [];
  members: StaffModel[] = [];
  searchTerm: string;

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
      val = JSON.parse(val);
      if (val.$key != "") {
        this.getStaffListInput.ParentClubKey = val.UserInfo[0].ParentClubKey;
        this.getStaffListInput.MemberKey = val.$key;

        // this.getStaffListInput.ParentClubKey=val.UserInfo[0].ParentClubKey;
        // this.getStaffListInput.MemberKey = val.$key;
        this.addStaffInput.ParentClubKey = val.UserInfo[0].ParentClubKey;
        this.addStaffInput.MemberKey = val.$key;

        this.getStaff();
      }
    });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad LeagueinvitecoachPage');
  }

  selectMembers(member) {
    let isPresent = false;
    // if (!isPresent) {
    //   for (let i = 0; i < this.addStaffInput.staffDetails.length; i++) {
    //     this.addStaffInput.staffDetails.push({ userPostGresId: member.id, userType: 1 });
    //   }
    // }

    if (this.addStaffInput.staffDetails.length > 0) {
      for (let i = 0; i < this.addStaffInput.staffDetails.length; i++) {
        if (this.addStaffInput.staffDetails[i] == member.firebaseKey) {
          isPresent = true;
          this.addStaffInput.staffDetails.splice(i, 1);

          break;
        }
      }
      if (!isPresent) {
        // this.addStaffInput.members.push({roleId:"a66c78c9-994b-4ced-8942-11c9a047611b",memberKey:member.FirebaseKey})
        this.addStaffInput.staffDetails.push({ userPostGresId: member.id, userType: member.user_type });;

      }
    } else if (this.addStaffInput.staffDetails.length == 0) {
      this.addStaffInput.staffDetails.push({ userPostGresId: member.id, userType: member.user_type });
    }

    console.log(this.addStaffInput.staffDetails);

    // for(let i=0;i<this.addStaffInput.staffDetails.length;i++){
    //    this.addStaffInput.staffDetails[i].userPostGresId=member.id;
    //    this.addStaffInput.staffDetails[i].userType=1;
    // }
    // console.log(this.addStaffInput.staffDetails);
    // return this.addStaffInput;

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
    this.graphqlService.query(userQuery, { ParentClubDetails: this.getStaffListInput }, 0).subscribe((data) => {
      this.staff = data.data.getStaffForParentClub;

      if (this.staff.length > 0) {
        for (let i = 0; i < this.staff.length; i++) {
          this.staff[i]["isSelect"] = false;
          this.staff[i]["isAlreadExisted"] = false;
          if (this.existedstaff.length > 0) {
            for (let j = 0; j < this.existedstaff.length; j++) {
              if (
                this.staff[i].firebaseKey ===
                this.existedstaff[j].StaffDetail.firebaseKey
              ) {
                this.staff[i]["isSelect"] = true;
                this.staff[i]["isAlreadExisted"] = true;
              }
            }
          }
        }
      }

      this.filteredStaff = JSON.parse(JSON.stringify(this.staff));
      console.log("Getting Staff Data", this.staff);
      this.commonService.hideLoader();
    },
      (error) => {
        console.error("Error in fetching:", error);


        if (error.graphQLErrors) {

          console.error("GraphQL Errors:", error.graphQLErrors);

          for (const gqlError of error.graphQLErrors) {
            console.error("Error Message:", gqlError.message);
            console.error("Error Extensions:", gqlError.extensions);

          }
        }


        if (error.networkError) {

          console.error("Network Error:", error.networkError);

        }
      })

  }
  /*   
  
   this.apollo
        .query({
          query: userQuery,
          fetchPolicy: "network-only",
          variables: {
            ParentClubDetails: this.getStaffListInput,
          },
        })
        .subscribe(
          ({ data }) => {
            console.log(
              "staff data" + JSON.stringify(data["getStaffForParentClub"])
            );
            // this.staff = JSON.parse(JSON.stringify(data["getStaffForParentClub"]))
            this.staff = data["getStaffForParentClub"] as StaffModel[];
            if (this.staff.length > 0) {
              for (let i = 0; i < this.staff.length; i++) {
                this.staff[i]["isSelect"] = false;
                this.staff[i]["isAlreadExisted"] = false;
                if (this.existedstaff.length > 0) {
                  for (let j = 0; j < this.existedstaff.length; j++) {
                    if (
                      this.staff[i].firebaseKey ===
                      this.existedstaff[j].StaffDetail.firebaseKey
                    ) {
                      this.staff[i]["isSelect"] = true;
                      this.staff[i]["isAlreadExisted"] = true;
                    }
                  }
                }
              }
            }
            this.filteredStaff = JSON.parse(JSON.stringify(this.staff));
            console.log("Getting Staff Data", this.staff);
  
            this.commonService.hideLoader();
  
          },
          (err) => {
            console.log(JSON.stringify(err));
            this.commonService.toastMessage(
              "failed to fetch Staff",
              2500,
              ToastMessageType.Error,
              ToastPlacement.Bottom
            );
          })
  
  */

  getFilterItems(ev: any) {

    // Reset items back to all of the items
    this.initializeItems();
    let val = ev.target.value;
    if (val && val.trim() != "") {
      this.filteredStaff = this.staff.filter((item) => {
        if (item.name != undefined) {
          if (item.name.toLowerCase().indexOf(val.toLowerCase()) > -1)
            return true;
        }

      });
    } else this.initializeItems();
  }

  initializeItems() {
    this.filteredStaff = this.staff;
  }

  saveStaff = async () => {
    console.log(JSON.stringify(this.addStaffInput));

    const addStaff = gql`
        mutation addStaffToParentClubTeam($addStaffInput:AddStaffInput!){
          addStaffToParentClubTeam(addStaffInput:$addStaffInput){
            
            id
            role{
              role_name
            }
            postgres_user_id

          }
        }
    `;
    const mutationVariables = { addStaffInput: this.addStaffInput }

    await this.graphqlService.mutate(addStaff, mutationVariables, 0).toPromise();

    const message = "Staff Added Successfully";

    this.commonService.toastMessage(message, 2500, ToastMessageType.Success, ToastPlacement.Bottom);
    // this.navCtrl.pop().then(() => this.navCtrl.pop());
    this.viewCtrl.dismiss({ canRefreshData: true });



  }

  dismiss() {
    this.viewCtrl.dismiss({ canRefreshData: true });
  }



}

export class GetStaffListInput {
  ParentClubKey: string
  MemberKey: string
  AppType: number
  ActionType: number
}

export class AddStaffInput {
  ParentClubKey: string
  MemberKey: string
  AppType: number
  ActionType: number

  staffDetails: StaffDetails[]
  parentClubteamId: string
}

export class StaffDetails {
  userPostGresId: string
  userType: number
}
