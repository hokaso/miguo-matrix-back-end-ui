import { resetRouter } from '@/router'

const state = {
  roles: []
}

const mutations = {
  SET_ROLES: (state, roles) => {
    state.roles = roles
  }
}

const actions = {
  getInfo({ commit }, roles) {
    commit('SET_ROLES', roles)
  },
  userLogout({ commit }) {
    commit('SET_ROLES', [])
    resetRouter()
  },
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
