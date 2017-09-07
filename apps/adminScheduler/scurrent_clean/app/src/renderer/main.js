import Vue from 'vue'
import Electron from 'vue-electron'
import Resource from 'vue-resource'
import Router from 'vue-router'
import Vuex from 'vuex'
import jQuery from 'jquery'

global.jQuery = jQuery
import App from './App'
import routes from './routes'
import { store } from './store.js';


Vue.use(require('vue-full-calendar'));
Vue.use(Electron)
Vue.use(Resource)
Vue.use(Router)
Vue.use(Vuex);
Vue.config.debug = true

const router = new Router({


  scrollBehavior: () => ({ y: 0 }),
  routes
})

new Vue({
  store,
  router,
  ...App,
  beforeMount: function(){
    //.fullCalendar
  $('#calendar').fullCalendar({
events: [
    {
        title  : 'event1',
        start  : '2017-06-01'
    },
    {
        title  : 'event2',
        start  : '2017-06-05',
        end    : '2010-01-07'
    },
    {
        title  : 'event3',
        start  : '2017-06-09T12:30:00',
        allDay : false // will make the time show
    }
],







    navLinks: true,

    header:
				{
					left: 'prev,next today',
					center: 'title',
					right: 'month,agendaWeek,agendaDay'
				},
});



}

}).$mount('#app')
