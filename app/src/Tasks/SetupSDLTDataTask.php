<?php
/**
 * Import default data into the SDLT environment. Default data is distributed as
 * a CSV. This script imports the data and relationships.
 *
 * @category SilverStripe_Project
 * @package SDLT
 * @author Catalyst IT <silverstripedev@catalyst.net.nz>
 * @copyright NZ Transport Agency
 * @license BSD-3
 * @link https://nzta.govt.nz
 **/
namespace NZTA\SDLT\Tasks;

use League\Csv\Reader;
use NZTA\SDLT\Model\AnswerActionField;
use NZTA\SDLT\Model\AnswerInputField;
use NZTA\SDLT\Model\Dashboard;
use NZTA\SDLT\Model\ImpactThreshold;
use NZTA\SDLT\Model\LikelihoodThreshold;
use NZTA\SDLT\Model\MultiChoiceAnswerSelection;
use NZTA\SDLT\Model\Pillar;
use NZTA\SDLT\Model\Question;
use NZTA\SDLT\Model\Questionnaire;
use NZTA\SDLT\Model\Risk;
use NZTA\SDLT\Model\RiskRating;
use NZTA\SDLT\Model\SecurityComponent;
use NZTA\SDLT\Model\SecurityControl;
use NZTA\SDLT\Model\Task;
use SilverStripe\Dev\BuildTask;
use SilverStripe\ORM\DB;
use SilverStripe\ORM\DataObject;
use SilverStripe\ORM\ValidationException;
use NZTA\SDLT\Traits\SDLTAdminCommon;

/**
 * SetupSDLTDataTask
 */
class SetupSDLTDataTask extends BuildTask
{
    use SDLTAdminCommon;

    /**
     * Segment of this task
     * @var string
     */
    private static $segment = 'SetupSDLTDataTask';
    /**
     * Title of this task
     * @var string
     */
    public $title = 'Initial setup of SDLT data';

    /**
     * Description of this task
     * @var string
     */
    public $description = 'This creates the initial dashboard, pillars,
        questionaires, tasks, questions, inputs, actions, risks, risk rating,
        security components and controls, and thresholds from CSV files';

    /**
     * Paths to the default data, relative to BASE_PATH
     * This is distributed with the project but can be overridden in YML
     * Note: the order is important!
     * @var array
     */
    private static $paths = [
        'Dashboard' => 'app/populate/csv/Dashboard.csv',
        'Pillar' => 'app/populate/csv/Pillar.csv',
        'Questionnaire' => 'app/populate/csv/Questionnaire.csv',
        'Task' => 'app/populate/csv/Task.csv',
        'Question' => 'app/populate/csv/Question.csv',
        'AnswerInputField' => 'app/populate/csv/AnswerInputField.csv',
        'AnswerActionField' => 'app/populate/csv/AnswerActionField.csv',
        'Risk' => 'app/populate/csv/Risk.csv',
        'ImpactThreshold' => 'app/populate/csv/ImpactThreshold.csv',
        'LikelihoodThreshold' => 'app/populate/csv/LikelihoodThreshold.csv',
        'RiskRating' => 'app/populate/csv/RiskRating.csv',
        'SecurityComponent' => 'app/populate/csv/SecurityComponent.csv',
        'SecurityControl' => 'app/populate/csv/SecurityControl.csv',

        //must import after AnswerInputField and Risk
        'AnswerInputBlock' => 'app/populate/csv/AnswerInputBlock.csv',

        //ControlWeightSet can't exist until Risk, SecurityControl,
        //and SecurityComponent are loaded
        'ControlWeightSet' => 'app/populate/csv/ControlWeightSet.csv',
    ];

