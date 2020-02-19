import HttpKit from '@/utils/http-kit'

export default {
  /**
   * 功能描述：官网文章管理
   * 其中「findAllByKeywords」返回为Null时查询所有，就不必增加多余的冗余方法了
   * @param form
   */
  add (form) {
    return HttpKit.post(`/admin/add`, form).then(
      res => res.data
    )
  },
  mod (ids, active) {
    return HttpKit.get(`/admin/modify/${ids}/${active}`).then(
      res => res.data
    )
  },
  findAllByKeywords (form) {
    return HttpKit.post(`/admin/find_all_by_keywords`, form).then(
      res => res.data
    )
  }
}
