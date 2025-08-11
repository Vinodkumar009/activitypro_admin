import { MembershipSetupList } from "../../membership/dto/membershi.dto";

//@InputType
export class VenueUsersInput{
    parentclubkey:string;
    clubkey:string;
    searchterm:string;
    limit:number;
    offset:number;
}

export class UsersListInput{//this one is new for new nextgen backend
  parentclub_id:string;
  club_id:string;
  search_term?:string;
  limit?:number;
  offset?:number;
  member_type?:number
  action_type?:number
}
  
  //@ObjectType()
  export class VenueUsers {
    venue_users: VenueUser[];
    total_users:number;
  }
  
  export class VenueUser  {
    Id: string;
    parent_firstname: string;
    parent_lastname: string;
    DOB: string;
    clubkey: string;
    parentFirebaseKey: string;
    email: string;
    phone_number:string;
    childcount: number;
    is_enable: boolean;
    is_coach: boolean;
    handicap: number;
    is_gold_member: boolean;
    allow_court_booking: boolean;
    membership_Id: string;
    vehicleRegNo1: string;
    vehicleRegNo2: string;
    Gender: string;
    medical_condition: string;
    parent_status:boolean; 
    media_consent:boolean;
    SignUpUnder?: number;
    SignedUpType?: number;
  }
  
  //@ObjectType()
  export class Club  {
    Id: string;
    City: string;
    ClubContactName: string;
    ClubName: string;
    ClubShortName: string;
    CountryName: string;
    PostCode: string;
    ContactPhone:string;
    ClubDescription:string;
    sequence:number;
    FirebaseId: string;
  }
  //@ObjectType()
export class FamilyMember  {
  Id:string
  FirstName: string;
  LastName: string;
  EmailID: string;
  Gender: string;
  DOB: string;
  FirebaseKey: string;
  ParentClubKey: string;
  ClubKey: string;
  IsChild: boolean;
  EmergencyContactName: string;
  EmergencyNumber: any;
  MedicalCondition: string;
  ParentKey: string;
  PhoneNumber: any;
  IsEnable: boolean;
  IsActive: boolean;
  PromoEmailAllowed: boolean;
  MediaConsent: boolean;
  SpecialNeeds: boolean;
  SpecialNeedsDesc:string;
  ChildSchoolMeals: boolean;
  ChildSchool: string;
  IncludeInLeaderBoard: boolean;
  Handicap: number;
  SetupName?:string
  CurrentPayment?:string;
  Validity?:string;
  IsSelect?:boolean
}
export class FamilyMemberInput{
  ParentClubKey:string;
  MemberKey:string;
  AppType:number;
  DeviceType:number; //Which app {1:Android,2:IOS,3:Web,4:API}
  ActionType:number //to get from postgre
}


export class AddMemberDTO{
  ParentClubId:string;
  MemberType:number; //to know member,holidaycamp or schoolmember
  VenueId:string;
  FirstName:string;
  LastName:string;
  MiddleName:string;
  DOB:string;
  Email:string;
  Password:string;
  Phone:string;
  Gender:string;
  Emergency_Contact_Name:string;
  Emergency_Contact_Number:string;
  Medical_Condition:string;
  
  // @Field(type => String,{ nullable: false })
  // Referral:string;
  Source:string; //ask can we store
  IsAcceptedTermsAndConditions:boolean;
  IsEnable:boolean; // to know mwmber or non-member
  IsChild:boolean;
  PromoEmailAllowed:boolean;
  NotificationEmailAllowed:boolean;
  IsTakenConcentForm:boolean;
  parent_id:string; //while reg family member
  vehicle_reg_no1:string; // required while profile update
  vehicle_reg_no2:string; // required while profile update

  // @Field(type => Int,{ nullable: true })
  // KidsLoginFlag:number; //can be used when family_member registers

  // @Field(type => String,{ nullable: true })
  // UserID:string; //required while apkids user

  // @Field(type => String,{ nullable: true })
  // MembershipID:string; // required while profile update
  is_childspl_needs:boolean;
  childspl_needs_desc:string;
  child_schoolmeals_paid:boolean;
  child_school:string;
  is_includein_leaderboard:boolean;
  is_child_had_disability:boolean;

  // @Field({ nullable: true})
  // allow_court_booking:boolean;

  // @Field({ nullable: true})
  // is_coach:boolean;

