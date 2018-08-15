const {remote} = require('electron')
const app = remote.app
const $ = require('jquery')
const fs = require('fs')

let canDelete = false // -> Toggle Delete Button
let canEdit = false // -> Toggle Edit Button
let hideWeeks = false // -> Toggle Enable/Disable changeweek panel

let data2 = {Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: [], Saturday: [], Sunday: []} // -> Set default days and write them to a json file
let readDays = {} // -> We will read the values here from the json file, but we will delete the start_time values
let readDaysWrite = {} // -> We will read the values here from the json file, but we won't delete the start_time - This object is used to display the values

let weeks = []

let currentWeekIndex // -> We need to save the selected week's id, because if we delete,edit or add something the default week would be loaded in the table over and over again
let clickedId // -> Get the clicked element's id

/// /////////////////////////////////////////////////////////////////////////////
/// //////////////////////        CLICK EVENTS         //////////////////////////
/// /////////////////////////////////////////////////////////////////////////////

$('.exitBTN').on('click', () => { // -> Simple app exit
  app.quit()
})

$('.deleteBTN').on('click', function () { // -> This is the function that we call if we want to toggle the delete function !NOTE: We also disable the edit function once we call this
  canDelete = !canDelete
  if (canDelete) {
    $('.lesson .deleteItem').css('display', 'block')
    $('.lesson .editItem').css('display', 'none')
    canEdit = false
  }
  if (!canDelete) {
    $('.lesson .deleteItem').css('display', 'none')
  }
})

$('.editBTN').on('click', function () { // -> This is the function that we call if we want to toggle the edit function !NOTE: We also disable the delete function once we call this
  canEdit = !canEdit
  if (canEdit) {
    $('.lesson .deleteItem').css('display', 'none')
    $('.lesson .editItem').css('display', 'block')
    canDelete = false
  }
  if (!canEdit) {
    $('.lesson .editItem').css('display', 'none')
  }
})

$('.changeWeekBTN').on('click', () => { // -> Enable/Disable week panel
  hideWeeks = !hideWeeks
  if (hideWeeks) {
    $('#weeks').css('display', 'block')
  } else {
    $('#weeks').css('display', 'none')
  }
})

$('body').on('click', '#weeks li', () => { // -> Disable week panel
  hideWeeks = !hideWeeks
  $('#weeks').css('display', 'none')
})

$('#exitOverlay').on('click', function () {
  $('.addLessonOverlay').animate({
    'opacity': '0'
  }, 400)

  setTimeout(function () {
    $('.addLessonOverlay').css('display', 'none')
  }, 400)
})

$('.editLessonOverlay .innerBox #exitOverlay').on('click', function () {
  $('.editLessonOverlay').animate({
    'opacity': '0'
  }, 400)

  setTimeout(function () {
    $('.editLessonOverlay').css('display', 'none')
  }, 400)
})

/// /////////////////////////////////////////////////////////////////////////////
/// //////////////////////     ADD ELEMENTS TO ARRAY   //////////////////////////
/// /////////////////////////////////////////////////////////////////////////////
/* This function was taken from StackOverflow */

function add3 (key, value) {
  if (!Array.isArray(readDaysWrite[key])) {
    readDaysWrite[key] = [readDaysWrite[key]]
  }
  readDaysWrite[key].push(value)
}

/// /////////////////////////////////////////////////////////////////////////////
/// ////////////////////       READ DATA FUNCTION        ////////////////////////
/// /////////////////////////////////////////////////////////////////////////////

