<?php
use NZTA\SDLT\Model\TaskSubmission;
use SilverStripe\Dev\SapphireTest;
use SilverStripe\Control\Director;

class TaskSubmissionTest extends SapphireTest
{
    public function testTaskSubmissionLink()
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
    }
}
