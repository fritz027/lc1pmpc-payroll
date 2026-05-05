import Api from '@/services/Api'

import type { LoginPayLoad, LoginResponse, Employee } from '@/types/auth'
const endPoint = `/pmdeux/auth`
export default {
  Login(payLoad: LoginPayLoad) {
    return Api.post<LoginResponse>(`${endPoint}/login`, payLoad)
  },
  CheckEmployee(empno: string, dob: string, email: string) {
    return Api.get(`${endPoint}/employees/exist?empno=${empno}&dob=${dob}&email=${email.toLocaleLowerCase()}`)
  },
  RequestOTP(employeeNo: string, email: string) {
    return Api.post(`${endPoint}/request-otp`, {
      employeeNo: employeeNo,
      email: email.toLocaleLowerCase()
    })
  },
  VerifyOTP(employeeNo: string, email: string, otp: string) {
    return Api.post(`${endPoint}/verified-otp`, {
      employeeNo: employeeNo,
      email: email.toLocaleLowerCase(),
      otp: otp
    })
  },
  ResendOTP(employeeNo: string, email: string) {
    return Api.post(`${endPoint}/resend-otp`, {
      employeeNo: employeeNo,
      email: email.toLocaleLowerCase()
    })
  },
  PasswordUpdate(employeeNo: string, email: string, password: string){
    return Api.patch(`${endPoint}/employees/password`, {
      empno: employeeNo,
      email: email,
      password: password
    })
  }
}
