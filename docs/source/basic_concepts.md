# Basic Concepts
```{contents} Contents
:depth: 4
```
This page will cover all of the basic concepts of the SDLT. Starting with the three paragraphs below which go through the key pieces of glossary and their relationships to each other within the scope of the SDLT.

The SDLT has a `dashboard` where the user selects the `pillar` of the delivery type they are working on. Once a `pillar` has been selected from the `dashboard`, the user will work through a `questionnaire` to determine the scope, complexity and risk of the delivery. When the user completes the `questionnaire`, the SDLT will assess the answers and assign required `tasks` to the `submission`. The user will need to complete all `tasks` on the `submission` before it can be submitted for approval. 

`Tasks` assigned to the SDLT will be marked as `complete` when they are finished, or they will be marked as `waiting for approval` if they require the approval of an external stakeholder. The external stakeholder will receive an email with a link to the `submission` and `task` for them to review and `approve`. Once they `approve` the task it will be considered `complete` by the SDLT.

When all tasks are marked as `complete` or `approved` on the `submission`, the user can submit the `submission` for approval. The submission will then be locked (non editable) and sent through to the `securty architects`, `chief information security officer` and `business owner` to approve. When the submission has been approved by the `business owner`, it will be marked as `approved` in the SDLT.

## Default Content
The SDLT ships with default content that should be suitable for many organisations out of the box. 

This includes five pillars:
1. Risk Profile - A risk questionnaire, no tasks that calculates the risk of a protential deliverable.
2. Proof of Concept - Used for running proof of concepts or software trials.
3. Cloud Product Onboarding - Used for adopting a new SaaS or cloud product/service.
4. New Project or Product - Used when releasing a new product, project, component, feature etc.
5. Product Release - Used for a BAU change release. So either a bug fix, technical change, version update etc.

