import Api from '@/services/Api'

interface DeletePayload {
  for_year: string,
  leave_cd: string
  leave_dt: string,
  no_hrs: number,
  with_pay: string,
  reason: string,
  apply_on: string,
}

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
  upsertLeave(token: string, payload: FormData | object) {
    return Api.post(`${endPoint}/upsert`, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  },
  deleteLeave(token: string, payload: DeletePayload) {
    return Api.delete(`${endPoint}/delete`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      data: payload,
    })
  },
  UploadLeave(token: string, payload: FormData | object) {
    return Api.post(`${endPoint}/upload/leave`, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    });
  }
}
