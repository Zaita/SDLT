<?php
/**
 * Display login attempts in CMS
 *
 * @category SilverStripe_Project
 * @package SDLT
 * @author  Catalyst I.T.
 * @copyright 2019 New Zealand Transport Agency
 * @license https://nzta.govt.nz (BSD-3)
 * @link https://nzta.govt.nz
 *
 **/
namespace NZTA\SDLT\Extension;

use SilverStripe\ORM\DataExtension;
use SilverStripe\Forms\FieldList;
use SilverStripe\Forms\GridField\GridField;
use SilverStripe\Forms\GridField\GridFieldConfig_RecordViewer;
use SilverStripe\Security\LoginAttempt;
use SilverStripe\Core\Convert;

/**
 * Display login attempts in CMS
 */
class ShowLoginAttemptsExtension extends DataExtension
{
    /**
     * new database fields
     *
     * @var array
     */
    private static $db = [
        'Hostname' => 'Varchar(255)'
    ];

    /**
     * Update CMS fields
     *
     * @param FieldList $fields fields
     * @return void
     */
    public function updateCMSFields(FieldList $fields)
    {
        $fields->addFieldToTab(
            'Root.LoginAttempts',
            GridField::create(
                'LoginAttempts',
                'LoginAttempts',
                LoginAttempt::get()->filter('Member.ID', $this->owner->ID),
                GridFieldConfig_RecordViewer::create(25)
            )
        );
    }

    /**
     * Record hostname before writing record
     *
     * @return void
     */
    public function onBeforeWrite()
    {
        if (isset($_SERVER['REMOTE_HOST'])) {
            $this->owner->Hostname = Convert::raw2sql($_SERVER['REMOTE_HOST']);
        }
    }
}
