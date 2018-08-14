const {remote} = require('electron');
const BrowserWindow = remote.BrowserWindow;
const app = remote.app;
const $ = require('jquery');
const fs = require('fs');

let win = remote.getCurrentWindow();


let canDelete = false; // -> Toggle Delete Button
let canEdit = false; // -> Toggle Edit Button
let hide_weeks = false; // -> Toggle Enable/Disable changeweek panel

let data2 = {Monday:[],Tuesday:[],Wednesday:[],Thursday:[],Friday:[],Saturday:[],Sunday:[]}; // -> Set default days and write them to a json file
let readDays = {}; // -> We will read the values here from the json file, but we will delete the start_time values
let readDays_write = {}; // -> We will read the values here from the json file, but we won't delete the start_time - This object is used to display the values

let weeks = [];

let currentWeekIndex; // -> We need to save the selected week's id, because if we delete,edit or add something the default week would be loaded in the table over and over again
let clicked_id; // -> Get the clicked element's id

////////////////////////////////////////////////////////////////////////////////
/////////////////////////        CLICK EVENTS         //////////////////////////
////////////////////////////////////////////////////////////////////////////////

$('.exitBTN').on('click',()=>{ // -> Simple app exit
  app.quit();
});

$(".deleteBTN").on('click',function(){ // -> This is the function that we call if we want to toggle the delete function !NOTE: We also disable the edit function once we call this
  canDelete = !canDelete;
  if(canDelete){
    $(".lesson .deleteItem").css('display','block');
    $(".lesson .editItem").css('display','none');
    canEdit = false;
  }
  if(!canDelete){
    $(".lesson .deleteItem").css('display','none');
  }
});

$(".editBTN").on('click',function(){ // -> This is the function that we call if we want to toggle the edit function !NOTE: We also disable the delete function once we call this
  canEdit = !canEdit;
  if(canEdit){
    $(".lesson .deleteItem").css('display','none');
    $(".lesson .editItem").css('display','block');
    canDelete = false;
  }
  if(!canEdit){
    $(".lesson .editItem").css('display','none');
  }
});

$('.changeWeekBTN').on('click',()=>{ // -> Enable/Disable week panel
  hide_weeks = !hide_weeks;
  if(hide_weeks) {
    $("#weeks").css('display','block');
  } else {
    $("#weeks").css('display','none');
  }
});

$("body").on('click','#weeks li',()=>{ // -> Disable week panel
  hide_weeks = !hide_weeks;
  $("#weeks").css('display','none');
});

$("#exitOverlay").on('click',function(){
  $(".addLessonOverlay").animate({
    "opacity":"0"
  },400);

  setTimeout(function(){
    $(".addLessonOverlay").css('display','none');
  },400);
});

$(".editLessonOverlay .innerBox #exitOverlay").on('click',function(){
  $(".editLessonOverlay").animate({
    "opacity":"0"
  },400);

  setTimeout(function(){
    $(".editLessonOverlay").css('display','none');
  },400);
});

////////////////////////////////////////////////////////////////////////////////
/////////////////////////     ADD ELEMENTS TO ARRAY   //////////////////////////
////////////////////////////////////////////////////////////////////////////////
            /* This function was taken from StackOverflow */
function add(key,value){
  if(!Array.isArray(data2[key])){
    data2[key]=[data2[key]]
  }
  data2[key].push(value)
}

function add2(key,value){
  if(!Array.isArray(readDays[key])){
    readDays[key]=[readDays[key]]
  }
  readDays[key].push(value)
}

function add3(key,value){
  if(!Array.isArray(readDays_write[key])){
    readDays_write[key]=[readDays_write[key]]
  }
  readDays_write[key].push(value)
}

////////////////////////////////////////////////////////////////////////////////
///////////////////////       READ DATA FUNCTION        ////////////////////////
////////////////////////////////////////////////////////////////////////////////

