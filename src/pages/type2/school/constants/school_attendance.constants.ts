enum AttendanceAction{
    INSERT = 0, //insert attendance first time
    UPDATE = 1, //update attendance 
    CANCEL = 2, //cancel attendance 
}
  
enum AttendanceStatus{
    NOTYET = 0,
    DONE_PARTIAL = 1,
    CANCELLED = 2,
}