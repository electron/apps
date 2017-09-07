<template>

  <!-- ************ @event-created="eventCreated" -->
  <div id="calendar"  :navL="navLinks" :event-sources="eventSources" :config="config" >
    <div class="container" id="calendarContainer">
      <div class="textC">
        {{nameDisplay}}
      </div>
      <!--"removeDialog" will appear whenever user clicks on a event they would like to remove-->
      <dialog id="removeDialog">
        <section>
          <h5 v-for= "source in eventInfo" v-if="eventNotNull">{{source.activity+" with Patient: "+source.pfirst+" "+source.plast}}</h5>
          <h5 v-for= "source in eventInfo" v-if="eventNotNull2">{{source.activity}}</h5>
          <h5 v-for= "source in eventInfo" v-if="ifnotadmin">{{source.activity+" with Dr. "+source.dlast+" at "+source.start}}</h5>
          <button @click="removeEvent">Remove</button>
          <button @click="cancel('removeDialog')">OK</button>
        </section>
      </dialog>
      <!-- "favDialog1" appears when a patient clicks a button to choose a doctor-->
      <dialog id="favDialog1">
        <section>
        <h3>Choose a Doctor</h3>
          <table class="mytable">
            <thead>
              <tr style="text-align:center" id="hrow" v-on:click="">
                <th style="text-align:center">First</th>
                <th style="text-align:center;padding-left:20px;">Last</th>
                <th style="text-align:center; padding-left:20px;">City</th>
                <th style="text-align:center; padding-left:20px;">Specialty</th>
              </tr>
            </thead>
            <tbody v-for="source in doctors">
              <tr id="mrowDoc" v-on:click="selectDoc(source)">
                <td  style="text-align:center;"scope="row">{{source.first}}</td>
                <td  style="text-align:center; padding-left:20px;" scope="row">{{source.last}}</td>
                <td  style="text-align:center; padding-left:20px;" scope="row">{{source.city}}</td>
                <td  style="text-align:center; padding-left:20px;" scope="row">{{source.specialty}}</td>
              </tr>
            </tbody>
            <button v-on:click="cancel('favDialog1')">Cancel</button>
          </table>
        </section>
      </dialog>

      <!--"requestDialog" appears when the doctor clicks button to view patient requests-->
      <dialog id="requestDialog">
        <section>
        <h3 style="text-align:center">Patient Requests</h3>
          <table class="mytable">
            <thead>
              <tr style="text-align:center" id="hrow" v-on:click="">
                <th style="text-align:center">Patient Name</th>
                <th style="text-align:center;padding-left:20px;">Operation</th>
                <th style="text-align:center; padding-left:20px;">Day</th>
                <th style="text-align:center; padding-left:20px;">Start</th>
                <th style="text-align:center; padding-left:20px;">End</th>
                <th style="text-align:center; padding-left:20px;">Accept</th>
                <th style="text-align:center; padding-left:20px;">Reject</th>
              </tr>
            </thead>
            <tbody v-for="source in requests">
              <tr id="mrowDocRequest" >
                <td  style="text-align:center;"scope="row">{{source.first +" "+source.last}}</td>
                <td  style="text-align:center; padding-left:20px;" scope="row">{{source.activity}}</td>
                <td  style="text-align:center; padding-left:20px;" scope="row">{{source.yearmonthday}}</td>
                <td  style="text-align:center; padding-left:20px;" scope="row">{{source.stime}}</td>
                <td  style="text-align:center; padding-left:20px;" scope="row">{{source.etime}}</td>
                <td  style="text-align:center; padding-left:20px;" scope="row">
                  <button>
                    <i class="glyphicon glyphicon-ok" v-on:click="requestAccepted(source)"></i>
                  </button>
                </td>
                <td  style="text-align:center; padding-left:20px;" scope="row">
                  <button>
                    <i class="glyphicon glyphicon-remove" v-on:click="requestDenied(source)"></i>
                  </button>
                </td>
              </tr>
            </tbody>
            <button v-on:click="cancel('requestDialog')">Cancel</button>
          </table>
        </section>
      </dialog>

      <!--"favDialog" is a warning that appears when doctor submits an event and there is a conflicting event-->
      <dialog id="favDialog" class="conflictD">
        <section>
        <h1>Your activity is in conflict with prior activities do you wish to proceed?</h1>
          <table class="mytable">
            <thead>
              <tr id="hrow" v-on:click="">
                <th style="text-align:center">Activity</th>
                <th style="text-align:center">Start</th>
                <th style="text-align:center; padding-left:20px;">End</th>
              </tr>
            </thead>
            <tbody v-for="source in response">
              <tr id="mrow" >
                <td  style="text-align:center"scope="row">{{source.activity}}</td>
                <td  style="text-align:center" scope="row">{{source.start}}</td>
                <td  style="text-align:center; padding-left:20px;" scope="row">{{source.end1}}</td>
              </tr>
            </tbody>
            <button v-on:click="proceed">Proceed</button>
            <button v-on:click="cancel('favDialog')">Cancel</button>
          </table>
        </section>
      </dialog>

      <!--"requestConflicts" will appear if a Doctor attempts to accept a request that conflicts with a prior event-->
      <dialog id="requestConflicts" class="conflictD">
        <section>
          <h1>Your Activity is in conflict with prior activities do you wish to proceed?</h1>
          <table class="mytable">
            <thead>
              <tr id="hrow" v-on:click="">
                <th style="text-align:center">Activity</th>
                <th style="text-align:center">Start</th>
                <th style="text-align:center; padding-left:20px;">End</th>
              </tr>
            </thead>
            <tbody v-for="source in response">
              <tr id="mrow" >
                <td  style="text-align:center"scope="row">{{source.activity}}</td>
                <td  style="text-align:center" scope="row">{{source.start}}</td>
                <td  style="text-align:center; padding-left:20px;" scope="row">{{source.end1}}</td>
              </tr>
            </tbody>
            <button v-on:click="proceedRequests">Proceed</button>
            <button v-on:click="cancel('requestConflicts')">Cancel</button>
          </table>
        </section>
      </dialog>

      <!--when user clicks button to view updates this dialog will appear-->
      <dialog id="updatesDialog">
        <section>
          <h3>Recent Updates</h3>
          <table class="mytable">
            <tbody v-for="source in updates">
              <tr id="mrow" >
                <td  style="text-align:left"scope="row">{{source.activity+" "+"with Dr. "+source.dlast+" has been "+source.update}}</td>
              </tr>
            </tbody>
            <button v-on:click="clearUpdates">Clear</button>
            <button v-on:click="cancel('updatesDialog')">Exit</button>
          </table>
        </section>
      </dialog>

      <!-- information from "createEvent" is used to create event-->
      <div id="createEvent" v-if="ifadmin">
        <div id="activityAndYear">
          <label for="example-search-input" class="col-2 col-form-label" style="margin-left:10px">Title</label>
          <div class="col-2">
            <input  style="width:160px; color:blue;"v-model="activity" class="form-control" type="text" name="activity" placeholder="Title"enctype="application/json">
          </div>
          <div id="year/month/day">
            <select class="custom-select" v-model="year">
              <option value="2017">2017</option>
              <option value="2018">2018</option>
              <option value="2019">2019</option>
              <option value="2020">2020</option>
              <option value="2021">2021</option>
            </select>
            <select v-model="month">
              <option value="01">Jan</option>
              <option value="02">Feb</option>
              <option value="03">Mar</option>
              <option value="04">Apr</option>
              <option value="05">May</option>
              <option value="06">Jun</option>
              <option value="07">Jul</option>
              <option value="08">Aug</option>
              <option value="09">Sep</option>
              <option value="10">Oct</option>
              <option value="11">Nov</option>
              <option value="12">Dec</option>
            </select>
            <select v-model="day">
              <option value="01">1</option>
              <option value="02">2</option>
              <option value="03">3</option>
              <option value="04">4</option>
              <option value="05">5</option>
              <option value="06">6</option>
              <option value="07">7</option>
              <option value="08">8</option>
              <option value="09">9</option>
              <option value="10">10</option>
              <option value="11">11</option>
              <option value="12">12</option>
              <option value="13">13</option>
              <option value="14">14</option>
              <option value="15">15</option>
              <option value="16">16</option>
              <option value="17">17</option>
              <option value="18">18</option>
              <option value="19">19</option>
              <option value="20">20</option>
              <option value="21">21</option>
              <option value="22">22</option>
              <option value="23">23</option>
              <option value="24">24</option>
              <option value="25">25</option>
              <option value="26">26</option>
              <option value="27">27</option>
              <option value="28">28</option>
              <option value="29">29</option>
              <option value="30">30</option>
              <option value="31">31</option>
            </select>
          </div>
        </div>
        <div id="start">
          <label for="example-search-input" class="col-2 col-form-label">Start Time</label>
          <div class="col-2">
            <input  style="width:80px; color:blue;"v-model="Stime" class="form-control" type="text" name="operation" placeholder="12:00"enctype="application/json">
            <select v-model="sAMPM">
              <option value="AM">AM</option>
              <option value="PM">PM</option>
            </select>
          </div>
        </div>
        <div id="end">
          <label for="example-search-input" class="col-2 col-form-label">End Time</label>
          <div class="col-2">
            <input  style="width:80px; color:blue;"v-model="Etime" class="form-control" type="text" name="operation" placeholder="12:00" enctype="application/json">
            <select v-model="eAMPM">
              <option value="AM">AM</option>
              <option value="PM">PM</option>
            </select>
          </div>
        </div>

        <!-- "calSubBtn" submits create event data to DB-->
        <button id="calSubBtn" v-if="ifadminOnly"  class="btn btn-secondary docbtns" v-on:click="submit()">
          Submit
        </button>
        <!-- "caReqBtn" submits request of a patient to a doctor into the DB-->
        <button id="caReqBtn"   class="btn btn-secondary docbtns" v-on:click="request()" v-if="selectDoctor">
          Submit Request
        </button>
        <!--See Requests button shows the requestDialog-->
        <button   class="btn btn-secondary docbtns reqViewBtn" v-on:click="showRequests()" v-if="ifadminOnly">
          See Requests
        </button>
        <!-- See your appointments button takes patient back to their own calendar-->
        <button   class="btn btn-secondary docbtns reqViewBtn" v-on:click="seeAppointments" v-if="selectDoctor">
          See Your appointments
        </button>
        <!-- "colorSelect" contains options for event color-->
        <div id="colorSelect" class="col-2">
          <select v-model="c">
            <option value="00bbf9">Blue</option>
            <option value="F9CF00">Yellow</option>
            <option value="3CC47C">Green</option>
            <option value="F53240">Red</option>
            <option value="E37222">Orange</option>
          </select>
        </div>
      </div>
      <!--Select Doctor button will pop up a dialog from which user can click on row to view that doctors schedule-->
      <button v-if="viewApps" class="btn btn-secondary docbtns" v-on:click="show" >Select Doctor</button>
      <!--See Updates button will pop up the updates dialog which will show patient whether their appointment has been
      accepted,rejected, or cancelled -->
      <button v-if="viewApps" class="btn btn-secondary docbtns" v-on:click="showUpdates" >See Updates</button>
    </div>

    <!-- logout button returns the user to the login screen-->
    <button id="calLogout"class="btn btn-secondary docbtns" v-on:click="logout()">
      Logout
    </button>
    <!-- full-calendar componenet-->
    <full-calendar id="target" ref="calendar" :event-sources="eventSources"  @day-click="click" :config="config"></full-calendar>
  </div>
