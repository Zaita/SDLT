# Advanced: Administration Tasks
```{contents} Contents
:depth: 4
```

This page will cover some of the basic administration tasks of operating the SDLT. 

All configuration is done in the admin panel (or content management system/CMS). You will need to authenticate to the SDLT as an admin and access the admin panel (http://127.0.0.1:8123/admin).

All of the following sections assume you have loaded the admin panel. The following terms will be used to describe navigating around the admin panel:
* The `SideBar` is the left navigation bar in the admin panel, it's the top level navigation element.
* The `NavBar` is located at the top-right of the screen and is a context navigation bar based on the `SideBar` context.
* The `Content Window` is the main window where configuration options will be changed.

## Adding a Task to a Submission
Note: This is not recommended. Please ensure your flows have been properly configured to be as accurate as possible. Doing this incorrectly could brick the submission.

In the admin panel, select Task Submissions from the left, then find the type of task you want to add to the target submission. Click into the task to view it's details. Go to the Task submission data tab and expand the Questionnaire Data field. Copy the contents of the field.

Select Questionnaire Submissions on the left, then click the hourglass icon on the right to search for the submission. Find a submission that you want to add the task to. If you have a direct link to the submission's summary screen, then grabbing the UUID from the URL is the most efficient method. Once you have found the submission, click on it to enter it's details view. Under the Task Submissions tab search for the name of the task in the search box and click Link Existing. Click in to the task to view details, then select Task submission data tab and expand the Questionnaire Data field. Paste the contents of the questionnaire data you had previously copied here and save.

## Creating or Editing a Pillar

The SDLT comes pre-configured with 4 pillars. If you want to create your own you can do, but this will likely require the addition of a new icon that is displayed on the home screen.

Adding new Icons for new Pillars can be done by:

    Adding icon SVG to: /themes/sdlt/src/img/Home/
    Adding a Pillar type to: /app/src/Model/Pillar.php
    Import Icon and add to switch statement in: /themes/sdlt/src/js/services/HomeDataService.js

If you want to add or edit a new pillar, this can be done by accessing the administration panel http://sdlt-ip/admin and going to Questionnaires on the left hand menu. You should have selected the Dashboards tab on the top right, then click on the dashboard listed in the center. Once inside the Dashboard view, you'll be modifying the landing page for the SDLT.

The Main tab will allow you to modify the text that is displayed on the landing screen.

The Pillars tab will allow you to modify what pillars show up on the landing screen.

The Tasks tab will allow you to modify what tasks show up as standalone tasks on the landing screen.

A Pillar is a linking of a Questionnaire to the landing page. You can do this through the Pillars tab. Once displayed you will see a list of existing pillars. Clicking inside a pillar will show you the linked questionnaire. You can change the text displayed on the pillar button by modifying the Label field and the Pillar Type will determine the icon displayed (nothing else).

The Questionnaire tab will show you the linked questionnaires. While the SDLT allows you to link multiple questionnaires, only the top one will be accessible to the user.

Alternately, you can click Questionnaires on the left menu, then select the Questionnaires tab on the top right to see a list of questionnaires in the system. These questionnaires are the only ones that can be linked to a pillar and accessed from the landing page.

## Deleting a Submission
Select `Questionnaire Submissions` from the SideBar, then click the hourglass icon on the right to search for the submission. If you have a direct link to the submission's summary screen, then grabbing the UUID from the URL is the most efficient method. Once you have found the submission, click on it to enter it's details view. Select `Main` from the NavBar, then change the status to expired and click save down the bottom.

Alternatively, you can ask the submitter to go to the summary screen and click edit answers. If you have configured that questionnaire to expire then it will expire automatically that night if the time since it was started is longer than the expiration period.

## Delegating Business Owner Responsibilities
When the SDLT sends an email to the business owner for approval, this contains a secure link. Any persons with this secure link can authenticate against the SDLT and approve on behalf of the business owner. Commonly, we'd say for the person who is acting as the business owner to get a forwarded copy of this email. When this is not possible, you can grab the secure URI from the SDLT.

Start by selecting `Questionnaire Submissions` from the SideBar, then selecting the target submission. You can use the search box to search for the specific submission. Once you have selected the submission, select `Links` from the NavBar. The `Business Owner Approval Link` can be issued to any persons who can approve on behalf of the Business Owner. 

## Changing the Business Owner
Using the same instructions above to find and open a submission, select `Business Owner Details` from the NavBar. From here you can update the business owner email address. If you'd want to resend the emails asking for approval to the new business owner, click the "Resend Email" button at the bottom right.'
