'use strict';

//initialize global array for holding Period objects
let periodArray = [];

//initialize clock with JSON.  
function initializeClock(configJSON) {

  //clear all global variables
  periodArray    = [];
  
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
        blockTimes[i].alarmsAfterStart ?? defaultAlarmsAfter,
        blockTimes[i].alarmsBeforeEnd  ?? defaultAlarmsBefore
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
        period (arbitrary string), 
        start (a Date object for the start of the period), 
        end (a Date object for the end of the period),
        duration (total millisecs in the period),
        trElement (an HTML <tr> element containing schedule info),
        alarms (array of Date objects for when an alarm should accur),
        overlayElement (<div> to overlay on progress bar),
        timeElapsed(curTime): return millisecs since the start of the period (curTime is a Date object; it will work for current time if undefined),
        percentageElapsed(curTime): return the percentage of the period that has elapsed,
        removeAlarm(key): remove the <tr> of alarms[key] and then delete it from the alarms array,
        isCurrentPeriod(theTime): determine if the Date Object theTime falls within this period (theTime defaults to now),
        makeSelected(boolValue): turn on (if true) or off (if false) the .is-selected class on the trElemement,
      }
*/
function Period (periodName, startTime, endTime, alarmsAfter, alarmsBefore) {
  
  //define attributes
  this.period   = periodName;
  this.start    = startTime;
  this.end      = endTime;
  this.duration = endTime - startTime;

  //use the global alarmsAfter and alarmsBefore arrays to populate the alarms attribute
  let alarmsArray = [];
  
  let currentTime = new Date();
  alarmsAfter.forEach( function(value, key) {
    let newTime = new Date(startTime.getTime() + parseInt(findMilliSecs(value)));
    if (newTime > currentTime) {
      alarmsArray.push(new Alarm(newTime, (((newTime - startTime)/(endTime - startTime)) * 100).toPrecision(4)));
    }
  });
  alarmsBefore.forEach( function(value, key) {
    let newTime = new Date(endTime.getTime() - parseInt(findMilliSecs(value)));
    if (newTime > currentTime) {
      alarmsArray.push(new Alarm (newTime, (((newTime - startTime)/(endTime - startTime)) * 100).toPrecision(4)));
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

  //make <div> overlay
  this.overlayElement = document.createElement('div');
  this.overlayElement.classList.add('is-overlay', 'is-vcentered', 'alarm-diamond')
  this.overlayElement.style.width = '100%';
  this.overlayElement.style.left  = '-7px';
  this.overlayElement.style.top   = '-5px';

  
  for (let i = 0; i < alarmsArray.length; i++) {
    newDiv.appendChild(alarmsArray[i].tagElement); //get all the alarms
    this.overlayElement.appendChild(alarmsArray[i].progressTag);
  }

}

Period.prototype.timeElapsed = function(curTime = new Date()) {
  return curTime - this.start;
}

Period.prototype.percentageElapsed = function(curTime) {
  return (this.timeElapsed(curTime) / this.duration * 100).toPrecision(4);
}

Period.prototype.removeAlarm = function(key) {
  this.alarms[key].tagElement.remove();
  this.alarms[key].progressTag.remove();
  this.alarms.splice(key,1); 
}

Period.prototype.isCurrentPeriod = function(theTime = new Date()) {
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
        time (a Date object for when the alarm should occur)
        tagElement (a <span class="tag"> element for showing alarms on schedule)
        progressTag (a <span> diamond with appropriate offset)
      }
*/
function Alarm (alarmTime, offset) {
  this.time        = alarmTime;
  this.tagElement  = document.createElement('span');
  this.tagElement.classList.add('tag', 'is-info');
  this.tagElement.textContent = printTimeString(this.time, true, true);
  this.progressTag = document.createElement('span');
  this.progressTag.classList.add('has-text-link', "is-size-5");
  this.progressTag.style.position = 'absolute';
  this.progressTag.style.left     = `${offset}%`;
  this.progressTag.innerHTML      = '&diams;';
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
  const progOverlay = document.getElementById('progressContainer');
  const progressBar = document.getElementById('progressBar');
  schedTable.getElementsByTagName('tbody')[0].remove();
  schedTable.appendChild(schedBody);

  let diamonds = document.getElementsByClassName('alarm-diamond');

  for (let i = 0; i < diamonds.length; i++) {
    diamonds[i].remove();
  }

  //retrieve the schedule <tr>'s and append them
  for (let i = 0; i < periodArray.length; i++) {
    schedBody.appendChild(periodArray[i].trElement);
    progOverlay.insertBefore(periodArray[i].overlayElement, progressBar)
  }

}


//update the time and put it in the #displayTime, also check for alarms
function updateTime() {
  const displayTime   = document.getElementById('displayTime');
  const currentPeriod = document.getElementById('currentPeriod');
  const nowTime = new Date();
 
  //update display
  displayTime.textContent   = printTimeString(nowTime, true, true);    //update the time
  currentPeriod.textContent = 'passing period';                        //it is passing period unless the for loop below overrides this
  updateProgressBar(0, 0, '');

  //determine which period we are in.  
  for (let i = 0; i < periodArray.length; i++) {
    if (periodArray[i].isCurrentPeriod()) {
      periodArray[i].makeSelected(true);                  //add the .is-selected class
      currentPeriod.textContent = periodArray[i].period;  //display the current period
      checkAlarm(nowTime, i);                             //check for alarms
      updateProgressBar(
        periodArray[i].timeElapsed(), 
        periodArray[i].duration, 
        periodArray[i].percentageElapsed()
      );
    } else { 
      periodArray[i].makeSelected(false);                 //remove the .is-selected class
    }
  } 

  //call this function again in one second
  setTimeout(updateTime, 1000);

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

//check to see if there's an alarm. If so, doAlarm()
function checkAlarm(nowTime,periodArrayKey) {
  const alarmsArray = periodArray[periodArrayKey].alarms;
  for (let i = 0; i < alarmsArray.length; i++) {
    if ( alarmsArray[i].time - nowTime <= 0 ) {
      doAlarm();
      periodArray[periodArrayKey].removeAlarm(i);    
        //remove this alarm from the periodArray so it doesn't get called again
    } 
  }
}

//do the alarm!
function doAlarm() {
  document.getElementById('sound1').play()
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

//when the page loads, start the clock
updateTime();