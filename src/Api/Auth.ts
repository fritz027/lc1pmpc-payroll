import Api from '@/services/Api'

import type { LoginPayLoad, LoginResponse, Employee } from '@/types/auth'
const endPoint = `/pmdeux/auth`
export default {
  Login(payLoad: LoginPayLoad) {
    return Api.post<LoginResponse>(`${endPoint}/login`, payLoad)
  },
}