function readData() {
  /* We need to reset everything */
  readDays = {};
  readDays_write = {};
  weeks = [];
  $("#weeks").empty();
  $(".innerContainer").empty();

  if(!fs.existsSync(app.getPath('userData')+'/settings.json')){
    fs.writeFile(app.getPath('userData')+'/settings.json',JSON.stringify(data2),(e)=>{
      if(e) return;
    });
  }

  fs.readFile(app.getPath('userData')+"/settings.json",'utf-8',(err,data)=>{
    let sort_times_monday = [];
    let sort_times_tuesday = [];
    let sort_times_wednesday = [];
    let sort_times_thursday = [];  // -> Save every start_time
    let sort_times_friday = [];
    let sort_times_saturday = [];
    let sort_times_sunday = [];

    readDays = JSON.parse(data); // -> Parse json string !NOTE: We'll delete the start_time values from this array
    readDays_write = JSON.parse(data); // -> Parse json string !NOTE: We won't delete the start_time values from this array

    /* Read every week from the file and save it to an array */
    for(i=0;i<Object.keys(readDays_write).length;i++){ // -> Loop through every day
      for(j=0;j<readDays_write[Object.keys(readDays_write)[i]].length;j++){ // -> Loop through every lesson
        if($.inArray(readDays_write[Object.keys(readDays_write)[i]][j].week,weeks) == -1){ // -> If the array does not contain the week yet, we'll add it
          weeks.push(readDays_write[Object.keys(readDays_write)[i]][j].week); // -> Add the week to the array
        }
      }
    }
    /* Append every type of week to the weeks panel */
    for(i=0;i<weeks.length;i++){
      $('#weeks').append('<li id="'+weeks[i]+'">'+weeks[i]+'</li>');
      $('.innerContainer').append('<div class="week" id=week'+weeks[i]+'><div class="day" id="monday"></div><div class="day" id="tuesday"></div><div class="day" id="wednesday"></div><div class="day" id="thursday"></div><div class="day" id="friday"></div><div class="day" id="saturday"></div><div class="day" id="sunday"></div></div>');
    }

    /*  Reset days to make everything clean in the HTML file */
    for(i=0;i<Object.keys(readDays).length;i++){
      $('#'+Object.keys(readDays)[i].toLowerCase()).empty();
    }

    /* We need to get the start_time values in order to sort the lessons */
    for(i=0;i<Object.keys(readDays).length;i++){
      if(Object.keys(readDays)[i] == "Monday"){
        for(j=0;j<readDays[Object.keys(readDays)[i]].length;j++){ // Loop through every day and get their start_times values - readDays[Object.keys(readDays)[i] == "MONDAY" in this case
          sort_times_monday.push(readDays[Object.keys(readDays)[i]][j].start_time);
        }
      }
      if(Object.keys(readDays)[i] == "Tuesday"){
        for(j=0;j<readDays[Object.keys(readDays)[i]].length;j++){ // Loop through every day and get their start_times values - readDays[Object.keys(readDays)[i] == "TUESDAY" in this case
          sort_times_tuesday.push(readDays[Object.keys(readDays)[i]][j].start_time);
        }
      }
      if(Object.keys(readDays)[i] == "Wednesday"){
        for(j=0;j<readDays[Object.keys(readDays)[i]].length;j++){ // Loop through every day and get their start_times values - readDays[Object.keys(readDays)[i] == "WEDNESDAY" in this case
          sort_times_wednesday.push(readDays[Object.keys(readDays)[i]][j].start_time);
        }
      }
      if(Object.keys(readDays)[i] == "Thursday"){
        for(j=0;j<readDays[Object.keys(readDays)[i]].length;j++){ // Loop through every day and get their start_times values - readDays[Object.keys(readDays)[i] == "THURSDAY" in this case
          sort_times_thursday.push(readDays[Object.keys(readDays)[i]][j].start_time);
        }
      }
      if(Object.keys(readDays)[i] == "Friday"){
        for(j=0;j<readDays[Object.keys(readDays)[i]].length;j++){ // Loop through every day and get their start_times values - readDays[Object.keys(readDays)[i] == "FRIDAY" in this case
          sort_times_friday.push(readDays[Object.keys(readDays)[i]][j].start_time);
        }
      }
      if(Object.keys(readDays)[i] == "Saturday"){
        for(j=0;j<readDays[Object.keys(readDays)[i]].length;j++){  // Loop through every day and get their start_times values - readDays[Object.keys(readDays)[i] == "SATURDAY" in this case
          sort_times_saturday.push(readDays[Object.keys(readDays)[i]][j].start_time);
        }
      }
      if(Object.keys(readDays)[i] == "Sunday"){
        for(j=0;j<readDays[Object.keys(readDays)[i]].length;j++){  // Loop through every day and get their start_times values - readDays[Object.keys(readDays)[i] == "SUNDAY" in this case
          sort_times_sunday.push(readDays[Object.keys(readDays)[i]][j].start_time);
        }
      }
    }
    /* Sort every array */
    sort_times_monday.sort(CustomSort);
    sort_times_tuesday.sort(CustomSort);
    sort_times_wednesday.sort(CustomSort);
    sort_times_thursday.sort(CustomSort);
    sort_times_friday.sort(CustomSort);
    sort_times_saturday.sort(CustomSort);
    sort_times_sunday.sort(CustomSort);

    function CustomSort(a, b) {
      let split = a.split(':');
      let split2 = b.split(':');
      if(split[0] != split2[0]){
          return (split[0] - split2[0]);
      }
      else{
          return (split[1].localeCompare(split2[1]));
      }
    }

    /* Append every lesson (Same with every day)*/
    for(i=0;i<sort_times_monday.length;i++){ // -> Loop through sort_times_monday
      for(k=0;k<readDays["Monday"].length;k++){ // -> Loop through monday's lessons
        if(sort_times_monday[i] == readDays["Monday"][k].start_time){
          for(j=0;j<weeks.length;j++){ // -> Append the lesson to the perfect week, if week == A, then we'll append the lesson to week A
            if(weeks[j] == readDays["Monday"][k].week){
              $('#week'+weeks[j]+' #monday').append('<div class="lesson" style="background:'+readDays['Monday'][k].bgColor+'"><i id="Monday-'+k+'" class="material-icons deleteItem">delete_forever</i><i id="Monday-'+k+'" class="material-icons editItem">create</i><p id="time">'+readDays['Monday'][k].start_time+'-'+readDays['Monday'][k].finish_time+'</p><p id="className">'+readDays['Monday'][k].lesson_name+'</p><p id="teacherName">'+readDays['Monday'][k].teacher_name+'</p><p id="classRoom">'+readDays['Monday'][k].class_room+'</p></div>');
              delete readDays['Monday'][k].start_time; // -> We have to delete start_time from the array, because this condition -> !sort_times_monday[i] == readDays["Monday"][k].start_time! -> would always happen
              break;
            }
          }
        }
      }
    }
    for(i=0;i<sort_times_tuesday.length;i++){
      for(k=0;k<readDays["Tuesday"].length;k++){
        if(sort_times_tuesday[i] == readDays["Tuesday"][k].start_time){
            for(j=0;j<weeks.length;j++){
              if(weeks[j] == readDays["Tuesday"][k].week){
                $('#week'+weeks[j]+' #tuesday').append('<div class="lesson" style="background:'+readDays['Tuesday'][k].bgColor+'"><i id="Tuesday-'+k+'" class="material-icons deleteItem">delete_forever</i><i id="Tuesday-'+k+'" class="material-icons editItem">create</i><p id="time">'+readDays['Tuesday'][k].start_time+'-'+readDays['Tuesday'][k].finish_time+'</p><p id="className">'+readDays['Tuesday'][k].lesson_name+'</p><p id="teacherName">'+readDays['Tuesday'][k].teacher_name+'</p><p id="classRoom">'+readDays['Tuesday'][k].class_room+'</p></div>');
                delete readDays['Tuesday'][k].start_time;
                break;
              }
            }
        }
      }
    }
    for(i=0;i<sort_times_wednesday.length;i++){
      for(k=0;k<readDays["Wednesday"].length;k++){
        if(sort_times_wednesday[i] == readDays["Wednesday"][k].start_time){
          for(j=0;j<weeks.length;j++){
            if(weeks[j] == readDays["Wednesday"][k].week){
              $('#week'+weeks[j]+' #wednesday').append('<div class="lesson" style="background:'+readDays['Wednesday'][k].bgColor+'"><i id="Wednesday-'+k+'" class="material-icons deleteItem">delete_forever</i><i id="Wednesday-'+k+'" class="material-icons editItem">create</i><p id="time">'+readDays['Wednesday'][k].start_time+'-'+readDays['Wednesday'][k].finish_time+'</p><p id="className">'+readDays['Wednesday'][k].lesson_name+'</p><p id="teacherName">'+readDays['Wednesday'][k].teacher_name+'</p><p id="classRoom">'+readDays['Wednesday'][k].class_room+'</p></div>');
              delete readDays['Wednesday'][k].start_time;
              break;
            }
          }
        }
      }
    }
    for(i=0;i<sort_times_thursday.length;i++){
      for(k=0;k<readDays["Thursday"].length;k++){
        if(sort_times_thursday[i] == readDays["Thursday"][k].start_time){
          for(j=0;j<weeks.length;j++){
            if(weeks[j] == readDays["Thursday"][k].week){
              $('#week'+weeks[j]+' #thursday').append('<div class="lesson" style="background:'+readDays['Thursday'][k].bgColor+'"><i id="Thursday-'+k+'" class="material-icons deleteItem">delete_forever</i><i id="Thursday-'+k+'" class="material-icons editItem">create</i><p id="time">'+readDays['Thursday'][k].start_time+'-'+readDays['Thursday'][k].finish_time+'</p><p id="className">'+readDays['Thursday'][k].lesson_name+'</p><p id="teacherName">'+readDays['Thursday'][k].teacher_name+'</p><p id="classRoom">'+readDays['Thursday'][k].class_room+'</p></div>');
              delete readDays['Thursday'][k].start_time;
              break;
            }
          }
        }
      }
    }
    for(i=0;i<sort_times_friday.length;i++){
      for(k=0;k<readDays["Friday"].length;k++){
        if(sort_times_friday[i] == readDays["Friday"][k].start_time){
          for(j=0;j<weeks.length;j++){
            if(weeks[j] == readDays["Friday"][k].week){
              $('#week'+weeks[j]+' #friday').append('<div class="lesson" style="background:'+readDays['Friday'][k].bgColor+'"><i id="Friday-'+k+'" class="material-icons deleteItem">delete_forever</i><i id="Friday-'+k+'" class="material-icons editItem">create</i><p id="time">'+readDays['Friday'][k].start_time+'-'+readDays['Friday'][k].finish_time+'</p><p id="className">'+readDays['Friday'][k].lesson_name+'</p><p id="teacherName">'+readDays['Friday'][k].teacher_name+'</p><p id="classRoom">'+readDays['Friday'][k].class_room+'</p></div>');
              delete readDays['Friday'][k].start_time;
              break;
            }
          }
        }
      }
    }
    for(i=0;i<sort_times_saturday.length;i++){
      for(k=0;k<readDays["Saturday"].length;k++){
        if(sort_times_saturday[i] == readDays["Saturday"][k].start_time){
          for(j=0;j<weeks.length;j++){
            if(weeks[j] == readDays["Saturday"][k].week){
              $('#week'+weeks[j]+' #saturday').append('<div class="lesson" style="background:'+readDays['Saturday'][k].bgColor+'"><i id="Saturday-'+k+'" class="material-icons deleteItem">delete_forever</i><i id="Saturday-'+k+'" class="material-icons editItem">create</i><p id="time">'+readDays['Saturday'][k].start_time+'-'+readDays['Saturday'][k].finish_time+'</p><p id="className">'+readDays['Saturday'][k].lesson_name+'</p><p id="teacherName">'+readDays['Saturday'][k].teacher_name+'</p><p id="classRoom">'+readDays['Saturday'][k].class_room+'</p></div>');
              delete readDays['Saturday'][k].start_time;
              break;
            }
          }
        }
      }
    }
    for(i=0;i<sort_times_sunday.length;i++){
      for(k=0;k<readDays["Sunday"].length;k++){
        if(sort_times_sunday[i] == readDays["Sunday"][k].start_time){
          for(j=0;j<weeks.length;j++){
            if(weeks[j] == readDays["Sunday"][k].week){
              $('#week'+weeks[j]+' #sunday').append('<div class="lesson" style="background:'+readDays['Sunday'][k].bgColor+'"><i id="Sunday-'+k+'" class="material-icons deleteItem">delete_forever</i><i id="Sunday-'+k+'" class="material-icons editItem">create</i><p id="time">'+readDays['Sunday'][k].start_time+'-'+readDays['Sunday'][k].finish_time+'</p><p id="className">'+readDays['Sunday'][k].lesson_name+'</p><p id="teacherName">'+readDays['Sunday'][k].teacher_name+'</p><p id="classRoom">'+readDays['Sunday'][k].class_room+'</p></div>');
              delete readDays['Sunday'][k].start_time;
              break;
            }
          }
        }
      }
    }
    /* End of Append */

    /* Set selected week */
    for(i=0;i<weeks.length;i++){
      $('#week'+weeks[i]).css('display','none');
    }
    if(currentWeekIndex == null) { // -> Load default week
      $('#week'+weeks[0]).css('display','block');
      if(weeks[0] == null) {
        $(".selectedWeek p").text("No lessons to load").css('font-size','12px');
      } else {
        $(".selectedWeek p").text("Week " + weeks[0]).css('font-size','16px');
      }
    } else {
      $('#week'+currentWeekIndex).css('display','block');
      $(".selectedWeek p").text("Week " + currentWeekIndex).css('font-size','16px');
    }

  });
}