function readData () {
  /* We need to reset everything */
  readDays = {}
  readDaysWrite = {}
  weeks = []
  $('#weeks').empty()
  $('.innerContainer').empty()

  if (!fs.existsSync(app.getPath('userData') + '/settings.json')) {
    fs.writeFile(app.getPath('userData') + '/settings.json', JSON.stringify(data2), (e) => {
    })
  }

  fs.readFile(app.getPath('userData') + '/settings.json', 'utf-8', (err, data) => {
    if (err) throw new Error('error')

    let sortTimesMonday = []
    let sortTimesTuesday = []
    let sortTimesWednesday = []
    let sortTimesThursday = [] // -> Save every start_time
    let sortTimesFriday = []
    let sortTimesSaturday = []
    let sortTimesSunday = []

    readDays = JSON.parse(data) // -> Parse json string !NOTE: We'll delete the start_time values from this array
    readDaysWrite = JSON.parse(data) // -> Parse json string !NOTE: We won't delete the start_time values from this array

    /* Read every week from the file and save it to an array */
    for (let i = 0; i < Object.keys(readDaysWrite).length; i++) { // -> Loop through every day
      for (let j = 0; j < readDaysWrite[Object.keys(readDaysWrite)[i]].length; j++) { // -> Loop through every lesson
        if ($.inArray(readDaysWrite[Object.keys(readDaysWrite)[i]][j].week, weeks) === -1) { // -> If the array does not contain the week yet, we'll add it
          weeks.push(readDaysWrite[Object.keys(readDaysWrite)[i]][j].week) // -> Add the week to the array
        }
      }
    }
    /* Append every type of week to the weeks panel */
    for (let i = 0; i < weeks.length; i++) {
      $('#weeks').append('<li id="' + weeks[i] + '">' + weeks[i] + '</li>')
      $('.innerContainer').append('<div class="week" id=week' + weeks[i] + '><div class="day" id="monday"></div><div class="day" id="tuesday"></div><div class="day" id="wednesday"></div><div class="day" id="thursday"></div><div class="day" id="friday"></div><div class="day" id="saturday"></div><div class="day" id="sunday"></div></div>')
    }

    /*  Reset days to make everything clean in the HTML file */
    for (let i = 0; i < Object.keys(readDays).length; i++) {
      $('#' + Object.keys(readDays)[i].toLowerCase()).empty()
    }

    /* We need to get the start_time values in order to sort the lessons */
    for (let i = 0; i < Object.keys(readDays).length; i++) {
      if (Object.keys(readDays)[i] === 'Monday') {
        for (let j = 0; j < readDays[Object.keys(readDays)[i]].length; j++) { // Loop through every day and get their start_times values - readDays[Object.keys(readDays)[i] == "MONDAY" in this case
          sortTimesMonday.push(readDays[Object.keys(readDays)[i]][j].start_time)
        }
      }
      if (Object.keys(readDays)[i] === 'Tuesday') {
        for (let j = 0; j < readDays[Object.keys(readDays)[i]].length; j++) { // Loop through every day and get their start_times values - readDays[Object.keys(readDays)[i] == "TUESDAY" in this case
          sortTimesTuesday.push(readDays[Object.keys(readDays)[i]][j].start_time)
        }
      }
      if (Object.keys(readDays)[i] === 'Wednesday') {
        for (let j = 0; j < readDays[Object.keys(readDays)[i]].length; j++) { // Loop through every day and get their start_times values - readDays[Object.keys(readDays)[i] == "WEDNESDAY" in this case
          sortTimesWednesday.push(readDays[Object.keys(readDays)[i]][j].start_time)
        }
      }
      if (Object.keys(readDays)[i] === 'Thursday') {
        for (let j = 0; j < readDays[Object.keys(readDays)[i]].length; j++) { // Loop through every day and get their start_times values - readDays[Object.keys(readDays)[i] == "THURSDAY" in this case
          sortTimesThursday.push(readDays[Object.keys(readDays)[i]][j].start_time)
        }
      }
      if (Object.keys(readDays)[i] === 'Friday') {
        for (let j = 0; j < readDays[Object.keys(readDays)[i]].length; j++) { // Loop through every day and get their start_times values - readDays[Object.keys(readDays)[i] == "FRIDAY" in this case
          sortTimesFriday.push(readDays[Object.keys(readDays)[i]][j].start_time)
        }
      }
      if (Object.keys(readDays)[i] === 'Saturday') {
        for (let j = 0; j < readDays[Object.keys(readDays)[i]].length; j++) { // Loop through every day and get their start_times values - readDays[Object.keys(readDays)[i] == "SATURDAY" in this case
          sortTimesSaturday.push(readDays[Object.keys(readDays)[i]][j].start_time)
        }
      }
      if (Object.keys(readDays)[i] === 'Sunday') {
        for (let j = 0; j < readDays[Object.keys(readDays)[i]].length; j++) { // Loop through every day and get their start_times values - readDays[Object.keys(readDays)[i] == "SUNDAY" in this case
          sortTimesSunday.push(readDays[Object.keys(readDays)[i]][j].start_time)
        }
      }
    }
    /* Sort every array */
    sortTimesMonday.sort(CustomSort)
    sortTimesTuesday.sort(CustomSort)
    sortTimesWednesday.sort(CustomSort)
    sortTimesThursday.sort(CustomSort)
    sortTimesFriday.sort(CustomSort)
    sortTimesSaturday.sort(CustomSort)
    sortTimesSunday.sort(CustomSort)

    function CustomSort (a, b) {
      let split = a.split(':')
      let split2 = b.split(':')
      if (split[0] !== split2[0]) {
        return (split[0] - split2[0])
      } else {
        return (split[1].localeCompare(split2[1]))
      }
    }

    /* Append every lesson (Same with every day) */
    for (let i = 0; i < sortTimesMonday.length; i++) { // -> Loop through sortTimesMonday
      for (let k = 0; k < readDays['Monday'].length; k++) { // -> Loop through monday's lessons
        if (sortTimesMonday[i] === readDays['Monday'][k].start_time) {
          for (let j = 0; j < weeks.length; j++) { // -> Append the lesson to the perfect week, if week == A, then we'll append the lesson to week A
            if (weeks[j] === readDays['Monday'][k].week) {
              $('#week' + weeks[j] + ' #monday').append('<div class="lesson" style="background:' + readDays['Monday'][k].bgColor + '"><i id="Monday-' + k + '" class="material-icons deleteItem">delete_forever</i><i id="Monday-' + k + '" class="material-icons editItem">create</i><p id="time">' + readDays['Monday'][k].start_time + '-' + readDays['Monday'][k].finish_time + '</p><p id="className">' + readDays['Monday'][k].lesson_name + '</p><p id="teacherName">' + readDays['Monday'][k].teacher_name + '</p><p id="classRoom">' + readDays['Monday'][k].class_room + '</p></div>')
              delete readDays['Monday'][k].start_time // -> We have to delete start_time from the array, because this condition -> !sortTimesMonday[i] == readDays["Monday"][k].start_time! -> would always happen
              break
            }
          }
        }
      }
    }
    for (let i = 0; i < sortTimesTuesday.length; i++) {
      for (let k = 0; k < readDays['Tuesday'].length; k++) {
        if (sortTimesTuesday[i] === readDays['Tuesday'][k].start_time) {
          for (let j = 0; j < weeks.length; j++) {
            if (weeks[j] === readDays['Tuesday'][k].week) {
              $('#week' + weeks[j] + ' #tuesday').append('<div class="lesson" style="background:' + readDays['Tuesday'][k].bgColor + '"><i id="Tuesday-' + k + '" class="material-icons deleteItem">delete_forever</i><i id="Tuesday-' + k + '" class="material-icons editItem">create</i><p id="time">' + readDays['Tuesday'][k].start_time + '-' + readDays['Tuesday'][k].finish_time + '</p><p id="className">' + readDays['Tuesday'][k].lesson_name + '</p><p id="teacherName">' + readDays['Tuesday'][k].teacher_name + '</p><p id="classRoom">' + readDays['Tuesday'][k].class_room + '</p></div>')
              delete readDays['Tuesday'][k].start_time
              break
            }
          }
        }
      }
    }
    for (let i = 0; i < sortTimesWednesday.length; i++) {
      for (let k = 0; k < readDays['Wednesday'].length; k++) {
        if (sortTimesWednesday[i] === readDays['Wednesday'][k].start_time) {
          for (let j = 0; j < weeks.length; j++) {
            if (weeks[j] === readDays['Wednesday'][k].week) {
              $('#week' + weeks[j] + ' #wednesday').append('<div class="lesson" style="background:' + readDays['Wednesday'][k].bgColor + '"><i id="Wednesday-' + k + '" class="material-icons deleteItem">delete_forever</i><i id="Wednesday-' + k + '" class="material-icons editItem">create</i><p id="time">' + readDays['Wednesday'][k].start_time + '-' + readDays['Wednesday'][k].finish_time + '</p><p id="className">' + readDays['Wednesday'][k].lesson_name + '</p><p id="teacherName">' + readDays['Wednesday'][k].teacher_name + '</p><p id="classRoom">' + readDays['Wednesday'][k].class_room + '</p></div>')
              delete readDays['Wednesday'][k].start_time
              break
            }
          }
        }
      }
    }
    for (let i = 0; i < sortTimesThursday.length; i++) {
      for (let k = 0; k < readDays['Thursday'].length; k++) {
        if (sortTimesThursday[i] === readDays['Thursday'][k].start_time) {
          for (let j = 0; j < weeks.length; j++) {
            if (weeks[j] === readDays['Thursday'][k].week) {
              $('#week' + weeks[j] + ' #thursday').append('<div class="lesson" style="background:' + readDays['Thursday'][k].bgColor + '"><i id="Thursday-' + k + '" class="material-icons deleteItem">delete_forever</i><i id="Thursday-' + k + '" class="material-icons editItem">create</i><p id="time">' + readDays['Thursday'][k].start_time + '-' + readDays['Thursday'][k].finish_time + '</p><p id="className">' + readDays['Thursday'][k].lesson_name + '</p><p id="teacherName">' + readDays['Thursday'][k].teacher_name + '</p><p id="classRoom">' + readDays['Thursday'][k].class_room + '</p></div>')
              delete readDays['Thursday'][k].start_time
              break
            }
          }
        }
      }
    }
    for (let i = 0; i < sortTimesFriday.length; i++) {
      for (let k = 0; k < readDays['Friday'].length; k++) {
        if (sortTimesFriday[i] === readDays['Friday'][k].start_time) {
          for (let j = 0; j < weeks.length; j++) {
            if (weeks[j] === readDays['Friday'][k].week) {
              $('#week' + weeks[j] + ' #friday').append('<div class="lesson" style="background:' + readDays['Friday'][k].bgColor + '"><i id="Friday-' + k + '" class="material-icons deleteItem">delete_forever</i><i id="Friday-' + k + '" class="material-icons editItem">create</i><p id="time">' + readDays['Friday'][k].start_time + '-' + readDays['Friday'][k].finish_time + '</p><p id="className">' + readDays['Friday'][k].lesson_name + '</p><p id="teacherName">' + readDays['Friday'][k].teacher_name + '</p><p id="classRoom">' + readDays['Friday'][k].class_room + '</p></div>')
              delete readDays['Friday'][k].start_time
              break
            }
          }
        }
      }
    }
    for (let i = 0; i < sortTimesSaturday.length; i++) {
      for (let k = 0; k < readDays['Saturday'].length; k++) {
        if (sortTimesSaturday[i] === readDays['Saturday'][k].start_time) {
          for (let j = 0; j < weeks.length; j++) {
            if (weeks[j] === readDays['Saturday'][k].week) {
              $('#week' + weeks[j] + ' #saturday').append('<div class="lesson" style="background:' + readDays['Saturday'][k].bgColor + '"><i id="Saturday-' + k + '" class="material-icons deleteItem">delete_forever</i><i id="Saturday-' + k + '" class="material-icons editItem">create</i><p id="time">' + readDays['Saturday'][k].start_time + '-' + readDays['Saturday'][k].finish_time + '</p><p id="className">' + readDays['Saturday'][k].lesson_name + '</p><p id="teacherName">' + readDays['Saturday'][k].teacher_name + '</p><p id="classRoom">' + readDays['Saturday'][k].class_room + '</p></div>')
              delete readDays['Saturday'][k].start_time
              break
            }
          }
        }
      }
    }
    for (let i = 0; i < sortTimesSunday.length; i++) {
      for (let k = 0; k < readDays['Sunday'].length; k++) {
        if (sortTimesSunday[i] === readDays['Sunday'][k].start_time) {
          for (let j = 0; j < weeks.length; j++) {
            if (weeks[j] === readDays['Sunday'][k].week) {
              $('#week' + weeks[j] + ' #sunday').append('<div class="lesson" style="background:' + readDays['Sunday'][k].bgColor + '"><i id="Sunday-' + k + '" class="material-icons deleteItem">delete_forever</i><i id="Sunday-' + k + '" class="material-icons editItem">create</i><p id="time">' + readDays['Sunday'][k].start_time + '-' + readDays['Sunday'][k].finish_time + '</p><p id="className">' + readDays['Sunday'][k].lesson_name + '</p><p id="teacherName">' + readDays['Sunday'][k].teacher_name + '</p><p id="classRoom">' + readDays['Sunday'][k].class_room + '</p></div>')
              delete readDays['Sunday'][k].start_time
              break
            }
          }
        }
      }
    }
    /* End of Append */

    /* Set selected week */
    for (let i = 0; i < weeks.length; i++) {
      $('#week' + weeks[i]).css('display', 'none')
    }
    if (currentWeekIndex == null) { // -> Load default week
      $('#week' + weeks[0]).css('display', 'block')
      if (weeks[0] == null) {
        $('.selectedWeek p').text('No lessons to load').css('font-size', '12px')
      } else {
        $('.selectedWeek p').text('Week ' + weeks[0]).css('font-size', '16px')
      }
    } else {
      $('#week' + currentWeekIndex).css('display', 'block')
      $('.selectedWeek p').text('Week ' + currentWeekIndex).css('font-size', '16px')
    }
  })
}

