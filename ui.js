'use strict';
//JSON templates for differnt Days [ template name, JSON ]

const defaultSchedules = `[
  {
    "title"   : "7 Periods",
    "blocks"  : [
      {  "period" : "Period 1" , "start" : "08:25" , "end" : "09:09" } ,
      {  "period" : "Period 2" , "start" : "09:16" , "end" : "10:00" } ,
      {  "period" : "Period 3" , "start" : "10:07" , "end" : "10:57" } ,
      {  "period" : "Period 4" , "start" : "11:04" , "end" : "12:37" } ,
      {  "period" : "Period 5" , "start" : "12:44" , "end" : "13:28" } ,
      {  "period" : "Period 6" , "start" : "13:35" , "end" : "14:19" } ,
      {  "period" : "Period 7" , "start" : "14:26" , "end" : "15:10" }
    ] ,
    "defaultAlarmsAfterStart"  : [],
    "defaultAlarmsBeforeEnd"   : [ "2:00" ]
  },
  {
    "title"   : "ABC Day",
    "blocks"  : [
      {  "period" : "Block 1" , "start" : "08:25" , "end" : "09:32" } ,
      {  "period" : "Block 2" , "start" : "09:39" , "end" : "10:52" } ,
      {  "period" : "Block 3" , "start" : "10:59" , "end" : "12:42" } ,
      {  "period" : "Block 4" , "start" : "12:49" , "end" : "13:56" } ,
      {  "period" : "Block 5" , "start" : "14:03" , "end" : "15:10" }
    ] ,
    "defaultAlarmsAfterStart"  : [],
    "defaultAlarmsBeforeEnd"   : [ "2:00" ]
  },
  {
    "title"   : "7 Periods (C-Lunch)",
    "blocks"  : [
      {  "period" : "Period 1" , "start" : "08:25" , "end" : "09:09" } ,
      {  "period" : "Period 2" , "start" : "09:16" , "end" : "10:00" } ,
      {  "period" : "Period 3" , "start" : "10:07" , "end" : "10:57" } ,
      {  "period" : "Period 4" , "start" : "11:04" , "end" : "12:08" } ,
      {  "period" : "Period 5" , "start" : "12:44" , "end" : "13:28" } ,
      {  "period" : "Period 6" , "start" : "13:35" , "end" : "14:19" } ,
      {  "period" : "Period 7" , "start" : "14:26" , "end" : "15:10" }
    ] ,
    "defaultAlarmsAfterStart"  : [],
    "defaultAlarmsBeforeEnd"   : [ "2:00" ]
  },
  {
    "title"   : "ABC Day (C-Lunch)",
    "blocks"  : [
      {  "period" : "Block 1" , "start" : "08:25" , "end" : "09:32" } ,
      {  "period" : "Block 2" , "start" : "09:39" , "end" : "10:52" } ,
      {  "period" : "Block 3" , "start" : "10:59" , "end" : "12:12" } ,
      {  "period" : "Block 4" , "start" : "12:49" , "end" : "13:56" } ,
      {  "period" : "Block 5" , "start" : "14:03" , "end" : "15:10" }
    ] ,
    "defaultAlarmsAfterStart"  : [],
    "defaultAlarmsBeforeEnd"   : [ "2:00" ]
  }
  ]`;

const schedules = JSON.parse(localStorage.getItem('classroomTimers')) || JSON.parse(defaultSchedules)


function chooseInitOption(key) {

  if (key != 'custom' ) { 
    initializeClock(schedules[key]);
  }

  for (let i = 0; i < buttonElements.length; i++) {
    if (i == key) {
      buttonElements[i].classList.add('is-active');
    } else {
      buttonElements[i].classList.remove('is-active');
    }
  }

}



//////////////////////////////////////////////////
///////// INITIALIZE THE HTML DOCUMENT ///////////
//////////////////////////////////////////////////



function handleAddListeners(stmt, fn) {
  const elementArray = document.querySelectorAll(stmt);
  for (let i = 0; i < elementArray.length; i++) {
    elementArray[i].addEventListener('click', fn);
  }
}

let buttonElements = [];
const placeToPut = document.getElementById('schedOptions');


for (let i = 0; i < schedules.length; i++) {
  //parse the schedule
  const data = schedules[i];
  
  //make a new entry into the nav ul
  let newLI = document.createElement('li');
  let newLink = document.createElement('a');
  newLI.appendChild(newLink);
  newLink.addEventListener('click', function() { chooseInitOption(i) });
  newLink.addEventListener('mouseup', function() { return false; });
  newLink.textContent = data.title;

  //append the new entry
  buttonElements.push(newLI)
  placeToPut.appendChild(newLI);
}


