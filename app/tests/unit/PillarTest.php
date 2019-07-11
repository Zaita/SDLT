<?php

use SilverStripe\Dev\SapphireTest;
use NZTA\SDLT\Model\Pillar;

class PillarTest extends SapphireTest
{
    public function testisApprovalOverriddenByBadArg()
    {
        $this->expectException(\InvalidArgumentException::class);
        Pillar::create([
            'ApprovalOverrideBySecurityArchitect' => 0,
        ])->isApprovalOverriddenBy('sdlt-not-here');
    }

    public function testisApprovalOverriddenByNoField()
    {
        $this->expectException(\LogicException::class);
        Pillar::create([
            'ApprovalOverrideByCISO' => 0,
        ])->isApprovalOverriddenBy('sdlt-ciso');
    }

    public function testisApprovalOverriddenByGroup()
    {
       $this->assertFalse(Pillar::create([
            'ApprovalOverrideBySecurityArchitect' => 0,
        ])->isApprovalOverriddenBy('sdlt-security-architect'));

        $this->assertTrue(Pillar::create([
            'ApprovalOverrideBySecurityArchitect' => 1,
        ])->isApprovalOverriddenBy('sdlt-security-architect'));
    }
}