$(document).ready(function () {
  readData() // -> Call readData()
})

/// /////////////////////////////////////////////////////////////////////////////
/// //////////////////////       ADD NEW LESSON        //////////////////////////
/// /////////////////////////////////////////////////////////////////////////////

$('.addBTN').on('click', () => {
  $('.addLessonOverlay').css('display', 'block')
  $('.addLessonOverlay').animate({
    'opacity': '1'
  }, 400)
})

$('.addNewLesson').on('click', () => {
  let startTimeH
  let startTimeMM
  let finishTimeH
  let finishTimeMM
  let lessonName
  let teacherName
  let classRoom
  let week
  let day
  let bgColor

  let allowStartTimeH = true
  let allowStartTimeMM = true
  let allowFinishTimeH = true
  let allowFinishTimeMM = true
  let allowLessonName = true
  let allowTeacherName = true
  let allowClassRoom = true
  let allowWeek = true
  let allowDay = true

  if ($('#start_time_h').val() === null) {
    $('#start_time_h').css('border', '1px solid #DB2B39')
    allowStartTimeH = false
  } else {
    startTimeH = $('#start_time_h').val()
    allowStartTimeH = true
  }
  if ($('#start_time_mm').val() === null) {
    $('#start_time_mm').css('border', '1px solid #DB2B39')
    allowStartTimeMM = false
  } else {
    startTimeMM = $('#start_time_mm').val()
    allowStartTimeMM = true
  }
  if ($('#finish_time_h').val() === null) {
    $('#finish_time_h').css('border', '1px solid #DB2B39')
    allowFinishTimeH = false
  } else {
    finishTimeH = $('#finish_time_h').val()
    allowFinishTimeH = true
  }
  if ($('#finish_time_mm').val() === null) {
    $('#finish_time_mm').css('border', '1px solid #DB2B39')
    allowFinishTimeMM = false
  } else {
    finishTimeMM = $('#finish_time_mm').val()
    allowFinishTimeMM = true
  }
  if ($('#lesson_name').val() === '') {
    $('#lesson_name').css('border', '1px solid #DB2B39')
    allowLessonName = false
  } else {
    lessonName = $('#lesson_name').val()
    allowLessonName = true
  }
  if ($('#teacher_name').val() === '') {
    $('#teacher_name').css('border', '1px solid #DB2B39')
    allowTeacherName = false
  } else {
    teacherName = $('#teacher_name').val()
    allowTeacherName = true
  }
  if ($('#class_room').val() === '') {
    $('#class_room').css('border', '1px solid #DB2B39')
    allowClassRoom = false
  } else {
    classRoom = $('#class_room').val()
    allowClassRoom = true
  }
  if ($('#week').val() === '') {
    $('#week').css('border', '1px solid #DB2B39')
    allowWeek = false
  } else {
    week = $('#week').val()
    allowWeek = true
  }
  if ($('#day').val() === null) {
    $('#day').css('border', '1px solid #DB2B39')
    allowDay = false
  } else {
    day = $('#day').val()
    allowDay = true
  }
  if ($('#bgColor').val() === '') {
    bgColor = '#09BC8A'
  }

  $('#start_time_h').focus(function () {
    $(this).css('border', 'none')
  })
  $('#start_time_mm').focus(function () {
    $(this).css('border', 'none')
  })
  $('#finish_time_h').focus(function () {
    $(this).css('border', 'none')
  })
  $('#finish_time_mm').focus(function () {
    $(this).css('border', 'none')
  })
  $('#lesson_name').focus(function () {
    $(this).css('border', 'none')
  })
  $('#teacher_name').focus(function () {
    $(this).css('border', 'none')
  })
  $('#class_room').focus(function () {
    $(this).css('border', 'none')
  })
  $('#week').focus(function () {
    $(this).css('border', 'none')
  })
  $('#day').focus(function () {
    $(this).css('border', 'none')
  })
  $('#bgColor').focus(function () {
    $(this).css('border', 'none')
  })

  if (!allowStartTimeH || !allowStartTimeMM || !allowFinishTimeH || !allowFinishTimeMM || !allowLessonName || !allowTeacherName || !allowClassRoom || !allowWeek || !allowDay) {
    return
  }

  let startTime = startTimeH + ':' + startTimeMM
  let finishTime = finishTimeH + ':' + finishTimeMM

  let newObj = {start_time: startTime, finish_time: finishTime, lesson_name: lessonName, teacher_name: teacherName, class_room: classRoom, week: week, bgColor: bgColor} // -> We will add this value to the json object

  add3(day, newObj) // -> Add values
  fs.writeFile(app.getPath('userData') + '/settings.json', JSON.stringify(readDaysWrite), () => { // -> Save values
  })

  $('#start_time_h').val('1')
  $('#start_time_mm').val('00')
  $('#finish_time_h').val('1')
  $('#finish_time_mm').val('00')
  $('#lesson_name').val('')
  $('#teacher_name').val('')
  $('#class_room').val('')
  $('#week').val('')
  $('#day').val('Day')
  $('#bgColor').val('')

  $('.addLessonOverlay').animate({
    'opacity': '0'
  }, 400)

  setTimeout(function () {
    $('.addLessonOverlay').css('display', 'none')
  }, 400)

  readData() // -> Refresh table
})

