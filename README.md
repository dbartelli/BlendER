# BlendER
Google Apps Scripts for Pulling Data from Blend (Canvas LMS)

**PROBLEM**  
While [Austin ISD’s Blend (Canvas) application](https://www.austinisd.org/caregivers/technology-support-learning/blend) has some good features, I found it too difficult and time consuming to see all assignments, submissions and grades to understand if my kids were on top of everything. To get the full picture, I was drilling into each class and then flipping between modules and grades (for some reason each has separate and different info you need for each assignment) and also checking the calendar. I personally found it challenging, so I knew kids would struggle with it even more. I figured there had to be a better way to stay in sync.

**SOLUTION**  
I created a Google Apps Script that pulls from the AISD Blend portal API using a student's access token. It pulls and merges data from courses, assignments, submissions and grades. The logic in the script, plus some nifty custom conditional formatting in Google Sheets combine to prove a single pane of glass view into your student’s status in Blend. 

**PRICE**  
Free\! Please use it and enjoy. 

**SETUP**

1. Get your student’s Blend Access Token:  
   1. Log into Blend as your student (be sure it is the student’s login, not yours)  
   2. Click the profile icon on the left nav bar, then click Settings  
   3. Scroll down and click the blue button “**\+New Access Token**”  
   4. Enter a Purpose that makes sense to you, such as “BlendER”, leave the date blank, then click “**Generate Token**”  
   5. Copy the entire Token (all characters) and save it someplace safe. I recommend a password manager like LastPass. It is a password, so please treat it as such.  
2. Click [**HERE**](https://docs.google.com/spreadsheets/d/1czxLX0f3TIrhwKXfNaW1B9oGtWxwQ10LB02XEyE1kNI/edit?usp=sharing) to open the BlendER spreadsheet template   
3. Make a copy of it by going to **File** \> **Make a copy**. This will save it in your Google Drive (yes, you need a Google account). Rename it to whatever you want, such as BlendER-*Studentname*. You need to save a separate one for each student you’re tracking.

   *Quick Side Note: The first time you run it, you’ll get an “Authorization Required” permissions popup. You have to approve this because the scripts need to insert data into your spreadsheet. Feel free to look at the code in the script editor to confirm there is nothing scary or bad going on (there isn’t)*

4. Open the BlendER spreadsheet you just saved. After a second or 2, you’ll see a menu appear at the top called “**\#\#\#BlendER\#\#\#”** \- Click that and select “**Initial Setup-REQUIRED**”  
5. Paste in the Access Token you generated/saved and click **Ok**. (You need to do this only once)  
6. Now you’re ready to roll. You can select the various update menu options and pull down fresh data any time.

**FUNCTIONS**

* Update Assignments-Focused: This will refresh the Assignments tab with any for that student with a due date plus or minus 7 days from today. The assignments rows due today will be highlighted light yellow. This one is the main one you’ll use.  
* Update Assignments-Show All: This will refresh the Assignments tab with all assignments for the student. This might be good for an initial look, but will probably be overwhelming for normal use.  
* Update Events: Refreshes the data on the UpcomingEvents tab.  
* Update Activity Stream: Refreshes the data on the ActivityStream tab.

**ASSIGNMENTS**  
I find the Assignments tab to be the most useful. ***Important Note:** BlendER is showing you exactly what is in Blend and sometimes you’ll see false positives for late or missing submissions. I’m sorry, but I can’t do anything about it \- it all depends on how the teachers create the assignments. If it is weird in BlendER, it is weird in Blend. Don’t shoot the messenger\!*   
Here is some info about a few of the columns:

* Due Date: Date the assignment is due. Note that the BlendER Focused option shows only those assignments with Due Dates \+/- 7 days from today. Assignments are sorted by Due Date, oldest to newest (going into the future at the bottom)  
* Submitted Date: When the student submitted the assignment. If it is blank, there is no submission. Note that I’ve seen some “submitted dates” be blank in Blend even though the student submitted it, but that happens when they submit via certain external systems vs directly through Blend.  
* Locked: If it says “Locked” then the students can’t submit. Sometimes a teacher keeps an assignment locked until the class period or they lock it after a certain amount of time so that students can’t submit again.  
* Late: Shows **Late** in bold red text because the student will likely take a hit on their grade for being late.  
* Missing: Shows **Missing** in bold red text because it wasn’t turned in \- better ask your kid about this one\!  
* Allowed Attempts: some assignments let the student submit more than once. So, if you see a bad grade and they can submit again, have your student go for a better grade.  
* Assignment URL: Direct link to the assignment in Blend.  
* Submission URL: Direct link to the submitted assignment in Blend.  
* Submission Details: This is probably more for me than anyone else, but if something looks funky, then I look at these nitty gritty submission details. 

**ADVANCED**  
Now if you truly want to *Blend it like Bartelli*, then you’ll want to set up automated refresh. 

* While in your copy of the BlendER spreadsheet, click **Tools** \> **Script Editor**  
* You’ll see my code that runs things. On the script editor toolbar, click **Edit** \> **Current Project Triggers**  
* Click “**Add Trigger**”  
* Select the following in this order:  
  * getCourseAssignments  
  * Head  
  * Time-driven  
  * Hour Timer  
  * Every Hour (or whatever interval you want)  
* Click **Save**  
* Repeat for functions (the top box) for getUpcomingEvents and getActivityStream if desired.   
* You can close this page as well as the script editor page 