$(document).ready(function(){
  readData(); // -> Call readData()
})

////////////////////////////////////////////////////////////////////////////////
/////////////////////////       ADD NEW LESSON        //////////////////////////
////////////////////////////////////////////////////////////////////////////////

$('.addBTN').on('click',()=>{
  $('.addLessonOverlay').css('display','block');
  $('.addLessonOverlay').animate({
    "opacity":"1"
  },400);
});

$(".addNewLesson").on('click',()=>{

  let start_time_h;
  let start_time_mm;
  let finish_time_h;
  let finish_time_mm;
  let lesson_name;
  let teacher_name;
  let class_room;
  let week;
  let day;
  let bgColor;

  let allow_start_time_h = true;
  let allow_start_time_mm = true;
  let allow_finish_time_h = true;
  let allow_finish_time_mm = true;
  let allow_lesson_name = true;
  let allow_teacher_name = true;
  let allow_class_room = true;
  let allow_week = true;
  let allow_day = true;

  if($("#start_time_h").val() == null) {
    $("#start_time_h").css('border','1px solid #DB2B39');
    allow_start_time_h = false;
  } else {
    start_time_h = $('#start_time_h').val();
    allow_start_time_h = true;
  }
  if($("#start_time_mm").val() == null) {
    $("#start_time_mm").css('border','1px solid #DB2B39');
    allow_start_time_mm = false;
  } else {
    start_time_mm = $('#start_time_mm').val();
    allow_start_time_mm = true;
  }
  if($("#finish_time_h").val() == null) {
    $("#finish_time_h").css('border','1px solid #DB2B39');
    allow_finish_time_h = false;
  } else {
    finish_time_h = $('#finish_time_h').val();
    allow_finish_time_h = true;
  }
  if($("#finish_time_mm").val() == null) {
    $("#finish_time_mm").css('border','1px solid #DB2B39');
    allow_finish_time_mm = false;
  } else {
    finish_time_mm = $('#finish_time_mm').val();
    allow_finish_time_mm = true;
  }
  if($("#lesson_name").val() == "") {
    $("#lesson_name").css('border','1px solid #DB2B39');
    allow_lesson_name = false;
  } else {
    lesson_name = $('#lesson_name').val();
    allow_lesson_name = true;
  }
  if($("#teacher_name").val() == "") {
    $("#teacher_name").css('border','1px solid #DB2B39');
    allow_teacher_name = false;
  } else {
    teacher_name = $('#teacher_name').val();
    allow_teacher_name = true;
  }
  if($("#class_room").val() == "") {
    $("#class_room").css('border','1px solid #DB2B39');
    allow_class_room = false;
  } else {
    class_room = $('#class_room').val();
    allow_class_room = true;
  }
  if($("#week").val() == "") {
    $("#week").css('border','1px solid #DB2B39');
    allow_week = false;
  } else {
    week = $('#week').val();
    allow_week = true;
  }
  if($("#day").val() == null) {
    $("#day").css('border','1px solid #DB2B39');
    allow_day = false;
  } else {
    day = $('#day').val();
    allow_day = true;
  }
  if($("#bgColor").val() == "") {
    bgColor = "#09BC8A";
  }

  $("#start_time_h").focus(function(){
    $(this).css('border','none');
  });
  $("#start_time_mm").focus(function(){
    $(this).css('border','none');
  });
  $("#finish_time_h").focus(function(){
    $(this).css('border','none');
  });
  $("#finish_time_mm").focus(function(){
    $(this).css('border','none');
  });
  $("#lesson_name").focus(function(){
    $(this).css('border','none');
  });
  $("#teacher_name").focus(function(){
    $(this).css('border','none');
  });
  $("#class_room").focus(function(){
    $(this).css('border','none');
  });
  $("#week").focus(function(){
    $(this).css('border','none');
  });
  $("#day").focus(function(){
    $(this).css('border','none');
  });
  $("#bgColor").focus(function(){
    $(this).css('border','none');
  });

  // let start_time_h = $('#start_time_h').val();
  // let start_time_mm = $('#start_time_mm').val();
  // let finish_time_h = $('#finish_time_h').val();
  // let finish_time_mm = $('#finish_time_mm').val();
  // let lesson_name = $('#lesson_name').val();
  // let teacher_name = $('#teacher_name').val();
  // let class_room = $('#class_room').val();
  // let week = $('#week').val();
  // let day = $('#day').val();
  // let bgColor = $('#bgColor').val();

  if(!allow_start_time_h || !allow_start_time_mm || !allow_finish_time_h || !allow_finish_time_mm || !allow_lesson_name || !allow_teacher_name || !allow_class_room || !allow_week || !allow_day) {
    return;
  }

  let start_time = start_time_h + ':' + start_time_mm;
  let finish_time = finish_time_h + ':' + finish_time_mm;

  let new_obj = {start_time:start_time,finish_time:finish_time,lesson_name:lesson_name,teacher_name:teacher_name,class_room:class_room,week:week,bgColor:bgColor}; // -> We will add this value to the json object

  add3(day,new_obj); // -> Add values

  fs.writeFile(app.getPath('userData')+'/settings.json',JSON.stringify(readDays_write),(error)=>{ // -> Save values
    if(error) return;
  });

  $('#start_time_h').val("1");
  $('#start_time_mm').val("00");
  $('#finish_time_h').val("1");
  $('#finish_time_mm').val("00");
  $('#lesson_name').val("");
  $('#teacher_name').val("");
  $('#class_room').val("");
  $('#week').val("");
  $('#day').val("Day");
  $('#bgColor').val("");

  $(".addLessonOverlay").animate({
    "opacity":"0"
  },400);

  setTimeout(function(){
    $(".addLessonOverlay").css('display','none');
  },400);

  readData(); // -> Refresh table
});

