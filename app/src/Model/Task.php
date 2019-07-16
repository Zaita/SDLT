<?php

/**
 * This file contains the "Task" class.
 *
 * @category SilverStripe_Project
 * @package SDLT
 * @author  Catalyst I.T. SilverStripe Team 2018 <silverstripedev@catalyst.net.nz>
 * @copyright 2018 Catalyst.Net Ltd
 * @license https://www.catalyst.net.nz (Commercial)
 * @link https://www.catalyst.net.nz
 */

namespace NZTA\SDLT\Model;

use GraphQL\Type\Definition\ResolveInfo;
use NZTA\SDLT\GraphQL\GraphQLAuthFailure;
use SilverStripe\Core\Convert;
use SilverStripe\Forms\FieldList;
use SilverStripe\Forms\GridField\GridField;
use SilverStripe\GraphQL\OperationResolver;
use SilverStripe\GraphQL\Scaffolding\Interfaces\ScaffoldingProvider;
use SilverStripe\GraphQL\Scaffolding\Scaffolders\SchemaScaffolder;
use SilverStripe\ORM\DataObject;
use SilverStripe\ORM\HasManyList;
use SilverStripe\Security\Member;
use SilverStripe\Security\Security;
use Symbiote\GridFieldExtensions\GridFieldOrderableRows;
use SilverStripe\Forms\GridField\GridFieldAddExistingAutocompleter;
use SilverStripe\Forms\GridField\GridFieldPaginator;
use NZTA\SDLT\Traits\SDLTModelPermissions;

/**
 * Class Task
 *
 * @property string Name
 * @property boolean DisplayOnHomePage
 * @property string KeyInformation
 * @property string TaskType
 * @property boolean LockAnswersWhenComplete
 *
 * @method HasManyList Questions()
 */
class Task extends DataObject implements ScaffoldingProvider
{
    use SDLTModelPermissions;
    /**
     * @var string
     */
    private static $table_name = 'Task';

    /**
     * @var array
     */
    private static $db = [
        'Name' => 'Varchar(255)',
        'DisplayOnHomePage'=> 'Boolean',
        'KeyInformation' => 'HTMLText',
        'TaskType' => 'Enum(array("questionnaire", "selection"))',
        'LockAnswersWhenComplete' => 'Boolean'
    ];

    /**
     * @var array
     */
    private static $has_many = [
        'Questions' => Question::class,
        'SubmissionEmails' => TaskSubmissionEmail::class
    ];

    /**
     * @var array
     */
    private static $belongs_many_many = [
        'Questionnaires' => Questionnaire::class
    ];

    /**
     * CMS Fields
     * @return FieldList
     */
    public function getCMSFields()
    {
        $fields = parent::getCMSFields();

        /* @var GridField $questions */
        $questions = $fields->dataFieldByName('Questions');

        if ($questions) {
            $config = $questions->getConfig();
            $config->addComponent(
                new GridFieldOrderableRows('SortOrder')
            );
            $config->removeComponentsByType(GridFieldAddExistingAutocompleter::class);
            $config->getComponentByType(GridFieldPaginator::class)
                ->setItemsPerPage(250);
        }

        if ($this->TaskType === 'selection') {
            $fields->removeByName('Questions');
        }

        return $fields;
    }

    /**
     * @return array
     */
    public function getQuestionsData()
    {
        $questions = $this->Questions();
        $questionsData = [];

        foreach ($questions as $question) {
            /* @var $question Question */
            $questionData['ID'] = $question->ID;
            $questionData['Title'] = $question->Title;
            $questionData['Question'] = $question->Question;
            $questionData['Description'] = $question->Description;
            $questionData['AnswerFieldType'] = $question->AnswerFieldType;
            $questionData['AnswerInputFields'] = $question->getAnswerInputFieldsData();
            $questionData['AnswerActionFields'] = $question->getAnswerActionFieldsData();
            $questionsData[] = $questionData;
        }

        return $questionsData;
    }

    /**
     * @return string
     */
    public function getQuestionsDataJSON()
    {
        return (string)json_encode($this->getQuestionsData());
    }

    /**
     * Provide GraphQL scaffolding
     * @param SchemaScaffolder $scaffolder scaffolder
     * @return SchemaScaffolder
     */
    public function provideGraphQLScaffolding(SchemaScaffolder $scaffolder)
    {
        $typeScaffolder = $scaffolder
            ->type(self::class)
            ->addFields([
                'ID',
                'Name',
                'TaskType',
                'QuestionsDataJSON'
            ]);

        $typeScaffolder
            ->operation(SchemaScaffolder::READ_ONE)
            ->setName('readTask')
            ->setResolver(new class implements OperationResolver {
                /**
                 * Invoked by the Executor class to resolve this mutation / query
                 * @see Executor
                 *
                 * @param mixed       $object  object
                 * @param array       $args    args
                 * @param mixed       $context context
                 * @param ResolveInfo $info    info
                 * @throws GraphQLAuthFailure
                 * @return mixed
                 */
                public function resolve($object, array $args, $context, ResolveInfo $info)
                {
                    $member = Security::getCurrentUser();
                    if (!$member) {
                        throw new GraphQLAuthFailure();
                    }

                    $task = Task::get_by_id(Convert::raw2sql(trim($args['ID'])));
                    return $task;
                }
            })
            ->end();
    }
}
