# Digital Security Risk Assessment Configuration
```{contents} Contents
:depth: 4
```
## Foreword
The Digital Security Risk Assessment (DSRA) is an advanced concept in terms of automating change management. The SDLT provides an optional DSRA capability where you can offload your risk assessment, control implementation and control validation work to the DSRA as a guide to the delivery team.

In simple terms, the DSRA calculates the risk using a standardised quantitiative measurement, then provides a Kanban board to the project team for working through control implementation. Each control comes with the technology patterns for the organisation, and by implementing the applicable ones, the Kanban board automatically updates the current risk position.

If you have a mature risk assessment methodology, you might not find this of use. But, if you have no risk assessment methodology then the DSRA is an ideal starting point. It requires minimal initial configuration and is usable "out of the box".

## The Digital Security Risk Assessment
The Digital Security Risk Assessment (DSRA) is a combination of a security risk assessment and orgainsational patterns for delivery. By being a mechanism for the delivery of technology and security patterns, delivery teams are encouraged to engage with the SDLT and DSRA as early as possible.

This is designed to provide an end-to-end approach to security within the concept of delivery. Controls are provided to the user with an initial risk impact position at (or before) high-level design. The delivery team can then asses what controls, technologies and patterns are appropriate for the deliverable and plan around that. The DSRA represents this by introducing gamification and shopping-down risk.

A key aspect of digitizing the security risk assessment process is the move from a qualitative to quantitative approach. Where the assessment of impacts and likelihoods is traditionally done through risk workshops, the DSRA handles this internally.

Note: For the rest of this page, we'll refer to a control that has not been implemented as a treatment in line with traditional risk terminology.

## The 100,000ft view
The DSRA process is quantitative (score based). The delivery team will get an impact score and a likelihood score. They'll be able to shop-down the scores by picking treatments from the recommended treatment list that fit with their delivery.

A delivery team can pick from a list of available treatments those that:
* Fit within the time and budget allowed
* Reduce the risk position to an acceptable “Low” As each treatment is implemented.

The DSRA provides an ongoing “live” view of risk to the delivery team. This process can be started after the high-level design is understood, so at the very beginning of the project life-cycle. The decision of controls to be implemented to shop-down risk can be incorporated into the high-level design with the knowledge that the final risk rating will be acceptable to the organisation. This provides full transparency to the delivery team and persons accepting risk on behalf of the organisation.

The DSRA purposely sets out to gamify the risk assessment process. Everything within the DSRA has scores attached that influence the level of risk up or down. This encourages delivery teams to work with the DSRA to figure out the best return on investment. They can choose controls that work best with their delivery time-frames and budgets, but ultimately bring their final risk position down to an acceptable level.

## Key Information
The DSRA will almost always give the user a higher starting risk position than the manual process. This is because of the shift from qualitative to quantitative and absolute risk to controllable risk. All users will be able to implement controls to reduce their risk rating to "Low" within the methodology. The outcome from a user perspective in terms of "effort required" should not change from standard good practice.

The "Initial Impact Assessment" only lists ~20 systems. This is because we have an "Other/Not-Listed" category that is a catch-all set at "Moderate" in terms of impact levels. This is a nice compromise between complexity and coverage.

## What are the Risks
The SDLT ships with a pre-configured DSRA that represents six risks. These risks represent the CIA triad as well as some practical risks. Removal of risks is not necessary if they are not applicable to your scenario. Risks will only show up in the DSRA when they have an assigned impact through the Risk Questionnaire.

* Information Disclosure (incl Privacy Breach) – The information is disclosed to an unauthorised internal or external party.
* Information Modification – The information is changed, removing data integrity and truth.
* Information Loss – The loss the information and all backups.
* Sustained Service Unavailability – The service is gone for an extended or indefinite period.
* Degraded Service Performance – The service is having sustained performance issues.
* Human Damage or Loss of Life – A person is harmed, or person(s) are killed.

## Controllable vs Absolute Risk
The move from a manual qualitative risk framework to a digital quantitative risk framework does require some key changes to the way risk is measured and reported. One of the key changes required is the move from "Absolute" to "Controllable" risk.

Absolute risk means all risk of the encompassing environment, data or systems. A traditional risk assessment methodology will consider the absolute risk and use this as a starting point for the recommendation of treatments.

The DSRA looks only at controllable risk. This means risk that is within the control of the delivery team for the current deliverable. It is expected that all controllable risk be "Low" as reported by the DSRA for a delivery to continue to production.

## Impact x Likelihood = Current Risk Rating
The DSRA uses the traditional approach of having a matrix and calculating the risk rating by looking up Impact x Likelihood. This approach was purposely retained to make it easier to understand for users. It is expected that most people are familiar with tradtional risk matrixes.

