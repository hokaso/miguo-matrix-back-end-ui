import HttpKit from "@/utils/http-kit";


export default {

  findClassArticle(form) {
    return HttpKit.post(`/admin/article/find_all_class`, form).then(
      res => res.data
    )
  },
  findAllArticle(form) {
    return HttpKit.post(`/admin/article/find_all`, form).then(
      res => res.data
    )
  },
  findClassVideo (form) {
    return HttpKit.post(`/admin/video/find_all_class`, form).then(
      res => res.data
    )
  },
  findAllVideo (form) {
    return HttpKit.post(`/admin/video/find_all`, form).then(
      res => res.data
    )
  },
  findClassSwiper (form) {
    return HttpKit.post(`/admin/swiper/find_all_class`, form).then(
      res => res.data
    )
  },
  findAllSwiper (form) {
    return HttpKit.post(`/admin/swiper/find_all`, form).then(
      res => res.data
    )
  },
}
