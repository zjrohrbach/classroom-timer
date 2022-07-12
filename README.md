# classroom-timer

## Explanation
This project exists to serve a very niche problem.  In my classroom, students coming from across my rather large school have trouble making it to my room before passing period ends.  Therefore, I give them an extra 45 seconds after the bell rings before I count them tardy.  I also don't allow students to pack up prior to three minutes before the end of the period.  So, I wanted a script that would sound an alarm bell 45 seconds after the beginning of each period and 3 minutes prior to the end of the period.

## Configuration
You can write your own JSON configurations and store them in `schedules.js`.  Each configuration needs a `"title"`, some `"blocks"` objects with `"period"`, `"start"` and `"end"` times, and two arrays in `mm:ss` format for `"alarmsAfterStart"` (of the period) and `"alarmsBeforeEnd"` (of the period).

### Example Config

~~~ json
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
~~~