    /**
     * Paths to the default relationship data, relative to BASE_PATH
     * This is distributed with the project but can be overridden in YML
     * @var array
     */
    private static $relation_paths = [
        'SecurityComponent_SecurityControls' => [
            'path' => 'app/populate/csv/SecurityComponent_SecurityControl.csv',
        ],
        'AnswerActionField_Tasks' => [
            'path' => 'app/populate/csv/AnswerActionField_Tasks.csv',
        ],
        'AnswerInputBlock_Risks' => [
            'path' => 'app/populate/csv/AnswerInputBlock_Risks.csv',
        ],
        'Dashboard_Tasks' => [
            'path' => 'app/populate/csv/Dashboard_Tasks.csv',
        ],
        'Questionnaire_Tasks' => [
            'path' => 'app/populate/csv/Questionnaire_Tasks.csv',
        ],
        'Task_DefaultSecurityComponents' => [
            'path' => 'app/populate/csv/Task_DefaultSecurityComponents.csv',
        ],
    ];

    /**
     * This is a bucket that tracks the progress of the upload, ostensibly to
     * avoid duplicates.
     *
     * @var array
     */
    private $records = [
        'NZTA\SDLT\Model\AnswerActionField' => [],
        'NZTA\SDLT\Model\AnswerInputField' => [],
        'NZTA\SDLT\Model\ControlWeightSet' => [],
        'NZTA\SDLT\Model\Dashboard' => [],
        'NZTA\SDLT\Model\ImpactThreshold' => [],
        'NZTA\SDLT\Model\LikelihoodThreshold' => [],
        'NZTA\SDLT\Model\MultiChoiceAnswerSelection' => [],
        'NZTA\SDLT\Model\Pillar' => [],
        'NZTA\SDLT\Model\Question' => [],
        'NZTA\SDLT\Model\Questionnaire' => [],
        'NZTA\SDLT\Model\Risk' => [],
        'NZTA\SDLT\Model\RiskRating' => [],
        'NZTA\SDLT\Model\SecurityComponent' => [],
        'NZTA\SDLT\Model\SecurityControl' => [],
        'NZTA\SDLT\Model\Task' => [],
    ];

    /**
     * @var array
     */
    private $json_questionnaire_paths = [
        'Questionnaire: Proof of Concept' => 'app/populate/json/questionnaire/questionnaire_poc.json',
        'Questionnaire: Solution' => 'app/populate/json/questionnaire/questionnaire_solution.json',
        'Questionnaire: SaaS' => 'app/populate/json/questionnaire/questionnaire_saas.json',
        'Questionnaire: Feature Release' => 'app/populate/json/questionnaire/questionnaire_feature.json'
    ];

    /**
     * @var array
     */
    private $json_task_paths = [
        'Task: Web Security Configuration' => 'app/populate/json/task/task_web_security_configuration.json'
    ];

