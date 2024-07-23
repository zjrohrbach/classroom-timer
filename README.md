# classroom-timer

## Explanation
This project exists to serve a very niche problem.  In my classroom, students coming from across my rather large school have trouble making it to my room before passing period ends.  Therefore, I give them an extra 45 seconds after the bell rings before I count them tardy.  I also don't allow students to pack up prior to three minutes before the end of the period.  So, I wanted a script that would sound an alarm bell 45 seconds after the beginning of each period and 3 minutes prior to the end of the period.

## Configuration
You can write your own JSON configurations and store them in `ui.js`.  Each configuration needs a `"title"`, some `"blocks"` objects with `"period"`, `"start"` and `"end"` times, and two optional arrays in `mm:ss` format for `"defaultAlarmsAfterStart"` (of the period) and `"defaultAlarmsBeforeEnd"` (of the period).  You can override the default alarms in a given period by added the object `alarmsAfterStart` are `alarmsBeforeEnd`.  In the example below, alarms go off 45 seconds after the beginning of each period (except period 1, due to the `alarmsAfterStart` property in the first `block` object) and 3 minutes before the end of the period.

### Example Config

~~~ json
{
    "title"   : "7 Periods",
    "blocks"  : [
      {  "period" : "Period 1" , "start" : "08:25" , "end" : "09:12" ,
         "alarmsAfterStart" : [] } ,
      {  "period" : "Period 2" , "start" : "09:18" , "end" : "10:05" } ,
      {  "period" : "Period 3" , "start" : "10:11" , "end" : "11:04" } ,
      {  "period" : "Period 4" , "start" : "11:10" , "end" : "12:31" } ,
      {  "period" : "Period 5" , "start" : "12:37" , "end" : "13:24" } ,
      {  "period" : "Period 6" , "start" : "13:30" , "end" : "14:17" } ,
      {  "period" : "Period 7" , "start" : "14:23" , "end" : "15:10" }
    ] ,
    "defaultAlarmsAfterStart"  : [ "0:45" ],
    "defaultAlarmsBeforeEnd"   : [ "3:00" ]
}
~~~

## Demo

You can see this in action at <https://timer.rohrbachscience.com/>.  There are custom timers at <https://timer.rohrbachscience.com/custom/>.
