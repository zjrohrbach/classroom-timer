'use strict';
//JSON templates for differnt Days [ template name, JSON ]

let schedules;
if (typeof custSched == 'undefined') {
  schedules = [
  `{
    "title"   : "7 Periods",
    "blocks"  : [
      {  "period" : "Period 1" , "start" : "08:25" , "end" : "09:11" } ,
      {  "period" : "Period 2" , "start" : "09:18" , "end" : "10:04" } ,
      {  "period" : "Period 3" , "start" : "10:11" , "end" : "11:03" } ,
      {  "period" : "Period 4" , "start" : "11:10" , "end" : "12:31" } ,
      {  "period" : "Period 5" , "start" : "12:38" , "end" : "13:24" } ,
      {  "period" : "Period 6" , "start" : "13:31" , "end" : "14:17" } ,
      {  "period" : "Period 7" , "start" : "14:24" , "end" : "15:10" }
    ] ,
    "defaultAlarmsAfterStart"  : [],
    "defaultAlarmsBeforeEnd"   : [ "2:00" ]
  }`,
  `{
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
  }`,
  `{
    "title"   : "7 Periods (C-Lunch)",
    "blocks"  : [
      {  "period" : "Period 1" , "start" : "08:25" , "end" : "09:11" } ,
      {  "period" : "Period 2" , "start" : "09:18" , "end" : "10:04" } ,
      {  "period" : "Period 3" , "start" : "10:11" , "end" : "11:03" } ,
      {  "period" : "Period 4" , "start" : "11:10" , "end" : "12:06" } ,
      {  "period" : "Period 5" , "start" : "12:38" , "end" : "13:24" } ,
      {  "period" : "Period 6" , "start" : "13:31" , "end" : "14:17" } ,
      {  "period" : "Period 7" , "start" : "14:24" , "end" : "15:10" }
    ] ,
    "defaultAlarmsAfterStart"  : [],
    "defaultAlarmsBeforeEnd"   : [ "2:00" ]
  }`,
  `{
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
  }`
  ];
} else {
  schedules = custSched;
}


function chooseInitOption(key) {

  if (key != 'custom' ) { 
    initializeClock(schedules[key]);
    document.getElementById('customJSONEntry').value = schedules[key];
    document.getElementById(`initOption-${key}`);
  }

  for (let i = 0; i < buttonElements.length; i++) {
    if (i == key) {
      buttonElements[i].classList.add('is-active');
    } else {
      buttonElements[i].classList.remove('is-active');
    }
  }

}

function closeModal() {
  document.getElementById('customJSONContainer').classList.remove('is-active');
  refreshAllTimers();
}

function openModal() {
  document.getElementById('customJSONContainer').classList.add('is-active');
}



//////////////////////////////////////////////////
///////// INITIALIZE THE HTML DOCUMENT ///////////
//////////////////////////////////////////////////


let buttonElements = [];
const placeToPut = document.getElementById('schedOptions');

for (let i = 0; i < schedules.length; i++) {
  //parse the schedule
  const data = JSON.parse(schedules[i]);
  
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

function handleAddListeners(stmt, fn) {
  const elementArray = document.querySelectorAll(stmt);
  for (let i = 0; i < elementArray.length; i++) {
    elementArray[i].addEventListener('click', fn);
  }
}

handleAddListeners('.modal-close, .modal-background', closeModal)
handleAddListeners('.open-modal', openModal)

document.getElementById('loadNewJSON').addEventListener('click', function() {
  const textareaField = document.getElementById('customJSONEntry');
  const btn = document.getElementById('loadNewJSON');
  try {
    textareaField.classList.remove('is-danger');
    btn.classList.remove('is-danger')
    initializeClock(textareaField.value);
    chooseInitOption('custom');
    closeModal();
  } catch(e) {
    textareaField.classList.add('is-danger');
    btn.classList.add('is-danger')
    alert(e.message);
  }

});

document.getElementById('loadNewJSON').addEventListener('mouseup', function() { return false; });