/// /////////////////////////////////////////////////////////////////////////////
/// //////////////////////        CHANGE WEEK          //////////////////////////
/// /////////////////////////////////////////////////////////////////////////////

$('body').on('click', '#weeks li', (event) => {
  var weekID = event.target.id

  for (let i = 0; i < weeks.length; i++) {
    $('#week' + weeks[i]).css('display', 'none')
  }

  $('#week' + weekID).css('display', 'block')
  $('.selectedWeek p').text('Week ' + weekID).css('font-size', '16px')
  currentWeekIndex = weekID
})

/// /////////////////////////////////////////////////////////////////////////////
/// //////////////////////        EDIT LESSON          //////////////////////////
/// /////////////////////////////////////////////////////////////////////////////

$('body').on('click', '.editItem', (event) => {
  $('.editLessonOverlay').css('display', 'block')
  $('.editLessonOverlay').animate({
    'opacity': '1'
  }, 400)

  clickedId = event.target.id.split('-') // -> Split id to get the day and lesson id

  let startTime = readDaysWrite[clickedId[0]][clickedId[1]].start_time
  let startTimeSplitted = startTime.split(':')
  let startTimeH = startTimeSplitted[0]
  let startTimeMM = startTimeSplitted[1]

  let finishTime = readDaysWrite[clickedId[0]][clickedId[1]].finish_time
  let finishTimeSplitted = finishTime.split(':')
  let finishTimeH = finishTimeSplitted[0]
  let finishTimeMM = finishTimeSplitted[1]

  $('.editLessonOverlay .innerBox #start_time_h').val(startTimeH)
  $('.editLessonOverlay .innerBox #start_time_mm').val(startTimeMM)
  $('.editLessonOverlay .innerBox #finish_time_h').val(finishTimeH)
  $('.editLessonOverlay .innerBox #finish_time_mm').val(finishTimeMM)
  $('.editLessonOverlay .innerBox #lesson_name').val(readDaysWrite[clickedId[0]][clickedId[1]].lesson_name)
  $('.editLessonOverlay .innerBox #teacher_name').val(readDaysWrite[clickedId[0]][clickedId[1]].teacher_name)
  $('.editLessonOverlay .innerBox #class_room').val(readDaysWrite[clickedId[0]][clickedId[1]].class_room)
  $('.editLessonOverlay .innerBox #week').val(readDaysWrite[clickedId[0]][clickedId[1]].week)
  $('.editLessonOverlay .innerBox #day').val(readDaysWrite[clickedId[0]][clickedId[1]].day)
  $('.editLessonOverlay .innerBox #bgColor').val(readDaysWrite[clickedId[0]][clickedId[1]].bgColor)
})

