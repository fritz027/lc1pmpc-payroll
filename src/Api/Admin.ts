import Api from '@/services/Api'
import type { Announcement, PayslipPayloadSetting } from '@/types/general'
import Employee from './Employee'

const endPoint = `/pmdeux/admin`

export default {
  NewAnnouncement(accessToken: string, announcement: FormData) {
    return Api.post(`${endPoint}/create/announcement`, announcement, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
  },
  Announcements(accessToken: string) {
    return Api.get(`${endPoint}/announcements`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
  },
  DeleteAnnouncement(accessToken: string, id: number) {
    return Api.delete(`${endPoint}/announcement/remove/${id}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
  },
  GetAnnouncementByID(accessToken: string, id: number) {
    return Api.get(`${endPoint}/announcement/${id}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
  },
  EditAnnouncement(accessToken: string, id: number, annoucement: FormData) {
    return Api.patch(`${endPoint}/announcement/edit/${id}`, annoucement, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
  },
  GetAllSuggestions(accessToken: string) {
    return Api.get(`${endPoint}/suggestions`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
  },
  GetSuggestionById(accessToken: string, id: number) {
    return Api.get(`${endPoint}/suggestion?id=${id}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
  },
  UpdateSuggestionStatus(accessToken: string, id: number, status: string) {
    return Api.patch(
      `${endPoint}/suggestion/update/status`,
      { id, status }, // shorthand
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
  UpdatePayslipSetting(accessToken: string, payload: PayslipPayloadSetting) {
    return Api.patch(
      `${endPoint}/system-config/update`,
      {
        payload,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    )
  },
  FetchUserRoles(token: string) {
    return Api.get(`${endPoint}/roles/users`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  },
  FetchRoles(token: string) {
    return Api.get(`${endPoint}/roles`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  },
  RoleSave(emp_no: string, role_id: number, token: string) {
    return Api.post(
      `${endPoint}/roles/save`,
      { emp_no, role_id },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    )
  },
  FetchAvailableEmployees(token: string) {
    return Api.get(`${endPoint}/employees`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  },
  DeleteUserRole(emp_no: string, token: string) {
    return Api.delete(`${endPoint}/roles/remove/${emp_no}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  },
  FetchDepartments(token: string) {
    return Api.get(`${endPoint}/departments`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  },
  FetchEmployeeByDepartment(token: string, approver: string, department: string, division: string) {
    return Api.get(
      `${endPoint}/employees/department?approver=${approver}&department=${department}&division=${division}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    )
  },
  FetchEmployeeByRole(token: string, role: string) {
    return Api.get(`${endPoint}/employees/role/${role}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  },
  FetchDivisionByDepartment(token: string, department: string) {
    return Api.get(`${endPoint}/department/${department}/divisions`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  },
  SaveBulkApproverPermission(token: string, payload: { approver_id: string; assignments: any[] }) {
    return Api.post(`${endPoint}/bulk-update-approver-permission`, payload, {
      headers: { Authorization: `Bearer ${token}` },
    })
  },
  FetchEmployeeByApprover(token: string, type: string, from: string, to: string) {
    return Api.get(`${endPoint}/approver?type=${type}&from=${from}&to=${to}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  },
  FetchEmployeeLeaveByApprover(empNo: string, from: string, to: string, token: string) {
    return Api.get(`${endPoint}/leave/request?no=${empNo}&from=${from}&to=${to}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  },
  BulkApproveLeave(token: string, payload: any) {
    return Api.patch(`${endPoint}/bulk-approve-leave`, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  },
  FetchEmployeeovertimeRequest(empNo: string, from: string, to: string, token: string) {
    return Api.get(`${endPoint}/overtime/request?no=${empNo}&from=${from}&to=${to}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  },
  BulkApproveOvertime(token: string, payload: any) {
    return Api.patch(`${endPoint}/bulk-approve-overtime`, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  },
  EmployeeAttendanceRequest(empNo: string, from: string, to: string, token: string) {
    return Api.get(`${endPoint}/attendance/request?no=${empNo}&from=${from}&to=${to}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  },
  BulkApproveAttendance(token: string, payload: any) {
    return Api.patch(`${endPoint}/bulk-approve-attendance`, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  },
  EmployeeTravelOrderRequest(empNo: string, from: string, to: string, token: string) {
    return Api.get(`${endPoint}/travel-order/request?no=${empNo}&from=${from}&to=${to}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  },
  BulkApproveTravelOrder(token: string, payload: any) {
    return Api.patch(`${endPoint}/bulk-approve-travel-order`, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  },
  EmployeeChangeDayOffRequest(empNo: string, token: string) {
    return Api.get(`${endPoint}/change-day-off/request?no=${empNo}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  },
  BulkApproveChangeDayOff(token: string, payload: any) {
    return Api.patch(`${endPoint}/bulk-approve-change-day-off`, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  },
  ManPowerRequestList(token: string) {
    return Api.get(`${endPoint}/manpower/requests`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  },
  AllPosition(token: string) {
    return Api.get(`${endPoint}/positions`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  },
  AllDivision(token: string) {
    return Api.get(`${endPoint}/divisions`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  },
  CreateManPowerRequest(token: string, payload: any) {
    return Api.post(`${endPoint}/create/manpower-request`, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  },
}
