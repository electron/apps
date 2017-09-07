<template >
  <!-- div with class "background" will have background image for the login page-->
  <div class="login background" style="height:100%" v-on:click="bodywarning">
    <!--"signbtn" will take the user to the sign up page-->
    <button id="signbtn" class="btn" v-on:click="signup">Sign Up</button>
    <!-- "divcontainer" contains login inputs username and password-->
    <div id="divcontainer">
       <div class="container col-lg-2 col-md-3 col-sm-4 col-xs-6 " id="container" >
          <!-- div with class "popup" will appear if there is a login error-->
          <div class="popup" style="margin-left:50%;">
             <span class="popuptext" id="myPopup">Invalid Username or Password</span>
          </div>
          <!--username-->
          <div class="input-group" style="margin-top:15px;">
             <span class="input-group-addon" id="basic-addon1" style="background-color:white;border-color:white;opacity:.8;color:#1D2731;" > <span class="glyphicon glyphicon-user"></span></span>
             <input type="text" v-model="username" id="inputUsername" name="username"  class="form-control col-lg-1"  required autofocus  placeholder="Username" aria-describedby="basic-addon1" style="opacity:.8;color:#1D2731;font-weight:bold;">
          </div>
          <!--password-->
          <div class="input-group" style="margin-top:15px;">
             <span class="input-group-addon" style="opacity:.8;color:#1D2731;font-weight:bold;">
                <i class="glyphicon glyphicon-eye-open"></i>
             </span>
             <input  v-model="password" type="password" id="inputPassword" name="password" class="form-control" placeholder="Password" required autofocus style="opacity:.8;color:#1D2731;font-weight:bold;"/>
          </div>
          <!--"loginbtn" will submit the form -->
          <button id="loginbtn"v-on:click="submit" class="btn btn-lg btn-primary btn-block"  type="submit">Login</button>
        </div>
     </div>
  </div>
</template>

<script>
export default {

  name: 'login',
  data() {
    //variables
    return {
      username: '',
      password: '',
      error: '',
      toggleWarning:1
    }
  },
  methods: {
    submit: function(){
      this.$http.post('http://localhost:3000/login?username='+this.username+'&password='+this.password)
        .then(response => {
          //store the id number of user and whether or not user has admin priveledges
          this.$store.commit('user', response.body.id);
          this.$store.commit('admin', response.body.admin);
          if(response.body!="error"){
            //if successfull login update the docId of user to be the same as id of user (this will be important in giving admin priveledges)
            this.$http.post('http://localhost:3000/whichDoc?user='+response.body.id+'&docId='+response.body.id)
            .then(response => {
            this.$router.push({name:'calendar'});
          });
          }
          else{
              if(response.body=="error"){
                this.toggleWarning=0;
                this.warning();
                this.error = 'Invalid Password or Username entered please try again';
                this.clear();
              }
          }
        })
    },
    clear: function(){
      this.username = '';
      this.password = '';
    },
    signup: function(){
        this.$router.push({name:'signup'});
    },
    calendar: function(){
      this.$router.push({name:'calendar'})
    },
    warning: function() {
        if(this.toggleWarning==0){
        var popup = document.getElementById("myPopup");
        popup.classList.toggle("show");
      }
    },
    bodywarning: function(){
      this.warning();
      this.toggleWarning=1;
    }
  }
}
</script>
