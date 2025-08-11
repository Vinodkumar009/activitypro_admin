import { Component, OnInit, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, ActionSheetController, ToastController, Platform, Slides, Content } from 'ionic-angular';
import { CommonService, ToastMessageType, ToastPlacement } from '../../../../services/common.service';
import { FirebaseService } from '../../../../services/firebase.service';
import { Storage } from '@ionic/storage';
import { PopoverController } from 'ionic-angular';
import * as moment from 'moment';
import { Member } from '../../../Model/MemberModel';
import { HttpService } from '../../../../services/http.service';
import { SharedServices } from '../../../services/sharedservice';
import { GraphqlService } from '../../../../services/graphql.service';
import { EnrolInput, EnrolledMember, FamilyMember, FamilyMemberInput, FamilyMemberModel, MemberShipData, MemberShipInput, RemoveUserFromMembership } from '../model/member';
import gql from 'graphql-tag';
import { API } from '../../../../shared/constants/api_constants';
import { AppType } from '../../../../shared/constants/module.constants';
import { App } from 'ionic-angular/components/app/app';

/**
 * Generated class for the MemberprofilePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
    selector: 'page-assignmemberships',
    templateUrl: 'assignmemberships.html',
    providers: [HttpService]
})
export class AssignmembershipsPage {
    @ViewChild('myslider') myslider: Slides;
    @ViewChild(Content) content: Content;
    is_no_members:boolean = false;
    selectedClubKey: any;
    ParentClubKey: any;
    isDirectedEdit: boolean;
    Setups = [];
    currencyDetails: any;
    selectedMember;
    Member: any;
    Setup: any;
    member = {};
    selectedClubMember: any;
    Duration: string = '';
    selectedClubMembers = []
    count: any;
    validity: any;
    updateDate = ' ';
    isAssigned = false;
    time: any;
    ConfigKeyForUpdate: any;
    Creationdate: any;
    MemberKey: any;
    FamilyMember: any;
    selectedMemberKey: any;
    AllSetups: any;
    currentDate: any;
    year: any;
    Isnew: any;
    //IsRenewed have NotRenewed, RenewedPending, RenewedPaid.
    months = { "jan": { "num": 0, "last": 31 }, "feb": { "num": 1, "last": 28 }, 'mar': { "num": 2, "last": 31 }, 'apr': { "num": 3, "last": 30 }, "may": { "num": 4, "last": 31 }, "jun": { "num": 5, "last": 30 }, "jul": { "num": 6, "last": 31 }, "aug": { "num": 7, "last": 31 }, "sep": { "num": 8, "last": 30 }, 'oct': { "num": 9, "last": 31 }, 'nov': { "num": 10, "last": 30 }, "dec": { "num": 11, "last": 31 } }
    familyMemberBackup: any;
    clubId: string;
    memberId: string;
    membership_id: string;
    selectedMembers: FamilyMember[] = [];
    memberShipData: MemberShipData;
    family_members: FamilyMember[] = [];
    enrolledMembers: EnrolledMember[] = [];
    availableFamilyMembers: FamilyMember[] = [];
    minMember: number;
    maxMember: number;
    monthArr: [];
    startDate: string;
    min: any;
    max: any;
    isEditing: boolean = false;
    monthly: boolean;
    yearly: boolean;

    inputObj: MemberShipInput = {
        parentclubId: "",
        clubId: "",
        activityId: "",
        memberId: "",
        action_type: 0,
        device_type: 0,
        app_type: AppType.ADMIN_NEW,
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

    removeUserFromMembership: RemoveUserFromMembership = {
        parentclubId: '',
        clubId: '',
        activityId: '',
        memberId: '',
        action_type: 0,
        device_type: 0,
        app_type: 0,
        device_id: '',
        updated_by: '',
        membership_id: '',
        membership_package_id: '',
        membership_package_item_id: '',
        parent_id: ''
    }
    enrolMember: EnrolledMember;
    familyMemberInfo:FamilyMemberModel[]=[];
    minDate:any;
    maxDate:any;
    constructor(public fb: FirebaseService,
        public toastCtrl: ToastController,
        public alertCtrl: AlertController,
        public comonService: CommonService,
        public navCtrl: NavController,
        public navParams: NavParams,
        public actionSheetCtrl: ActionSheetController,
        storage: Storage,
        public popoverCtrl: PopoverController,
        public httpService: HttpService,
        private sharedService: SharedServices,
        private graphqlService: GraphqlService
    ) {
        storage.get('Currency').then((val) => {
            this.currencyDetails = JSON.parse(val);
        })
        //  this.AllSetups = navParams.get("AllSetups")
        //  this.AllSetups = this.AllSetups.filter(setup => setup.IsActive)
        // this.MemberKey = navParams.get("MemberKey")
        this.Isnew = navParams.get("Isnew");
        this.inputObj.app_type = AppType.ADMIN_NEW;
        this.inputObj.device_type = this.sharedService.getPlatform() == "android" ? 1 : 2;
        // if ((this.ParentClubKey = navParams.get("ParentClubKey"))
        //     && (this.selectedClubKey = navParams.get("ClubKey"))
        //     && (this.Setup = navParams.get("Setup"))
        // ) {
        //     if(this.Setup.TimePayments!= undefined && this.Setup.TimePayments.length == 1) this.Duration = this.Setup.TimePayments[0].Label;
        //     this.isDirectedEdit = true
        //     this.getMemberlist(this.ParentClubKey, this.selectedClubKey, this.MemberKey)



        // } else {
        //     this.isDirectedEdit = false
        // }

        //  this.min = new Date().toISOString();
        //  this.max = "2049-12-31";

        // this.startDate = moment().format('YYYY-MM-DD');

        this.clubId = this.navParams.get("clubId");
        this.memberId = this.navParams.get("memberId");
        this.membership_id = this.navParams.get("membership_id");

        this.inputObj.parentclubId = this.sharedService.getPostgreParentClubId();
        this.inputObj.clubId = this.clubId;
        this.inputObj.memberId = this.memberId;
        this.inputObj.membership_id = this.membership_id;

        this.enrolInput.device_type = this.sharedService.getPlatform() == "android" ? 1 : 2;
        this.enrolInput.clubId = this.clubId;
        this.enrolInput.memberId = this.memberId;
        this.enrolInput.membership_id = this.membership_id;
        this.enrolInput.parentclubId = this.sharedService.getPostgreParentClubId();
        this.enrolInput.membership_package_id = "";
        this.enrolInput.parent_id = this.memberId;
        this.enrolInput.start_month = " ";


        this.getFamilyDetails();

        this.familyMemberDetails();


        //  this.getMonthDetails();
        if (this.Isnew) {
            this.getMemberShipDetails();
        } else {
            this.getActiveMemberShipDetails(false);
        }

    }

    ngOnInit(){
       
    }

    slideChanged() {
        setTimeout(() => {
            this.content.scrollToTop(200);
        });
        // this.isBeginSlide = this.myslider.isBeginning();
        // this.isEndSlide = this.myslider.isEnd();
        // console.log(this.isEndSlide);
        let slideslen = this.myslider.length();
        console.log(slideslen, this.myslider.getActiveIndex());
    }


    //going to next slide
    next() {
        if (!this.myslider.isEnd()) {
            this.myslider.slideNext();
        }
    }




   

    calValidity() {
        this.year = new Date().getFullYear()
        if (this.year % 400 == 0) {
            this.months['feb']['last'] = 29
        }
        else if (this.year % 100 == 0) {
            this.months.feb.last = 28
        }
        else if (this.year % 4 == 0) {
            this.months.feb.last = 29
        }
        else {
            this.months.feb.last = 28
        }

        if (this.Setup.OptionName == "Financial Year") {
            let financialMonth, financialDate
            for (let key in this.months) {
                if (key.toLowerCase() == this.Setup.CreatedDate.toLowerCase()) {
                    financialMonth = this.months[key]["num"]
                    financialDate = this.months[key]["last"]
                }
            }
            if (financialMonth < new Date().getMonth()) {
                this.year = this.year + 1;
            } else {
                this.year = this.year
            }
            return new Date(this.year, financialMonth, financialDate).getTime()
            //  console.log(moment(this.validity).format("DD-MM-YYYY"))
            // console.log(this.validity)
        } else if (this.Setup.OptionName == "finish a month before") {

            return this.Setup.CreatedDate = moment().add(11, 'month').valueOf()
        } else if (this.Setup.OptionName == "finish at that month") {
            return this.Setup.CreatedDate = moment().add(12, 'month').valueOf()
        }
    }

    // getMonthDetails() {
    //     this.httpService.post('membership/getMembershipMonths', this.inputObj).subscribe((res: any) => {
    //         this.monthArr = res["data"];
    //     }, (error) => {
    //         this.comonService.toastMessage("Month Fetch failed", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
    //     }
    //     )
    // }

    assignmember() {
        //initially we have a month selection page for monthly but as per shubhankar instruction we have 
        //commented, now we have only calender date
        this.enrolInput.plan_type = this.Duration == "monthly" ? 1 : 2;
        if (this.Duration == 'monthly') { 
            // if (this.validate()) {
                this.assignMemberShip(); // Go to the page to select the month and submit
            // }
        } else {
            // For Yearly memberships, directly submit the data
            // if (this.validate()) {
                this.assignMemberShip();
            // }
        }
    }

    
    familyMemberDetails(){
        this.comonService.showLoader("Please wait")
        this.httpService.post(`${API.GET_FAMILY_MEMBER}`,this.inputObj).subscribe((res:any)=>{
            this.comonService.hideLoader();
            this.familyMemberInfo = res.data;
            this.is_no_members = this.familyMemberInfo.every(member => member.member_enrolled);
        },
        (error)=>{
            if(error){
                this.comonService.hideLoader();
            }     
        })
    }

    //assigning membership
    assignMemberShip() {
        const confirm_title = "Assign membership";
        const confirm_msg = "Are you sure, want to enrol?"
        this.comonService.commonAlert_V4(confirm_title,confirm_msg,"Enrol","Cancel",()=>{
            try {
                this.comonService.showLoader("Please wait...")
                this.enrolInput.start_month = this.startDate;
                this.httpService.post(`${API.ENROL_USER_INTO_MEMBERSHIP}`,this.enrolInput).subscribe(data => {
                        this.comonService.hideLoader();
                        console.log(data)
                        // if(data['status'] == 200){
                        this.comonService.toastMessage('Membership assigned successfully', 2500, ToastMessageType.Success, ToastPlacement.Bottom)
                        this.comonService.updateCategory("update_user_memberships_list");
                        this.navCtrl.pop();
                },
                error => {
                    this.comonService.hideLoader();
                })
            } catch (error) {
                this.comonService.hideLoader();
            }
        })
    }

    remove() {
        let alert = this.alertCtrl.create({
            title: "Remove Membership",
            message: ' Are you sure want to remove this Membership?',
            buttons: [
                {
                    text: "No",
                    role: 'cancel'

                },
                {
                    text: 'Yes',
                    handler: () => {
                        // let flag = 0
                        // let sameSetupGroup = []
                        // this.AllSetups.forEach(config => {

                        //     if (config.IsActive == true && config.SetupKey != undefined) {
                        //         if (config.SetupKey == this.Setup.SetupKey && config.primaryMembershipKey == this.Setup.primaryMembershipKey && !config.subsOn) {
                        //             this.fb.update(config.MembershipAssignedKey, "Membership/MembershipAssigned/" + this.ParentClubKey + "/" + this.selectedClubKey + "/" + config.MemberKey, { IsActive: false });
                        //             this.isAssigned = false
                        //             flag = 1
                        //             this.showToast("Membership Removed", 2000)
                        //             this.navCtrl.pop()
                        //         }


                        //     }
                        // })
                        // if (flag == 0) {
                        //     this.showToast("You cannot delete this membership.", 3000)
                        // }

                        this.removeMember();

                    }
                }
            ]
        });
        alert.present();
    }

    validate() {
        this.count = 0;
        if (this.Duration == undefined) {
            const message = "Please select payment option"
            this.comonService.toastMessage(message, 2500, ToastMessageType.Error);
            return false
        }
        for (let i = 0; i < this.availableFamilyMembers.length; i++) {
            if (this.availableFamilyMembers[i]['IsSelect'] == true) {
                this.count++
            }
        }
        this.count = this.availableFamilyMembers.filter(member => {
            return member.IsSelect
        }).length
        if (this.count > this.maxMember) {

            const message = "Not more than " + this.maxMember + " members are allowed to this membership";
            this.comonService.toastMessage(message, 2000, ToastMessageType.Error);

            return false
        } else if (this.count < this.minMember) {
            const message = "Not less than " + this.minMember + " members are allowed to this membership";
            this.comonService.toastMessage(message, 2000, ToastMessageType.Error);
            return false;
        } else if (this.minMember <= this.count && this.count <= this.maxMember) {
            return true
        }
        return false;
    }

    
    getMemberShipDetails() {
        //this.inputObj.memberId = this.ActiveSetups[0].id
        this.httpService.post(`${API.MEMBERSHIP_DETAILS}`, this.inputObj).subscribe((res: any) => {
            // this.selectedMembers = res.data.enrolled_members || []; // Initialize as empty array if no members
            this.memberShipData = res.data;
            this.minMember = res.data.min_member;
            this.maxMember = res.data.max_member;

            if (this.memberShipData.monthly) {
                this.monthly = true;
            } if (this.memberShipData.yearly) {
                this.yearly = true;
            }

            this.minDate = moment(this.memberShipData.membership_setup.start_date).format("YYYY-MM-DD");
            this.maxDate = moment(this.memberShipData.membership_setup.end_date).format("YYYY-MM-DD");

            //  this.enrolledMembers = res.data.enrolled_members || [];
            // this.getFamilyDetails();

        }, (error) => {
            this.comonService.toastMessage("Member Fetch failed", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
        })
    }

    getActiveMemberShipDetails(isEditMode: boolean = false) {
        this.isEditing = isEditMode;
        this.comonService.showLoader("Please wait...");
        this.httpService.post(`${API.ACTIVE_MEMBERSHIP_DETAILS}`, this.inputObj).subscribe((res: any) => {
            this.comonService.hideLoader();
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
            this.comonService.toastMessage("Member Fetch failed", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
            this.comonService.hideLoader();
        })
    }

    getFamilyDetails() {
        const family_input: FamilyMemberInput = {
            ParentClubKey: this.sharedService.getPostgreParentClubId(),
            MemberKey: this.memberId,//this.memberInfo.parentFirebaseKey, using firebase
            AppType: 0,
            DeviceType: this.sharedService.getPlatform() == "android" ? 1 : 2, //Which app {1:Android,2:IOS,3:Web,4:API}
            ActionType: 3  //pass 2 to send postgreId,Pass 1 to send Firebasekey in above MemberKey field
            //ClubKey:"" // if u need to get data from firebase
        }
        const userQuery = gql`
        query getFamilyMembers($family_input: FamilyMemberInput!) {
          getFamilyMembers(familyMemberInput:$family_input){
            Id
            FirstName
            LastName
            EmailID
            Gender
            DOB
            FirebaseKey
            ParentClubKey
            ClubKey
            IsChild
            EmergencyContactName
            EmergencyNumber
            MedicalCondition
            ParentKey
            PhoneNumber
            IsEnable
            IsActive
            PromoEmailAllowed
            MediaConsent
            SpecialNeeds
            SpecialNeedsDesc
            ChildSchoolMeals
            ChildSchool
            IncludeInLeaderBoard
            Handicap
            
          }
        }
      `;
        this.graphqlService.query(userQuery, { family_input: family_input }, 0).subscribe(({ data }) => {
            // this.family_members = data["getFamilyMembers"] as FamilyMember[];
            this.availableFamilyMembers = data["getFamilyMembers"] as FamilyMember[];
            /// this.filterFamilyMembers();

            if (!this.Isnew) {
                this.getEnrolledUserInMemberShip();
            }

        }, (err) => {
            this.comonService.toastMessage("Users fetch failed", 3000, ToastMessageType.Error, ToastPlacement.Bottom);
        });
    }

    getEnrolledUserInMemberShip() {
        this.httpService.post(`${API.GET_ENROLLED_USER_INTO_MEMBERSHIP}`, this.inputObj).subscribe((res: any) => {
            this.enrolledMembers = res.data;
            this.isAssigned = true;
            this.enrolInput.user_ids = [];
            this.availableFamilyMembers.forEach(familyMember => {
                // Check if this family member is in the list of enrolled members
                const isEnrolled = this.enrolledMembers.some(enrolledMember => enrolledMember.family_member.Id === familyMember.Id);
                familyMember.IsSelect = isEnrolled;  // Set the checkbox to checked if enrolled
                if (isEnrolled) {
                    this.enrolInput.user_ids.push(familyMember.Id);
                }
            });
        }, (error) => {
            this.comonService.toastMessage("Enrolled member fetch failed", 3000, ToastMessageType.Error, ToastPlacement.Bottom)
        })
    }
    // filterFamilyMembers() {

    //     if (this.enrolledMembers.length > 0) {
    //         const enrolledMemberKeys = this.enrolledMembers.map(member => member.family_member.FirebaseKey);
    //         this.availableFamilyMembers = this.family_members.filter(
    //             familyMember => !enrolledMemberKeys.includes(familyMember.FirebaseKey)
    //         );
    //     } else {
    //         this.availableFamilyMembers = this.family_members;
    //     }
    // }

    selectMember(member: FamilyMember) {
        if (member.IsSelect) {
            // if (!this.validateMaxSelection()) {
            //     member.IsSelect = false;
            //     return;
            // }
            if (this.enrolInput.user_ids.length >= this.maxMember) {
                this.comonService.toastMessage(`You can only select up to ${this.maxMember} members.`, 2500, ToastMessageType.Error, ToastPlacement.Bottom);
                setTimeout(() => {
                    member.IsSelect = false;
                }, 0);
               // member.IsSelect = false; // Prevent the selection by reverting the checkbox
                return;
            }
            this.enrolInput.user_ids.push(member.Id)
        } else {
            this.enrolInput.user_ids = this.enrolInput.user_ids.filter(id => id !== member.Id);
            if (!this.validateMinSelection()) {
               // member.IsSelect = true;
               setTimeout(() => {
                member.IsSelect = true;
            }, 0);
                return;
            }
        }
    }

    //To check the maximum selection

    
    
    validateMaxSelection(): boolean {
        if (this.enrolInput.user_ids.length >= this.maxMember) {
            this.comonService.toastMessage(`You can only select up to ${this.maxMember} members.`, 2500, ToastMessageType.Error, ToastPlacement.Bottom);
            return false;
        }
        return true;
    }

    //To check the minimum selection
    validateMinSelection(): boolean {
        if (this.enrolInput.user_ids.length < this.minMember) {
            this.comonService.toastMessage(`You must select at least ${this.minMember} members.`, 2500, ToastMessageType.Error, ToastPlacement.Bottom);
            return false;
        }
        return true;
    }

    //check confirm button that every thing should be selected 

    get isFormValid(): boolean {
        // Check if a payment option is selected
        const isPaymentOptionSelected = !!this.Duration;
    
        // Check if at least one member is selected
        const isMemberSelected = this.familyMemberInfo.some(member => member.IsSelect);
    
        // Check if a start date is selected (if required)
        const isDateSelected = !!this.startDate;
    
        // Return true if all conditions are met
        return isPaymentOptionSelected && isMemberSelected && isDateSelected;
    }


    addUserIntoMemberShip() {
        if (!this.validateMaxSelection()) {
            return; // Exit the update method if the max selection is invalid
        }
    
        // Validate the minimum selection
        if (!this.validateMinSelection()) {
            return; // Exit the update method if the min selection is invalid
        }
        try {
            this.enrolInput.plan_type = this.Duration == "monthly" ? 1 : 2;
            this.enrolInput.membership_package_id = this.memberShipData.membership_package.id;

            this.httpService.post(`${API.ADD_USER_INTO_MEMBERSHIP}`, this.enrolInput)
                .subscribe(data => {
                    this.comonService.hideLoader();
                    console.log(data);
                    this.comonService.toastMessage('membership assigned successfully...', 2500, ToastMessageType.Success, ToastPlacement.Bottom)
                    this.navCtrl.pop();

                },
                    error => {
                        this.comonService.hideLoader();
                        if (error) {
                            this.comonService.toastMessage(error.error.message, 2500, ToastMessageType.Error, ToastPlacement.Bottom);
                        } else {
                            // Fallback to show a generic error message if needed
                            this.comonService.toastMessage('An error occurred. Please try again.', 2500, ToastMessageType.Error, ToastPlacement.Bottom);
                        }


                    }
                )
        } catch (error) {
            this.comonService.hideLoader();
            this.comonService.toastMessage(error.message, 2500, ToastMessageType.Error, ToastPlacement.Bottom)
        }


    }

    selectordeselectMember(member: FamilyMember) {
        if (member.IsSelect) {
            this.enrolInput.user_ids.push(member.Id)
        } else {
            this.enrolInput.user_ids = this.enrolInput.user_ids.filter(id => id !== member.Id);
        }
    }


    removeMember() {
        const remainingMembersCount = this.enrolInput.user_ids.length;
        if (remainingMembersCount - 1 < this.minMember) {
            this.comonService.toastMessage(`You must keep at least ${this.minMember} members selected.`, 2500, ToastMessageType.Error, ToastPlacement.Bottom);
            return;
        }

        const enrolIds: string[] = []

        for (let i = 0; i < this.enrolInput.user_ids.length; i++) {
            const familyMemberId = this.enrolInput.user_ids[i];
            const enrolledMember = this.enrolledMembers.find(member => member.family_member.Id === familyMemberId);

            if (enrolledMember) {
                enrolIds.push(enrolledMember.id); // Store the ID if found
            } else {
                this.comonService.toastMessage('member  not found in enrolment...', 2000, ToastMessageType.Error, ToastPlacement.Bottom)
            }
        }

        const input = {
            parentclubId: this.sharedService.getPostgreParentClubId(),
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
            membership_enrollment_ids: enrolIds,
            parent_id: this.memberId
        }
        console.log(JSON.stringify(input));

        this.httpService.post(`${API.REMOVE_USER_FROM_MEMBERSHIP}`, input)
            .subscribe(data => {
                this.comonService.hideLoader();
                console.log(data)

                this.comonService.toastMessage('Membership Removed...', 2500, ToastMessageType.Success, ToastPlacement.Bottom)
                this.navCtrl.pop()

            },
            error => {
                    this.comonService.hideLoader();
                    if (error) {
                        this.comonService.toastMessage(error.error.message, 2500, ToastMessageType.Error, ToastPlacement.Bottom)
                    }
            })

    }

    //if enrolled member is empty then show all the family members
    //if enrol member available then loop over family member then 
    //check that family member in the enrolled member array,if that is found then don't show that user
    //in the list

    //when select member check min ,max member...
}
