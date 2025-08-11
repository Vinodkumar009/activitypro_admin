export interface IFirebaseCreateCamp{
      PayByDate: string,
      AgeGroup: string,
      CampName: string,
      CampType: number, //Single day || Half day || multiple day codes
      ClubKey: string,
      ClubName: string,
      // CoachKey: string,
      // CoachName: string,
      VenueKey: string,
      VenueName: string,
      VenueType: string,
      CreationDate: number,
      Description: string,
      Days: string,
      DurationPerDay: string,
      EndDate: string,
      FullAmountForMember: string,
      FullAmountForNonMember: string,
      ImageUrl: string,
      Instruction: string,
      IsActive: true,
      IsAllowMemberEnrollment: true,
      IsAllowEarlyDrop:false,
      IsAllowLatePickUp: false,
      IsAllowLunch: false,
      IsAllowSnacks: false,
      LunchPrice_Member:string;
      LunchPrice_NonMember:string;
      SnacksPrice_Member:string;
      SnacksPrice_NonMember:string;
      Earlydrop_MemberFee:string;
      Earlydrop_Time:string;
      Latepickup_Time:string;
      Earlydrop_NonMemberFee:string;
      Latepickup_MemberFee:string;
      Latepickup_NonMemberFee:string;
      LunchText:string;
      IsMultiSports: false,
      IsPromotionPushFlag: false,
      IsrestrictedSquadSize: false,
      MemberAllowmentText: string,
      Moderator: string,
      ParentClubKey: string,
      PerDayAmountForMember: string,
      PerDayAmountForNonMember: string,
      SquadSize: number,
      StartDate: string,
      UpdatedDate: number,
      Activity: {},
      IsAllowCashPayment:boolean,
      Coach: {},
      VenueAddress: string,
      VenuePostCode: string,
      MinSessionBooking:number,
      AllowChildCare:boolean
}

export interface ICampSessionConfig{
      // session_name: string;
      // duration: string;
      // start_time: string;
      // amount_for_member: string;
      // amount_for_non_member: string;
      // is_lunch_allowed: boolean;
      // is_snacks_allowed: boolean;
      // capacity: number;
      AmountForMember: string,
      AmountForNonMember: string,
      CreationDate: number,
      Duration: string,
      EndTime: string,
      IsActive: boolean,
      SessionName: string,
      StartTime: string,
      UpdatedDate:string,
      Day: string,
      SessionDate: string,
      SessionId:string
}