$('.editLesson').on('click', '', function (event) {
  let startTimeH = $('.editLessonOverlay .innerBox #start_time_h').val()
  let startTimeMM = $('.editLessonOverlay .innerBox #start_time_mm').val()
  let finishTimeH = $('.editLessonOverlay .innerBox #finish_time_h').val()
  let finishTimeMM = $('.editLessonOverlay .innerBox #finish_time_mm').val()
  let lessonName = $('.editLessonOverlay .innerBox #lesson_name').val()
  let teacherName = $('.editLessonOverlay .innerBox #teacher_name').val()
  let classRoom = $('.editLessonOverlay .innerBox #class_room').val()
  let week = $('.editLessonOverlay .innerBox #week').val()
  let bgColor = $('.editLessonOverlay .innerBox #bgColor').val()

  let startTime = startTimeH + ':' + startTimeMM
  let finishTime = finishTimeH + ':' + finishTimeMM

  readDaysWrite[clickedId[0]][clickedId[1]].start_time = startTime
  readDaysWrite[clickedId[0]][clickedId[1]].finish_time = finishTime
  readDaysWrite[clickedId[0]][clickedId[1]].lesson_name = lessonName
  readDaysWrite[clickedId[0]][clickedId[1]].teacher_name = teacherName
  readDaysWrite[clickedId[0]][clickedId[1]].class_room = classRoom
  readDaysWrite[clickedId[0]][clickedId[1]].week = week
  readDaysWrite[clickedId[0]][clickedId[1]].bgColor = bgColor

  fs.writeFile(app.getPath('userData') + '/settings.json', JSON.stringify(readDaysWrite), () => {
  })

  $('.editLessonOverlay').animate({
    'opacity': '0'
  }, 400)

  setTimeout(function () {
    $('.editLessonOverlay').css('display', 'none')
  }, 400)

  readData()
})

/// /////////////////////////////////////////////////////////////////////////////
/// //////////////////////       DELETE LESSON        ///////////////////////////
/// /////////////////////////////////////////////////////////////////////////////

$('body').on('click', '.deleteItem', (event) => {
  let clickedId = event.target.id.split('-')
  delete readDaysWrite[clickedId[0]][parseInt(clickedId[1])]
  readDaysWrite[clickedId[0]].copyWithin(parseInt(clickedId[1]), parseInt(clickedId[1]) + 1, readDaysWrite[clickedId[0]].length)
  readDaysWrite[clickedId[0]].pop()

  fs.writeFile(app.getPath('userData') + '/settings.json', JSON.stringify(readDaysWrite), () => {
  })
  fs.readFile(app.getPath('userData') + '/settings.json', 'utf-8', (data) => {
  })

  readData()
})