    /**
     * Default "run" method, required when implementing BuildTask
     *
     * @param HTTPRequest $request default parameter
     * @return void
     * @throws \Exception when SDLT_AGENCY_NAME is not defined, or path to a CSV
     *          does not exist
     */
    public function run($request)
    {
        DB::query("TRUNCATE AnswerActionField");
        DB::query("TRUNCATE AnswerActionField_Tasks");
        DB::query("TRUNCATE AnswerInputBlock");
        DB::query("TRUNCATE AnswerInputBlock_Risks");
        DB::query("TRUNCATE AnswerInputField");
        DB::query("TRUNCATE ControlWeightSet");
        DB::query("TRUNCATE Dashboard");
        DB::query("TRUNCATE Dashboard_Tasks");
        DB::query("TRUNCATE ImpactThreshold");
        DB::query("TRUNCATE LikelihoodThreshold");
        DB::query("TRUNCATE Pillar");
        DB::query("TRUNCATE Question");
        DB::query("TRUNCATE Questionnaire");
        DB::query("TRUNCATE Questionnaire_Tasks");
        DB::query("TRUNCATE Risk");
        DB::query("TRUNCATE RiskRating");
        DB::query("TRUNCATE SecurityComponent");
        DB::query("TRUNCATE SecurityComponent_Controls");
        DB::query("TRUNCATE SecurityControl");
        DB::query("TRUNCATE Task");
        DB::query("TRUNCATE Task_DefaultSecurityComponents");


        foreach ($this->config()->paths as $model => $csvpath) {
            if (!file_exists(BASE_PATH . DIRECTORY_SEPARATOR . $csvpath)) {
                throw new \Exception(BASE_PATH . DIRECTORY_SEPARATOR . $csvpath . ' does not exist');
            }
            $csv = Reader::createFromPath(BASE_PATH . DIRECTORY_SEPARATOR . $csvpath, 'r');

            //get the first row, usually the CSV header
            $headers = $csv->fetchOne();

            // $res = $csv->setOffset(1)->fetchAll();
            $res = $csv->setOffset(1)->fetchAll();

            $className = '';
            foreach ($res as $row) {
                $keys = array_values($headers);
                $vals = array_values($row);

                if (count($keys) !== count($vals)) {
                    DB::alteration_message($model.$vals[0]."\tHeader/row mismatch");
                    continue;
                }

                $record = array_combine(
                    $keys,
                    $vals
                );
                $processMethod = 'process'.$model;
                if (method_exists($this, $processMethod)) {
                    $record = $this->$processMethod($record);
                }

                if (!$record) {
                    continue;
                }

                $className = $record->ClassName;
                $id = (int) $record->ID;
                $this->records[$className][$id] = $record->ID;
            }
                DB::alteration_message(
                    sprintf(
                        "Recorded %d %s records",
                        isset($this->records[$className])
                            ? count($this->records[$className])
                            : 0,
                        $model
                    )
                );
        }

        foreach ($this->config()->relation_paths as $model => $csvArray) {
            $csvpath = $csvArray['path'] ?? null;
            if ($csvpath && !file_exists(BASE_PATH . DIRECTORY_SEPARATOR . $csvpath)) {
                throw new \Exception(BASE_PATH . DIRECTORY_SEPARATOR . $csvpath . ' does not exist');
            }
            $csv = Reader::createFromPath(BASE_PATH . DIRECTORY_SEPARATOR . $csvpath, 'r');

            //get the first row, usually the CSV header
            $headers = $csv->fetchOne();

            // $res = $csv->setOffset(1)->fetchAll();
            $res = $csv->setOffset(1)->fetchAll();

            $className = '';
            foreach ($res as $row) {
                $record = array_combine(
                    array_values($headers),
                    array_values($row)
                );
                $joinMethod = 'join'.$model;
                if (method_exists($this, $joinMethod)) {
                    $record = $this->$joinMethod($record);
                }

                $className = $model;
                $id = (int) $record['ID'];
                $this->records[$model][$id] = $record['ID'];
            }

            DB::alteration_message(
                sprintf(
                    "Linked %d %s records",
                    isset($this->records[$className])
                        ? count($this->records[$className])
                        : 0,
                    $model
                )
            );
        }

        /**
         * Now that the CSV Import has been done, we'll import
         * the JSON files that will handle the relationship betweens
         * between Questionnaires and tasks
         */
        foreach ($this->json_questionnaire_paths as $key => $value) {
            printf("Importing JSON Questionnaire '$key' from $value\n");

            $string = file_get_contents($value);
            $incomingJson = $incomingJson = (json_decode($string));
            Questionnaire::create_record_from_json($incomingJson, true);
        }

        /**
         * Import Tasks
         */
        foreach ($this->json_task_paths as $key => $value) {
            printf("Importing JSON Task '$key' from $value\n");

            $string = file_get_contents($value);
            $incomingJson = $incomingJson = (json_decode($string));
            Task::create_record_from_json($incomingJson, true);
        }
    }

     /**
     * Magic method for linking SecurityComponent and SecurityControl records
     *
     * @param DataObject $record parsed CSV row
     * @return DataObject
     */
    private function joinSecurityComponent_SecurityControls($record)
    {
        $securityComponent = $this->findOrMake(
            'NZTA\SDLT\Model\SecurityComponent',
            $record['SecurityComponentID']
        );
        $securityControl = $this->findOrMake(
            'NZTA\SDLT\Model\SecurityControl',
            $record['SecurityControlID']
        );
        if ($securityComponent && $securityControl) {
            $securityComponent->Controls()->add($securityControl);
        }

        return $record;
    }

