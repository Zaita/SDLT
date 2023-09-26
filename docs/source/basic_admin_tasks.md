# Basic Administration Tasks
```{contents} Contents
:depth: 4
```

This page will cover some of the basic administration tasks of operating the SDLT. 

All configuration is done in the admin panel (or content management system/CMS). You will need to authenticate to the SDLT as an admin and access the admin panel (http://127.0.0.1:8123/admin).

All of the following sections assume you have loaded the admin panel. The following terms will be used to describe navigating around the admin panel:
* The `SideBar` is the left navigation bar in the admin panel, it's the top level navigation element.
* The `NavBar` is located at the top-right of the screen and is a context navigation bar based on the `SideBar` context.
* The `Content Window` is the main window where configuration options will be changed.

## Accessing the Login form when using SSO
When using SSO, it's still possible to access the login form and login with a local user. This would be necessary in any event where you need to break glass and the SSO is broken.

By appending `showloginform=1` to the login screen URI, you will enable the login form.

## Changing the Submitter on a Submission
There are scenarios where the submitter of a submission will need to be changed. The submitter is the only person who can edit the answers of a submission or submit it for approval. If the submitter has left your organisation, you will likely need to update this value in the admin panel to allow another staff member to complete the submission.

Select `Questionnaire Submissions` from the SideBar, then search and find the submission you need to update. Click on this submission, then select `Submitter details` from the NavBar. You will need to update the `Submitter email` field. This will link to the user's SDLT account and allow them to have ownership of the submission. Updating the Submitter and Submitter name are optional.

If the submission has any tasks that are currently in progress, it is best to update the submitter details for these as well. Tasks that have yet to be started, or have been completed will not need to be updated. Tasks can be found under `Task Submissions` NavBar option for the submission.

Ensure you click Save down the bottom.

## Deleting a Submission
Select `Questionnaire Submissions` from the SideBar, then click the hourglass icon on the right to search for the submission. If you have a direct link to the submission's summary screen, then grabbing the UUID from the URL is the most efficient method. Once you have found the submission, click on it to enter it's details view. Select `Main` from the NavBar, then change the status to expired and click save down the bottom.

Alternatively, you can ask the submitter to go to the summary screen and click edit answers. If you have configured that questionnaire to expire then it will expire automatically that night if the time since it was started is longer than the expiration period.

## Delegating Business Owner Responsibilities
When the SDLT sends an email to the business owner for approval, this contains a secure link. Any persons with this secure link can authenticate against the SDLT and approve on behalf of the business owner. Commonly, we'd say for the person who is acting as the business owner to get a forwarded copy of this email. When this is not possible, you can grab the secure URI from the SDLT.

Start by selecting `Questionnaire Submissions` from the SideBar, then selecting the target submission. You can use the search box to search for the specific submission. Once you have selected the submission, select `Links` from the NavBar. The `Business Owner Approval Link` can be issued to any persons who can approve on behalf of the Business Owner. 

## Changing the Business Owner
Using the same instructions above to find and open a submission, select `Business Owner Details` from the NavBar. From here you can update the business owner email address. If you'd want to resend the emails asking for approval to the new business owner, click the "Resend Email" button at the bottom right.'
