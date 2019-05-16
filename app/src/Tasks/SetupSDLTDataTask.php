<?php
/**
 * Import default data into the SDLT environment. Default data is distributed as
 * a CSV. This script imports the data and relationships.
 *
 * @category SilverStripe_Project
 * @package SDLT
 * @author Catalyst IT <silverstripedev@catalyst.net.nz>
 * @copyright 2019 New Zealand Transport Agency
 * @license https://nzta.govt.nz (BSD-3)
 * @link https://nzta.govt.nz
 **/
namespace NZTA\SDLT\Tasks;

use League\Csv\Reader;
use SilverStripe\Dev\BuildTask;
use SilverStripe\ORM\DB;
use NZTA\SDLT\Model\Dashboard;
use NZTA\SDLT\Model\Pillar;
use NZTA\SDLT\Model\Questionnaire;
use NZTA\SDLT\Model\Task;
use NZTA\SDLT\Model\Question;
use SilverStripe\ORM\DataObject;
use SilverStripe\Core\Environment;

/**
 * SetupSDLTDataTask
 */
class SetupSDLTDataTask extends BuildTask
{
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
        questionaires, tasks, questions, inputs, and actions from a CSV file';

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
    ];

    /**
     * This is a bucket that tracks the progress of the upload, ostensibly to
     * avoid duplicates.
     *
     * @var array
     */
    private $records = [
        'NZTA\SDLT\Model\Dashboard' => [],
        'NZTA\SDLT\Model\Pillar' => [],
        'NZTA\SDLT\Model\Questionnaire' => [],
        'NZTA\SDLT\Model\Task' => [],
        'NZTA\SDLT\Model\Question' => [],
        'NZTA\SDLT\Model\AnswerInputField' => [],
        'NZTA\SDLT\Model\AnswerActionField' => [],
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

        DB::query("TRUNCATE Dashboard");
        DB::query("TRUNCATE Pillar");
        DB::query("TRUNCATE Questionnaire");
        DB::query("TRUNCATE Task");
        DB::query("TRUNCATE Question");
        DB::query("TRUNCATE AnswerInputField");
        DB::query("TRUNCATE AnswerActionField");

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
                $record = array_combine(
                    array_values($headers),
                    array_values($row)
                );
                $processMethod = 'process'.$model;
                if (method_exists($this, $processMethod)) {
                    $record = $this->$processMethod($record);
                }

                $className = $record->ClassName;
                $id = (int) $record->ID;
                // echo $record['ClassName'] . $record['ID'] . PHP_EOL;
                $this->records[$className][$id] = $record->ID;
            }
            DB::alteration_message(sprintf("Recorded %d %s records", count($this->records[$className]), $model));
        }
    }

    /**
     * Magic method for processing the Dashboard record
     *
     * @param DataObject $record parsed CSV row
     * @return DataObject
     */
    private function processDashboard($record)
    {
        $dashboard = $this->findOrMake('NZTA\SDLT\Model\Dashboard', $record['ID'], $record);
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
        $pillar = $this->findOrMake('NZTA\SDLT\Model\Pillar', $record['ID'], $record);
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
        $questionnaire = $this->findOrMake('NZTA\SDLT\Model\Questionnaire', $record['ID'], $record);
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
        $task = $this->findOrMake('NZTA\SDLT\Model\Task', $record['ID'], $record);
        $questionnaire = Questionnaire::get()->byID($record['QuestionnaireID']);
        $task->QuestionnaireID = $questionnaire ? $questionnaire->ID : 0;
        $task->write();
        return $task;
    }

    /**
     * Magic method for processing the Question record
     *
     * @param DataObject $record parsed CSV row
     * @return DataObject
     */
    private function processQuestion($record)
    {
        $question = $this->findOrMake('NZTA\SDLT\Model\Question', $record['ID'], $record);
        $task = Task::get()->byID($record['TaskID']);
        $questionnaire = Questionnaire::get()->byID($record['QuestionnaireID']);
        $question->TaskID = $task ? $task->ID : 0;
        $question->QuestionnaireID = $questionnaire ? $questionnaire->ID : 0;
        $question->write();
        return $question;
    }

    /**
     * Magic method for processing the AnswerInput record
     *
     * @param DataObject $record parsed CSV row
     * @return DataObject
     */
    private function processAnswerInputField($record)
    {
        $aif = $this->findOrMake('NZTA\SDLT\Model\AnswerInputField', $record['ID'], $record);
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
        $aaf = $this->findOrMake('NZTA\SDLT\Model\AnswerActionField', $record['ID'], $record);
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
