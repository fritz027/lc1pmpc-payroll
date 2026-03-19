import Api from '@/services/Api'

const endPoint = '/pmdeux/overtime'

interface overtimePayload {
  code: string
  phalf: string
  dateFrom: string | Date | null
  dateTo: string | Date | null
}

export default {
  getEmployeeOvertimeList(payload: overtimePayload, token: string) {
    return Api.get(
      `${endPoint}/list?code=${payload.code}&phalf=${payload.phalf}&dateFrom=${payload.dateFrom}&dateTo=${payload.dateTo}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    )
  },
  newOvertime(token: string, payload: any) {
    return Api.post(`${endPoint}/new`, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  },
  updateOvertime(token: string, payload: any) {
    return Api.patch(`${endPoint}/update`, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  },
  deleteOvertime(token: string, otDate: string) {
    return Api.delete(`${endPoint}/delete?date=${otDate}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  },
}
