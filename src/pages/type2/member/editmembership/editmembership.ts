import { Component } from '@angular/core';
import { ActionSheetController, AlertController, Checkbox, IonicPage, NavController, NavParams, PopoverController } from 'ionic-angular';
//import { EnrolInput, EnrolledMember, FamilyMember, FamilyMemberInput, FamilyMemberModel, MemberShipData, MemberShipInput } from '../../model/member';
import { Storage } from '@ionic/storage';
import moment from 'moment';
import { HttpService } from '../../../../services/http.service';
import { CommonService, ToastMessageType, ToastPlacement } from '../../../../services/common.service';
import { SharedServices } from '../../../services/sharedservice';
//import { GraphqlService } from '../../../../services/graphql.service';
import { API } from '../../../../shared/constants/api_constants';
import { EnrolInput, EnrolledMember, FamilyMember, FamilyMemberModel, MemberShipData, MemberShipInput } from '../model/member';
/**
 * Generated class for the EditmembershipPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-editmembership',
  templateUrl: 'editmembership.html',
  providers: [HttpService]
})
export class EditmembershipPage {

  isEditing: boolean = false;
  monthly: boolean;
  yearly: boolean;

  clubId: string;
  memberId: string;
  membership_id: string;

  minMember: number;
  maxMember: number;

  memberShipData: MemberShipData;

  Duration: string = ''
  enrolledMembers: EnrolledMember[] = [];
  isAssigned = false;
  currencyDetails: any;

  inputObj: MemberShipInput = {
    parentclubId: "",
    clubId: "",
    activityId: "",
    memberId: "",
    action_type: 0,
    device_type: 0,
    app_type: 0,
    device_id: "",
    updated_by: "",
    membership_id: ""
  }

  enrolInput: EnrolInput = {
    parentclubId: "",
    clubId: "",
    activityId: "",
    memberId: "",
    action_type: 0,
    device_type: 0,
    app_type: 0,
    device_id: "",
    updated_by: "",
    user_ids: [],
    parent_id: "",
    membership_id: "",
    membership_package_id: "",
    plan_type: 0,
    start_month: ""
  }
  initial_enrol_count:number = 0;
  availableFamilyMembers: FamilyMember[] = [];
  familyMemberInfo: FamilyMemberModel[] = [];
  postgre_parentclub_id:string = '';
  all_family_enrolled:boolean = false;
  constructor(
    public commonService: CommonService,
    public navCtrl: NavController,
    public navParams: NavParams,
    public actionSheetCtrl: ActionSheetController,
    storage: Storage,
    public popoverCtrl: PopoverController,
    public httpService: HttpService,
    private sharedService: SharedServices,
    //private graphqlService: GraphqlService,
    public alertCtrl: AlertController,
  ) {

    storage.get('Currency').then((val) => {
      this.currencyDetails = JSON.parse(val);
    })
    
    this.clubId = this.navParams.get("clubId");
    this.memberId = this.navParams.get("memberId");
    this.membership_id = this.navParams.get("membership_id");

    this.inputObj.clubId = this.clubId;
    this.inputObj.memberId = this.memberId;
    this.inputObj.membership_id = this.membership_id;

    storage.get('postgre_parentclub').then((postgre_parentclub) => {
      this.postgre_parentclub_id = postgre_parentclub.Id;
      this.inputObj.parentclubId = postgre_parentclub.Id;
      this.getActiveMemberShipDetails();
      this.familyMemberDetails()
    })

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad EditmembershipPage');
  }


  //event for, on change of user selection
  selectMember(member: FamilyMember,cbox:Checkbox) {
    //console.log('checkbox',cbox.checked);
    if (cbox.checked) {
      if (this.initial_enrol_count >= this.maxMember) {
        setTimeout(() => {
          cbox.checked = false;
          this.commonService.toastMessage(`You can only select upto ${this.maxMember} members`, 2500, ToastMessageType.Error, ToastPlacement.Bottom);
          return 
        },100)
      }
      this.initial_enrol_count++;
      //this.enrolInput.user_ids.push(member.Id)
    } else {
      if (this.initial_enrol_count <= this.minMember) {
        setTimeout(() => {
          cbox.checked = true;
          this.commonService.toastMessage(`You must select ${this.minMember} members`, 2500, ToastMessageType.Error, ToastPlacement.Bottom);
          return 
        },100)
      }
      this.initial_enrol_count--;
      //const user_ind = this.enrolInput.user_ids.findIndex(id => id === member.Id);
      //this.enrolInput.user_ids.splice(user_ind,1);
    }
  }

  //To check the maximum selection
  validateMaxSelection(): boolean {
    if (this.initial_enrol_count >= this.maxMember) {
      this.commonService.toastMessage(`You can only select upto ${this.maxMember} members`, 2500, ToastMessageType.Error, ToastPlacement.Bottom);
      return false;
    }
    return true;
  }

  //To check the minimum selection
  validateMinSelection(): boolean {
    if (this.initial_enrol_count < this.minMember) {
      this.commonService.toastMessage(`There must be atleast ${this.minMember} member(s)`, 2500, ToastMessageType.Error, ToastPlacement.Bottom);
      return false;
    }
    return true;
  }


  getformatDate(date){
    return moment(date, "YYYY-MM-DD").format("DD-MMM-YYYY");
  }

  async getActiveMemberShipDetails(isEditMode: boolean = false) {
    this.commonService.showLoader("Please wait...");
    this.isEditing = isEditMode;
    // this.commonService.showLoader("Please wait...");
    this.httpService.post(`${API.ACTIVE_MEMBERSHIP_DETAILS}`, this.inputObj).subscribe((res: any) => {
      this.commonService.hideLoader();
      console.log(res.data);
      if (res && res.data) {
        this.memberShipData = res.data;
        this.minMember = res.data.min_member;
        this.maxMember = res.data.max_member;

        if (this.memberShipData.plan.plan_name == 'Monthly') {
          this.Duration = 'monthly';
          this.monthly = true;
        } else if (this.memberShipData.plan.plan_name == 'Yearly') {
          this.Duration = 'yearly';
          this.yearly = true;
        }

      }

    }, (error) => {
      this.commonService.toastMessage("Membership dets fetch failed", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
      // this.commonService.hideLoader();
    })
  }

  async familyMemberDetails() {
   // this.commonService.showLoader("Please wait...")
    this.httpService.post(`${API.GET_FAMILY_MEMBER}`, this.inputObj).subscribe((res: any) => {
      //this.commonService.hideLoader();
      if(res.data.length > 0){
        this.familyMemberInfo = res.data.map((family_member)=>{
          return{
            ...family_member,
            IsSelect: family_member.member_enrolled
          }
        })
        console.log("family member");
        console.table(this.familyMemberInfo);
        this.initial_enrol_count = res.data.filter(family_member => family_member.member_enrolled).length;
        this.all_family_enrolled = res.data.every(family_member => family_member.member_enrolled);
      }
     
      this.getEnrolledUserInMemberShip();
    },
      (error) => {
        if (error) {
          this.commonService.hideLoader();
        }
      }
    )
  }


  async getEnrolledUserInMemberShip() {
    //this.commonService.showLoader("Please wait")
    this.httpService.post(`${API.GET_ENROLLED_USER_INTO_MEMBERSHIP}`, this.inputObj).subscribe((res: any) => {
      // this.commonService.hideLoader();
      this.enrolledMembers = res.data;
      this.isAssigned = true;
      this.enrolInput.user_ids = [];
      // // console.log("get enrolled member", JSON.stringify(this.enrolledMembers));
      // // console.log("get family member", JSON.stringify(this.familyMemberInfo));
      // this.familyMemberInfo.forEach(familyMember => {
      //   // Check if this family member is in the list of enrolled members
      //   const isEnrolled = this.enrolledMembers.some(enrolledMember => enrolledMember.family_member.Id === familyMember.Id);
      //   familyMember.IsSelect = isEnrolled;  // Set the checkbox to checked if enrolled
      //   if (isEnrolled) {
      //     this.enrolInput.user_ids.push(familyMember.Id);
      //   }
      // });
    }, (error) => {
      this.commonService.toastMessage("Enrolled member(s) fetch failed", 3000, ToastMessageType.Error, ToastPlacement.Bottom);
    })
  }


  enrolIntoMembership() {
    try {
      const enrol_users = this.familyMemberInfo.filter(member => member.IsSelect && !member.member_enrolled);

      if(enrol_users.length == 0){
        this.commonService.toastMessage('Please select atleast one member', 2500, ToastMessageType.Error, ToastPlacement.Bottom);
        return false;
      }
      this.enrolInput.user_ids = enrol_users.map(user => user.Id);
      this.commonService.commonAlert_V4("Update Membership", "Are you sure you want to update this membership?", "Update", "No", () => {
      this.enrolInput.plan_type = this.Duration == "monthly" ? 1 : 2;
      this.enrolInput.membership_package_id = this.memberShipData.membership_package.id;
      this.httpService.post(`${API.ADD_USER_INTO_MEMBERSHIP}`, this.enrolInput)
        .subscribe(data => {
          console.log(data);
          this.commonService.toastMessage('Membership assignment updated', 2500, ToastMessageType.Success, ToastPlacement.Bottom)
          this.commonService.updateCategory("update_user_memberships_list");
          this.navCtrl.pop();
        },
        error => {
            if (error) {
              this.commonService.toastMessage(error.error.message, 2500, ToastMessageType.Error, ToastPlacement.Bottom);
            } else {
              // Fallback to show a generic error message if needed
              this.commonService.toastMessage('An error occurred. Please try again.', 2500, ToastMessageType.Error, ToastPlacement.Bottom);
            }
        })
      });
    } catch (error) {
      this.commonService.toastMessage(error.message, 2500, ToastMessageType.Error, ToastPlacement.Bottom)
    }

  }


  //basically unenrol member
  unEnrolConfirmation(user_id:string) {
    let alertTitle = "Remove Member";
    let alertMessage = "Are you sure you want to remove from this membership?"
    this.commonService.commonAlert_V4(alertTitle,alertMessage,"Yes","No",()=>{
      this.unEnrolFromMembership(user_id);
    })
  }

  unEnrolFromMembership(user_id:string) {
    //const unenrol_users = this.familyMemberInfo.filter(member => !member.IsSelect && member.member_enrolled);
    // const unenrol_userids = unenrol_users.reduce((acc, unenrol_user) => {
    //   const filteredEnrolments = this.enrolledMembers
    //     .filter(enrolled_user => enrolled_user.family_member.Id === unenrol_user.Id)
    //     .map(enrolled_user => enrolled_user.id);
    
    //   return acc.concat(filteredEnrolments); // Concatenating the results into the accumulator
    // }, []);
    

    // if(unenrol_userids.length == 0){
    //     this.commonService.toastMessage('Please select atleast one member', 2500, ToastMessageType.Error, ToastPlacement.Bottom);
    //     return false;
    // }

    if(this.validateMinSelection()){
      const unenrol_userids = this.enrolledMembers.filter(enrolled_user => enrolled_user.family_member.Id === user_id).map(enrolled_user => enrolled_user.id);
      this.commonService.showLoader("Please wait");
      const input = {
        parentclubId: this.postgre_parentclub_id,
        clubId: this.clubId,
        activityId: "",
        memberId: this.memberId,
        action_type: 0,
        device_type: this.sharedService.getPlatform() == "android" ? 1 : 2,
        app_type: 0,
        device_id: "",
        updated_by: "",
        membership_id: this.membership_id,
        membership_package_id: this.memberShipData.membership_package.id,
        membership_enrollment_ids: unenrol_userids,
        parent_id: this.memberId
      }
      console.log(JSON.stringify(input));
  
      this.httpService.post(`${API.REMOVE_USER_FROM_MEMBERSHIP}`, input)
        .subscribe(data => {
          this.commonService.hideLoader();
          this.commonService.toastMessage('Member removed', 2500, ToastMessageType.Success, ToastPlacement.Bottom)
          this.commonService.updateCategory("update_user_memberships_list");
          this.navCtrl.pop()
        },
        error => {
            if (error) {
              this.commonService.hideLoader();
              this.commonService.toastMessage(error.error.message, 2500, ToastMessageType.Error, ToastPlacement.Bottom)
            }
        })
    }
  }


  //unenrol/removing from membership
  deleteMemberShipConfirm() {
    const alertTitle = "Unassign Membership";
    const alertMessage = "Are you sure you want to unassign the membership?"
    this.commonService.commonAlert_V4(alertTitle,alertMessage,"unassign","Cancel",()=>{
      this.deleteMemberShip();
    })
  }

  deleteMemberShip() {
    const delete_input = {
      parentclubId: this.postgre_parentclub_id,
      clubId: this.clubId,
      activityId: "",
      memberId: this.memberId,
      action_type: 0,
      device_type: this.sharedService.getPlatform() == "android" ? 1 : 2,
      app_type: 0,
      device_id: this.sharedService.getDeviceId(),
      updated_by: "",
      membership_package_id: this.memberShipData.membership_package.id
    }
    this.httpService.post(`${API.DELETE_USER_MEMBERSHIP}`, delete_input)
      .subscribe(data => {
       // this.commonService.hideLoader();
        console.log(data)
        this.commonService.toastMessage('Membership removed', 2500, ToastMessageType.Success, ToastPlacement.Bottom)
        this.commonService.updateCategory("update_user_memberships_list");
        this.navCtrl.pop();
      },
      error => {
          if (error) {
            this.commonService.toastMessage(error.error.message, 2500, ToastMessageType.Error, ToastPlacement.Bottom)
          }
      })
  }

  cancelMemberShip() {
    this.navCtrl.push("CancelMembershipPage",{
      membership_name:this.memberShipData.membership_name,
      expiry_date:this.memberShipData.membership_package.membership_expiry_date,
      last_payment_date:this.memberShipData.membership_package.latest_payment_date,
      membership_id:this.memberShipData.membership_package.id,
      member_id:this.inputObj.memberId,
      membership_package_id : this.memberShipData.membership_package.id
    })
    //this.inputObj.membership_package_id = this.memberShipData.membership_package.id;
    // this.httpService.post(`${API.CANCEL_MEMBERSHIP}`, this.inputObj)
    //   .subscribe(data => {
    //   //  this.commonService.hideLoader();
    //     console.log(data)
    //     this.commonService.toastMessage('Membership cancelled', 2500, ToastMessageType.Success, ToastPlacement.Bottom)
    //     this.commonService.updateCategory("update_user_memberships_list");
    //     this.navCtrl.pop();
    //   },
    //   error => {
    //       if (error) {
    //         this.commonService.toastMessage(error.error.message, 2500, ToastMessageType.Error, ToastPlacement.Bottom)
    //       }
    //   })
  }
}


