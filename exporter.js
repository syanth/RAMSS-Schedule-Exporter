window.onload = function() {
      var txt = document.getElementById('txt');
     // txt.value = "Copy paste your schedule here";
      document.getElementById('link').onclick = function(code) {
      	var cal = "BEGIN:VCALENDAR" +
      		"\r\nVERSION:2.0" +
      		"\r\nPRODID:-//hacksw/handcal//NONSGML v1.0//EN"
      	var inp = txt.value;
      	var regcourse = /([A-Z]{3})(\s)([0-9]{3})/g; //regex to find course code
      	var classes = inp.split(regcourse); // Every 4n+1 index is the dept code, 4n+3 is the course number, 4n+4 is the course info
        var regline = /(\n)/g;
        var info;
        var start;
        var times;
        var dates;
        // var timereg = /([A-Z][a-z])(\s)([0-9])/g;
        // var datereg = /([0-9]{2})(\S)([0-9]{2})(\S)([0-9]{4})/g;
        for (i = 0; i < (classes.length-1)/4; i++) { 
          info = classes[4*i+4].split("\n");
          console.log(info);
          times = [];
          dates = [];
          rooms = [];
          for (j = 9; j < info.length; j+=7) {
            if (info[j].search("TBA") == -1 && info[j+3].search("TBA") == -1) {
              times.push(info[j]);
              dates.push(info[j+3]);
              rooms.push(info[j+1]);
            }
          }
          for (j = 0; j < times.length; j++) {
            cal += "\r\nBEGIN:VEVENT" +
            "\r\nDTSTART:" + parseTime(times[j], dates[j], rooms[j]) +
            "\r\nSUMMARY:" + info[0].substring(3, info[0].length) +
            "\r\nEND:VEVENT";
          }
          console.log(times);
          console.log(dates);
        }
        cal += "\r\nEND:VCALENDAR";
        this.href = 'data:text/plain;charset=utf-8,'
          + encodeURIComponent(cal);
      };
    };
function parseTime(time, date, room) {
  var m_31 = [1, 3, 5, 7, 8, 10, 12]; // List of months with 31 days
  //var timereg = ([0-9])(:)([0-9]{2});
  console.log(time + date);
  var year = parseInt(date.substring(6, 10));
  var month = parseInt(date.substring(0, 2));
  var day = parseInt(date.substring(3, 5));
  if (day != 1) {
    day--;
  }
  else {
    month--;
    if (m_31.indexOf(month) != -1) { // if the month has 31 days. i.e. if the month exists in the list of months with 31 days
      day = 31;
    }
    else if (month == 2) {
      if (isLeapYear(year)) {
        day = 29;
      }
      else {
        day = 28;
      }
    }
    else {
      day = 30;
    }
  }
  if (day < 10) {
    day = "0" + day;
  }
  if (month < 10) {
    month = "0" + month;
  }
  var datetime = year + "" + month + "" + day + "T";
  var bias;
  var hoursbegin; // the hours will be converted to the 24 hour clock
  var minsbegin;
  if (time.substring(7, 8) == 'A') { // if true, the time has one digit.
    hoursbegin = parseInt(time.substring(3, 4));
    minsbegin = parseInt(time.substring(5, 7));
    datetime += "0" + hoursbegin + String(minsbegin) + "00";
    bias = 0;
  }
  else if (time.substring(7, 8) == 'P') { // Time must be single digits, but PM
    minsbegin = parseInt(time.substring(5, 7));
    hoursbegin = parseInt(time.substring(3, 4)) + 12;
    datetime += String(hoursbegin) + String(minsbegin) + "00";
    bias = 0;
  }
  else {
    hoursbegin = parseInt(time.substring(3, 5));
    minsbegin = parseInt(time.substring(6, 8));
    if (time.substring(8, 9) == 'P' && hoursbegin != 12)
      hoursbegin += 12;
    datetime += String(hoursbegin) + String(minsbegin) + "00";
    bias = 1;
  }
  var exdate = "\r\nEXDATE:" + year + "" + month + "" + day + "T000000";
  year = parseInt(date.substring(19, 23));
  month = parseInt(date.substring(13, 15));
  day = parseInt(date.substring(16, 18));
  if ((m_31.indexOf(month) != -1 && day == 31) || (month == 2 && day == 28 && !isLeapYear(year)) || (month == 2 && day == 29 && isLeapYear(year)) || day == 30) {
    day = 1;
    month++;
  }
  else {
    day++;
  }
  if (day < 10) {
    day = "0" + day;
  }
  if (month < 10) {
    month = "0" + month;
  }
  datetime += "\r\nRRULE:FREQ=WEEKLY;UNTIL=" + year + "" + month + "" + day + "T";
  var hoursend;
  var minsend;
  if (time.substr(16+bias, 1) == 'A') { // if true, the time has one digit.
    hoursend = parseInt(time.substr(12+bias, 1));
    minsend = parseInt(time.substr(14+bias, 2));
    datetime += "0" + hoursend + String(minsend) + "00";
  }
  else if (time.substr(16+bias, 1) == 'P') { // Time must be single digits, but PM
    hoursend = parseInt(time.substr(12+bias, 1)) + 12;
    minsend = parseInt(time.substr(14+bias, 2));
    datetime += hoursend + String(minsend) + "00";
  }
  else {
    hoursend = parseInt(time.substr(12+bias, 2));
    minsend = parseInt(time.substr(15+bias, 2));
    if (time.substr(17+bias, 1) == 'P' && hoursend != 12)
      hoursend += 12;
    datetime += hoursend + String(minsend) + "00";
  }
  datetime += ";WKST=SU;BYDAY=" + time.substr(0, 2).toUpperCase();
  datetime += exdate;
  datetime += "\r\nDURATION:PT" + (hoursend - hoursbegin) + "H" + (minsend - minsbegin) + "M";
  datetime += "\r\nLOCATION:" + room;
  return datetime;
}
function isLeapYear(year) {
  if (year % 400 == 0) {
    return true;
  }
  else if (year % 100 == 0) {
    return false;
  }
  else if (year % 4 == 0) {
    return true;
  }
  return false;
}