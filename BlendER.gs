// Script to grab info from Canvas LMS, which is called Blend at Austin ISD
// Created 9/21/2020 - Dave Bartelli
// Live API for testing - https://aisdblend.instructure.com//doc/api/live

// UI Setup for API Key Management
var userProperties = PropertiesService.getUserProperties();
var scriptProperties = PropertiesService.getScriptProperties();

// General setup
var accessToken = userProperties.getProperty('canvas_access_token') || scriptProperties.getProperty('canvas_access_token');
var domain = 'https://aisdblend.instructure.com'; // move this to a menu / property if ever expand script for use outside of AISD.
var params = {
  'headers': getHeader(), 
  'method': 'GET'
}; 


// Function to check existence of sheet tab and create it if it doesn't exist
function checkSheets(sheetName) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet();
  var checkSheet = sheet.getSheetByName(sheetName);
  if (!checkSheet) {
    sheet.insertSheet(sheetName);
  } 
}

// Function to create custom Menu in Google Sheets
function onOpen() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet();
  // Check for sheet tabs that are needed 
  // checkSheets('Assignments');
  // checkSheets('UpcomingEvents');
  // checkSheets('ActivityStream');
  var menuEntries = [ {name: 'Setup Access Token-REQUIRED', functionName: 'setToken'},
                     {name: 'Update Assignments-Focused', functionName: 'menuCourseAssignmentsFocused'},
                     {name: 'Update Assignments-Show All', functionName: 'menuCourseAssignmentsAll'},
                     {name: 'Update Events', functionName: 'getUpcomingEvents'},
                     {name: 'Update Activity Stream', functionName: 'getActivityStream'},
                     {name: 'About BlendER', functionName: 'aboutBlendER'}];
  sheet.addMenu('HEY! BlendER Setup and Actions', menuEntries);  
}

// Function for setting Set Token in Menu
function setToken() {
  var token = Browser.inputBox('Enter your API access token: (Get it from Blend website>Account>Settings>New Access Token button)');
  if(token && token != 'cancel') {
    ScriptProperties.setProperty('canvas_access_token', token);
  } else {
    Browser.msgBox('Spreadsheet must have valid access token to work');
  }
}

// Function for update focused assignments menu
function menuCourseAssignmentsFocused() {
  getCourseAssignments('focused');
}

// Function for update all assignments menu
function menuCourseAssignmentsAll() {
  getCourseAssignments('all');
}

// Function for Menu to show About Script
function aboutBlendER() {
  Browser.msgBox('BlendER created by Dave Bartelli 9/2020 in a feeble attempt to maintain sanity while digging through Blend assignments/grades/event screens.');
}

// Function to Convert from ISO time to local time using library from momentjs.com
function convertTime(timestamp) {
  return moment(timestamp).utcOffset(-5).format('MM/DD/YY h:mm a');
}

// Function to create HTTP Header for API authentication 
function getHeader(){
  var properties = PropertiesService.getDocumentProperties();
  properties.setProperties({acctssToken: accessToken, domain: domain});
  var header = {'Authorization':'Bearer '+accessToken}; 
  return header;
}

// Function to get the different in days between today and due date
function diffDays(dueDate) {
  if (dueDate == null) {
    return 9999;
  }
  else {
    var todayDate = new Date(); // today's date
    var t1 = moment(todayDate).valueOf(); // get milliseconds
    var t2 = moment(dueDate).valueOf();  // get milliseconds
    return Math.round(Math.abs(Math.floor((t1-t2)/(24*3600*1000)))); // return difference in days
  }
}

