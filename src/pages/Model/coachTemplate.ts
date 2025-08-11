export class CoachTemplate{
    ParentClubKey:string = ""
    MemberKey:string = "";
    MemberName:string = "";
    Mode:number = 0;
    AveragePerformance:number = 0;
    IsRated:boolean = true;
    CreateDate:string = "";
    UpdatedDate:string = "";
    CreatedBy:string = "";
    Creatorkey:string = "";
    CreaterName:string = "";
    SignedUpType:number = 0;
    ClubKey:string = "";
    StartDate:string = "";
    EndDate:string = "";
//Template Information
    ActivityCode:string = "";
    ActivityKey:string = "";
    ActivityName:string = "";
    IsActive:boolean;
    TemplateName:string = "";
    Summary:string= "";
//Submit Information
    SubmitedTo:string = "";
    CoachName:string = "";
    CoachKey:string = "";
    Status:number = 1;
    SubmitedType:string="";
    ReferedBy:string="";
    ReferedTemplateKey:string="";
    ReferedCoachComment:string = "";
}
export class Mode{
 getMode(i):string{
     switch(i){
         case 1: return "In Progress";
         case 2: return "With Consultant";
         case 3: return "Submited";
     }
 }
}
export class Rate{
    Rating:any ='';
    RatingDoneBy:any = '';
    RaterKey:any = '';
    RaterName:any = '';
    Comments:any = '';
}