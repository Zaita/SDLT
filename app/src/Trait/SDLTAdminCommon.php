<?php

/**
 * This file contains the "SDLTAdminCommon" trait.
 *
 * @category SilverStripe_Project
 * @package SDLT
 * @author  Catalyst I.T. SilverStripe Team 2019 <silverstripedev@catalyst.net.nz>
 * @copyright 2019 Catalyst.Net Ltd
 * @license https://www.catalyst.net.nz (Commercial)
 * @link https://www.catalyst.net.nz
 */

namespace NZTA\SDLT\Traits;

use SilverStripe\Core\Config\Configurable;
use SilverStripe\Security\Security;
use SilverStripe\Forms\HiddenField;
use SilverStripe\Forms\FileField;
use SilverStripe\Forms\FormAction;
use SilverStripe\ORM\ValidationResult;
use Swaggest\JsonSchema\Schema as JSONSchema;
use SilverStripe\Forms\FieldList;
use SilverStripe\Forms\Form;
use SilverStripe\Forms\CheckboxField;

trait SDLTAdminCommon
{
    use Configurable;

    /**
     * Default location of task schema, allow dev to override for alternative schema
     *
     * @var string
     */
    private static $json_schema_task = '/app/src/ImportJsonSchema/Schema/TaskSchema.json';

     /**
     * Default location of questionnaire schema, allow dev to override for alternative schema
     *
     * @var string
     */
    private static $json_schema_questionnaire = '/app/src/ImportJsonSchema/Schema/QuestionnaireSchema.json';

    /**
    * Default location of security component schema, allow dev to override for alternative schema
    *
    * @var string
    */
    private static $json_schema_security_component = '/app/src/ImportJsonSchema/Schema/SecurityComponentSchema.json';

    /**
     * @var array
     */
    private static $allowed_actions = array(
        'ImportJsonForm',
        'ImportForm',
        'SearchForm'
    );

    /**
     * Allow individual data-models to declare independent config for export fields
     * without polluting what appears in a GridField via $summary_fields.
     *
     * @return array
     */
    public function getExportFields(): array
    {
        $summaryFields = $this->modelClass::config()->get('summary_fields') ?? [];
        $extraFields = $this->modelClass::config()->get('extra_export_fields') ?? [];

        if ($extraFields) {
            return array_merge($summaryFields, $extraFields);
        }

        return $summaryFields;
    }

    /**
     * Generate a CSV import form for a single {@link DataObject} subclass.
     *
     * @return Form|false
     */
    public function ImportJsonForm()
    {
        $modelSNG = singleton($this->modelClass);
        $modelName = $modelSNG->i18n_singular_name();

        // check if a import form should be generated
        if (!$this->showImportForm ||
            (is_array($this->showImportForm) && !in_array($this->modelClass, $this->showImportForm))
        ) {
            return false;
        }

        $importers = $this->getModelImporters();

        if (!$importers || !isset($importers[$this->modelClass])) {
            return false;
        }

        if (!$modelSNG->canCreate(Security::getCurrentUser())) {
            return false;
        }

        $fields = FieldList::create(
            HiddenField::create('ClassName', false, $this->modelClass),
            FileField::create('_JsonFile', false)
                ->setAllowedExtensions(['json', 'Json', 'JSON'])
        );

        if ($modelSNG->config()->show_overwrite_for_json_import) {
            $fields->push(
                CheckboxField::create(
                    'Overwrite',
                    'Overwrite an existing '. strtolower($modelName) . ' of the same name',
                    false
                )
            );
        }

        $actions = new FieldList(
            FormAction::create('importJson', 'Import from Json')
                ->addExtraClass('btn btn-outline-secondary font-icon-upload')
        );

        $form = new Form(
            $this,
            "ImportJsonForm",
            $fields,
            $actions
        );

        return $form;
    }

    /**
     * Imports the submitted json file based on specifications given in
     * {@link self::model_importers}.
     * Redirects back with a success/failure message.
     *
     * @param array       $data    form data
     * @param Form        $form    form
     * @param HTTPRequest $request request
     *
     * @return bool|HTTPResponse
     */
    public function importJson($data, $form, $request)
    {
        if (!$this->showImportForm || (is_array($this->showImportForm)
                && !in_array($this->modelClass, $this->showImportForm))
        ) {
            return false;
        }

        // File wasn't properly uploaded, show a reminder to the user
        if (empty($_FILES['_JsonFile']['tmp_name']) ||
            file_get_contents($_FILES['_JsonFile']['tmp_name']) == ''
        ) {
            $form->sessionMessage(
                'Please browse for a Json file to import.',
                ValidationResult::TYPE_ERROR
            );
            $this->redirectBack();
            return false;
        }

        $overwrite = false;

        if (!empty($data['Overwrite']) && $data['Overwrite']) {
            $overwrite = true;
        }

        $schemaJson = $this->getSchemaJson();
        $schema = JSONSchema::import(json_decode($schemaJson));
        $incomingJsonString = file_get_contents($_FILES['_JsonFile']['tmp_name']);

        try {
            $incomingJson = (json_decode($incomingJsonString));

            //check incoming json schema
            $schema->in($incomingJson);

            // Logic: save object
            $this->LoadJson($incomingJson, $overwrite);

            // return success message
            $form->sessionMessage(
                "Record created successfully.",
                'good'
            );

            return $this->redirectBack();
        } catch (\Exception $e) {
            $form->sessionMessage(
                sprintf(
                    'Invalid JSON according to schema. Validator said: %s',
                    $e->getMessage()
                ),
                ValidationResult::TYPE_ERROR
            );

            $this->redirectBack();
            return false;
        }
    }

    /**
     * get the json schema content for the curret model
     *
     * @return string;
     */
    public function getSchemaJson()
    {
        $schemaJson = '';

        switch ($this->ImportClass) {
            case 'Questionnaire':
                $pathToSchema = BASE_PATH . $this->config()->json_schema_questionnaire;
                $schemaJson = file_get_contents($pathToSchema);
                break;
            case 'Task':
                $pathToSchema = BASE_PATH . $this->config()->json_schema_task;
                $schemaJson = file_get_contents($pathToSchema);
                break;
            case 'Security Component':
                $pathToSchema = BASE_PATH . $this->config()->json_schema_security_component;
                $schemaJson = file_get_contents($pathToSchema);
                break;
        }

        return $schemaJson;
    }

    /**
     * LoadJson : create record from json
     *
     * @param object  $incomingJson incoming json
     * @param boolean $overwrite    overwrite the existing record
     * @return void
     */
    public function LoadJson($incomingJson, $overwrite)
    {
        if ($this->ImportClass == 'Security Component') {
            $this->modelClass::create_record_from_json($incomingJson);
        } else {
            $this->modelClass::create_record_from_json($incomingJson, $overwrite);
        }
    }

    /**
     * get current class name
     *
     * @return string;
     */
    public function getImportClass()
    {
        $importClass = '';

        $modelSNG = singleton($this->modelClass);
        $importClass = $modelSNG->i18n_singular_name();

        return $importClass;
    }
}
