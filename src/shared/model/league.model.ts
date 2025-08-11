import { PaymentStatus, PaymentTypes } from "../constants/payment.constants";

export class UsersListInput {//this one is new for new nextgen backend
    parentclub_id: string;
    club_id: string;
    search_term?: string;
    limit?: number;
    offset?: number;
    member_type?: number
    action_type?: number
}



export class UsersModel {
    isSelect: boolean;
    Id: string
    FirebaseKey: string;
    FirstName: string;
    LastName: string;
    ClubKey: string;
    IsChild: string;
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

export interface IClubDetails {
    Id: string
    ClubName: string
    FirebaseId: string
    MapUrl: string
    sequence: string;
    AmountPaid?: string; // Make these properties optional
    Transactions?: number;
    AmountDue?: string
}

export class SessionPaymentUpdateInput {
    ActionType?: number;
    orderId?: string;
    UpdatedBy: string;
    user_payment: UserPaymentStatusUpdate;
}
export class UserPaymentStatusUpdate {
    enrollementId: string;
    transactionId: string;

    payment_mode: PaymentTypes | null;
    payment_status: PaymentStatus | null;
    comments: string;
    amount: string;
    payment_date: string | null;
}

export class RoundTypesModel {
    id: number;
    name: string;
}

export class RoundTypeInput {
  parentclubId: string;
  clubId: string;
  activityId: string;
  memberId: string;
  action_type: number;
  device_type: number;
  app_type: number;
  device_id: string;
  updated_by: string;
}