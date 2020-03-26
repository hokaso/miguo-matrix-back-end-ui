import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/* Layout */
import Layout from '@/layout'

/**
 * 注意：子菜单仅在路由children.length> = 1时出现
 * 详细信息请参见：https://panjiachen.github.io/vue-element-admin-site/guide/essentials/router-and-nav.html
 *
 * 隐藏：如果设置为true，则为true，则项目不会显示在边栏中（默认为false）
 *  alwaysShow：如果设置为true，则将始终显示根菜单
 * 如果未设置alwaysShow，则当项有多个子路线时，
 * 它将变为嵌套模式，否则不显示根菜单
 *  redirect：noRedirect如果设置了noRedirect将不会在面包屑中重定向
 *  name：“路由器名称”，该名称由<keep-alive>使用（必须设置！！！）
 *  meta：{
     角色：['admin'，'editor']控制页面角色（您可以设置多个角色）
     title：“ title”名称显示在侧边栏和面包屑中（推荐设置）
     图标：'svg-name'图标显示在侧栏中
     面包屑：如果设置为false，则该项将隐藏在面包屑中（默认值为true）
     activeMenu：如果设置了路径，则为“ / example / list”，边栏将突出显示您设置的路径
 }
*/

/**
 * constantRoutes
 * 没有权限要求的基本页面
 * 可以访问所有角色
 */

export const constantRoutes = [
  {
    path: '/redirect',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '/redirect/:path*',
        component: () => import('@/views/redirect/index')
      }
    ]
  },
  {
    path: '/login',
    component: () => import('@/views/login/index'),
    hidden: true
  },
  {
    path: '/404',
    component: () => import('@/views/404'),
    hidden: true
  },
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [{
      path: 'dashboard',
      name: 'Dashboard',
      component: () => import('@/views/dashboard/index'),
      meta: { title: '数据总览', icon: 'dashboard', affix: true }
    }]
  },
  {
    path: '/web_management',
    component: Layout,
    redirect: '/web_management/article/list',
    name: 'web_management',
    meta: { title: '官网管理', icon: 'component' },
    children: [
      {
        path: 'article/create',
        component: () => import('@/views/website/article/create'),
        name: 'WebArticleCreate',
        meta: { title: '文章创建', noCache: true, activeMenu: '/web_management/article/list' },
        hidden: true
      },
      {
        path: 'article/edit/:id(\\d+)',
        name: 'WebArticleEdit',
        component: () => import('@/views/website/article/edit'),
        meta: { title: '文章编辑', noCache: true, activeMenu: '/web_management/article/list' },
        hidden: true
      },
      {
        path: 'article/list',
        name: 'WebArticle',
        component: () => import('@/views/website/article/list'),
        meta: { title: '文章发布', icon: 'article' }
      },
      {
        path: 'video',
        name: 'WebVideo',
        component: () => import('@/views/website/video/index'),
        meta: { title: '视频发布', icon: 'video' }
      },
      {
        path: 'swiper',
        name: 'WebSwiper',
        component: () => import('@/views/website/swiper/index'),
        meta: { title: '轮播图发布', icon: 'swiper' }
      }
    ]
  },
  {
    path: '/mp_management',
    component: Layout,
    redirect: '/mp_management/article',
    name: 'mp_management',
    meta: { title: '小程序管理', icon: 'miniprogram' },
    children: [
      {
        path: 'activity',
        name: 'Activity',
        component: () => import('@/views/miniprogram/activity/index'),
        meta: { title: '活动发布', icon: 'activity' }
      },
      {
        path: 'group',
        name: 'Group',
        component: () => import('@/views/miniprogram/group/index'),
        meta: { title: '投票对象', icon: 'group' }
      },
      {
        path: 'merchant',
        name: 'Merchant',
        component: () => import('@/views/miniprogram/merchant/index'),
        meta: { title: '赞助商', icon: 'merchant' }
      },
      {
        path: 'note',
        name: 'Note',
        component: () => import('@/views/miniprogram/note/index'),
        meta: { title: '公告栏', icon: 'note' }
      },
      {
        path: 'record',
        name: 'Record',
        component: () => import('@/views/miniprogram/record/index'),
        meta: { title: '投票记录', icon: 'record' }
      },
      {
        path: 'swiper',
        name: 'Swiper',
        component: () => import('@/views/miniprogram/swiper/index'),
        meta: { title: '轮播图', icon: 'swiper' }
      },
    ]
  },
  {
    path: '/media_management',
    component: Layout,
    redirect: '/media_management/article',
    name: 'media_management',
    meta: { title: '媒体分发', icon: 'send' },
    children: [
      {
        path: 'article',
        name: 'Article',
        component: () => import('@/views/media/article/index'),
        meta: { title: '文章分发', icon: 'article' }
      },
      {
        path: 'video',
        name: 'Video',
        component: () => import('@/views/media/video/index'),
        meta: { title: '视频分发', icon: 'video' }
      }
    ]
  },
  // {
  //   path: '/east_staff',
  //   component: Layout,
  //   redirect: '/east_staff/staff_list',
  //   name: 'east_staff',
  //   meta: { title: '员工健康', icon: 'send' },
  //   children: [
  //     {
  //       path: 'staff_list',
  //       name: 'Staff_List',
  //       component: () => import('@/views/covid19/staff_list/index'),
  //       meta: { title: '员工列表', icon: 'article' }
  //     },
  //     {
  //       path: 'staff_health',
  //       name: 'Staff_Health',
  //       component: () => import('@/views/covid19/staff_health/index'),
  //       meta: { title: '身体状况', icon: 'video' }
  //     }
  //   ]
  // },
  // 404 page must be placed at the end !!!
  { path: '*', redirect: '/404', hidden: true }
]

