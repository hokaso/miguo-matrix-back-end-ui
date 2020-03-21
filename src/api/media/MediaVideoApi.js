import HttpKit from '@/utils/http-kit'

export default {
  /**
   * 功能描述：媒体平台文章管理
   * 其中「findAllByKeywords」返回为Null时查询所有，就不必增加多余的冗余方法了
   * @param form
   */
  add (form) {
    return HttpKit.post(`/media/video/add`, form).then(
      res => res.data
    )
  },
  delOne (id) {
    return HttpKit.delete(`/media/video/delete_one/${id}`).then(
      res => res.data
    )
  },
  findAllByKeywords (form) {
    return HttpKit.post(`/media/video/find_all_by_keywords`, form).then(
      res => res.data
    )
  },
  update (form) {
    return HttpKit.put(`/media/video/update`, form).then(
      res => res.data
    )
  }
}
