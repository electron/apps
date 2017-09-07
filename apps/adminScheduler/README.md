# adminScheduler

adminScheduler is an application leveraging electron for cross platform compatibility, vue.js for lightning fast UI and full-calendar.io to deliver a premium calendar interface. 

**Features**
* separate client/admin classes
* admin can accept/reject requests
* client can make requests to different admins
* client receives updates regarding appointment status
* admin can cancel events including accepted requests
* client can also cancel events but not those of admin users

*To see the Features of this application in action click here:*
[adminScheduler video](https://www.youtube.com/watch?v=LhDaJRz65Sg)

Purpose
---
I wanted to develop a desktop application that had the potential to prove useful in a variety of use cases. In its current form adminScheduler is setup to handle to tasks of scheduling a doctor’s office. Users are patients or doctors who can request appointments and accept/reject them  based on their associated privileges. However although this project has been set up to handle the needs of a doctor’s office, it can be used in other situations with just a few modifications. The application could be used to manage the appointments of a law office or it could be used to schedule meetings between a tutor and their students. adminScheduler can be used in almost any scenario involving a client and admin relationship.

Setup
---

(This application is currently configured to work with a postgres db. However it could be reconfigured to work with other databases.)

**Initialstep:**
Clone repository then go to adminScheduler/clean_server/ and run 'npm install' and go to adminScheduler/scurrent_clean/ and run 'npm install'
and lastly go to adminScheduler/clean_server/createUserTable and run 'npm install'

**Database Setup**
* Step 1. Create postgres databases named ‘seq’ and ‘doctor’
* Step 2. Find sequelize.js in adminScheduler/clean_server/createUserTable/app/sequelize.js
* Step 3. Configure sequelize.js to connect with your database
* Step 4. Find setupPg.js in adminScheduler/clean_server/resources/app/setupPg.js
* Step 5. Configure the connectionString in setupPg.js
* Step 6. find setupPg.js again and run ‘node setupPg.js’
* Step 7.  go to adminScheduler/clean_server/createUserTable and run ‘node setup.js’
        
 **Final Steps**
 
* Run the server by going to adminScheduler/clean_server/resources/app and running ‘node servertest3.js’
Finally run the application by going to adminScheduler/scurrent_clean/ and running ’npm run dev’

**Client Admin Relationship**
---
If you are using this application for a different kind of client/admin relationship, for example a law office or tutoring service you may need to make some simple changes. So if you have a law office you would make some adjustments changing the users with doctor priveledges into lawyers and users with patient priveledges would become clients. Lawyers would now accept or reject appointment requests from clients and clients view the schedules of different lawyers before choosing the lawyer they would like to schedule an appointment with. In essence you would only have to change the names of some popups, buttons, and edit a couple lines of server code to change this application from one set-up for a Doctor's office to one for a law office to any sort of business involving a admin/client relationship.
