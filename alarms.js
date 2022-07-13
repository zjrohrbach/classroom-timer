//initialize global variables
var alarmsAfter, alarmsBefore, timeOfPageLoad;
var periodArray = [];

//initialize clock with JSON.  
function initializeClock(configJSON) {

  //clear all global variables
  alarmsAfter    = null;
  alarmsBefore   = null;
  timeOfPageLoad = null;
  periodArray    = [];
  
  //parse the configJSON
  const configObject = JSON.parse(configJSON);

  //set global variables
  alarmsAfter        = configObject.alarmsAfterStart;
  alarmsBefore       = configObject.alarmsBeforeEnd;
  timeOfPageLoad     = new Date();

  //call setTimeWindows() for each block
  const blockTimes   = configObject.blocks;
  blockTimes.forEach(setTimeWindows);

  //put title in its place
  document.getElementById('scheduleName').textContent = configObject.title;

  //update the #schedTable
  updateSchedTable();

  //start the clock
  updateTime();

}

//creates a new Period Object from a blockTime object 
/* 
blockTime object should include 
     {
        period (arbitrary string), 
        start (hh:mm in military time), 
        end (hh:mm in military time)
      }
*/
function setTimeWindows(blockTime) {
  periodArray.push(
    new Period(
      blockTime.period, 
      convertToTime(blockTime.start), 
      convertToTime(blockTime.end)
    )
  );
}

//define the Period object
/*
Period object will include 
     {
        period (arbitrary string), 
        start (a Date object for the start of the period), 
        end (a Date object for the end of the period),
        trElement (an HTML <tr> element containing schedule info)
        alarms (array of Date objects for when an alarm should accur)
        removeAlarm(key): remove the <tr> of alarms[key] and then delete it from the alarms array
        isCurrentPeriod(theTime): determine if the Date Object theTime falls within this period (theTime defaults to now)
        makeSelected(boolValue): turn on (if true) or off (if false) the .is-selected class on the trElemement
      }
*/
function Period (periodName, startTime, endTime) {
  
  //define attributes
  this.period = periodName;
  this.start  = startTime;
  this.end    = endTime;

  //use the global alarmsAfter and alarmsBefore arrays to populate the alarms attribute
  alarmsArray = [];

  alarmsAfter.forEach( function(value, key) {
    newTime = new Date(startTime.getTime() + parseInt(findMilliSecs(value)));
    if (newTime > timeOfPageLoad) {
      alarmsArray.push(new Alarm(newTime));
    }
  });
  alarmsBefore.forEach( function(value, key) {
    newTime = new Date(endTime.getTime() - parseInt(findMilliSecs(value)));
    if (newTime > timeOfPageLoad) {
      alarmsArray.push(new Alarm (newTime));
    }
  });
  this.alarms = alarmsArray;

  //make a <tr> element for the schedule table
  this.trElement = document.createElement('tr');
  let timeTD     = document.createElement('td');
  let periodTD   = document.createElement('td');
  this.trElement.appendChild(timeTD);
  this.trElement.appendChild(periodTD);
  timeTD.textContent = `${printTimeString(this.start,false)} - ${printTimeString(this.end,false)}`;
  periodTD.textContent = this.period;
  let newDiv     = document.createElement('div'); //this is going to hold all the alarm tags
  newDiv.classList.add('tags')
  periodTD.appendChild(newDiv);
  
  for (let i = 0; i < alarmsArray.length; i++) {
    newDiv.appendChild(alarmsArray[i].tagElement); //get all the alarms
  }

}

Period.prototype.removeAlarm = function(key) {
  this.alarms[key].tagElement.remove();
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
      }
*/
function Alarm (alarmTime) {
  this.time       = alarmTime;
  this.tagElement = document.createElement('span');
  this.tagElement.classList.add('tag', 'is-info');
  this.tagElement.textContent = printTimeString(this.time,true);
}

