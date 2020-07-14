<?php

/**
 * This file contains the "JIRAIssueV3" class.
 *
 * @category SilverStripe_Project
 * @package SDLT
 * @author  Catalyst I.T. SilverStripe Team 2019 <silverstripedev@catalyst.net.nz>
 * @copyright NZ Transport Agency
 * @license BSD-3
 * @link https://www.catalyst.net.nz
 */

namespace NZTA\SDLT\IssueTracker\JIRA;

use NZTA\SDLT\IssueTracker\IssueTrackerTicket;
use NZTA\SDLT\Model\SecurityControl;

/**
 * A very basic encapsulation of a v3 JIRA issue format.
 *
 * @see https://unpkg.com/@atlaskit/adf-schema@3.1.2/dist/json-schema/v1/full.json
 */
class JIRAIssueV3 extends IssueTrackerTicket
{
    /**
     * @var string
     */
    protected $introText = 'Instruction';

    /**
     * @var array
     *
     * A map of JIRA emoji "states" to {@link Control} Status values. This should probably
     * be implemented on an intermediary class with no knowledge of either {@link JIRA}
     * or {@link SecurityControl}.
     */
    private static $emoji_status_map = [
        ':check_mark:' => SecurityControl::CTL_STATUS_1,
        ':cross_mark:' => SecurityControl::CTL_STATUS_2,
        ':link:' => SecurityControl::CTL_STATUS_3,
    ];

    /**
     * The v3 ticket format.
     *
     * @return string
     */
    public function compose(): string
    {
        $body = array_merge([
            [
                'type' => 'heading',
                'attrs' => [
                    'level' => 1,
                ],
                'content' => [
                    [
                        'type' => 'text',
                        'text' => 'Instructions',
                    ],
                ]
            ],
            [
                'type' => 'panel',
                'attrs' => [
                    'panelType' => 'warning',
                ],
                'content' => [
                    [
                        'type' => 'paragraph',
                        'content' => [
                            [
                                "type" => "text",
                                "text" => "Below is a list of the security controls that should be implemented for this product. Those marked as "
                            ],
                            [
                                "type" => "emoji",
                                "attrs" => [
                                    "shortName" => ":cross_mark:"
                                ]
                            ],
                            [
                                "type" => "text",
                                "text" => " (cross_mark) have been designated as intended by the solution designer and should be implemented. Those marked as "
                            ],
                            [
                                "type" => "emoji",
                                "attrs" => [
                                    "shortName" => ":link:"
                                ]
                            ],
                            [
                                "type" => "text",
                                "text" => " (link) have been marked as not-applicable and do not need to be implemented. When a control has been implemented, it moves from intended "
                            ],
                            [
                                "type" => "emoji",
                                "attrs" => [
                                    "shortName" => ":cross_mark:"
                                ]
                            ],
                            [
                                "type" => "text",
                                "text" => " (cross_mark) to be realised "
                            ],
                            [
                                "type" => "emoji",
                                "attrs" => [
                                    "shortName" => ":check_mark:"
                                ]
                            ],
                            [
                                "type" => "text",
                                "text" => " (check_mark). Please update this ticket description with the new emoji when you have implemented a control."
                            ],
                        ],
                    ],
                    [
                        'type' => 'paragraph',
                        'content' => [
                            [
                                'type' => 'text',
                                'text' => '    ',
                            ]
                        ],
                    ],
                    [
                        'type' => 'paragraph',
                        'content' => [
                            [
                                'type' => 'text',
                                'text' => sprintf('If you have any questions about this process, please contact the security architects (%s)', $this->email),
                            ]
                        ],
                    ]
                ],
            ],
            [
                'type' => 'heading',
                'attrs' => [
                    'level' => 1,
                ],
                'content' => [
                    [
                        'type' => 'text',
                        'text' => 'Controls',
                    ]
                ]
            ]],
            $this->getListItems()
        );

        $payload = [
            'fields' => [
                'project' => [
                    'key' => $this->projectKey,
                ],
                'summary' => $this->summaryText,
                'description' => [
                    'type' => 'doc',
                    'version' => 1,
                    'content' => $body,
                ],
                'issuetype' => [
                    'name' => $this->issueType
                ],
            ]
        ];

        return json_encode($payload);
    }

    /**
     * Defines an issue heading.
     *
     * @return array
     */
    public function getHeading(): array
    {
        return [
            'type' => 'heading',
            'content' => [
                [
                    'type' => 'text',
                    'attrs' => [
                        'level' => 1,
                    ],
                    'text' => $this->headingText,
                ]
            ],
        ];
    }

    /**
     * Defines an issue's introductory text.
     *
     * @return array
     */
    public function getIntro(): array
    {
        return [
            'type' => 'paragraph',
            'content' => [
                [
                    'type' => 'text',
                    'text' => $this->introText,
                ]
            ],
        ];
    }

    /**
     * Defines an issue's introductory text.
     *
     * @return array
     */
    public function getDescription(): array
    {
        return [
            'type' => 'paragraph',
            'content' => [
                [
                    'type' => 'text',
                    'text' => $this->descriptionText,
                ]
            ],
        ];
    }

    /**
     * Defines an issue's bullet points.
     *
     * @todo Should they be rendered in any particular way in JIRA e.g. "[x]"?
     * @return array
     */
    public function getListItems(): array
    {
        return $this->listItems;
    }

    /**
     * A version3 specific implementation of normalise_list_item().
     *
     * @param  string $name The text to render before everything else on a line.
     * @param  array  $parts An arbitrary number of items to render into a list-item.
     * @return string
     */
    public static function normalise_list_item($name, ...$parts): string
    {
        foreach ($parts as $part) {
            if (!is_string($part)) {
                throw new \InvalidArgumentException('Bad variadic parameter passed.');
            }
        }

        $desc = implode(' ', $parts);
        $control = $name;
        $body = [
            [
                'type' => 'paragraph',
                'content' =>
                [
                    [
                        'type' => 'emoji',
                        'attrs' => [
                            'shortName' => ':cross_mark:',
                        ]
                    ],
                    [
                        'type' => 'text',
                        'text' => "  $control",
                        'marks' => [
                            [
                                'type' => 'strong',
                            ]
                        ]
                    ]
                ],
            ],
            [
                'type' => 'paragraph',
                'content' =>
                [
                    [
                        'type' => 'text',
                        'text' => '    ',
                    ],
                    [
                        'type' => 'text',
                        'text' => $desc,
                    ]
                ]
            ],
        ];

        return json_encode($body);
    }

}
