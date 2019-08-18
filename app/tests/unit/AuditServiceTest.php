<?php

use SilverStripe\Dev\FunctionalTest;
use SilverStripe\ORM\ValidationException;
use NZTA\SDLT\Service\AuditService;
use NZTA\SDLT\Model\AuditEvent;
use NZTA\SDLT\Model\Questionnaire;
use NZTA\SDLT\Model\QuestionnaireSubmission;
use NZTA\SDLT\Model\Task;

class AuditServiceTest extends FunctionalTest
{
    /**
     * @var boolean
     */
    protected $usesDatabase = true;

    /**
     * @var string
     */
    protected static $fixture_file = 'app/tests/fixtures/AuditServiceTest.yml';

    protected static $extra_dataobjects = [
        Questionnaire::class,
    ];

    public function testBadValidateEvent()
    {
        $this->expectException(ValidationException::class);
        singleton(AuditService::class)->ValidateEvent('Wibble');
    }

    public function test_normalise_event()
    {
        $this->assertEquals('QUESTIONNAIRE.CREATE', AuditService::normalise_event('Create', Questionnaire::create()));
        $this->assertEquals('QUESTIONNAIRESUBMISSION.CREATE', AuditService::normalise_event('Create', QuestionnaireSubmission::create()));
    }

    /**
     * Scaffold the service beforehand
     */
    public function testBasicCommit()
    {
        // Baseline
        $this->assertEquals(0, AuditEvent::get()->count());

        $event = 'Create';
        $extra = 'Something was created, where before there was nothing..';
        $user = $this->objFromFixture(Member::class, 'some-user');
        $model = Questionnaire::create([
            'Name' => 'TEST1',
        ]);

        $model->auditService->commit($event, $extra, $model, $user->Email);

        $this->assertEquals(1, AuditEvent::get()->count());
        $this->assertEquals('anyone@test.app', AuditEvent::get()->first()->UserData);
    }

    /**
     * Test logging scenario:
     * Event: Questionnaire Created
     * User:  Any
     */
    public function testCommitQuestionnaireInAnyUserContext()
    {
        // Baseline
        $this->assertEquals(0, AuditEvent::get()->count());

        $user = $this->objFromFixture(Member::class, 'some-user');
        $this->logInAs($user);

        Questionnaire::create([
            'Name' => 'TEST2',
        ])->write();

        $this->assertEquals(1, AuditEvent::get()->count());
        $this->assertEquals('Email: anyone@test.app. Group(s): N/A', AuditEvent::get()->first()->UserData);
        $this->assertEquals('QUESTIONNAIRE.CREATE', AuditEvent::get()->first()->Event);
    }

    /**
     * Test logging scenario:
     * Event: Questionnaire Submitted
     * User:  Any
     */
    public function testSubmitQuestionnaireInAnyUserContext()
    {
        // Baseline
        $this->assertEquals(0, AuditEvent::get()->count());

        $user = $this->objFromFixture(Member::class, 'some-user');
        $this->logInAs($user);

        QuestionnaireSubmission::create([
            'QuestionnaireStatus' => 'work_in_progress',
        ])->write();

        $this->assertEquals(1, AuditEvent::get()->count());
        $this->assertEquals('Email: anyone@test.app. Group(s): N/A', AuditEvent::get()->first()->UserData);
        $this->assertEquals('QUESTIONNAIRESUBMISSION.SUBMIT', AuditEvent::get()->first()->Event);
    }