     /**
     * Magic method for linking AnswerActionField and Task records
     *
     * @param DataObject $record parsed CSV row
     * @return DataObject
     */
    private function joinAnswerActionField_Tasks($record)
    {
        $aaf = $this->findOrMake(
            'NZTA\SDLT\Model\AnswerActionField',
            $record['AnswerActionFieldID']
        );
        try {
            $task = $this->findOrMake(
                'NZTA\SDLT\Model\Task',
                $record['TaskID']
            );
            if ($aaf && $task) {
                $aaf->Tasks()->add($task);
            }
        } catch (ValidationException $e) {
            DB::alteration_message(
                '...skipped Task #'
                .$record['TaskID']
                ."\t: "
                .$e->getMessage()
            );
        }
        return $record;
    }

     /**
     * Magic method for linking AnswerInputBlock and Risk records
     *
     * @param DataObject $record parsed CSV row
     * @return DataObject
     */
    private function joinAnswerInputBlock_Risks($record)
    {
        $aib = $this->findOrMake(
            'NZTA\SDLT\Model\MultiChoiceAnswerSelection',
            $record['AnswerInputBlockID']
        );
        $risk = $this->findOrMake(
            'NZTA\SDLT\Model\Risk',
            $record['RiskID']
        );
        if ($aib && $risk) {
            $risk->Weight = (int) ($record['Weight'] ?? 0);
            $aib->Risks()->add($risk);
        }

        return $record;
    }

     /**
     * Magic method for linking Dashboard and Task records
     *
     * @param DataObject $record parsed CSV row
     * @return DataObject
     */
    private function joinDashboard_Tasks($record)
    {
        $dash = $this->findOrMake(
            'NZTA\SDLT\Model\Dashboard',
            $record['DashboardID']
        );
        try {
            $task = $this->findOrMake(
                'NZTA\SDLT\Model\Task',
                $record['TaskID']
            );
            if ($dash && $task) {
                $dash->Tasks()->add($task);
            }
        } catch (ValidationException $e) {
            DB::alteration_message(
                '...skipped Task #'
                .$record['TaskID']
                ."\t: "
                .$e->getMessage()
            );
        }
        return $record;
    }

     /**
     * Magic method for linking Questionnaire and Task records
     *
     * @param DataObject $record parsed CSV row
     * @return DataObject
     */
    private function joinQuestionnaire_Tasks($record)
    {
        $questionnaire = $this->findOrMake(
            'NZTA\SDLT\Model\Questionnaire',
            $record['QuestionnaireID']
        );
        try {
            $task = $this->findOrMake(
                'NZTA\SDLT\Model\Task',
                $record['TaskID']
            );
            if ($questionnaire && $task) {
                $questionnaire->Tasks()->add($task);
            }
        } catch (ValidationException $e) {
            DB::alteration_message(
                '...skipped Task #'
                .$record['TaskID']
                ."\t: "
                .$e->getMessage()
            );
        }

        return $record;
    }

     /**
     * Magic method for linking Task and (default) SecurityComponent records
     *
     * @param DataObject $record parsed CSV row
     * @return DataObject
     */
    private function joinTask_DefaultSecurityComponents($record)
    {
        try {
            $task = $this->findOrMake(
                'NZTA\SDLT\Model\Task',
                $record['TaskID']
            );
            $sComp = $this->findOrMake(
                'NZTA\SDLT\Model\SecurityComponent',
                $record['SecurityComponentID']
            );
            if ($task && $sComp) {
                $task->DefaultSecurityComponents()->add($sComp);
            }
        } catch (ValidationException $e) {
            DB::alteration_message(
                '...skipped Task #'
                .$record['TaskID']
                ."\t: "
                .$e->getMessage()
            );
        }
        return $record;
    }

    /**
     * Magic method for processing the Dashboard record
     *
     * @param DataObject $record parsed CSV row
     * @return DataObject
     */
    private function processDashboard($record)
    {
        $dashboard = $this->findOrMake(
            'NZTA\SDLT\Model\Dashboard',
            $record['ID'],
            $record
        );
        return $dashboard;
    }

    /**
     * Magic method for processing the Pillar record
     *
     * @param DataObject $record parsed CSV row
     * @return DataObject
     */
    private function processPillar($record)
    {
        $pillar = $this->findOrMake(
            'NZTA\SDLT\Model\Pillar',
            $record['ID'],
            $record
        );
        $dashboard = Dashboard::get()->byID($record['DashboardID']);
        $pillar->DashboardID = $dashboard ? $dashboard->ID : 0;
        $pillar->write();
        return $pillar;
    }

