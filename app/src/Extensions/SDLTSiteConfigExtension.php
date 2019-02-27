<?php
/**
 * Site Config Extension for SDLT Tool
 *
 * @category SilverStripe_Project
 * @package SDLT
 * @author  Catalyst I.T. SilverStripe Team 2018 <silverstripedev@catalyst.net.nz>
 * @copyright 2018 Catalyst.Net Ltd
 * @license https://www.catalyst.net.nz (Commercial)
 * @link https://www.catalyst.net.nz
 *
 * */
namespace NZTA\SDLT;

use SilverStripe\ORM\DataExtension;
use SilverStripe\Assets\Image;
use SilverStripe\Forms\FieldList;
use SilverStripe\AssetAdmin\Forms\UploadField;

/**
 * Site Config Extension for SDLT Tool
 **/
class SDLTSiteConfigExtension extends DataExtension
{
    /**
     * Has One relationships
     *
     * @var array
     */
    private static $has_one = [
        'NZTALogo' => Image::class,
        'LoginHeroImage' => Image::class
    ];

    /**
     * Ownership relationships - automatically publish these records
     *
     * @var array
     */
    private static $owns = [
        'NZTALogo',
        'LoginHeroImage'
    ];

    /**
     * CMS fields for siteconfig extension
     *
     * @param FieldList $fields fields passed into the extension
     * @return void
     */
    public function updateCMSFields(FieldList $fields)
    {
        $fields->addFieldsToTab(
            'Root.Images',
            [
                UploadField::create('NZTALogo', 'NZTA Logo')
                    ->setDescription('This is official NZTA logo that appears throughout the application. Should be an SVG'),
                UploadField::create('LoginHeroImage', 'Login screen background image')
                    ->setDescription('This is the background image shown on the login screen.'),
            ]
        );
    }
}
