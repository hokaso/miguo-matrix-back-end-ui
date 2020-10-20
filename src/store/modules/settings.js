import defaultSettings from '@/settings'

const { showSettings, fixedHeader, sidebarLogo,tagsView } = defaultSettings

const state = {
  showSettings: showSettings,
  fixedHeader: fixedHeader,
  tagsView: tagsView,
  sidebarLogo: sidebarLogo,
  uploadUrl: process.env.HOME_URL + '/picture/upload/',
  mpUploadUrl: process.env.HOME_URL + '/picture/upload_mp/',
  callbackUrl: process.env.HOME_URL + '/file/',
  mpCallbackUrl: process.env.HOME_URL +  '/file/thumbnails/mp'
}

const mutations = {
  CHANGE_SETTING: (state, { key, value }) => {
    if (state.hasOwnProperty(key)) {
      state[key] = value
    }
  }
}

const actions = {
  changeSetting({ commit }, data) {
    commit('CHANGE_SETTING', data)
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}