</template>

<script>
import moment from 'moment';
const self = this;
export default {
  name: 'calendar',
  data() {
    return {
    //eventSources used to fetch events from server
     eventSources: [
      {
        url: 'http://localhost:3000/getAppointments',
        type: 'GET',
        data: {
        //id field is neeeded so that we fetch the events of the correct user from server
        id: this.$store.getters.user,
        },
        error: function() {
          alert('there was an error while fetching events!');
        },
      }
    ],
      navLinks: true,
      config: {
        eventClick: (event) => {
          this.$http.get('http://localhost:3000/getOperation?pkid='+event.id)
          //getOperation will return us information regarding the event we clicked on
            .then(response => {
                 //update eventInfo with the clicked events data
                 this.eventInfo = response.body;
                 var i=0;
                 while(i<response.body.length){
                   this.eventInfo[i].start= this.convert(response.body[i].start);
                   i++;
                 }
            });
          //if the user = the docId, or docId has been set to 0 then we show removeDialog
          //because of admin priveledges
          if(this.$store.getters.user == this.$store.getters.docId || this.$store.getters.docId==0 ){
            this.showM('removeDialog');
          }
          this.selected = event;
        },
        //navLinks allows used to click on links to days weeks etc
        navLinks: true,
        editable: false,
        displayEventTime: false
      },
      selected: {},
      val: [],
      id: this.$store.getters.user,
      admin: this.$store.getters.admin,
      docid: this.$store.getters.docId,
      //************************these variables below are all from time_converter
      yearmonthday: "",
      year: "2017",
      month: "01",
      day: '01',
      eAMPM: 'AM',
      sAMPM: 'AM',
      Stime: '',
      Etime: '',
      sharedvalue: '',
      user_operations: [],
      user_operation: '',
      c: '00bbf9',
      activity: '',
      response: '',
      doctors:'',
      auto_insert: "NO",
      rtest: '',
      ownPage: false,
      nameDisplay: '',
      requests: '',
      requestOverwrite: '',
      updates: '',
      eventInfo: '',
    };
  },

  methods: {
    clearUpdates: function(){
      this.$http.post('http://localhost:3000/clearR?user='+this.$store.getters.user)
      this.cancel('updatesDialog');
    },
    showUpdates:function(){
      var userid = this.$store.getters.user;
      this.$http.get('http://localhost:3000/showUpdates?user='+userid)
      .then(response => {
           this.updates = response.body;
       });
      this.showM('updatesDialog');
    },
    seeAppointments: function() {
      var user = this.$store.getters.user;
      this.nameDisplay = ""
      this.$http.post('http://localhost:3000/whichDoc?user='+user+'&docId='+user)
        .then(response => {
             this.ownPage = false;
             this.$store.commit('docId', 0);
             this.$refs.calendar.fireMethod('refetchEvents');
      });
    },
    selectDoc: function(s){
      this.$store.commit('docId', s.id);
      var docId = this.$store.getters.docId;
      var user = this.$store.getters.user
        this.$http.post('http://localhost:3000/whichDoc?user='+user+'&docId='+docId)
          .then(response => {
               this.ownPage = true;
               this.nameDisplay = "Request appointment with Dr. "+ response.data[0].last;
               this.$refs.calendar.fireMethod('refetchEvents');
          });
      var favDialog = document.getElementById('favDialog1');
      favDialog.close();
    },
    //show shows available doctors
    show: function(){
      this.$http.get('http://localhost:3000/getDocs?admin='+"admin")
        .then(response => {
          this.doctors = response.body;
        });
      this.showM('favDialog1');
    },
    showRequests: function(){
        var userid = this.$store.getters.user;
      this.$http.get('http://localhost:3000/getRequests?docid='+userid+'&show='+'show')
        .then(response => {
            this.requests = this.timeConversion(response.body, this.requests)
        });
      this.showM('requestDialog');
    },
    removeEvent() {
      this.$http.get('http://localhost:3000/removeAppointments?id='+this.selected.id+'&admin='+this.admin);
      this.$refs.calendar.$emit('remove-event', this.selected);
      this.selected = {};
      this.cancel('removeDialog');
    },
  click: function(date, jsEvent, view) {
  },

    request: function(){
         var y = this.year+"-"+this.month+"-"+this.day;
         this.yearmonthday = y;
         var docid = this.$store.getters.docId;
         this.$http.post('http://localhost:3000/request?Stime='+this.Stime+'&Etime='+this.Etime+'&eAMPM='+this.eAMPM+'&sAMPM='+this.sAMPM+'&id='+this.id+'&activity='+this.activity+'&auto_insert='+this.auto_insert+'&yearmonthday='+this.yearmonthday+'&color1='+this.c+'&docid='+docid+'')
         this.clear();
    },
    submit: function() {
      this.$store.commit('setStoredNumber', 5);
      var y = this.year+"-"+this.month+"-"+this.day;
      this.yearmonthday = y;
      if(this.admin == "admin"){
        this.$http.post('http://localhost:3000/operation?Stime='+this.Stime+'&Etime='+this.Etime+'&eAMPM='+this.eAMPM+'&sAMPM='+this.sAMPM+'&id='+this.id+'&activity='+this.activity+'&auto_insert='+this.auto_insert+'&yearmonthday='+this.yearmonthday+'&color1='+this.c)
        .then(response => {
            this.$refs.calendar.fireMethod('refetchEvents')
            this.response = response.body;
            if(this.response!="inserted"){
              this.response = this.timeConversion(response.body, this.response);
              this.showM('favDialog');
              this.$refs.calendar.fireMethod('refetchEvents')
          }
          else{
            this.clear();  //Clear after submitted
          }
        })
      }
      else{
      }
      this.$refs.calendar.fireMethod('refetchEvents')
    },
    removeRow: function(array, item){
      var i =0;
      while(i<array.length){
        if(array[i].pkid == item.pkid){
          array.splice(i,1);
          break;
        }
        i++;
      }
      return array;
    },

    proceedRequests: function(){
      this.auto_insert = "YES";
      this.requests = this.removeRow(this.requests, this.requestOverwrite);
      this.$http.post('http://localhost:3000/requestAccepted?stime='+this.requestOverwrite.stime+'&etime='+this.requestOverwrite.etime+'&pkid='+this.requestOverwrite.pkid+'&userid='+this.requestOverwrite.userid+'&docid='+this.requestOverwrite.docid+'&yearmonthday='+this.requestOverwrite.yearmonthday+'&first='+this.requestOverwrite.first+'&last='+this.requestOverwrite.last+'&dfirst='+this.requestOverwrite.dfirst+'&dlast='+this.requestOverwrite.dlast+'&activity='+this.requestOverwrite.activity+'&auto_insert='+this.auto_insert+'&reqId='+this.requestOverwrite.pkid)
      .then(response => {
        //update request
        this.$http.post('http://localhost:3000/updateRequest?pkid='+this.requestOverwrite.pkid+'&update='+'accepted');
        this.$refs.calendar.fireMethod('refetchEvents')
        this.response = response.body;
      })
      this.auto_insert = "NO";
      this.cancel('requestConflicts')
    },
    requestAccepted: function(source){
       this.$http.post('http://localhost:3000/requestAccepted?stime='+source.stime+'&etime='+source.etime+'&pkid='+source.pkid+'&userid='+source.userid+'&docid='+source.docid+'&yearmonthday='+source.yearmonthday+'&first='+source.first+'&last='+source.last+'&dfirst='+source.dfirst+'&dlast='+source.dlast+'&activity='+source.activity+'&auto_insert='+this.auto_insert+'&reqId='+source.pkid)
      .then(response => {
        this.$refs.calendar.fireMethod('refetchEvents')
        this.response = response.body;
        if(this.response!="inserted"){
          this.response = this.timeConversion(response.body, this.response);
          this.requestOverwrite = source;
          this.showM('requestConflicts');
          this.$refs.calendar.fireMethod('refetchEvents')
        }
        else{
          this.requestOverwrite = source;
          this.requests = this.removeRow(this.requests, this.requestOverwrite);
          this.$http.post('http://localhost:3000/updateRequest?pkid='+this.requestOverwrite.pkid+'&update='+'accepted');
        }
      })
    },

    timeConversion: function(responseBody,vals){
      vals= JSON.stringify(responseBody);
      vals= JSON.parse(vals);
      responseBody = vals;
      var i=0;
      while(i<responseBody.length){
        if(responseBody[i].stime!=null){
          vals[i].stime = this.convert(responseBody[i].stime);
          vals[i].etime = this.convert(responseBody[i].etime);
        }
        else{
          vals[i].start= this.convert(responseBody[i].start);
          vals[i].end1 = this.convert(responseBody[i].end1);
        }
        i++;
      }
      return vals;
    },
    requestDenied: function(source){
      this.$http.post('http://localhost:3000/updateRequest?pkid='+source.pkid+'&update='+'denied');
      this.requests = this.removeRow(this.requests, source);
    },
    convert: function(item) {
      var ampm1 = "AM";
      var time = item.split(":");
      var hour= parseInt(time[0]);
      if(hour==12){
        ampm1 = "PM";
      }
      if(hour==0){
        hour = 12;
      }
      if(hour>12){
        ampm1 = "PM"
        hour = hour-12;
      }
      var min = parseInt(time[1]);
      if(min<10){
        min = "0"+min.toString()
      }
      time = hour+":"+min+" "+ampm1;
      return time;
    },
    clear: function(){
      this.activity = '';
      this.eAMPM= 'AM';
      this.sAMPM= 'AM';
      this.Stime= '';
      this.Etime= '';
    },
    logout: function(){
      this.$store.commit('docId', 0);
      this.$router.push({name:'login'});
    },
    cancel: function(val){
      var favDialog = document.getElementById(val);
      favDialog.close();
      this.clear();
    },
    showM: function(val){
      var favDialog = document.getElementById(val);
      favDialog.showModal();
    },
    proceed: function(){
      this.$refs.calendar.fireMethod('refetchEvents')
      this.auto_insert = "YES";
      this.$http.post('http://localhost:3000/operation?Stime='+this.Stime+'&Etime='+this.Etime+'&eAMPM='+this.eAMPM+'&sAMPM='+this.sAMPM+'&id='+this.id+'&activity='+this.activity+'&auto_insert='+this.auto_insert+'&yearmonthday='+this.yearmonthday+'&color1='+this.c)
      .then(response => {
        this.$refs.calendar.fireMethod('refetchEvents')
        this.response = response.body;
      })
      this.auto_insert = "NO";
      var favDialog = document.getElementById('favDialog');
      favDialog.close();
      this.clear();
      this.$refs.calendar.fireMethod('refetchEvents');
    },
    calendar: function(){
      this.$router.push({name:'calendar'})
    }
  },

  computed: {
    //these computed values are used to determine whether certain divs should be displayed based on whether the user is a
    //doctor, patient etc.
    ifadmin: function(){
      if(this.admin == "admin"){
        return true;
      }
      else if(this.$store.getters.docId!=0){
        return true;
      }
      return false;
    },
    ifadminOnly: function(){
      if(this.admin == "admin"){
        return true;
      }
      else if(this.$store.getters.docId == this.$store.getters.user){
        return true;
      }
      return false;
    },
    ifnotadmin: function(){
      if(this.admin != "admin"){
        return true;
      }
      return false;
    },
    selectDoctor: function(){
      if(this.admin != "admin" && this.$store.getters.docId!=this.$store.getters.user){
        return true;
      }
      return false;
    },
    viewApps: function(){
      if(this.admin != "admin" && this.$store.getters.docId==0){
        return true;
      }
      return false;
    },
    eventNotNull: function(){
      if(this.ifadminOnly){
        if(this.eventInfo[0].pfirst == null){
        return false;
        }
        return true;
      }
      return false;

    },
    eventNotNull2: function(){
      if(this.ifadminOnly){
        if(this.eventInfo[0].pfirst == null ){
        return true;
        }
        return false;
      }
      return false;

    }
  },
};
</script>
<style>
@import '~fullcalendar/dist/fullcalendar.css';
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
