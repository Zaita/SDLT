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
namespace NZTA\SDLT\Extension;

use GraphQL\Type\Definition\ResolveInfo;
use SilverStripe\GraphQL\Scaffolding\Interfaces\ScaffoldingProvider;
use SilverStripe\GraphQL\Scaffolding\Scaffolders\SchemaScaffolder;
use SilverStripe\ORM\DataExtension;
use SilverStripe\Assets\Image;
use SilverStripe\Forms\FieldList;
use SilverStripe\AssetAdmin\Forms\UploadField;
use SilverStripe\Forms\CheckboxField;
use SilverStripe\Forms\HTMLEditor\HtmlEditorField;
use SilverStripe\SiteConfig\SiteConfig;

/**
 * Site Config Extension for SDLT Tool
 **/
class SDLTSiteConfigExtension extends DataExtension implements ScaffoldingProvider
{
    /**
     * @var array
     */
    private static $db = [
        'AlertEnabled' => 'Boolean',
        'AlertMessage' => 'HTMLText',
        'NoScriptAlertMessage' => 'HTMLText'
    ];

    /**
     * Has One relationships
     *
     * @var array
     */
    private static $has_one = [
        'Logo' => Image::class,
        'LoginHeroImage' => Image::class
    ];

    /**
     * Ownership relationships - automatically publish these records
     *
     * @var array
     */
    private static $owns = [
        'Logo',
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
                UploadField::create('Logo', 'Logo')
                    ->setDescription('This is official logo that appears throughout the application. Should be an SVG'),
                UploadField::create('LoginHeroImage', 'Login screen background image')
                    ->setDescription('This is the background image shown on the login screen.'),
            ]
        );

        $fields->addFieldsToTab(
            'Root.SiteAlertMessage',
            [
              CheckboxField::create(
                  'AlertEnabled',
                  'Alert Enabled'
              ),
              HtmlEditorField::create(
                  'AlertMessage',
                  'Alert Message'
              ),
              HtmlEditorField::create(
                  'NoScriptAlertMessage',
                  'Javascript disabled Alert Message'
              )
            ]
        );
    }

    /**
     * @param SchemaScaffolder $scaffolder
     * @return SchemaScaffolder
     */
    public function provideGraphQLScaffolding(SchemaScaffolder $scaffolder)
    {
        $scaffolder
            ->type(SiteConfig::class)
            ->addFields([
                'Title'
            ])
            ->operation(SchemaScaffolder::READ)
            ->setName('readSiteConfig')
            ->setUsePagination(false)
            ->setResolver(function ($object, array $args, $context, ResolveInfo $info) {
                $config = SiteConfig::current_site_config();
                return [$config];
            })
            ->end();

        return $scaffolder;
    }
}
