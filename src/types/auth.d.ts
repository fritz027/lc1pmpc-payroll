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
}

export interface AuthState {
  accessToken: string
  employee: Employee | null
  gender: string | null
  role: string
  firstLogin: boolean
  lastActivity: Date | string | null
}
