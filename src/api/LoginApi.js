import HttpKit from '@/utils/http-kit'

export default {
  /**
   * 功能描述：登录
   * @param name
   */
  login (form) {
    return HttpKit.post(`/login/account`, form).then(
      res => res.data
    )
  }
}
