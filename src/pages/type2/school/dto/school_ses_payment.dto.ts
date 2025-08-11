import { PaymentStatus, PaymentTypes } from "../../../../shared/constants/payment.constants";

export class UserPaymentStatusUpdate {
    enrollementId: string;
    //@Field((type) => String, { nullable: true })
    transactionId: string;

    //@Field((type) => Int, { nullable: true }) //don't send if only for payment 
    payment_mode: PaymentTypes | null;
    payment_status: PaymentStatus | null;
    comments: string;
    amount: string;
    payment_date: string | null;
  }

export class SessionPaymentUpdateInput{
    ActionType?:number;
    orderId?: string;
    UpdatedBy: string;
    user_payment: UserPaymentStatusUpdate;
}


