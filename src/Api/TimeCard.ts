import Api from '@/services/Api'
import type { Attendance } from '@/types/timeCard'

const endPoint = '/pmdeux'
export default {
  GetCutoffs(accessToken: string) {
    return Api.get(`${endPoint}/cutoffs`, {
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