    /**
     * Test logging scenario:
     * Event: Questionnaire Changed
     * User:  Security Architect
     */
    public function testChangeQuestionnaireSubmissionInSecurityArchitectUserContext()
    {
        // Baseline
        $this->assertEquals(0, AuditEvent::get()->count());

        $user = $this->objFromFixture(Member::class, 'security-architect-user');
        $this->logInAs($user);

        $questionnaireSubmission = QuestionnaireSubmission::create([
            'SecurityArchitectApprovalStatus' => 'waiting_for_approval',
        ]);
        $questionnaireSubmission->write(); // Sets the initial "waiting_for_approval" state
        $questionnaireSubmission
            ->setField('SecurityArchitectApprovalStatus', 'in_progress')
            ->write();  // Sets the subsequent "in_progress" state

        // x2 audit log entries because:
        // 1). Basic write()
        // 2). The status change
        // Both of which results in a separate audit log entry being generated
        $this->assertEquals(2, AuditEvent::get()->count());
        $this->assertEquals('Email: security-architect@test.app. Group(s): NZTA-SDLT-SecurityArchitect', AuditEvent::get()->first()->UserData);
        $this->assertEquals('QUESTIONNAIRESUBMISSION.SUBMIT', AuditEvent::get()->toArray()[0]->Event);
        $this->assertEquals('QUESTIONNAIRESUBMISSION.CHANGE', AuditEvent::get()->toArray()[1]->Event);
    }

    /**
     * Test logging scenario:
     * Event: Questionnaire Changed
     * User:  SDLT User
     */
    public function testChangeQuestionnaireSubmissionInSDLTUserContext()
    {
        // Baseline
        $this->assertEquals(0, AuditEvent::get()->count());

        $user = $this->objFromFixture(Member::class, 'sdlt-user');
        $this->logInAs($user);

        $questionnaireSubmission = QuestionnaireSubmission::create([
            'QuestionnaireStatus' => 'waiting_for_approval',
        ]);
        $questionnaireSubmission->write(); // Sets the initial "waiting_for_approval" state
        $questionnaireSubmission
            ->setField('QuestionnaireStatus', 'in_progress')
            ->write();  // Sets the subsequent "in_progress" state

        // x2 audit log entries because:
        // 1). Basic write()
        // 2). The status change
        // Both of which results in a separate audit log entry being generated
        $this->assertEquals(2, AuditEvent::get()->count());
        $this->assertEquals('Email: sdlt@test.app. Group(s): NZTA-SDLT-Users', AuditEvent::get()->first()->UserData);
        $this->assertEquals('QUESTIONNAIRESUBMISSION.SUBMIT', AuditEvent::get()->toArray()[0]->Event);
        $this->assertEquals('QUESTIONNAIRESUBMISSION.CHANGE', AuditEvent::get()->toArray()[1]->Event);
    }

    /**
     * Test logging scenario:
     * Event: Questionnaire Changed
     * User:  Admin
     */
    public function testChangeQuestionnaireInAdminUserContext()
    {
        // Baseline
        $this->assertEquals(0, AuditEvent::get()->count());

        $user = $this->objFromFixture(Member::class, 'adminUser');
        $this->logInAs($user);

        $questionnaire = Questionnaire::create([
            'Name' => 'TEST3',
        ]);
        $questionnaire->write();
        $questionnaire
            ->setField('Name', 'TEST4')
            ->write(); // Enact any old change

        // x2 audit log entries because:
        // 1). Basic write()
        // 2). The status change
        // Both of which results in a separate audit log entry being generated
        $this->assertEquals(2, AuditEvent::get()->count());
        $this->assertEquals('Email: admin@test.app. Group(s): Administrators', AuditEvent::get()->toArray()[1]->UserData);
        $this->assertEquals('QUESTIONNAIRE.CHANGE', AuditEvent::get()->toArray()[1]->Event);
    }

    /**
     * Test logging scenario:
     * Event: Task Created
     * User:  SDLT
     */
    public function testCreateTaskInSDLTUserContext()
    {
        // Baseline
        $this->assertEquals(0, AuditEvent::get()->count());

        $user = $this->objFromFixture(Member::class, 'sdlt-user');
        $this->logInAs($user);

        Task::create([
            'TaskType' => 'questionnaire',
            'Name' => 'TEST1',
        ])->write();

        // SDLT Users cannot access admin UI, which is the only area a "Task" can be created
        $this->assertEquals(0, AuditEvent::get()->count());
    }

