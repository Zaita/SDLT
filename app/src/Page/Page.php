<?php

/**
 * This file contains the "Page" class.
 *
 * @category SilverStripe_Project
 * @package SDLT
 * @author  Catalyst I.T. SilverStripe Team 2018 <silverstripedev@catalyst.net.nz>
 * @copyright 2018 Catalyst.Net Ltd
 * @license https://www.catalyst.net.nz (Commercial)
 * @link https://www.catalyst.net.nz
 */

namespace {

    use SilverStripe\CMS\Model\SiteTree;
    use SilverStripe\ORM\DB;
    use SilverStripe\Versioned\Versioned;

    /**
     * Class Page
     *
     */
    class Page extends SiteTree
    {
        /**
         * @var array
         */
        private static $db = [];

        /**
         * @var array
         */
        private static $has_one = [];

        /**
         * Add default records to database.
         *
         * This function is called whenever the database is built, after the
         * database tables have all been created. Overloa this to add default
         * records when the database is built, but make sure you call
         * parent::requireDefaultRecords().
         *
         * @return void
         */
        public function requireDefaultRecords()
        {
            parent::requireDefaultRecords();

            if (SiteTree::config()->create_default_pages) {
                return;
            }

            // default pages
            if (DB::query("SELECT COUNT(*) FROM \"SiteTree\"")->value() == 1) {
                $aboutus = new Page();
                $aboutus->Title = _t(__CLASS__.'.DEFAULTABOUTTITLE', 'About Us');
                $aboutus->Content = _t(
                    'SilverStripe\\CMS\\Model\\SiteTree.DEFAULTABOUTCONTENT',
                    '<p>You can fill this page out with your own content, or delete it and create your own pages.</p>'
                );
                $aboutus->Sort = 2;
                $aboutus->write();
                $aboutus->copyVersionToStage(Versioned::DRAFT, Versioned::LIVE);
                $aboutus->flushCache();
                DB::alteration_message('About Us page created', 'created');

                $contactus = new Page();
                $contactus->Title = _t(__CLASS__.'.DEFAULTCONTACTTITLE', 'Contact Us');
                $contactus->Content = _t(
                    'SilverStripe\\CMS\\Model\\SiteTree.DEFAULTCONTACTCONTENT',
                    '<p>You can fill this page out with your own content, or delete it and create your own pages.</p>'
                );
                $contactus->Sort = 3;
                $contactus->write();
                $contactus->copyVersionToStage(Versioned::DRAFT, Versioned::LIVE);
                $contactus->flushCache();
                DB::alteration_message('Contact Us page created', 'created');
            }
        }
    }
}