This default content is just example content. You can definitely use it from day-1 within your organisation, then customise it slowly over time as you figure out what works for your (or doesn't). Or you can invest upfront and customize the content straight away. We'd recommend the former.

As part of the default content, the pillars are also pre-configured to spawn different tasks including:
1. Security Risk Assessment

And this also includes a pre-configured security control set for the security risk assessment based on the industry standard security baselines (NIST, NZISM and ISO27001). You will need to do some configuration on the `Initial Risk Impact Assessment` questionnaire to enter in the types of data your organisation uses, and the names of your critical systems.

## How Questions Work
The SDLT provides some basic logic for questions in the questionnaire. There are two types of questions, `input` or `action`. The `input` question asks the user for some information, but has no logic. The `action` question will change the questionnaire flow based on the answer.

The `action` question will have `action fields` (buttons) that have an action associated with them. The SDLT has the following actions:
1. `continue` - Continue to the next question in the questionnaire.
2. `goto` - Go to a specific question in the questionnaire.
3. `message` - Display a message to the user and halt the questionnaire.
3. `finish` - End the questionnaire, returning an optional result.

The `continue` action is the default action in the SDLT. When a user finishes answering a question, the SDLT will `continue` to the next question in the questionnaire.

The `goto` action is used to skip questions in the questionnaire. If the user answers an `action` question with an answer that means they don't need to be asked some further questions on that topic, the `goto` is used to skip ahead to the next relevant question.

The `message` action is used to display a message to the user and halt the questionnaire. This is often used as part of the triage at the beginning of a pillar questionnaire to ensure the user has selected the appropriate pillar for their delivery. 

The `finish` action is used in a task, where the task has determined the result and doesn't need to ask anymore questions. This is used on tasks like Information Classification, where the SDLT has already determined the classification and does not need to ask further questions.

_Note: Input questions have a single action `continue` that cannot be customized. They are considered to have "no logic"_

## Tasks
A task is a requirement that is added to a submission. The task will have a different type of engagement depending on it's type. The most common type of tasks is a `questionnaire` that has more questions to solicit information from the user. Other tasks include:
1. Security Risk Assessment
2. Control Validation Audit
3. External Questionnaire (for an external to complete)
4. Risk Questionnaire (questionnaire that returns a risk result)

Some tasks will be marked as complete when the user finishes them, and some will require a stakeholder approval.

_Note: A questionnaire that is assigned to a pillar, and a task that is a questionnaire type share the same configuration and behavioural options. They are the same type of object in the code_

## Stakeholder Engagement
Tasks can be configured to require the approval of stakeholders. In the SDLT, you can create a `Security -> Group` and this group can have members assigned. A task can be configured to require the approval of a security group. A task will require only a single member of that group to approve it.

The SDLT will email all members of the group when a new task is submitted that requires approval. This allows the SDLT to automatically engage stakeholders only when necessary. 

A good example of this process is the engagement of Privacy. They will be required to review and approve any privacy assessments, but only want to be engaged on submissions that meet a specific criteria. The pillar will determine if there is a privacy required, and if so will add a privacy task to the submission. The privacy task will solicit information from the user, then notify the privacy stakeholders when the SDLT is ready for them to review and approve the task.

Common stakeholder groups that should be involved in the SDLT are:
* Privacy
* Procurement / Finance
* Security Operations
* Information Management / Data
* Change Management
* Compliance

_Note: Task approvers can view the entire submission. This ensures we can reduce the amount of duplicate information gathering across an entire submissions_

## Approval Flows
A submission must be approved before it is marked as done. The SDLT has a built-in approval flow.
When a submission is submitted for approval, it will go to members of the SDLT's Security Architect group. Once a member of the security architect group approves the submission, it will go to the business owner and members of the CISO (chief information security officer) group. A member of the CISO group will give a recommendational approval, and the business owner will formally approve accepting all risks associated with the delivery.

Once the business owner approves the submission, it is marked as approved.
_Note: A pillar can be configured to allow the security architect members to auto-approve submissions if they feel they pose no risk to the organisation_

## Digital Security Risk Assessment (DSRA)
The DSRA is a component of the SDLT that focusses on simplifying risk assessments and control validation. It implements the following core concepts:
1. The way you measure risk is consistent and quantifiable, no human involvement.
2. The decision to implement controls should have a known impact on the risk position (gamification).
3. The process should be entirely self-service for the project/delivery team.
4. Approval/Endorsement of the delivery should be guaranteed based on acceptable risk outcomes.
5. Controls should provide information aboud technology decisions and patterns to the delivery team (design by numbers).

The DSRA has 3 steps.
1. The user answers a small questionnaire about the data and systems their delivery interacts with. This is used to calculate the initial risk position.
2. The user then selects from the control catalogue the controls that are applicable to their delivery. The applicable controls will all have a risk reduction score against the initial risk position.
3. The delivery team plan and implement the controls to bring their risk position down to an agreed acceptable level.

Every control has a description of the control, implementation guidance, validation requirements and the scores associated with the risk reduction. The idea being that the delivery team don't need to go hunting for information outside of the SDLT on how to satisfy the risk requirements.

For example, if you have a control called "Password Complexity" then this control should include all information required to implement it. The requirements for the password complexity rules should be documented within the control. Similarly, if you had a more complex control like "Back Up", then the control should link to the relevant documentation on how the project can implement back-up procedures in line with the organisations existing processes, practices and tooling. A solution designer shouldn't ever need to chase down organisational patterns and existing technology implementating when designing a new solution. The DSRA should be the avenue to delivering technology decisions for designs to solution designers.

Most importantly for the DSRA, it provides a consistent and reproducible method for assessing, measuring and monitoring risk in the organisation. If you put A in today and get C out, then that would be the same in 12 months or 24 months regardless of the person conducting the risk assessment. It removes human subjectivity from the equation.

## Certification and Accreditation
Certification and accreditation (C&A) is a two-step process that ensures security of information systems. Certification is the process of evaluating, testing, and examining security controls that have been pre-determined based on the data type in an information system. The evaluation compares the current systems’ security posture with specific standards. The certification process ensures that security weaknesses are identified and plans for mitigation strategies are in place. On the other hand, accreditation is the process of accepting the residual risks associated with the continued operation of a system and granting approval to operate for a specified period of time [1](https://en.wikipedia.org/wiki/Certification_and_Accreditation).

By it's very nature, using the SDLT constitutes a certification process. 

Accreditation is handled through a specific "certification and accreditation" task in the SDLT. The SDLT can be customised to have a C&A task that issues an accreditation in the `Service Inventory` module. The task is completed after all other tasks and an accreditation for a period of time can be issued. This ensures systems are recorded in the SDLT as either being accredited or not, and re-certification can be done on a schedule. You can also use the SDLT to catalogue and review all changes made on a system during it's accreditation pariod as part of the re-certification process.








