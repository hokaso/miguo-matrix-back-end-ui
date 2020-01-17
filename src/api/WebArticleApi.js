import HttpKit from '@/utils/http-kit'

export default {
  /**
   * 功能描述：官网文章管理
   * 其中「findAllByKeywords」返回为Null时查询所有，就不必增加多余的冗余方法了
   * @param form
   */
  add (form) {
    return HttpKit.post(`/staff/article/add`, form).then(
      res => res.data
    )
  },
  delSome (ids) {
    return HttpKit.delete(`/staff/article/delete/${ids}`).then(
      res => res.data
    )
  },
  delOne (id) {
    return HttpKit.delete(`/staff/article/delete_one/${id}`).then(
      res => res.data
    )
  },
  findOne (id) {
    return HttpKit.get(`/staff/article/find_one_by_id/${id}`).then(
      res => res.data
    )
  },
  findAllDel (form) {
    return HttpKit.get(`/staff/article/find_all_deleted/${form.page}/${form.size}`, form).then(
      res => res.data
    )
  },
  findAllExist (form) {
    return HttpKit.get(`/staff/article/find_all_exist/${form.page}/${form.size}`, form).then(
      res => res.data
    )
  },
  findAllByKeywords (form) {
    return HttpKit.post(`/staff/article/find_all_by_keywords`, form).then(
      res => res.data
    )
  },
  update (form) {
    return HttpKit.put(`/staff/article/update`, form).then(
      res => res.data
    )
  },
  upload (file) {
    return HttpKit.post(`/picture/upload`, file).then(
      res => res.data
    )
  }
}
