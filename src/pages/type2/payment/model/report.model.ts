export type payment_email= {
    is_child: boolean;
    parent_key?: string;
    user_id: string;
    email: string;
    FirstName: string;
    LastName: string;
    DOB:string;
    MedicalCondition:string;
    MediaConsent:string;
    PhoneNumber:string;
    ParentEmailID:string
    ParentPhoneNumber:string;
  }



  export type report_model = {
    FirstName: string,
    LastName: string,
    Session: string,
    Coach: string,
    Venue:string,
    PaidAmount:string
    PaidOn:string
    PaidBy:string
    DueAmount:string
    Discount:string          
  }

  // Define the structure for both lists using union types
export type PaidMemberDetails = {
  FirstName: string;
  LastName: string;
  ClubName: string;
  session_name: string;
  coach_name:string;
  amount_paid: string;
  transaction_date: string;
  paid_by_text: string;
  total_discount: string;
};

export type DueMemberDetails = {
  FirstName: string;
  LastName: string;
  ClubName: string;
  session_name: string;
  coach_name:string;
  amount_due: string;
};
