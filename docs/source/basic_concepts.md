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
adsa

## Certification and Accreditation
dsad




