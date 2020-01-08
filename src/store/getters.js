const getters = {
  sidebar: state => state.app.sidebar,
  device: state => state.app.device,
  roles: state => state.user.roles,
  has_routes: state => state.permission.has_routes,
  permission_routes: state => state.permission.routes,

}
export default getters