    /**
     * Magic method for processing the Questionnaire record
     *
     * @param DataObject $record parsed CSV row
     * @return DataObject
     */
    private function processQuestionnaire($record)
    {
        $questionnaire = $this->findOrMake(
            'NZTA\SDLT\Model\Questionnaire',
            $record['ID'],
            $record
        );
        $pillar = Pillar::get()->byID($record['PillarID']);
        $questionnaire->PillarID = $pillar ? $pillar->ID : 0;
        $questionnaire->write();
        return $questionnaire;
    }

    /**
     * Magic method for processing the Task record
     *
     * @param DataObject $record parsed CSV row
     * @return DataObject
     */
    private function processTask($record)
    {
        try {
            $task = $this->findOrMake(
                'NZTA\SDLT\Model\Task',
                $record['ID'],
                $record
            );
            $questionnaire = Questionnaire::get()->byID(
                $record['QuestionnaireID']
            );
            $task->QuestionnaireID = $questionnaire ? $questionnaire->ID : 0;
            $task->write();
            return $task;
        } catch (ValidationException $e) {
            DB::alteration_message(
                '...skipped Task #'
                .$record['ID']
                ."\t: ".$e->getMessage()
            );
        }
    }

    /**
     * Magic method for processing the Question record
     *
     * @param DataObject $record parsed CSV row
     * @return DataObject
     */
    private function processQuestion($record)
    {
        $question = $this->findOrMake(
            'NZTA\SDLT\Model\Question',
            $record['ID'],
            $record
        );
        $task = Task::get()->byID($record['TaskID']);
        $questionnaire = Questionnaire::get()->byID($record['QuestionnaireID']);
        $question->TaskID = $task ? $task->ID : 0;
        $question->QuestionnaireID = $questionnaire ? $questionnaire->ID : 0;
        $question->write();
        return $question;
    }

    /**
     * Magic method for processing the AnswerInputBlock record
     * (modeled by the MultiChoiceAnswerSelection DataObject)
     *
     * @param DataObject $record parsed CSV row
     * @return DataObject
     */
    private function processAnswerInputBlock($record)
    {
        $answerInputBlock = $this->findOrMake(
            'NZTA\SDLT\Model\MultiChoiceAnswerSelection',
            $record['ID'],
            $record
        );
        $aif = AnswerInputField::get()->byID($record['AnswerInputFieldID']);
        $answerInputBlock->AnswerInputFieldID = $aif ? $aif->ID : 0;
        $answerInputBlock->write();
        return $answerInputBlock;
    }

    /**
     * Magic method for processing the AnswerInput record
     *
     * @param DataObject $record parsed CSV row
     * @return DataObject
     */
    private function processAnswerInputField($record)
    {
        $aif = $this->findOrMake(
            'NZTA\SDLT\Model\AnswerInputField',
            $record['ID'],
            $record
        );
        $question = Question::get()->byID($record['QuestionID']);
        $aif->QuestionID = $question ? $question->ID : 0;
        $aif->write();
        return $aif;
    }

    /**
     * Magic method for processing the AnswerAction record
     *
     * @param DataObject $record parsed CSV row
     * @return DataObject
     */
    private function processAnswerActionField($record)
    {
        $aaf = $this->findOrMake(
            'NZTA\SDLT\Model\AnswerActionField',
            $record['ID'],
            $record
        );
        $task = Task::get()->byID($record['TaskID']);
        $goto = Question::get()->byID($record['GotoID']);
        $question = Question::get()->byID($record['QuestionID']);
        $aaf->TaskID = $task ? $task->ID : 0;
        $aaf->GotoID = $goto ? $goto->ID : 0;
        $aaf->QuestionID = $question ? $question->ID : 0;
        $aaf->write();
        return $aaf;
    }

