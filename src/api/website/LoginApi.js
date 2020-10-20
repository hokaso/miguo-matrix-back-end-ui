import HttpKit from '@/utils/http-kit'

export default {
  /**
   * 功能描述：登录
   * @param name
   */
  login (form) {
    return HttpKit.post(`/account/login`, form).then(
      res => res.data
    )
  },
  logout (form) {
    return HttpKit.post(`/account/logout`, form).then(
      res => res.data
    )
  },
  getSelfInfo () {
    return HttpKit.post(`/staff/account/find_one`, "a").then(
      res => res.data
    )
  },
  setSelfInfo (form) {
    return HttpKit.post(`/staff/account/update`, form).then(
      res => res.data
    )
  },
  getCount () {
    return HttpKit.post(`/count/quality`, "a").then(
      res => res.data
    )
  }
}

