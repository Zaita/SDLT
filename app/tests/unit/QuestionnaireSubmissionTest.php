<?php

use SilverStripe\Dev\FunctionalTest;
use SilverStripe\Security\Member;
use NZTA\SDLT\Model\QuestionnaireSubmission;

class QuestionnaireSubmissionTest extends FunctionalTest
{
    /**
     * @var boolean
     */
    protected $usesDatabase = true;

    /**
     * @var string
     */
    protected static $fixture_file = 'app/tests/fixtures/QuestionnaireSubmissionTest.yml';

    /**
     * Tests that for any given user, their group memberships produce an accurate
     * array of their applicable approval fields.
     */
    public function test_normalise_group_approval_fields()
    {
        // Assert correct no totals
        $userHasNoGroups = $this->objFromFixture(Member::class, 'user-has-no-groups');
        $this->assertCount(0, QuestionnaireSubmission::normalise_group_approval_fields($userHasNoGroups));

        $userHasOneGroup = $this->objFromFixture(Member::class, 'user-has-one-group');
        $this->assertCount(1, QuestionnaireSubmission::normalise_group_approval_fields($userHasOneGroup));
        $this->assertEquals(['SecurityArchitectApprovalStatus',], QuestionnaireSubmission::normalise_group_approval_fields($userHasOneGroup));

        $userHasTwoGroups = $this->objFromFixture(Member::class, 'user-has-two-groups');
        $this->assertCount(2, QuestionnaireSubmission::normalise_group_approval_fields($userHasTwoGroups));
        $this->assertEquals([
            'CisoApprovalStatus',
            'SecurityArchitectApprovalStatus',
        ], QuestionnaireSubmission::normalise_group_approval_fields($userHasTwoGroups));

        $this->assertCount(3, QuestionnaireSubmission::normalise_group_approval_fields($userHasTwoGroups, true));
        $this->assertEquals([
            'BusinessOwnerApprovalStatus',
            'CisoApprovalStatus',
            'SecurityArchitectApprovalStatus',
        ], QuestionnaireSubmission::normalise_group_approval_fields($userHasTwoGroups, true));
    }

    /**
     * Wether or not a user is a "Business Owner" is a bit of an unknown thing.
     * Let's test this the best we can.
     *
     * @todo Need to scaffold an appropriate request that creates a QuestionnaireSubmission
     * record.
     */
    public function testIsCurrentUserABusinessOwner()
    {
        $this->assertFalse(QuestionnaireSubmission::create()->isCurrentUserABusinessOwner());
        $this->assertFalse(QuestionnaireSubmission::create([
            'UUID' => 'Wibble'
        ])->isCurrentUserABusinessOwner());
        $this->assertFalse(QuestionnaireSubmission::create([
            'UUID' => 'Wibble',
            'ApprovalLinkToken' => 'Wibble'
        ])->isCurrentUserABusinessOwner());
    }
}
