//response model for session-listing

export class GroupSession {
    id: string;
    session_name: string;
    firebase_sessionkey: string;
    firebase_clubkey: string;
    ParentClubDetails: ParentClub;
    ActivityDetails: Activity;
    ClubDetails: Club;
    firebase_activitykey: string;
    activity_category_name: string;
    activity_subcategory_name: string;
    duration: string;
    term_name:string;
    group_category:string;
    days: string;
    no_of_weeks: number;
    Coach: Coach;
    group_size: number;
    session_fee: string
    session_fee_for_nonmember
    tot_enrol_count:number;
    pending_count:number;
    paid_count:number;
    start_time: string;
    end_time: string;
    start_date: string;
    end_date: string;
  }
  
  class ParentClub {
    ParentClubName: string;
  }
  
  class Activity {
    ActivityName: string;
    FirebaseActivityKey:string
  }
  
  class Club {
    ClubName: string;
    FirebaseId: string;
  }
  
  class Coach {
    coach_firebase_id: string;
    first_name: string;
    last_name: string;
    profile_image: string;
  }
  
  export class EnrolMember {
    member: {
      FirstName: string
      LastName: string
      DOB: string
    }
    amount_due: string
    payment_status: string
    total_amount: string
    payment: {
      amount_paid: string
      amount_pay_status: string
      paidby: string
      transaction_date: string
      total_fee_amount: string
    }
  }
  
  