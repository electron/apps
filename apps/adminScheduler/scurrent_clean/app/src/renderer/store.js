import Vuex from 'vuex'
export const store = new Vuex.Store({
  state: {
    safelyStoredNumber: 3,
    user: "",
    admin: "",
    docId: "",
  },
  getters: {
    safelyStoredNumber: state => state.safelyStoredNumber,
    user: state => state.user,
    admin: state => state.admin,
    docId: state => state.docId,
  },
  mutations: {
    setStoredNumber(state, newNumber) {
      // newNumber is the payload passed in.
      state.safelyStoredNumber = newNumber;
    },
    user(state, newUser){
      state.user = newUser;
    },
    docId(state, newdocId){
      state.docId = newdocId;
    },
    admin(state, newAdmin){
      state.admin = newAdmin;
    }
  }
});
