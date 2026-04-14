export interface Announcement {
  title: string
  contentFile: File[]
  announceBy: string
}

export interface Announcements {
  id: number
  title: string
  status: string
  dateCreated: string
  date: string
  contentFile: string
  dateUpdated: string
  editedBy: string
  announceBy: string
}

export interface GetPaySlip {
  employeeNo: string
  dateFrom: string
  dateTo: string
  format: string
}

export interface Suggestions {
  id: number
  title: string
  dateCreated: string
  suggestion: string
  status: string
}

export interface AdminSuggestions {
  id: number
  title: string
  suggesstion: string
  employee: string
  status: string
  date_created: string | Date
  image: string
}

export interface ChangePassword {
  employeeNo: string
  oldPassword: string
  newPassword: string
}

export interface PayslipPayloadSetting {
  enable: boolean
  dateFrom: Date | string | null
  dateTo: Date | string | null
}

export interface SaveBulkApprovalPayload {
  subordinate_id: string
  allow_leave: number
  allow_ot: number
  allow_attendance: number
  allow_travel: number
  allow_changeOff: number
}

export interface BulkApproveLeavePayload {
  emp_no: string
  leave_dt: string
  for_year: string
  leave_cd: string
}

export interface BulkApproveOvertimePayload {
  emp_no: string
  ot_date: string | Date
}

export interface BulkApproveAttendancePayload {
  emp_no: string
  date_dt: string | Date
  status: 'APPROVED' | 'REJECTED' | 'PENDING' | string
  action_date: string | Date
}

export interface BulkAppproveTravelPayload {
  emp_no: string
  travel_passno: string
  approved: boolean | number
}

export interface BulkApproveChangeDayOffPayload {
  emp_no: string
  ot_date: string | Date
  status: string
  action_date: string | Date
}

export interface ManPowerRequestPayload {
  requestor: string
  div_code: string
  position_code: string
  sex: string
  civil_status: string
  emp_status: string
  age: string | number
  no_of_heads: number
  date_needed: string | Date
  educ_attainment: string
  status: number | string // Get the value (e.g. 'O' from 'Open')
  remarks: string
}
