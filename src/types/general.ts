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
