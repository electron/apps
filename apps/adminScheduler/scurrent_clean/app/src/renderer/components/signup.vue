<template >
  <!--div with class background2 contains background image-->
  <div class= "signup background2" style="background-color:#D7CEC7; height:100%" v-on:click="bodywarning" >
    <!--"gotologin" button will take user to login page-->
    <button id="gotologin" class="btn" v-on:click="login">Login</button>
    <!--div "divcontainer2" contains the form inputs for the signup page-->
    <div id="divcontainer2">
      <div class="container" id="container2">
        <div>
          <div class="popup" style="margin-left:50%;">
             <span class="popuptext" id="myPopup">{{passmatch}}</span>
          </div>
          <!--divs with class input-group contain input fields-->
          <!--username -->
          <div class="input-group" id="theinput" style="margin-top:15px;">
             <span class="input-group-addon" id="basic-addon1" style="background-color:white;border-color:white;opacity:.8;color:#1D2731;" > <span class="glyphicon glyphicon-user"></span></span>
             <input type="text" v-model="username" id="inputUsername" name="username"  class="light-shadow form-control col-lg-1"  required autofocus  placeholder="Username" aria-describedby="basic-addon1" style="opacity:.8;color:#1D2731;font-weight:bold;">
          </div>
          <!--first -->
          <div class="input-group" id="theinput" style="margin-top:15px;">
             <span class="input-group-addon" id="basic-addon1" style="background-color:white;border-color:white;opacity:.8;color:#1D2731;" > <span class="glyphicon glyphicon-user"></span></span>
             <input type="text" v-model="first" id="first" name="first"  class="light-shadow form-control col-lg-1"  required autofocus  placeholder="First Name" aria-describedby="basic-addon1" style="opacity:.8;color:#1D2731;font-weight:bold;">
          </div>
          <!--last -->
          <div class="input-group" id="theinput" style="margin-top:15px;">
             <span class="input-group-addon" id="basic-addon1" style="background-color:white;border-color:white;opacity:.8;color:#1D2731;" > <span class="glyphicon glyphicon-user"></span></span>
             <input type="text" v-model="last" id="last" name="last"  class="light-shadow form-control col-lg-1"  required autofocus  placeholder="Last Name" aria-describedby="basic-addon1" style="opacity:.8;color:#1D2731;font-weight:bold;">
          </div>
          <!--password -->
          <div class="input-group" style="margin-top:15px;">
             <span class="input-group-addon" id="basic-addon1" style="background-color:white;border-color:white;opacity:.8;color:#1D2731;" > <span class="glyphicon glyphicon-eye-open"></span></span>
             <input type="password" v-model="password" id="inputPassword" name="password"  class="form-control col-lg-1"  required autofocus  placeholder="Password" aria-describedby="basic-addon1" style="opacity:.8;color:#1D2731;font-weight:bold;">
          </div>
          <!--password2 -->
          <div class="input-group" style="margin-top:15px;">
             <span class="input-group-addon" id="basic-addon1" style="background-color:white;border-color:white;opacity:.8;color:#1D2731;" > <span class="glyphicon glyphicon-eye-open"></span></span>
             <input type="password" v-model="password2" id="inputPassword2" name="password2"  class="form-control col-lg-1"  required autofocus  placeholder="Repeat Password" aria-describedby="basic-addon1" style="opacity:.8;color:#1D2731;font-weight:bold;">
          </div>
          <!--specialty -->
          <div class="input-group" id="theinput" style="margin-top:15px;">
             <span class="input-group-addon" id="basic-addon1" style="background-color:white;border-color:white;opacity:.8;color:#1D2731;" > <span class="glyphicon glyphicon-star"></span></span>
             <input type="text" v-model="specialty" id="specialty" name="specialty"  class="light-shadow form-control col-lg-1"  required autofocus  placeholder="Specialty (If doctor)" aria-describedby="basic-addon1" style="opacity:.8;color:#1D2731;font-weight:bold;">
          </div>
          <!--city -->
          <div class="input-group" id="theinput" style="margin-top:15px;">
             <span class="input-group-addon" id="basic-addon1" style="background-color:white;border-color:white;opacity:.8;color:#1D2731;" > <span class="glyphicon glyphicon-map-marker"></span></span>
             <input type="text" v-model="city" id="city" name="city"  class="light-shadow form-control col-lg-1"  required autofocus  placeholder="City" aria-describedby="basic-addon1" style="opacity:.8;color:#1D2731;font-weight:bold;">
          </div>
          <!--admin -->
          <div class="input-group" style="margin-top:15px;">
             <span class="input-group-addon" id="basic-addon1" style="background-color:white;border-color:white;opacity:.8;color:#1D2731;" > <span class="glyphicon glyphicon-briefcase"></span></span>
             <input type="password" v-model="admin" id="admin" name="admin"  class="form-control col-lg-1"  required autofocus  placeholder="Admin" aria-describedby="basic-addon1" style="opacity:.8;color:#1D2731;font-weight:bold;">
          </div>
          <!--"signupbtn" will submit the signup form -->
          <button id="signupbtn" v-on:click="signup" class="btn btn-lg btn-primary btn-block" >Sign up</button>
        </div>
      </div>
    </div>
  </div>
</template>


<script>

export default {
  name: 'signup',
  data() {
    return {
      //variables
      city: '',
      first: '',
      last: '',
      specialty: '',
      admin: '',//if admin= "admin" then user will be given executive priveledges
      username: '',
      password:'',
      password2: '',
      pass_or_fail: '',
      passmatch:'',
      toggleWarning:1,
      key:'',
    }
  },

  methods: {
    signup: function () {
      const vm = this;
      this.$http.post('http://localhost:3000/signup?username='+this.username+'&password='+this.password+'&password2='+this.password2+'&admin='+this.admin+'&first='+this.first+'&last='+this.last+'&specialty='+this.specialty+'&city='+this.city)
      //make post request to server where the information will be used to create a user in our DB
        .then(response => {
          if(response.body=="error1"){
            this.toggleWarning=0;
            this.warning();
            this.passmatch="Please fill in all the fields"
          }
          if(response.body=="error2"){
            this.toggleWarning=0;
            this.warning();
            this.passmatch="Passwords did not match"
          }
          if(response.body=="error3"){
            this.toggleWarning=0;
            this.warning();
            this.passmatch="This Username has been taken"
          }
          if(response.body!="error1"&&response.body!="error2"&&response.body!="error3"){
            this.$store.commit('user', response.body[0].max);
            this.$http.post('http://localhost:3000/whichDoc?user='+response.body[0].max+'&docId='+response.body[0].max)
            .then(response => {
              this.$store.commit('user', response.body[0].id);
              this.$store.commit('admin', response.body[0].admin);
              //if user input "admin" in admin field our docId global variable is set to our current id which
              //will be used to determine that the user is in fact an admin in calandar.vue
              if(this.admin == "admin"){
              this.$store.commit('docId', response.body[0].id);
              }
               vm.$router.push({name:'calendar'});
             });
          }
        })
    },
    login: function() {
       //this.$router.push will take us to the page in the name field
       //see routes.js to see how a name is connected to a page
       this.$router.push({name:'login'});
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