### Calculating: Impact
The DSRA looks at potential impact based on:
* The systems your deliverable interacts with (transmits data to or receives data from)
* The data your system handles (stores, transmits or receives)

Systems and Data are both pre-classified with impact scores. These impact levels are combined and worked through some math to come out with a final impact rating. This means that any change that transmits or receives data from "System A" will have the impact ratings for "System A" added to the calculation. This has been designed to account for concepts such as lateral movement within a network etc. The impact score for each risk is calculated by looking at the scores added to all systems and data that the user selects as part of their "Initial Impact Assessment" risk questionnaire. In the following example, we'll consider the "Information Disclosure" risk.

The user selects the following data: First Name, Last Name, Address And the following systems: System 1, System 2 Where the following Information Disclosure scores have been assigned:
```none
First Name - 4
Last Name - 4
Address - 29
System 1 - 29
System 2 - 31
```

The math would be:
```none
X = 4 + 4 + 29 + 29
Avg = Average(X)
Med = Median(X)
Score = 31 + ((3 x Avg + 2x Med) x 0.25)
Score = 31 + ((3 x 16.5 + 2 x 16.5) x 0.25)
Score = 61.625
```

This is represented as: Score = Max Score + ((3x Average + 2x Median) x 0.25) => where Median and Average are calculated with the Max Score removed.
Within the SDLT configuration. This calculation method is named "NZTA Risk Approximation".

### Calculating: Likelihood
Likelihood is represented as a score, not as a percentage or chance in the DSRA. All risks that get allocated to the DSRA will start with a likelihood of 100 and will be adjusted as treatments are implemented. A likelihood can do down when a treatment is implement; and can go up if there is a penalty applied (see "Security Components and Controls" below).

Likelihood cannot be altered by users or administrators of the SDLT. It's a fixed part of the SDLT/DSRA methodology.

### Calculating: Treatments and Controls
The contra element to the risk in the DSRA is the treatment. Where a treatment is a recommended control that has not been implemented, and a control is a treatment that has been implemented. For the purpose of further discussion, both treatments and controls will be referred to as controls only.

The calculation of risk creates two values (likelihood and impact) that can be modified by the implementation of a control. Every control has 4 values assigned to it for each risk.
* Likelihood – The amount to reduce the likelihood by when the control is implemented
* Impact – The amount to reduce the impact by when the control is implemented
* Likelihood Penalty – The amount to increase the likelihood by when the control is not implemented
* Impact Penalty – The amount to increase the likelihood by when the control is not implemented.

The Likelihood and Impact values will reduce the respective risk scores as controls are implemented. This is how the DSRA users will “shop” down risk. They’ll be able to determine what controls provide the best ROI for their change.

e.g. The control “Multi-factor Authentication” could have a likelihood score of 11 for “Information Disclosure” and 2 for “Information Loss”. When implemented, this control would reduce the current likelihood score by 11 for “Information Disclosure” and by 2 for “Information Loss”.

The Penalties are used to enforce key controls. Where a control is mandatory, it’ll have a penalty applied that prevents the reduction of risk to “Low” unless it has been implemented. This allows the enforcement of controls like Multi-factor Authentication across all changes where User accounts are being implemented.

e.g. The control “Multi-factor Authentication” may have a likelihood score of 11 and a penalty if 20 for “Information Disclosure”. If this control is implemented, it’d have a net effect of reducing the “Information Disclosure” likelihood rating by 31. If it is not implemented, the likelihood score is increased from it’s based value by 20.
Security Components and Controls

The SDLT comes pre-configured with 1 security component named the "Baseline Control Set". This control set has ~60 controls that are pre-configured for the default DSRA setup.

### DSRA Object Hierarchy
The DSRA has:
* "Security Components" which are a control catalogue and each has many "Controls"
* Each "Control" has many "Risks"
* Each "Risk" has 4 weights (Likelihood, Impact, Likelihood Penalty and Impact Penalty)

The default configuration only uses a single security component, but the DSRA is designed to allow multiple security components, each with their own control sets. This allows the user to pick the components that are applicable to their delivery and have a more targeted control set. The philosophy being that more security components, each with less controls would allow for a more targeted approach.

e.g. You could have a Security Component called "Virtual Machines" that had controls specific for the deployment of virtual machines; and another called "Firewall" that had controls specific for the deployment of a firewall.

## Baseline Control Set
The DSRA comes pre-configured with the "baseline control set". The control set has ~60 controls that are aligned to the New Zealand Information Security Manual (NZISM) “MUST” requirements for New Zealand Government Agencies.

For each control, the SDLT provides the user with:
* A description of what the control is and why it’s important.
* Where possible, how to implement the control in line with Technology decisions (e.g. what type of multi-factor authentication to use).
* The scores that the DSRA uses to change the risk