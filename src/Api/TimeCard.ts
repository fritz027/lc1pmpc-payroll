import Api from '@/services/Api'
import type { Attendance } from '@/types/timeCard'

const endPoint = '/pmdeux/employee'
export default {
  GetCutoffs(accessToken: string) {
    return Api.get(`${endPoint}/cutoff/attendance`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
  },
  GetEmployeeAttendace(employeeNo: string, code: string, accessToken: string, format: string) {
    return Api.get(`${endPoint}/cutoff/?employeeNo=${employeeNo}&code=${code}&format=${format}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      responseType: format === 'pdf' ? 'blob' : 'json',
    })
  },
}