  // @Field({ nullable: true})
  // is_gold_member:boolean; //requires from admin profile update
  SignedUpType:number;
}


export class EnrolledMember {
  id: string
  is_active: boolean
  family_member: FamilyMember;
}

export class MemberShipUser {
  id: string

  membership_name: string
  min_member: 1
  max_member: 1
  membership_disclaimer: string
  monthly: boolean
  monthly_price: string
  yearly: boolean
  yearly_price: string
  description: string
  stripe_product_id: string
  stripe_monthly_plan_id: string
  stripe_yearly_plan_id: string
  stripe_connected_account_id: string
  status: number
  amount_to_show: string
  membership_packages: MemberShipPackage[]
  membership_package: MemberShipPackage;
}



export class MemberShipPackage {


  id: string
  latest_payment_date: string
  subscription_status: number
  membership_renewal_date: string
  membership_type: number
  cancellation_date: string
  stripe_subscription_id: string
  amount: string
  trial_period_days: string
  stripe_connected_account: string
  stripe_customer_id: string
  renewal_date: string
  enrolled_count: number
  enrollment_date: string
  start_date: string
  admin_fees: string
  membership_type_text: string
  one_time_discount: string
}

export class MemberShips {
  memberships: MemberShipData[];

}

export class MemberShipData {
  membership_name:string;
  id: string
  monthly: boolean
  yearly: boolean
  membership_tier: MemberShipTier
  membership_member_count: number
  plan: Plan
  membership_package: MembershipPackage
  enrolled_members: EnrolledMember[]
  membership_setup?:MembershipSetupList;
}


export class MembershipPackage {
  id: string;
  subscription_status:number;
  membership_expiry_date:string;
  latest_payment_date:string
}

export class Plan {
  amount_to_show: string
  absolute_amount: string
  plan_name: string
  plan_id: string
}

export class MemberShipTier {
  id: string
  is_active: boolean
  name: string
}

export interface EnrolInput {

  parentclubId: string;
  clubId: string;
  activityId: string;
  memberId: string;
  action_type: number;
  device_type: number;
  app_type: number;
  device_id: string;
  updated_by: string;
  user_ids: string[];
  parent_id: string;
  membership_id: string;
  membership_package_id: string;
  plan_type: number;
  start_month: string;


}

export interface MemberShipInput {

  parentclubId: string;
  clubId: string;
  activityId: string;
  memberId: string;
  action_type: number;
  device_type: number;
  app_type: number;
  device_id: string;
  updated_by: string;
  membership_id: string;
  membership_package_id?:string

}

export class Months {
  month: number
  year: number
  date: string
  isSelect?: boolean
}

export interface RemoveUserFromMembership {

  parentclubId: string,
  clubId: string,
  activityId: string,
  memberId: string,
  action_type: 0,
  device_type: 0,
  app_type: 0,
  device_id: string,
  updated_by: string,
  membership_id: string,
  membership_package_id: string,
  membership_package_item_id: string,
  parent_id: string

}

export interface BookingSummaryInput {
  parentclubId: string,
  clubId: string,
  activityId: string,
  memberId: string,
  action_type: number,
  device_type: number,
  app_type: number,
  device_id: string,
  updated_by: string,
  membership_package_id: string
}

export class BookingDetails {
  booking_payment_text: {
    text: string
  }
  booking_payment_summary: {

    line_items: [
      {
        item_id: string,
        item_name: string,
        amount: string,
        amount_currency: string
      }
    ],
    membership_name: string,

    total_membership_amount: string,
    total_membership_amount_currency: string,
    discounts: [],
    one_time_discount_fee:string;
    discount_amount: string,
    discount_amount_currency: string,
    total_discount_amount_currency: string,
    total_discount_amount: string,
    admin_fees: string,
    admin_fees_currency: string,
    one_time_fee: string,
    one_time_fee_currency: string,
    total_net_payment_amount: string,
    total_net_payment_amount_currency: string
  }

}


export class ModifyMemberShipAdminFees {
  parentclubId: string
  clubId: string
  activityId: string
  memberId: string
  action_type: number
  device_type: number
  app_type: number
  device_id: string
  updated_by: string
  membership_package_id: string
  amount: string
  admin_fees: string
  start_date: string
  end_date: string
}

export class FamilyMemberModel {
  Id: string
  FirstName: string
  LastName: string
  member_enrolled: false
  IsSelect?:boolean
}