'use strict';

//initialize global variables
let periodArray = [];
let alarmId = 0;
let periodId = 0;
let timeOffset = 0;
let clockTimeout;

//initialize clock with JSON.  
function initializeClock(configJSON) {

  //clear all global variables
  clearAllAlarms();
  periodArray    = [];
  periodId       = 0;
  alarmId        = 0;
  
  //parse the configJSON
  const configObject = JSON.parse(configJSON);

  //make a new Period for each block object in the configObject
  const blockTimes   = configObject.blocks;
  const defaultAlarmsAfter  = configObject.defaultAlarmsAfterStart;
  const defaultAlarmsBefore = configObject.defaultAlarmsBeforeEnd;
  for (let i = 0; i < blockTimes.length; i++) {
    periodArray.push(
      new Period(
        blockTimes[i].period, 
        convertToTime(blockTimes[i].start), 
        convertToTime(blockTimes[i].end),
        blockTimes[i].alarmsAfterStart ?? defaultAlarmsAfter ?? [],
        blockTimes[i].alarmsBeforeEnd  ?? defaultAlarmsBefore ?? []
      )
    )
  }

  //put title in its place
  document.getElementById('scheduleName').textContent = configObject.title;

  //update the #schedTable
  updateSchedTable();

  //start the clock
  updateTime();

}

//define the Period object
/*
Period object will include 
     {
        id (autoincremented from periodId)
        period (arbitrary string), 
        start (a Date object for the start of the period), 
        end (a Date object for the end of the period),
        duration (total millisecs in the period),
        trElement (an HTML <tr> element containing schedule info),
        alarms (array of Date objects for when an alarm should accur),
        elapsedTime(): return millisecs since the start of the period,
        percentageElapsed(): return the percentage of the period that has elapsed,
        isCurrentPeriod(theTime): determine if the Date Object theTime falls within this period (theTime defaults to now),
        makeSelected(boolValue): turn on (if true) or off (if false) the .is-selected class on the trElemement,
      }
*/
function Period (periodName, startTime, endTime, alarmsAfter, alarmsBefore) {
  
  //define attributes
  this.id       = periodId;
  this.period   = periodName;
  this.start    = startTime;
  this.end      = endTime;
  this.duration = endTime - startTime;

  let alarmsArray = [];
  
  let currentTime = nowTime();
  alarmsAfter.forEach( function(value, key) {
    let newTime = new Date(startTime.getTime() + parseInt(findMilliSecs(value)));
    if (newTime > currentTime) {
      alarmsArray.push(new Alarm(newTime, periodId));
    }
  });
  alarmsBefore.forEach( function(value, key) {
    let newTime = new Date(endTime.getTime() - parseInt(findMilliSecs(value)));
    if (newTime > currentTime) {
      alarmsArray.push(new Alarm (newTime, periodId));
    }
  });
  this.alarms = alarmsArray;

  //make a <tr> element for the schedule table
  this.trElement = document.createElement('tr');
  let timeTD     = document.createElement('td');
  let periodTD   = document.createElement('td');
  this.trElement.appendChild(timeTD);
  this.trElement.appendChild(periodTD);
  timeTD.textContent = `${printTimeString(this.start,false)} - ${printTimeString(this.end, false, true)}`;
  periodTD.textContent = this.period;
  let newDiv     = document.createElement('div'); //this is going to hold all the alarm tags
  newDiv.classList.add('tags')
  periodTD.appendChild(newDiv);
  
  for (let i = 0; i < alarmsArray.length; i++) {
    newDiv.appendChild(alarmsArray[i].tagElement); //get all the alarms
  }
  periodId++;
}

Period.prototype.elapsedTime = function() {
  let curTime = nowTime();
  return curTime - this.start;
}

Period.prototype.percentageElapsed = function() {
  return (this.elapsedTime() / this.duration * 100).toPrecision(4);
}

Period.prototype.isCurrentPeriod = function(theTime = nowTime()) {
  return (theTime >= this.start && theTime <= this.end)
}