    /**
     * Test logging scenario:
     * Event: Task Created
     * User:  Security Architect
     */
    public function testCreateTaskInSecurityArchitectUserContext()
    {
        // Baseline
        $this->assertEquals(0, AuditEvent::get()->count());

        $user = $this->objFromFixture(Member::class, 'security-architect-user');
        $this->logInAs($user);

        Task::create([
            'TaskType' => 'questionnaire',
            'Name' => 'TEST1',
        ])->write();

        // An Non-SDLT Users, with access to the admin UI, should be able to create a "Task"
        $this->assertEquals(1, AuditEvent::get()->count());
        $this->assertEquals('Email: security-architect@test.app. Group(s): NZTA-SDLT-SecurityArchitect', AuditEvent::get()->toArray()[0]->UserData);
        $this->assertEquals('TASK.CREATE', AuditEvent::get()->toArray()[0]->Event);
    }

    /**
     * Test logging scenario:
     * Event: Standalone Task Created
     * User:  Any
     */
    public function testCreateStandaloneTaskInAnyUserContext()
    {
        // Baseline
        $this->assertEquals(0, AuditEvent::get()->count());

        $user = $this->objFromFixture(Member::class, 'some-user');
        $this->logInAs($user);

        Task::create([
            'Name' => 'TEST1',
            'TaskType' => 'questionnaire',
            'DisplayOnHomePage' => 1, // <-- denotes a "Standalone" task.
        ])->write();

        $this->assertEquals(1, AuditEvent::get()->count());
        $this->assertEquals('Email: anyone@test.app. Group(s): N/A', AuditEvent::get()->toArray()[0]->UserData);
        $this->assertEquals('TASK.CREATE', AuditEvent::get()->toArray()[0]->Event);
        $this->assertContains('Standalone', AuditEvent::get()->toArray()[0]->Extra);
    }

    /**
     * Test logging scenario:
     * Event: Non-Standalone Task Created
     * User:  Any
     */
    public function testCreateNoneStandaloneTaskInAnyUserContext()
    {
        // Baseline
        $this->assertEquals(0, AuditEvent::get()->count());

        $user = $this->objFromFixture(Member::class, 'some-user');
        $this->logInAs($user);

        Task::create([
            'Name' => 'TEST1',
            'TaskType' => 'questionnaire',
            'DisplayOnHomePage' => 0, // <-- denotes a non-"Standalone" task.
        ])->write();

        $this->assertEquals(0, AuditEvent::get()->count());
    }

    /**
     * Test logging scenario:
     * Event: Non-Standalone Task Created
     * User:  SDLT
     */
    public function testCreateNoneStandaloneTaskInSDLTUserContext()
    {
        // Baseline
        $this->assertEquals(0, AuditEvent::get()->count());

        $user = $this->objFromFixture(Member::class, 'sdlt-user');
        $this->logInAs($user);

        Task::create([
            'Name' => 'TEST1',
            'TaskType' => 'questionnaire',
            'DisplayOnHomePage' => 0, // <-- denotes a non-"Standalone" task.
        ])->write();

        // SDLT Users cannot access admin UI, which is the only area a "Task" can be created
        $this->assertEquals(0, AuditEvent::get()->count());
    }

    /**
     * Test logging scenario:
     * Event: QuestionnaireSubmission Approved
     * User:  Security Architect
     */
    public function testApprovalQuestionnaireSubmissionInSecurityArchitectUserContext()
    {
        // Baseline
        $this->assertEquals(0, AuditEvent::get()->count());

        $user = $this->objFromFixture(Member::class, 'security-architect-user');
        $this->logInAs($user);

        $questionnaireSubmission = QuestionnaireSubmission::create([
            'SecurityArchitectApprovalStatus' => 'pending',
        ]);
        $questionnaireSubmission->write(); // Write the initial state
        $questionnaireSubmission
            ->setField('SecurityArchitectApprovalStatus', 'approved')
            ->write(); // Transition to "approved"

        // x2 audit log entries because:
        // 1). Basic write()
        // 2). The status change
        // Both of which results in a separate audit log entry being generated
        $this->assertEquals(2, AuditEvent::get()->count());
        $this->assertEquals('Email: security-architect@test.app. Group(s): NZTA-SDLT-SecurityArchitect', AuditEvent::get()->toArray()[1]->UserData);
        $this->assertEquals('QUESTIONNAIRESUBMISSION.APPROVE', AuditEvent::get()->toArray()[1]->Event);
    }