//converts an "hh:mm" string to a Date object today at hh:mm
function convertToTime(theTime) {
  partsOfTime = theTime.split(":");
  theTime = new Date();
  theTime.setHours(partsOfTime[0])
  theTime.setMinutes(partsOfTime[1])
  theTime.setSeconds(0)
  return theTime;
}

//Print the Schedule Table
function updateSchedTable() {
  const schedTable = document.getElementById('schedTable');
  
  //clear and recreate the <tbody>
  schedTable.getElementsByTagName('tbody')[0].remove();
  schedBody = document.createElement('tbody');
  schedTable.appendChild(schedBody);

  //retrieve the schedule <tr>'s and append them
  for (let i = 0; i < periodArray.length; i++) {
    schedBody.appendChild(periodArray[i].trElement);
  }

}


//update the time and put it in the #displayTime, also check for alarms
function updateTime() {
  const displayTime   = document.getElementById('displayTime');
  const currentPeriod = document.getElementById('currentPeriod');
  const infoElement   = document.getElementById('info');
  const nowTime = new Date();
  
  const getInfo = whichWindow(nowTime, periodArray);   //determine which time window we are in
    //getInfo[0] is the human readable period
    //getInfo[1] is the key to this period in periodArray

  displayTime.textContent   = printTimeString(nowTime, true);    //update the time
  currentPeriod.textContent = getInfo[0];                        //update the period name
  infoElement.getElementsByTagName('strong')[0].textContent = alarmsAfter.join(", ");  //list alarms in infoElement
  infoElement.getElementsByTagName('strong')[1].textContent = alarmsBefore.join(", "); //list alarms in infoElement


  //remove all .is-selected classes and then reapply to only current period (if there is one)
  const classArray = document.querySelectorAll('.is-selected');
  for (let i = 0; i < classArray.length; i++) {
    classArray[i].classList.remove('is-selected');
  }
  if (getInfo[1] != undefined) {                       //if getInfo[1] is undefined, we aren't in a period
    checkAlarm(nowTime, getInfo[1]);                   //check for alarms
    periodArray[getInfo[1]].trElement.classList.add('is-selected')
  }

  //call this function again in one second
  setTimeout(updateTime, 1000);
}

//make sure numbers always have two digits
function leadingZeroes(number) {
  if (number < 10) {
    return "0" + number;
  } else {
    return number;
  }
}

//print Date object in human readable manner
function printTimeString(theDate, includeSecs) {
  const theHour = theDate.getHours();
  const theMin  = theDate.getMinutes();
  const theSec  = theDate.getSeconds();

  var amPm, hourToPrint;
  if (theHour < 13) {
    amPm    = "am";
    hourToPrint = leadingZeroes(theHour);
  } else {
    amPm    = "pm";
    hourToPrint = leadingZeroes(theHour - 12);  
  }
  
  let timestring = '';

  if (includeSecs) {
    timeString = `${hourToPrint}:${leadingZeroes(theMin)}:${leadingZeroes(theSec)} ${amPm}`;
  } else {
    timeString = `${hourToPrint}:${leadingZeroes(theMin)} ${amPm}`;
  }

  
  return timeString;
}

//determine which periodArray the current time falls within
/*
  returns an array [
    string of the name attribute of period,
    indexKey of the period
  ]
*/
function whichWindow(theTime, theArray) {
  let whereWeAre  = 'passing period';
  let indexKey    = undefined;
  theArray.every( function(value, index) {
    if (value.isCurrentPeriod()) {
      whereWeAre = value.period;
      indexKey = index;
      return false;
    } else {
      return true;
    }
  })
  return [ whereWeAre, indexKey ];
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
      //do the alarm!
      doAlarm();

      //remove this alarm from the periodArray so it doesn't get called again
      periodArray[periodArrayKey].removeAlarm(i); 
    } 
  }
}

//do the alarm!
function doAlarm() {
  document.getElementById('sound1').play()
}