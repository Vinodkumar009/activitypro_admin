export class ReportMembers{
    StartDate: string;
    EndDate: string;
    FirstName: string;
    LastName: string;
    MedicalCondition: string;
    Age: string;
    Gender: string;
    PaymentStatus: string;
    PhoneNumber: string;
    EmailID: string;
    ExtraLine: boolean;
    ExtraLineNumber: Number;
    MemberType:string;
}

export class ReportModel_V1 { 
    parentclub_image:string;
    parentclub_name:string;
    club_name: string;
    to_address:string;
    from_address:string;
    cc_address:string;
    subject:string;
    reply_to_address:string;
    memer_list:ReportMembers[];
    msg_body: string;
    attachment_name: string;
}