    /**
     * Magic method for processing the ControlWeightSet record
     *
     * @param DataObject $record parsed CSV row
     * @return DataObject
     */
    private function processControlWeightSet($record)
    {
        $cws = $this->findOrMake(
            'NZTA\SDLT\Model\ControlWeightSet',
            $record['ID'],
            $record
        );
        $risk = Risk::get()->byID($record['RiskID']);
        $sCtrl = SecurityControl::get()->byID($record['SecurityControlID']);
        $sComp = SecurityComponent::get()->byID($record['SecurityComponentID']);
        $cws->RiskID = $risk ? $risk->ID : 0;
        $cws->SecurityControlID = $sCtrl ? $sCtrl->ID : 0;
        $cws->SecurityComponentID = $sComp ? $sComp->ID : 0;
        $cws->write();
        return $cws;
    }

    /**
     * Magic method for processing the Risk record
     *
     * @param DataObject $record parsed CSV row
     * @return DataObject
     */
    private function processRisk($record)
    {
        $risk = $this->findOrMake(
            'NZTA\SDLT\Model\Risk',
            $record['ID'],
            $record
        );
        return $risk;
    }

    /**
     * Magic method for processing the LikelihoodThreshold record
     *
     * @param DataObject $record parsed CSV row
     * @return DataObject
     */
    private function processLikelihoodThreshold($record)
    {
        $likelihoodthreshold = $this->findOrMake(
            'NZTA\SDLT\Model\LikelihoodThreshold',
            $record['ID'],
            $record
        );
        $task = Task::get()->byID($record['TaskID']);
        $likelihoodthreshold->TaskID = $task ? $task->ID : 0;
        $likelihoodthreshold->write();
        return $likelihoodthreshold;
    }

    /**
     * Magic method for processing the ImpactThreshold record
     *
     * @param DataObject $record parsed CSV row
     * @return DataObject
     */
    private function processImpactThreshold($record)
    {
        $impactThreshold = $this->findOrMake(
            'NZTA\SDLT\Model\ImpactThreshold',
            $record['ID'],
            $record
        );
        return $impactThreshold;
    }

    /**
     * Magic method for processing the RiskRating record
     *
     * @param DataObject $record parsed CSV row
     * @return DataObject
     */
    private function processRiskRating($record)
    {
        $riskrating = $this->findOrMake(
            'NZTA\SDLT\Model\RiskRating',
            $record['ID'],
            $record
        );
        $likelihoodthreshold = LikelihoodThreshold::get()->byID(
            $record['LikelihoodID']
        );
        $task = Task::get()->byID($record['TaskID']);
        $riskrating->LikelihoodID = $likelihoodthreshold
            ? $likelihoodthreshold->ID
            : 0;
        $riskrating->TaskID = $task ? $task->ID : 0;
        $riskrating->write();
        return $riskrating;
    }

    /**
     * Magic method for processing the SecurityComponent record
     *
     * @param DataObject $record parsed CSV row
     * @return DataObject
     */
    private function processSecurityComponent($record)
    {
        $securityComponent = $this->findOrMake(
            'NZTA\SDLT\Model\SecurityComponent',
            $record['ID'],
            $record
        );
        return $securityComponent;
    }

    /**
     * Magic method for processing the SecurityControl record
     *
     * @param DataObject $record parsed CSV row
     * @return DataObject
     */
    private function processSecurityControl($record)
    {
        $securityControl = $this->findOrMake(
            'NZTA\SDLT\Model\SecurityControl',
            $record['ID'],
            $record
        );
        //$securityControl->write();
        return $securityControl;
    }

    /**
     * Find or make an existing DataObject
     *
     * @param string $className fully qualified classname
     * @param int    $recordID  integer ID of the database record
     * @param array  $record    parsed row from a CSV
     *
     * @return DataObject
     */
    private function findOrMake($className, $recordID, $record = null)
    {
        $existingID = $this->records[$className][$recordID] ?? 0;
        $obj = null;
        if ($existingID === 0) {
            $obj = $className::create();
        } else {
            $obj = $className::get()->byID($existingID);
        }

        if ($record) {
            foreach ($record as $key => $value) {
                if ($value === 'NULL') {
                    $value = null;
                }
                $obj->$key = $value;
            }
        }

        $obj->write();

        return $obj;
    }
}
