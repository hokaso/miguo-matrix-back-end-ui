import HttpKit from '@/utils/http-kit'

export default {
  /**
   * 功能描述：官网文章管理
   * 其中「findAllByKeywords」返回为Null时查询所有，就不必增加多余的冗余方法了
   * @param form
   */
  add (form) {
    return HttpKit.post(`/staff_miniprogram/mp_activity/add`, form).then(
      res => res.data
    )
  },
  del (list) {
    return HttpKit.post(`/staff_miniprogram/mp_activity/delete/`,list).then(
      res => res.data
    )
  },
  findAllByKeywords (form) {
    return HttpKit.post(`/staff_miniprogram/mp_activity/find_all_by_keywords`, form).then(
      res => res.data
    )
  },
  findAllByKeywordsFromInput (name) {
    return HttpKit.get(`/staff_miniprogram/mp_activity/find_all_by_keywords_from_input/${name}`).then(
      res => res.data
    )
  },
  update (form) {
    return HttpKit.put(`/staff_miniprogram/mp_activity/update`, form).then(
      res => res.data
    )
  },
  upload (file) {
    return HttpKit.post(`/picture/upload`, file).then(
      res => res.data
    )
  },
  findOne (id) {
    return HttpKit.get(`/staff_miniprogram/mp_activity/find_activity_id/${id}`).then(
      res => res.data
    )
  }
}