Period.prototype.makeSelected = function(boolValue) {
  if (boolValue) {
    this.trElement.classList.add('is-selected')
  } else {
    this.trElement.classList.remove('is-selected')
  }
}

//define the Alarm object
/*
Alarm object will include 
      {
        id (an id for this alarm; autoincremented from periodId)
        periodId (id that maps to object in the periodArray)
        time (a Date object for when the alarm should occur)
        tagElement (a <span class="tag"> element for showing alarms on schedule)
        timer (timeout for when the alarm should occur)
        isActive (switch when alarm fires to protect against double-firing due to unexpected timing of code execution)
        refreshTimer()  (function for refreshing timer in case of bottlenecks in code)
        resolveAlarm() (trigger the alarm and then remove it)
        removeAlarm(key): remove the <tr> of this alarm then splice it out of its parent array.
      }
*/
function Alarm (alarmTime, pdId) {
  this.id         = alarmId;
  this.periodId   = pdId;
  this.time       = alarmTime;
  this.tagElement = document.createElement('span');
  this.tagElement.classList.add('tag', 'is-info');
  this.tagElement.textContent = printTimeString(this.time, true, true);
  this.timer      = null;
  this.isActive   = true;
  this.refreshTimer();
  alarmId++;
}

Alarm.prototype.refreshTimer = function () {
  clearTimeout(this.timer);
  this.timer = setTimeout(this.resolveAlarm.bind(this), (this.time - nowTime()));
}

Alarm.prototype.resolveAlarm = function () {
  (this.isActive) && doAlarm(); //only fire if the alarm is active
  this.removeAlarm();
  refreshAllTimers();
}

Alarm.prototype.removeAlarm = function() {
  this.isActive = false;
  clearTimeout(this.timer);
  const periodKey = periodArray.findIndex((obj) => obj.id == this.periodId);
  const alarmsKey = periodArray[periodKey].alarms.findIndex((obj) => obj.id == this.id);
  this.tagElement.remove();
  periodArray[periodKey].alarms.splice(alarmsKey,1); 
}

//refresh all the timers to avoid timeout drift
function refreshAllTimers() {
  for (let i = 0; i < periodArray.length; i++) {
    for (let j = 0; j < periodArray[i].alarms.length; j++) {
      periodArray[i].alarms[j].refreshTimer();
    }
  }
}

//clear all Alarms in each Period until there aren't any left.
function clearAllAlarms() {
  for (let i = 0; i < periodArray.length; i++) {
    while (periodArray[i].alarms.length > 0) {
      periodArray[i].alarms[0].removeAlarm();
    }
  }
}

//converts an "hh:mm" string to a Date object today at hh:mm
function convertToTime(hhmmString) {
  let partsOfTime = hhmmString.split(":");
  let theTime     = new Date();
  theTime.setHours(partsOfTime[0])
  theTime.setMinutes(partsOfTime[1])
  theTime.setSeconds(0)
  return theTime;
}

//Print the Schedule Table
function updateSchedTable() {

  //clear and recreate the <tbody>
  const schedTable  = document.getElementById('schedTable');
  const schedBody   = document.createElement('tbody');
  schedTable.getElementsByTagName('tbody')[0].remove();
  schedTable.appendChild(schedBody);

  //retrieve the schedule <tr>'s and append them
  for (let i = 0; i < periodArray.length; i++) {
    schedBody.appendChild(periodArray[i].trElement);
  }

}


