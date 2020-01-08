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
  }
}

