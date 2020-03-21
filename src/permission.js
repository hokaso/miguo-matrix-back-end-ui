import router from './router'
import store from './store'
import { Message } from 'element-ui'
import NProgress from 'nprogress' // progress bar
import 'nprogress/nprogress.css' // progress bar style
import getPageTitle from '@/utils/get-page-title'

NProgress.configure({ showSpinner: false }) // NProgress Configuration

const whiteList = ['/login', '/auth-redirect'] // no redirect whitelist

router.beforeEach(async(to, from, next) => {
  // start progress bar
  NProgress.start()
  // set page title
  document.title = getPageTitle(to.meta.title)
  if (whiteList.indexOf(to.path) !== -1) {
    // in the free login whitelist, go directly
    next()
  }
  else {
    // determine whether the user has obtained his permission roles through getInfo
    const hasRoles = store.getters.roles && store.getters.roles.length > 0
    const cacheRoles = sessionStorage.getItem('user')
    if (hasRoles && store.getters.has_routes) {
      // console.log("1")
      next()
    }
    else if(cacheRoles && cacheRoles!==''){
      // 刷新後執行
      await store.dispatch('user/getInfo', cacheRoles)
      await store.dispatch('permission/getRoutes')
      const accessRoutes = await store.dispatch('permission/generateRoutes', store.getters.roles)
      router.addRoutes(accessRoutes)
      next({ ...to, replace: true })
    }
    else if (hasRoles) {
      // console.log("2")
      try {
        // get user info
        // note: roles must be a object array! such as: ['admin'] or ,['developer','editor']
        await store.dispatch('permission/getRoutes')

        // generate accessible routes map based on roles
        const accessRoutes = await store.dispatch('permission/generateRoutes', store.getters.roles)

        // dynamically add accessible routes
        router.addRoutes(accessRoutes)

        // hack method to ensure that addRoutes is complete
        // set the replace: true, so the navigation will not leave a history record

        next({ ...to, replace: true })
      } catch (error) {
        // remove token and go to login page to re-login
        Message.error(error || 'Has Error')
        next(`/login?redirect=${to.path}`)
        NProgress.done()
      }
    }

    else {
      next(`/login?redirect=${to.path}`)
      NProgress.done()
    }
  }
})

router.afterEach(() => {
  // finish progress bar
  NProgress.done()
})
