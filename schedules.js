//JSON templates for differnt Days [ template name, JSON ]
var schedules = [
  `
  {
    "title"   : "7 Periods",
    "blocks"  : [
      {  "period" : "Period 1" , "start" : "08:00" , "end" : "08:54" } ,
      {  "period" : "Period 2" , "start" : "09:00" , "end" : "09:54" } ,
      {  "period" : "Period 3" , "start" : "10:00" , "end" : "10:54" } ,
      {  "period" : "Period 4" , "start" : "11:00" , "end" : "11:54" } ,
      {  "period" : "Period 5" , "start" : "12:00" , "end" : "12:54" } ,
      {  "period" : "Period 6" , "start" : "13:00" , "end" : "21:50" } ,
      {  "period" : "Period 7" , "start" : "22:00" , "end" : "23:57" }
    ] ,
    "alarmsAfterStart"  : [ "0:45" ],
    "alarmsBeforeEnd"   : [ "3:00" ]
  }
  `,
  `
  {
    "title"   : "A Day",
    "blocks"  : [
      {  "period" : "Period 1" , "start" : "08:00" , "end" : "08:54" } ,
      {  "period" : "Period 2" , "start" : "09:00" , "end" : "09:54" } ,
      {  "period" : "Period 3" , "start" : "10:00" , "end" : "10:54" } ,
      {  "period" : "Period 5" , "start" : "13:00" , "end" : "21:50" } ,
      {  "period" : "Period 6" , "start" : "12:00" , "end" : "12:54" }
    ] ,
    "alarmsAfterStart"  : [ "0:45" ],
    "alarmsBeforeEnd"   : [ "3:00" ]
  }
  `,
  `
  {
    "title"   : "B Day",
    "blocks"  : [
      {  "period" : "Period 2" , "start" : "13:00" , "end" : "16:07" } ,
      {  "period" : "SRT"      , "start" : "09:00" , "end" : "09:54" } ,
      {  "period" : "Period 4" , "start" : "10:00" , "end" : "10:54" } ,
      {  "period" : "Period 6" , "start" : "11:00" , "end" : "11:54" } ,
      {  "period" : "Period 7" , "start" : "12:00" , "end" : "12:54" }
    ] ,
    "alarmsAfterStart"  : [ "0:45" ],
    "alarmsBeforeEnd"   : [ "3:00" ]
  }
  `,
  `
  {
    "title"   : "C Day",
    "blocks"  : [
      {  "period" : "Period 1" , "start" : "08:00" , "end" : "08:54" } ,
      {  "period" : "Period 3" , "start" : "09:00" , "end" : "09:54" } ,
      {  "period" : "Period 4" , "start" : "10:00" , "end" : "10:54" } ,
      {  "period" : "Period 5" , "start" : "11:00" , "end" : "11:54" } ,
      {  "period" : "Period 7" , "start" : "12:00" , "end" : "12:54" }
    ] ,
    "alarmsAfterStart"  : [ "0:45" ],
    "alarmsBeforeEnd"   : [ "3:00" ]
  }
   `
];

//function for printing all the options.  Argument is element where it should be added
function writeScheduleOptions(HTMLElement) {
  
  for (let i = 0; i < schedules.length; i++) {
    //parse the schedule
    const data = JSON.parse(schedules[i]);
    
    //make a new entry into the nav ul
    let newLI = document.createElement('li');
    let newLink = document.createElement('a');
    newLI.appendChild(newLink);
    newLI.setAttribute('id', `initOption-${i}`);
    newLink.addEventListener('click', function() { chooseInitOption(i) });
    newLink.addEventListener('mouseup', function() { return false; });
    newLink.textContent = data.title;

    //append the new entry
    HTMLElement.appendChild(newLI);

  }

}

function chooseInitOption(key) {

  const classArray = document.getElementById('schedOptions').querySelectorAll('.is-active');
  for (let i = 0; i < classArray.length; i++) {
    classArray[i].classList.remove('is-active');
  }

  if (key != 'custom' ) { 
    initializeClock(schedules[key]);
    document.getElementById('customJSONEntry').value = schedules[key];
    document.getElementById(`initOption-${key}`).classList.add('is-active');
  }

}

function closeModal() {
  document.getElementById('customJSONContainer').classList.remove('is-active');
}

function openModal() {
  document.getElementById('customJSONContainer').classList.add('is-active');
}




// INITIALIZE THE HTML DOCUMENT
writeScheduleOptions(document.getElementById('schedOptions'));

function handleAddListeners(stmt, fn) {
  elementArray = document.querySelectorAll(stmt);
  for (let i = 0; i < elementArray.length; i++) {
    elementArray[i].addEventListener('click', fn);
  }
}

handleAddListeners('.modal-close, .modal-background', closeModal)
handleAddListeners('.open-modal', openModal)

document.getElementById('loadNewJSON').addEventListener('click', function() {
  initializeClock(document.getElementById('customJSONEntry').value);
  chooseInitOption('custom');
  closeModal();
});

document.getElementById('loadNewJSON').addEventListener('mouseup', function() { return false; });