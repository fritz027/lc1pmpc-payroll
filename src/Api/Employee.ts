import Api from '@/services/Api'
import type {
  GetPaySlip,
  Suggestions,
  ChangePassword,
  TravelOrderPayload
 } from '@/types/general'

const endPoint = '/pmdeux/employee'
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
    return Api.patch(
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
  PayrollInitials(accessToken: string) {
    return Api.get(`${endPoint}/payroll-init`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
  },
  EmployeeTravelOrders(accessToken: string, from: string, to: string) {
    return Api.get(`${endPoint}/travel-order/list?from=${from}&to=${to}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
  },
  NewEmployeeTravelOrder(accessToken: string, payload: TravelOrderPayload) {
    return Api.post(`${endPoint}/travel-order/new`, payload, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
  },
  UpdateEmployeeTravelOrder(accessToken: string, payload: TravelOrderPayload) {
    return Api.patch(`${endPoint}/travel-order/update`, payload, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
  },
  DeleteEmployeeTravelOrder(accessToken: string, id: string) {
    return Api.delete(`${endPoint}/travel-order/remove/${id}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
  },
  FetchPendingApprovalCount(accessToken: string, from: string, to: string) {
    return Api.get(`${endPoint}/pending-approvals?from=${from}&to=${to}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
  },
}
