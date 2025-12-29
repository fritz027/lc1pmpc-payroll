import Api from '@/services/Api'
import type { Announcement, PayslipPayloadSetting } from '@/types/general'

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
    return Api.put(`${endPoint}/announcement/edit/${id}`, annoucement, {
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
    return Api.put(
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
    return Api.put(
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
}
