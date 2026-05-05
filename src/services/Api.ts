import axios from 'axios'

const version = 'v1'

const Api = axios.create({
  //baseURL: `https://dev.api.lc1pmpc.com/api/v1`,
  baseURL: 'http://192.168.100.4:5137/api/v1',
  withCredentials: true,
})

export default Api
