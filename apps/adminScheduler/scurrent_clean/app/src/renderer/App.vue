<template>
  <div id="#app" style="height:100%">
    <router-view></router-view>
  </div>
</template>

<script>
  import store from 'renderer/vuex/store';
  import login from './components/login'
  import signup from './components/signup'

  export default {
    name: 'app',
    components: {
    login,
    signup
  //  foo
    },
    data () {
      return {
        source: "",
        sharedvalue: "hi"
      }
    },
    methods: {
      sourceChanged: function (source) {
        this.source = source;
      }
    }
  }
</script>
