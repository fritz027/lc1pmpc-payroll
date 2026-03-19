export interface LoginPayLoad {
  employeeNo: string
  password: string
  rememberMe?: boolean
}

export interface LoginResponse {
  success: boolean
  message: string
  accessToken: string
  firstLogin: boolean
  role: string
  viewPayslip: boolean
  employee: Employee
}

export interface Employee {
  employeeNo: string
  lastName: string
  firstName: string
  gender: string
  dateHired?: string
}

export interface AuthState {
  accessToken: string
  employee: Employee | null
  gender: string | null
  role: string
  firstLogin: boolean
  lastActivity: Date | string | null
  payrollInit?: PayrollInit | null
}

export interface PayrollInit {
  init_cd_full: string
  init_cd: string
  phalf: string
  pay_fr: string
  pay_to: string
  posted: '0' | '1'
  history: '0' | '1'
  pay_proc: string
  pay_emps: number
  att_fr: string
  att_to: string
}
