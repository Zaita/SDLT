<?php

use NZTA\SDLT\Model\TaskSubmission;
use SilverStripe\Dev\FunctionalTest;
use SilverStripe\SiteConfig\SiteConfig;

class TaskSubmissionTest extends FunctionalTest
{
    /**
     * Creates an isolated database, unique to this test-run.
     *
     * @var boolean
     */
    protected $usesDatabase = true;

    public function testTaskSubmissionLinks()
    {
        // Functionally "resets" the application's BASE_URL, to a known value, rather
        // than relying on the fact that it will always be "https://localhost" or on
        // whatever Director::absoluteBaseURL() gives us - and runs all the assertions
        // in this "context".
        $this->withBaseURL('https://foo.com', function() {
            // Bake-in some known values to compare against our dyanamic output
            $ts = TaskSubmission::create([
                'UUID' => '1234-abcd-efgh-ijkl',
                'SecureToken' => '0b9517e220ef67e9625540cc44da0edca48e32a61cfae1aec47658a47bd3065f',
            ]);
            $ts->write();

            $this->assertEquals('#/task/submission/1234-abcd-efgh-ijkl', $ts->Link());
            $this->assertEquals(
                'https://foo.com/vendor/#/task/submission/1234-abcd-efgh-ijkl?token=0b9517e220ef67e9625540cc44da0edca48e32a61cfae1aec47658a47bd3065f',
                $ts->AnonymousAccessLink('vendor')
            );
            $this->assertEquals(
                'https://foo.com/Security/login/?BackURL=%23%2Ftask%2Fsubmission%2F1234-abcd-efgh-ijkl',
                $ts->SecureLink()
            );

            // Set the SiteConfig for the current test DB
            $siteConfig = SiteConfig::current_site_config();
            $siteConfig->AlternateHostnameForEmail = 'https://example.co.nz/////////////////';
            $siteConfig->write();

            $this->assertEquals(
                'https://example.co.nz/vendor/#/task/submission/1234-abcd-efgh-ijkl?token=0b9517e220ef67e9625540cc44da0edca48e32a61cfae1aec47658a47bd3065f',
                $ts->AnonymousAccessLink('vendor')
            );
            $this->assertEquals(
                'https://example.co.nz/Security/login/?BackURL=%23%2Ftask%2Fsubmission%2F1234-abcd-efgh-ijkl',
                $ts->SecureLink()
            );
        });
    }
}
