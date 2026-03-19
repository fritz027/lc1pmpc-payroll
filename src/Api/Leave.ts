import Api from '@/services/Api'

const endPoint = `/pmdeux/employee/leave`

export default {
  getEmployeeLeaveCredits(token: string, year: number) {
    return Api.get(`${endPoint}/credits/${year}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  },
  getEmployeeLeaveList(token: string, year: number) {
    return Api.get(`${endPoint}/list/${year}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  },
  getLeaveTypes(token: string) {
    return Api.get(`${endPoint}/types`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  },
  getCreditByTypes(token: string, type: string, year: number) {
    return Api.get(`${endPoint}/credit/${year}/${type}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  },
  upsertLeave(token: string, payload: any) {
    return Api.post(`${endPoint}/upsert`, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  },
  deleteLeave(token: string, payload: any) {
    return Api.delete(`${endPoint}/delete`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      data: payload,
    })
  },
}