//update the time and put it in the #displayTime
function updateTime() {
  const displayTime   = document.getElementById('displayTime');
  const currentPeriod = document.getElementById('currentPeriod');
 
  //update display
  displayTime.textContent   = printTimeString(nowTime(), true, true);    //update the time
  currentPeriod.textContent = 'passing period';                        //it is passing period unless the for loop below overrides this
  updateProgressBar(0, 0, '');

  //determine which period we are in.  
  for (let i = 0; i < periodArray.length; i++) {
    if (periodArray[i].isCurrentPeriod()) {
      periodArray[i].makeSelected(true);                  //add the .is-selected class
      currentPeriod.textContent = periodArray[i].period;  //display the current period
      updateProgressBar(
        periodArray[i].elapsedTime(), 
        periodArray[i].duration, 
        periodArray[i].percentageElapsed()
      );
    } else { 
      periodArray[i].makeSelected(false);                 //remove the .is-selected class
    }
  } 

  //call this function again in one second
  clearTimeout(clockTimeout);
  clockTimeout = setTimeout(updateTime, 1000);

}

//make sure numbers always have two digits
function leadingZeroes(number) {
  return (number < 10) ? "0" + number : number;
}

//print Date object in human readable manner
function printTimeString(theDate, includeSecs, incudeAmPm) {
  const theHour = theDate.getHours();
  const theMin  = theDate.getMinutes();
  const theSec  = theDate.getSeconds();

  let amPm, hourToPrint;
  if (theHour < 13) {
    amPm    = "am";
    hourToPrint = leadingZeroes(theHour);
  } else {
    amPm    = "pm";
    hourToPrint = leadingZeroes(theHour - 12);  
  }

  if (!incudeAmPm) {
    amPm = '';
  }
  
  let timeString = '';

  if (includeSecs) {
    timeString = `${hourToPrint}:${leadingZeroes(theMin)}:${leadingZeroes(theSec)} ${amPm}`;
  } else {
    timeString = `${hourToPrint}:${leadingZeroes(theMin)} ${amPm}`;
  }
  
  return timeString;
}

//parse the string "mm:ss" and convert it to a number of milliseconds
function findMilliSecs(mmSS) {
  const numMinsAlarm = mmSS.split(":")[0];
  const numSecsAlarm = mmSS.split(":")[1];
  return (numMinsAlarm * 60000) + (numSecsAlarm * 1000);
}

//do the alarm!
function doAlarm() {
  document.getElementById('sound1').play();
  console.info(`Alarm triggered at ${printTimeString(nowTime(),true,true)}`);
}

//update the progressBar
function updateProgressBar(timeElapsed, duration, percentage) {
  let timeFromStart = new Date(timeElapsed);
  let timeToGo      = new Date(duration - timeElapsed);
  document.getElementById('progressBar').value       = percentage;
  document.getElementById('timeElapsed').textContent = 
    `${timeFromStart.getUTCHours()}:${leadingZeroes(timeFromStart.getUTCMinutes())}:${leadingZeroes(timeFromStart.getUTCSeconds())}`;
  document.getElementById('timeToGo').textContent    =
    `${timeToGo.getUTCHours()}:${leadingZeroes(timeToGo.getUTCMinutes())}:${leadingZeroes(timeToGo.getUTCSeconds())}`;

}

function nowTime() {
  let millisecs = (new Date()).getTime();
  millisecs = millisecs + timeOffset;
  let timeObj = new Date(millisecs)
  return timeObj;
}

function updateOffset() {
  const element = document.getElementById('offsetSecs');
  timeOffset = element.value * 1000;
  document.cookie = `offset=${timeOffset};max-age=${21*360000};SameSite=None;Secure;path=/;`;
  updateTime();
  refreshAllTimers();
}

function readOffsetCookie() {
  let cookieName = 'offset=';
  let decodedCookie = decodeURIComponent(document.cookie);
  let cookieArray = decodedCookie.split(';');
  let cookieOffset = 0;
  for (let i = 0; i < cookieArray.length; i++) {
    if (cookieArray[i].indexOf(cookieName) === 0) {
      cookieOffset = cookieArray[i].substring(cookieName.length);
    }
  }
  return cookieOffset;
}

document.getElementById('offsetSecs').addEventListener('change', updateOffset);

//when the page loads, start the clock and set the offsetSecs correctly
updateTime();
timeOffset = parseInt(readOffsetCookie());
document.getElementById('offsetSecs').value = Math.floor(timeOffset / 1000);