////////////////////////////////////////////////////////////////////////////////
/////////////////////////        CHANGE WEEK          //////////////////////////
////////////////////////////////////////////////////////////////////////////////

$("body").on('click','#weeks li',(event)=>{
  var weekID = event.target.id;

  for(i=0;i<weeks.length;i++){
    $('#week'+weeks[i]).css('display','none');
  }

  $("#week"+weekID).css('display','block');
  $(".selectedWeek p").text("Week " + weekID).css('font-size','16px');
  currentWeekIndex = weekID;
});

////////////////////////////////////////////////////////////////////////////////
/////////////////////////        EDIT LESSON          //////////////////////////
////////////////////////////////////////////////////////////////////////////////

$('body').on('click','.editItem',(event)=>{
  $(".editLessonOverlay").css('display','block');
  $(".editLessonOverlay").animate({
    "opacity":"1"
  },400);

  clicked_id = event.target.id.split('-'); // -> Split id to get the day and lesson id

  let start_time = readDays_write[clicked_id[0]][clicked_id[1]].start_time;
  let start_time_splitted = start_time.split(":");
  let start_time_h = start_time_splitted[0];
  let start_time_mm = start_time_splitted[1];

  let finish_time = readDays_write[clicked_id[0]][clicked_id[1]].finish_time;
  let finish_time_splitted = finish_time.split(":");
  let finish_time_h = finish_time_splitted[0];
  let finish_time_mm = finish_time_splitted[1];

  $(".editLessonOverlay .innerBox #start_time_h").val(start_time_h);
  $(".editLessonOverlay .innerBox #start_time_mm").val(start_time_mm);
  $(".editLessonOverlay .innerBox #finish_time_h").val(finish_time_h);
  $(".editLessonOverlay .innerBox #finish_time_mm").val(finish_time_mm);
  $(".editLessonOverlay .innerBox #lesson_name").val(readDays_write[clicked_id[0]][clicked_id[1]].lesson_name);
  $(".editLessonOverlay .innerBox #teacher_name").val(readDays_write[clicked_id[0]][clicked_id[1]].teacher_name);
  $(".editLessonOverlay .innerBox #class_room").val(readDays_write[clicked_id[0]][clicked_id[1]].class_room);
  $(".editLessonOverlay .innerBox #week").val(readDays_write[clicked_id[0]][clicked_id[1]].week);
  $(".editLessonOverlay .innerBox #day").val(readDays_write[clicked_id[0]][clicked_id[1]].day);
  $(".editLessonOverlay .innerBox #bgColor").val(readDays_write[clicked_id[0]][clicked_id[1]].bgColor);
});

