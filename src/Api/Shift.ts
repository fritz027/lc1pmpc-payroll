import Api from '@/services/Api'

const endPoint = '/pmdeux/schedule'
export default {
  GetShiftSchedule(from: string, to: string, accessToken: string) {
    return Api.get(`${endPoint}?from=${from}&to=${to}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
  },
  SubmitChangeDayRequest(
    payload: {
      emp_no: string
      original_off_date: string
      requested_off_date: string
      reason: string
    },
    accessToken: string,
  ) {
    return Api.post(`${endPoint}/change-off`, payload, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
  },
  CancelChangeDayRequest(requestId: number, accessToken: string) {
    console.log(accessToken)
    return Api.patch(
      `${endPoint}/change-off/${requestId}/cancel`,
      {},
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    )
  },
}