    /**
     * Test logging scenario:
     * Event: QuestionnaireSubmission Approved
     * User:  CSIO
     */
    public function testApprovalQuestionnaireSubmissionInCSIOUserContext()
    {
        // Baseline
        $this->assertEquals(0, AuditEvent::get()->count());

        $user = $this->objFromFixture(Member::class, 'csio-user');
        $this->logInAs($user);

        $questionnaireSubmission = QuestionnaireSubmission::create([
            'CisoApprovalStatus' => 'pending',
        ]);
        $questionnaireSubmission->write(); // Write the initial state
        $questionnaireSubmission
            ->setField('CisoApprovalStatus', 'approved')
            ->write(); // Transition to "approved"

        // x2 audit log entries because:
        // 1). Basic write()
        // 2). The status change
        // Both of which results in a separate audit log entry being generated
        $this->assertEquals(2, AuditEvent::get()->count());
        $this->assertEquals('Email: csio@test.app. Group(s): NZTA-SDLT-CISO', AuditEvent::get()->toArray()[1]->UserData);
        $this->assertEquals('QUESTIONNAIRESUBMISSION.APPROVE', AuditEvent::get()->toArray()[1]->Event);
    }

    /**
     * Test logging scenario:
     * Event: QuestionnaireSubmission Approved
     * User:  Business Owner
     */
    public function testApprovalQuestionnaireSubmissionInBusinessOwnerUserContext()
    {
        $this->markTestSkipped('Revisit this when Business Owner has an account. See QuestionnaireSubmissionTest::testIsCurrentUserABusinessOwner()');

        // Baseline
        $this->assertEquals(0, AuditEvent::get()->count());

        $questionnaireSubmission = QuestionnaireSubmission::create([
            'QuestionnaireStatus' => 'waiting_for_approval',
            'BusinessOwnerApprovalStatus' => 'pending',
            'BusinessOwnerEmailAddress' => 'business+owner@othertest.app',
        ]);
        $questionnaireSubmission->write(); // Write the initial state
        $questionnaireSubmission
            ->setField('BusinessOwnerApprovalStatus', 'approved')
            ->write(); // Transition to "approved"

        $this->assertEquals(1, AuditEvent::get()->count());
        $this->assertEquals('Email: business+owner@othertest.app, N/A', AuditEvent::get()->toArray()[0]->UserData);
        $this->assertEquals('QUESTIONNAIRESUBMISSION.APPROVE', AuditEvent::get()->toArray()[0]->Event);
    }

    /**
     * Test logging scenario:
     * Event: QuestionnaireSubmission Approved
     * User:  CISO (But where a BusinessOwnerEmailAddress also exists).
     */
    public function testApprovalQuestionnaireSubmissionWithBusinessOwnerInCSIOUserContext()
    {
        // Baseline
        $this->assertEquals(0, AuditEvent::get()->count());

        $user = $this->objFromFixture(Member::class, 'csio-user');
        $this->logInAs($user);

        $questionnaireSubmission = QuestionnaireSubmission::create([
            'QuestionnaireStatus' => 'waiting_for_approval',
            'BusinessOwnerApprovalStatus' => 'pending',
            'BusinessOwnerEmailAddress' => 'business+owner@othertest.app',
        ]);
        $questionnaireSubmission->write(); // Write the initial state
        $questionnaireSubmission
            ->setField('CisoApprovalStatus', 'approved')
            ->write(); // Transition to "approved"

        $this->assertEquals(2, AuditEvent::get()->count());
        $this->assertEquals('Email: csio@test.app. Group(s): NZTA-SDLT-CISO', AuditEvent::get()->toArray()[1]->UserData);
        $this->assertEquals('QUESTIONNAIRESUBMISSION.APPROVE', AuditEvent::get()->toArray()[1]->Event);
    }

