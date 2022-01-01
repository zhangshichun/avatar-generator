import axios from 'axios'
// create an axios instance
const service = axios.create({
  // baseURL: process.env.VUE_APP_BASE_API, // url = base url + request url
  baseURL: '/juejin',
  // withCredentials: true, // send cookies when cross-domain requests
  timeout: 20000, // request timeout
})

export default service;