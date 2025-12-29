import Api from '@/services/Api'
import type { GetPaySlip, Suggestions, ChangePassword } from '@/types/general'

const endPoint = '/pmdeux'
export default {
  GetPaySlip(accessToken: string, PayslipArgs: GetPaySlip) {
    return Api.get(
      `${endPoint}/payslip?empNo=${PayslipArgs.employeeNo}&dateFrom=${PayslipArgs.dateFrom}&dateTo=${PayslipArgs.dateTo}&format=${PayslipArgs.format}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        responseType: PayslipArgs.format === 'pdf' ? 'blob' : 'json',
      },
    )
  },
  fetchEmployeeSuggestions(accessToken: string, employeeNo: string) {
    return Api.get(`${endPoint}/suggestions/${employeeNo}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
  },
  NewEmployeeSuggestions(accessToken: string, suggestion: FormData) {
    return Api.post(`${endPoint}/suggestion/new`, suggestion, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
  },
  fetchEmployeeSuggestionById(accessToken: string, id: number, employeeNo: string) {
    return Api.get(`${endPoint}/suggestion/view?employeeNo=${employeeNo}&id=${id}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
  },
  fetchAnnouncements(accessToken: string) {
    return Api.get(`${endPoint}/announcements?status=O`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
  },
  UpdateEmplyoeePassword(accessToken: string, param: ChangePassword) {
    return Api.put(
      `${endPoint}/change-password/${param.employeeNo}`,
      {
        oldPassword: param.oldPassword,
        newPassword: param.newPassword,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    )
  },
  FetchPayslipSetting(accessToken: string) {
    return Api.get(`${endPoint}/payslip-setting`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
  },
}
