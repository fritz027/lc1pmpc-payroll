import Api from '@/services/Api'

const endPoint = '/pmdeux/attendance'

export default {
  AttendanceRecords(dateFrom: string, dateTo: string, token: string) {
    return Api.get(`${endPoint}/records?dateFrom=${dateFrom}&dateTo=${dateTo}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  },
  Shifts(token: string) {
    return Api.get(`${endPoint}/shifts`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  },
  EmployeeShift(token: string, date: string) {
    return Api.get(`${endPoint}/employee/shift?date=${date}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  },
  AttendanceRequest(token: string, payload: any) {
    return Api.post(`${endPoint}/request`, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  },
  RemoveAttendanceRequest(token: string, date: string, shift: string) {
    return Api.delete(`${endPoint}/request?date=${date}&shift=${shift}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  },
  AttendaceRecordsByEmployee(dateFrom: string, dateTo: string, token: string) {
    return Api.get(`${endPoint}/cutoff?dateFrom=${dateFrom}&dateTo=${dateTo}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  },
}
