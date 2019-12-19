import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/* Layout */
// import Layout from '@/layout'

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
    path: '/login',
    component: () => import('@/views/login/index'),
    hidden: true
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
