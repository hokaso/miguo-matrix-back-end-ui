import HttpKit from '@/utils/http-kit'

export default {
  /**
   * 功能描述：官网文章管理
   * 其中「findAllByKeywords」返回为Null时查询所有，就不必增加多余的冗余方法了
   * @param form
   */
  add (form) {
    return HttpKit.post(`/staff/web_swiper/add`, form).then(
      res => res.data
    )
  },
  delOne (id) {
    return HttpKit.delete(`/staff/web_swiper/delete_one/${id}`).then(
      res => res.data
    )
  },
  findAllDel (form) {
    return HttpKit.get(`/staff/web_swiper/find_all_deleted/${form.page-1}/${form.size}`, form).then(
      res => res.data
    )
  },
  findAllExist (form) {
    return HttpKit.get(`/staff/web_swiper/find_all_exist/${form.page-1}/${form.size}`, form).then(
      res => res.data
    )
  },
  findAllByKeywords (form) {
    return HttpKit.post(`/staff/web_swiper/find_all_by_keywords`, form).then(
      res => res.data
    )
  },
  update (form) {
    return HttpKit.put(`/staff/web_swiper/update`, form).then(
      res => res.data
    )
  }
}
