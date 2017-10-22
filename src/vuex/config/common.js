

'use strict';

const state = {
  me: {
    jwt: "",
    userID:"", 
    nickname:"", 
    avatar: "http://ucast.oss-cn-beijing.aliyuncs.com/avatars/avatar_who.png"
  }
};

const mutations = {
  setJwt(state, data) {
    state.me.jwt = data;
  },
  setMe(state, {jwt, userID, nickname, avatar}) {
    state.me.jwt = jwt;
    state.me.userID = userID;
    state.me.nickname = nickname;
    state.me.avatar = avatar;
  }
};

const actions = {
  setJwt: ({commit}, data) => {
    commit('setJwt', data);
  },
  setMe: ({commit}, data) => {
    commit('setMe', data);
  }
};

const getters = {
  jwt: (state) => state.me.jwt,
};

export default {
  state,
  mutations,
  actions,
  getters,
}