$(".editLesson").on('click','',function(event){

  let start_time_h = $('.editLessonOverlay .innerBox #start_time_h').val();
  let start_time_mm = $('.editLessonOverlay .innerBox #start_time_mm').val();
  let finish_time_h = $('.editLessonOverlay .innerBox #finish_time_h').val();
  let finish_time_mm = $('.editLessonOverlay .innerBox #finish_time_mm').val();
  let lesson_name = $('.editLessonOverlay .innerBox #lesson_name').val();
  let teacher_name = $('.editLessonOverlay .innerBox #teacher_name').val();
  let class_room = $('.editLessonOverlay .innerBox #class_room').val();
  let week = $('.editLessonOverlay .innerBox #week').val();
  let day = $('.editLessonOverlay .innerBox #day').val();
  let bgColor = $('.editLessonOverlay .innerBox #bgColor').val();

  let start_time = start_time_h + ':' + start_time_mm;
  let finish_time = finish_time_h + ':' + finish_time_mm;

  readDays_write[clicked_id[0]][clicked_id[1]].start_time = start_time;
  readDays_write[clicked_id[0]][clicked_id[1]].finish_time = finish_time;
  readDays_write[clicked_id[0]][clicked_id[1]].lesson_name = lesson_name;
  readDays_write[clicked_id[0]][clicked_id[1]].teacher_name = teacher_name;
  readDays_write[clicked_id[0]][clicked_id[1]].class_room = class_room;
  readDays_write[clicked_id[0]][clicked_id[1]].week = week;
  readDays_write[clicked_id[0]][clicked_id[1]].bgColor = bgColor;

  fs.writeFile(app.getPath('userData')+'/settings.json',JSON.stringify(readDays_write),(error)=>{
    if(error) return;
  });

  $(".editLessonOverlay").animate({
    "opacity":"0"
  },400);

  setTimeout(function(){
    $(".editLessonOverlay").css('display','none');
  },400);

  readData();
});

////////////////////////////////////////////////////////////////////////////////
/////////////////////////       DELETE LESSON        ///////////////////////////
////////////////////////////////////////////////////////////////////////////////

$('body').on('click','.deleteItem',(event)=>{
  let clicked_id = event.target.id.split('-');
  delete readDays_write[clicked_id[0]][parseInt(clicked_id[1])];
    readDays_write[clicked_id[0]].copyWithin(parseInt(clicked_id[1]),parseInt(clicked_id[1])+1,readDays_write[clicked_id[0]].length);
    readDays_write[clicked_id[0]].pop();

  fs.writeFile(app.getPath('userData')+'/settings.json',JSON.stringify(readDays_write),(err)=>{
    if(err) return;
  });
  fs.readFile(app.getPath('userData')+'/settings.json','utf-8',(err,data)=>{
    if(err) return;
  });

  readData();
});
