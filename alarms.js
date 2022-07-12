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
  document.getElementById('scheduleName').innerHTML = configObject.title;

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
        alarms (array of Date objects for when an alarm should accur)
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
      alarmsArray.push(newTime);
    }
  });
  alarmsBefore.forEach( function(value, key) {
    newTime = new Date(endTime.getTime() - parseInt(findMilliSecs(value)));
    if (newTime > timeOfPageLoad) {
      alarmsArray.push(newTime);
    }
  });
  this.alarms = alarmsArray;

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
  const schedBody = document.getElementById('schedTable').getElementsByTagName('tbody')[0];
  let schedString = '';
  periodArray.forEach(function(value, key) {


    schedString += `<tr id="schedRowKey-${key}">`;
    schedString += `<td>${printTimeString(value.start,false)} - ${printTimeString(value.end,false)}</td>`;
    schedString += `<td>${value.period}<br><div id="alarmListKey-${key}" class="tags">${listAllAlarms(value.alarms)}</div></td>`
    schedString += '</tr>';
  })
  schedBody.innerHTML = schedString;
}

//make tags for all the alarms
function listAllAlarms(alarmArray) {
  let alarmString = '';
  for (let i = 0; i < alarmArray.length; i++) {
    alarmString += `<span class="tag is-info">${printTimeString(alarmArray[i],true)}</span>`;
  }
  return alarmString;
}


//update the time and put it in the #displayTime, also check for alarms
function updateTime() {
  const displayTime = document.getElementById('displayTime');
  const infoBlock = document.getElementById('infoBlock');
  const nowTime = new Date();
  
  const getInfo = whichWindow(nowTime, periodArray);   //determine which time window we are in
    //getInfo[0] is the human readable period
    //getInfo[1] is the key to this period in periodArray

  displayTime.innerHTML = printTimeString(nowTime, true);    //update the time
  infoBlock.innerHTML = `
    <p class="block">Current Period: ${getInfo[0]}</p>
    <p class="block">
      Alarms are set each period to <strong>${alarmsAfter.join(", ")}</strong> after the start of the period 
      and <strong>${alarmsBefore.join(", ")}</strong> before the end of the period.
    </p>
  `;

  const classArray = document.querySelectorAll('.is-selected');
  for (let i = 0; i < classArray.length; i++) {
    classArray[i].classList.remove('is-selected');
  }
  
  if (getInfo[1] != undefined) {                       //if getInfo[1] is undefined, we aren't in a period
    checkAlarm(nowTime, getInfo[1]);                   //check for alarms
    document.getElementById(`schedRowKey-${getInfo[1]}`).classList.add('is-selected')
    document.getElementById(`alarmListKey-${getInfo[1]}`).innerHTML = listAllAlarms(periodArray[getInfo[1]].alarms);
  }

  setTimeout(updateTime, 1000);                       //call this function again in one second
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
    if (theTime >= value.start && theTime <= value.end){
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
    if ( alarmsArray[i] - nowTime <= 0 ) {
      //do the alarm!
      doAlarm();

      //remove this alarm from the periodArray so it doesn't get called again
      periodArray[periodArrayKey].alarms.splice(i,1); 
    } 
  }
}

//do the alarm!
function doAlarm() {
  document.getElementById('sound1').play()
}