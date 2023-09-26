## The User Flow
The user flow can be summarised as: `Pillar -> Tasks -> Approval`. The SDLT creates a submission object in the backend and this moves through different states depending on where in the lifecycle it is.

When the user clicks on a pillar from the dashboard, they will be asked to complete a questionnaire in the SDLT. The SDLT creates a new submission and marks it as "in progress". Once the user completes this initial set of questions and submits it, the SDLT will mark it as "submitted" and determine the required tasks for this submission. Tasks are assigned based on the answers to the initial questionnaire.

Once the user completes all tasks, the SDLT can be submitted for approval. The submission is marked as "waiting for security architect" and an email is sent to members of the "SDLT-SecurityArchitect" SDLT group. A member of this group will look at the submission and click "assign to me". Once they have completed their review they will click "approved" and the submission will be marked as "waiting for approval".

Emails will be sent to members of the "SDLT-CISO" SDLT group and to the email nominated as the business owner in the pillar questionnaire. A member of the CISO group will look at the submission and provide a recommendation approval by clicking "approve". This will not change the status of the submission. The business owner will review the submission and click "approve", this will mark the entire submission as "approved" and the user/submitter will receive an email notifying them that the submission has been approved.

### Tracking a submission
A user can click the "My Submissions" tab on the landing page to view the status of all of their submissions at any time.

A person who is responsible for the approval of a submission can click the "awaiting approvals" button on the landing page to see a list of all submissions awaiting approval at any time. A Short-breakdown of user flow would look like:

    1. A user enters the SDLT landing page
    2. The user selects a pillar for their type of deliverable
    3. The SDLT displays a "key information" page
    4. The user clicks "Start" to begin the submission.
    5. The user (submitter) answers the questions within that pillar
    6. The submitter reviews their responses before submitting to the SDLT
    7. The SDLT processes the responses and creates the appropriate Tasks to be completed
    8. The submitter completes the tasks through the SDLT
    9. Tasks that require approval when completed by the submitter will email their approval groups to be approved
    10. Once all tasks have been approved/completed, the SDLT enables the "Submit for Approval" button
    11. The submitter then submits their submission for approval
    12. Members of the Security Architect group get an email asking them to review and approve
    13. Once Security Architect approves the submission
    14. The SDLT emails the Business Owner and Chief Information Security Officer asking them to review and approve
    15. The Business Owner approves the submission
    16. The submitter gets an email notifying them of the approved submission