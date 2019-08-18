<?php

use SilverStripe\Dev\SapphireTest;
use NZTA\SDLT\Model\Questionnaire;
use NZTA\SDLT\Formulae\NztaApproxRepresentation;

class QuestionnaireTest extends SapphireTest
{
    public function testGetFormulaNotRisk()
    {
        $this->expectException('Exception');
        $this->expectExceptionMessageRegExp('#not a "Risk" type#');

        Questionnaire::create([
            'RiskCalculation' => 'NonExistentFormulaClass',
        ])->riskFactory();

        $this->expectException('Exception');
        $this->expectExceptionMessageRegExp('#not a "Risk" type#');

        Questionnaire::create([
            'RiskCalculation' => null,
        ])->riskFactory();

        $this->expectException('Exception');
        $this->expectExceptionMessageRegExp('#not a "Risk" type#');

        Questionnaire::create([
            'RiskCalculation' => 'None',
        ])->riskFactory();

        $this->expectException('Exception');
        $this->expectExceptionMessageRegExp('#not a "Risk" type#');

        Questionnaire::create([
            'Type' => 'NotAnythingRecognisable',
            'RiskCalculation' => 'None',
        ])->riskFactory();
    }

    public function testGetFormulaNztaApproxRepresentationExists()
    {
        $className = NztaApproxRepresentation::class;

        $this->assertInstanceOf($className, Questionnaire::create([
            'Type' => 'RiskQuestionnaire',
            'RiskCalculation' => 'NztaApproxRepresentation',
        ])->riskFactory());
    }
}
