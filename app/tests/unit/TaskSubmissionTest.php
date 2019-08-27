<?php
use NZTA\SDLT\Model\TaskSubmission;
use SilverStripe\Dev\SapphireTest;
use SilverStripe\Control\Director;
use SilverStripe\SiteConfig\SiteConfig;

class TaskSubmissionTest extends SapphireTest
{
    public function testTaskSubmissionLinks()
    {
        $ts = TaskSubmission::create();
        $ts->write();
        $uuid = $ts->UUID;
        $token = $ts->SecureToken;
        $absURL = Director::absoluteBaseURL();
        $link = $ts->Link();
        $anonLink = $ts->AnonymousAccessLink('vendor');
        $secureLink = $ts->SecureLink();

        $this->assertEquals('#/task/submission/'.$uuid, $link);
        $this->assertEquals($absURL.'vendor/#/task/submission/'.$uuid.'?token='.$token, $anonLink);
        $this->assertEquals($absURL.'Security/login/?BackURL='.rawurlencode('#/task/submission/'.$uuid), $secureLink);

        $siteConfig = SiteConfig::current_site_config();
        $siteConfig->AlternateHostnameForEmail = 'https://example.co.nz/////////////////';
        $siteConfig->write();

        $anonLink = $ts->AnonymousAccessLink('vendor');
        $secureLink = $ts->SecureLink();

        $this->assertEquals('https://example.co.nz/'.'vendor/#/task/submission/'.$uuid.'?token='.$token, $anonLink);
        $this->assertEquals('https://example.co.nz/'.'Security/login/?BackURL='.rawurlencode('#/task/submission/'.$uuid), $secureLink);

    }
}