export const asyncRoutes = [
  {
    path: '/admin_management',
    component: Layout,
    redirect: '/admin_management/subordinate',
    name: 'admin_management',
    meta: { title: '管理员', icon: 'admin', roles: ['admin'] },
    children: [
      {
        path: 'subordinate',
        name: 'Subordinate',
        component: () => import('@/views/admin/subordinate/index'),
        meta: { title: '人员管理', icon: 'subordinate', roles: ['admin'] }
      },
      {
        path: 'verify',
        name: 'Verify',
        component: () => import('@/views/admin/verify/index'),
        redirect: '/admin_management/verify/article/list',
        meta: { title: '官网审核', icon: 'verify', roles: ['admin'] },
        children: [
          {
            path: 'article/create',
            component: () => import('@/views/admin/verify/article/create'),
            name: 'VerifyArticleCreate',
            meta: { title: '文章创建', noCache: true, activeMenu: '/admin_management/verify/article/list', roles: ['admin'] },
            hidden: true
          },
          {
            path: 'article/edit/:id(\\d+)',
            name: 'VerifyArticleEdit',
            component: () => import('@/views/admin/verify/article/edit'),
            meta: { title: '文章编辑', noCache: true, activeMenu: '/admin_management/verify/article/list', roles: ['admin'] },
            hidden: true
          },
          {
            path: 'article/list',
            component: () => import('@/views/admin/verify/article/list'),
            name: 'VerifyArticle',
            meta: { title: '文章管理', roles: ['admin'], icon: 'article'}
          },
          {
            path: 'video',
            component: () => import('@/views/admin/verify/video/index'),
            name: 'VerifyVideo',
            meta: { title: '视频管理', roles: ['admin'], icon: 'video' }
          },
          {
            path: 'swiper',
            component: () => import('@/views/admin/verify/swiper/index'),
            name: 'VerifySwiper',
            meta: { title: '轮播图管理', roles: ['admin'], icon: 'swiper' }
          }
        ]
      },
      {
        path: 'media_verify',
        name: 'MediaVerify',
        component: () => import('@/views/admin/media/index'),
        redirect: '/admin_management/media_verify/video/index',
        meta: { title: '分发审核', icon: 'verify', roles: ['admin'] },
        children: [
          {
            path: 'video',
            component: () => import('@/views/admin/media/video/index'),
            name: 'VerifyMediaVideo',
            meta: { title: '视频分发', roles: ['admin'], icon: 'video' }
          },
          {
            path: 'article',
            component: () => import('@/views/admin/media/article/index'),
            name: 'VerifyMediaArticle',
            meta: { title: '文章分发', roles: ['admin'], icon: 'article' }
          }
        ]
      }
    ]
  }
]

const createRouter = () => new Router({
  // mode: 'history', // require service support
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRoutes
})

const router = createRouter()

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

export default router