    /**
     * Test logging scenario:
     * Event: QuestionnaireSubmission Denied
     * User:  Security Architect
     */
    public function testDenialQuestionnaireSubmissionInSecurityArchitectUserContext()
    {
        // Baseline
        $this->assertEquals(0, AuditEvent::get()->count());

        $user = $this->objFromFixture(Member::class, 'security-architect-user');
        $this->logInAs($user);

        $questionnaireSubmission = QuestionnaireSubmission::create([
            'SecurityArchitectApprovalStatus' => 'pending',
        ]);
        $questionnaireSubmission->write(); // Write the initial state
        $questionnaireSubmission
            ->setField('SecurityArchitectApprovalStatus', 'denied')
            ->write(); // Transition to "denied"

        // x2 audit log entries because:
        // 1). Basic write()
        // 2). The status change
        // Both of which results in a separate audit log entry being generated
        $this->assertEquals(2, AuditEvent::get()->count());
        $this->assertEquals('Email: security-architect@test.app. Group(s): NZTA-SDLT-SecurityArchitect', AuditEvent::get()->toArray()[1]->UserData);
        $this->assertEquals('QUESTIONNAIRESUBMISSION.DENY', AuditEvent::get()->toArray()[1]->Event);
    }

    /**
     * Test logging scenario:
     * Event: QuestionnaireSubmission Denied
     * User:  CSIO
     */
    public function testDenialQuestionnaireSubmissionInCSIOUserContext()
    {
        // Baseline
        $this->assertEquals(0, AuditEvent::get()->count());

        $user = $this->objFromFixture(Member::class, 'csio-user');
        $this->logInAs($user);

        $questionnaireSubmission = QuestionnaireSubmission::create([
            'CisoApprovalStatus' => 'pending',
        ]);
        $questionnaireSubmission->write(); // Write the initial state
        $questionnaireSubmission
            ->setField('CisoApprovalStatus', 'denied')
            ->write(); // Transition to "denied"

        // x2 audit log entries because:
        // 1). Basic write()
        // 2). The status change
        // Both of which results in a separate audit log entry being generated
        $this->assertEquals(2, AuditEvent::get()->count());
        $this->assertEquals('Email: csio@test.app. Group(s): NZTA-SDLT-CISO', AuditEvent::get()->toArray()[1]->UserData);
        $this->assertEquals('QUESTIONNAIRESUBMISSION.DENY', AuditEvent::get()->toArray()[1]->Event);
    }

    /**
     * Test logging scenario:
     * Event: QuestionnaireSubmission Denied
     * User:  Business Owner
     */
    public function testDenialQuestionnaireSubmissionInBusinessOwnerUserContext()
    {
        $this->markTestSkipped('Revisit this when Business Owner has an account. See QuestionnaireSubmissionTest::testIsCurrentUserABusinessOwner()');

        // Baseline
        $this->assertEquals(0, AuditEvent::get()->count());

        $questionnaireSubmission = QuestionnaireSubmission::create([
            'QuestionnaireStatus' => 'waiting_for_approval',
            'BusinessOwnerApprovalStatus' => 'pending',
            'BusinessOwnerEmailAddress' => 'business+owner@othertest.app',
        ]);
        $questionnaireSubmission->write(); // Write the initial state
        $questionnaireSubmission
            ->setField('BusinessOwnerApprovalStatus', 'denied')
            ->write(); // Transition to "denied"

        $this->assertEquals(1, AuditEvent::get()->count());
        $this->assertEquals('Email: business+owner@othertest.app. Group(s): N/A', AuditEvent::get()->toArray()[0]->UserData);
        $this->assertEquals('QUESTIONNAIRESUBMISSION.DENY', AuditEvent::get()->toArray()[0]->Event);
    }
}