// Function to pull Assignments from Courses from Canvas API
function getCourseAssignments(mode) {
  // Get courses
  var response = UrlFetchApp.fetch(domain + '/api/v1/courses?enrollment_state=active&state[]=available&per_page=200',params);
  var data = JSON.parse(response.getContentText());
  var sheetHeader = ['Course','Assignment','Due Date','Submitted Date','Locked?','Late?','Missing?','Grade','Pts Possible','Type','Allowed Attempts','Assignment URL','Submission URL','SubmissionJSON'];
  var assignments = [sheetHeader]; // Starts it off with just the header for the sheet/table and later adds rows
  data.forEach(function (result) {
    // Loop through each course and pull assignments
    var responseAssignment = UrlFetchApp.fetch(domain + '/api/v1/courses/'+result.id+'/assignments?include[]=submission&per_page=300',params);
    var dataAssignment = JSON.parse(responseAssignment.getContentText());
    dataAssignment.forEach(function(resultAssignment) {
      if (resultAssignment.due_at != null) {
        // Convert time from ISO to Local 
        var dueDateConverted = convertTime(resultAssignment.due_at);
      }
      else {
        dueDateConverted = null;
      }
      if (resultAssignment.submission.submitted_at != null) {
        // Convert time from ISO to Local 
        submissionDateConverted = convertTime(resultAssignment.submission.submitted_at);
      }
      else {
        submissionDateConverted = null;
      }
      // Check / Update Locked
      if (resultAssignment.locked_for_user === true) {
        lockedFlag = 'Locked'; //populates spreadsheet with 'Locked' to be more clear / easier on the eyes vs TRUE/FALSE
      }
      else {
        lockedFlag = null;
      }
      // Check / Update Late
      if (resultAssignment.submission.late === true) {
        lateFlag = 'Late'; //populates spreadsheet with 'Late' to be more clear / easier on the eyes vs TRUE/FALSE
      }
      else {
        lateFlag = null;
      }
      // Check / Update Missing
      if (resultAssignment.submission.missing === true) {
        missingFlag = 'Missing'; //populates spreadsheet with 'Missing' to be more clear / easier on the eyes vs TRUE/FALSE
      }
      else {
        missingFlag = null;
      }
      var days = diffDays(resultAssignment.due_at); // number days between today and due_at date
      // Check that will show only assignments within certin # days between today and due date and ignores older or blank due date assignments. 
      if(mode == 'all' || (mode == 'focused' && resultAssignment.due_at != null && days <= 7)) {
        if (resultAssignment.course_id == '264297' && resultAssignment.assignment_group_id == '290290') {
          // Ignore/skip this assignment because part of bad chinese class assignment group
        }
        else {
          assignments.push([result.name,resultAssignment.name,dueDateConverted,submissionDateConverted,lockedFlag,lateFlag,missingFlag,resultAssignment.submission.entered_grade,resultAssignment.points_possible,resultAssignment.submission.submission_type,resultAssignment.allowed_attempts,resultAssignment.html_url,resultAssignment.html_url+'/submissions/'+resultAssignment.submission.user_id,resultAssignment.submission]); 
        }
      };
    });
  });
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Assignments');
  sheet.clearContents();
  sheet.getRange(1,1,assignments.length,assignments[0].length).setValues(assignments);
  var headerRows = 1;
  var range = sheet.getRange(headerRows+1, 1, sheet.getMaxRows()-headerRows, sheet.getLastColumn());
  var sortFirst = 3; // Index of column to be sorted by; 1 = column A, 2 = column B, etc.
  var sortFirstAsc = true; //Set to false to sort descending
  range.sort([{column: sortFirst, ascending: sortFirstAsc}]); // Sorts the sheet
}

// Function to pull Upcoming Events from Canvas API
function getUpcomingEvents() {
  // Get Upcoming Events
  var response = UrlFetchApp.fetch(domain + '/api/v1/users/self/upcoming_events?per_page=200',params);
  var data = JSON.parse(response.getContentText());
  var sheetHeader = ['Context','Title','Message','Start At','End At','URL']; 
  var events = [sheetHeader]; // Starts it off with just the sheet/table header and later adds rows
  data.forEach(function(result) {
    if (result.description != null) {
      // Remove html tags from text
      var descriptionStripped = result.description.replace(/<[^>]+>/g, '');
    }
    else {
      descriptionStripped = null;
    }
    events.push([result.context_name,result.title,descriptionStripped,convertTime(result.start_at),convertTime(result.end_at),result.html_url]); 
  });
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('UpcomingEvents');
  sheet.clearContents();
  sheet.getRange(1,1,events.length,events[0].length).setValues(events);
  var headerRows = 1;
  var range = sheet.getRange(headerRows+1, 1, sheet.getMaxRows()-headerRows, sheet.getLastColumn());
  var sortFirst = 4; // Index of column to be sorted by; 1 = column A, 2 = column B, etc.
  var sortFirstAsc = true; //Set to false to sort descending
  range.sort([{column: sortFirst, ascending: sortFirstAsc}]); // Sorts the sheet
}

// Function to pull Activity Stream from Canvas API
function getActivityStream() {
  // Get Activity Stream
  var response = UrlFetchApp.fetch(domain + '/api/v1/users/self/activity_stream?only_active_courses=true&per_page=200',params);
  var data = JSON.parse(response.getContentText());
  var sheetHeader = ['Title','Message','Updated','URL']; // Starts it off with just the sheet/table header and later adds rows
  var activities = [sheetHeader];
  data.forEach(function(result) {
    if (result.message != null) {
      // Remove html tags from text
      var messageStripped = result.message.replace(/<[^>]+>/g, '');
    }
    else {
      messageStripped = null;
    }
    activities.push([result.title,messageStripped,convertTime(result.updated_at),result.url]); 
  });
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('ActivityStream');
  sheet.clearContents();
  sheet.getRange(1,1,activities.length,activities[0].length).setValues(activities);
}
