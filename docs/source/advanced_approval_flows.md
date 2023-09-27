# Advanced: More Approval Flow Information

## Overview
The SDLT uses a 3-stage approval flow. This becomes 4 stages when there is a certification and accreditation task.

The stages are:

    Task Approvals
    Security Architect Approval
    Chief Information Security Officer and Business Owner Approval
    Certification Authority and Accreditation Authority.

## Task Approvals
Tasks can be configured to use a SDLT user group as an approval group. When a task with this configured is completed by the user, the approval group will receive an email asking them to review and approve the task. Members of the approval group will have access to the entire submission and other allocated tasks to help with their review.

Once the reviewer is happy with the task, they can click "approve" and it will be marked as "approved by X" on the submission summary screen. This will flag it as complete within the SDLT and the user will be able to submit the full submission for approval if they have completed all tasks.

Note: The task approvers can see a list of outstanding task awaiting approval by going to the landing page, clicking "Awaiting Approvals" and selecting "Task Approvals".
Security Architect Approval

## Submission Approval
Once all tasks have been completed/approved, the user can submit the full submission for approval. The submission will be marked as "awaiting security architect" and the SDLT-SecurityArchitects SDLT user group will be emailed a notification asking them to review and approve. The SDLT will not notify the business owner of CISO at this point. The Security Architect approval is a mandatory step for all submissions.

Once a member of the security architect group approves the submission, it will be marked as "awaiting approval" and the CISO and Business Owner will be emailed a notification asking them to review and approve.
Chief Information Security Officer and Business Owner Approval

The next stage of approval is when the CISO and Business Owner receive an approval email at the same time.

The CISO approval is a recommendation that does not change the status of the submission.

The Business Owner is the person responsible for accepting the risks related to the deliverable and their approval will mark the submission as approved. If there is a certification and accreditation task, the submission will instead be marked as "awaiting_certification_and_accreditation".
Certification Authority and Accreditation Authority

Any submission with a C&A task will be required to complete two extra approval stages to verify certification and grant accreditation.

The certification authority will decide to grant or deny certification.

The accreditation authority will decide to issue or deny accreditation.

Note: If either authority deny the submission, then it's overall status will be denied. But it is possible for the certification authority to deny certification and the accreditation authority to still grant accreditation. Business rules will dictate how this is to be handled, but it would be expected that in this scenario the accreditation period would be short (1-3 months) to allow for remediation.
