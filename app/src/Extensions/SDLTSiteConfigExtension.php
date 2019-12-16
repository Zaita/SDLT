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
 */

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
use SilverStripe\Forms\TextField;
use SilverStripe\Forms\LiteralField;
use SilverStripe\SiteConfig\SiteConfig;

/**
 * Site Config Extension for SDLT Tool
 */
class SDLTSiteConfigExtension extends DataExtension implements ScaffoldingProvider
{
    /**
     * @var array
     */
    private static $db = [
        'AlertEnabled' => 'Boolean',
        'AlertMessage' => 'HTMLText',
        'NoScriptAlertMessage' => 'HTMLText',
        'AlternateHostnameForEmail' => 'Varchar(255)',
        // Customisation Config
        'FooterCopyrightText' => 'Text',
    ];

    /**
     * Has One relationships
     *
     * @var array
     */
    private static $has_one = [
        'Logo' => Image::class,
        'AuthLogo' => Image::class,
        'LoginHeroImage' => Image::class,
        // Customisation Config
        'HomePageBackgroundImage' => Image::class,
        'QuestionnairePdfHeaderImage' => Image::class,
        'QuestionnairePdfFooterImage' => Image::class,
        'FavIcon' => Image::class,
    ];

    /**
     * Ownership relationships - automatically publish these records
     *
     * @var array
     */
    private static $owns = [
        'Logo',
        'AuthLogo',
        'LoginHeroImage',
        'HomePageBackgroundImage',
        'QuestionnairePdfHeaderImage',
        'QuestionnairePdfFooterImage',
        'FavIcon',
    ];

    /**
     * CMS fields for siteconfig extension
     *
     * @param FieldList $fields fields passed into the extension
     * @return void
     */
    public function updateCMSFields(FieldList $fields)
    {
        // Main Tab
        $fields->dataFieldByName('Title')
            ->setDescription('This title is displayed in the HTML &lt;title&gt;, and at the top of most screens.');
        $fields->removeByName('Tagline');

        // "Main" tab
        $fields->addFieldToTab(
            'Root.Main',
            LiteralField::create(
                'MainIntro',
                '<p class="message notice">Configure general SDLT settings.</p>'
            ),
            'Title'
        );

        // "Access" tab
        $fields->addFieldToTab(
            'Root.Access',
            LiteralField::create(
                'AlertIntroAccess',
                '<p class="message notice">Configure who can do what within the SDLT.</p>'
            ),
            'CanViewType'
        );

        // "Email" tab
        $fields->addFieldsToTab(
            'Root.Email',
            [
                LiteralField::create(
                    'AlertIntroEmail',
                    '<p class="message notice">Configure some aspects of how email is treated in the system.</p>'
                ),
                TextField::create(
                    'AlternateHostnameForEmail',
                    'Alternate hostname for email'
                )->setDescription(
                    'This setting is used to configure an alternate hostname for use in outgoing email messages. It is'
                    . ' intended to be used in situations where the hostname of the server differs from the URL users'
                    . ' use to log into the website, such as a proxy server or a web application firewall (WAF).'
                )
            ]
        );

        // "Images" tab
        $fields->addFieldsToTab(
            'Root.Images',
            [
                LiteralField::create(
                    'ImagesIntro',
                    '<p class="message notice">Configure how various images and logos appear to users.</p>'
                ),
                UploadField::create('AuthLogo', 'Login screen logo')
                    ->setDescription('This is the logo that appears within the authentication screens.'),
                UploadField::create('Logo', 'Header Logo')
                    ->setDescription('This is the logo that appears in the header.
                    The default dimensions for the logo are 370px x 82px.'),
                UploadField::create('LoginHeroImage', 'Login screen background image')
                    ->setDescription('This is the background image shown on the login screen.'),
                UploadField::create('HomePageBackgroundImage', 'Home Page Background Image')
                    ->setDescription('This is the background image shown on the home-screen.'),
                UploadField::create('FavIcon', 'FavIcon')
                    ->setDescription('This is the site favicon shown on front-end browser tabs.
                    Require: .ico format, dimensions of 16x16, 32x32, or 48x48.')
                    ->setAllowedExtensions(['ico']),
            ]
        );

        // "Alert" tab.
        $fields->addFieldsToTab(
            'Root.Alert',
            [
                LiteralField::create(
                    'AlertIntro',
                    '<p class="message notice">Check the box below, to display '
                    .'a global banner-message along the top of each screen.</p>'
                ),
                CheckboxField::create(
                    'AlertEnabled',
                    'Alert Enabled'
                ),
                HtmlEditorField::create(
                    'AlertMessage',
                    'Alert Message'
                )
                    ->setRows(5),
                HtmlEditorField::create(
                    'NoScriptAlertMessage',
                    'Javascript disabled Alert Message'
                )->setRows(5)
            ]
        );

        // "PDF" tab
        $fields->addFieldsToTab(
            'Root.PDF',
            [
                LiteralField::create(
                    'PDFIntro',
                    '<p class="message notice">Configure how generated PDFs appear to users.</p>'
                ),
                UploadField::create('QuestionnairePdfHeaderImage'),
                UploadField::create('QuestionnairePdfFooterImage')
            ]
        );

        // "Footer" tab
        $fields->addFieldsToTab(
            'Root.Footer',
            [
                LiteralField::create(
                    'FooterIntro',
                    '<p class="message notice">Configure how the global footer appears to users.</p>'
                ),
                TextField::create(
                    'FooterCopyrightText',
                    'Footer Text'
                )
            ]
        );
    }

    /**
     * @param SchemaScaffolder $scaffolder generic comment
     * @return SchemaScaffolder
     */
    public function provideGraphQLScaffolding(SchemaScaffolder $scaffolder)
    {
        $scaffolder
            ->type(SiteConfig::class)
            ->addFields([
                'Title',
                'FooterCopyrightText',
                'LogoPath',
                'HomePageBackgroundImagePath',
                'PdfHeaderImageLink',
                'PdfFooterImageLink',
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

    /**
     * onBeforeWrite
     *
     * @return void
     */
    public function onBeforeWrite()
    {
        if ($this->owner->AlternateHostnameForEmail) {
            //strip whitespace characters from both sides of the URL
            $this->owner->AlternateHostnameForEmail = trim($this->owner->AlternateHostnameForEmail);
            //also strip / just in case it's there.
            $this->owner->AlternateHostnameForEmail = rtrim($this->owner->AlternateHostnameForEmail, '/');
            //we're now guaranteed to have a URL without a trailing slash so if we add one now it's consistently present
            $this->owner->AlternateHostnameForEmail .= '/';
        }
    }

    /**
      * Called from provideGraphQLScaffolding().
      *
      * @return string
      */
    public function getLogoPath() : string
    {
        return (string) $this->owner->Logo()->Link();
    }

    /**
     * Called from provideGraphQLScaffolding().
     *
     * @return string
     */
    public function getHomePageBackgroundImagePath() : string
    {
        return (string) $this->owner->HomePageBackgroundImage()->Link();
    }

    /**
     * Called from provideGraphQLScaffolding().
     *
     * @return string
     */
    public function getPdfHeaderImageLink() : string
    {
        return (string) $this->owner->QuestionnairePdfHeaderImage()->Link();
    }

    /**
     * Called from provideGraphQLScaffolding().
     *
     * @return string
     */
    public function getPdfFooterImageLink() : string
    {
        return (string) $this->owner->QuestionnairePdfFooterImage()->Link();
    }
}
