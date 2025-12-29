export interface Attendance {
  employeeNo: string
  shiftCode: string
  workDate: string | Date
  timeIn1: string | Date
  timeOut1: string | Date
  timeIn2: string | Date
  timeOut2: string | Date
  xOver: string | Date
  status1: string | null
  status2: string | null
}
