# Advanced: Creating Control Sets for DSRA
The Digital Security Risk Assessment (DSRA) supports using multiple control sets. This allows an organization to have targeted controls (e.g., Corporate, Operational, PowerApps, Cloud etc). The default SDLT comes with a single control set, the Baseline Control Set based on the New Zealand Information Security Manual, but it was designed to support many control sets.

Control Sets can be applied either statically to a DSRA, or directly to a component when delivery components are used. A delivery component approach allows the submitter to specify different parts of their solution (e.g., database and website) and assign different control sets per component.

Note: Where I have specified Control Sets, this may be Security Components for SDLTv2 users. In SDLTv3 this was renamed to better align to using Product Components/Aspects
Exporting a Control Set

From the Admin Panel select Control Sets. You will see a list of already installed or imported control sets. On the right-hand side of each control set is an icon with a blue downward facing arrow. Click this and it will do an export. If the export is going to be small/short then it will automatically open a dialog for you to download the file. If the file is going to be large, it will be emailed to you.

Please ensure you have configured the Data Export Email through the Settings -> Email section of the administration panel.
Importing a Control Set

Control Sets can be imported as JSON files through the Admin Panel by going to Control Sets and selecting Import

## Sample JSON
```none
{
    "securityComponents": [
        {
            "name": "Baseline Control Set",
            "description": "Baseline Control Set",
            "controls": [
                {
                    "name": "Access control policy and procedure",
                    "description": "<p>Ensure that users are only provided with access to the service that have been specifically authorised to use, including:<\/p><ul><li>Documenting of an access control policy that defines business requirements for access, principles for access (e.g. need to know, role based) and access control rules that will ensure these requirements are met<\/li>\n<li>Implementing specific policies for access control based on business functions, processes or user roles and responsibilities, such as administrator access, user access, system access, remote access, network access, and discretionary and mandatory access<\/li>\n<\/ul>",
                    "implementationGuidance": "",
                    "implementationEvidence": "",
                    "controlWeightSets": [
                        {
                            "risk": "Information Disclosure",
                            "likelihood": 2,
                            "Impact": 0,
                            "likelihoodPenalty": 0,
                            "impactPenalty": 0
                        },
                        {
                            "risk": "Information Modification",
                            "likelihood": 2,
                            "Impact": 0,
                            "likelihoodPenalty": 0,
                            "impactPenalty": 0
                        },
                        {
                            "risk": "Information Loss",
                            "likelihood": 2,
                            "Impact": 0,
                            "likelihoodPenalty": 0,
                            "impactPenalty": 0
                        },
                        {
                            "risk": "Degraded Service Performance",
                            "likelihood": 7,
                            "Impact": 0,
                            "likelihoodPenalty": 0,
                            "impactPenalty": 0
                        },
                        {
                            "risk": "Human Damage or Loss of Life",
                            "likelihood": 7,
                            "Impact": 0,
                            "likelihoodPenalty": 0,
                            "impactPenalty": 0
                        }
                    ]
                }
            ]
        }
    ]
}
```
It is recommended that you export an existing control set, then edit that.
Creating a Control Set Manually

From the Admin Panel select Control Sets and Add Control Set. This will allow you to add a control set, then add new controls or link existing controls to it. If you link existing controls, you will need to specify new weights for each risk as these are unique per control set. The SDLT provides full functionality for adding and editing controls within a control set through the Admin Panel.