<?php
namespace NZTA\SDLT\Tasks;
use SilverStripe\Dev\BuildTask;
use NZTA\SDLT\Model\SecurityControl;
use NZTA\SDLT\Model\ControlWeightSet;
use NZTA\SDLT\Model\Risk;
use NZTA\SDLT\Model\SecurityComponent;
use SilverStripe\Control\Director;

/**
 * Generate random control weights for every Risk defined in the database
 * This is used for testing values in the security risk assessment matrix
 * and should not be used in a production setting
 */
class RandomControlWeightSet extends BuildTask {

    public $title = 'Randomise control weights for risks';

    public $description = 'This task will generate random control weights for '
        .'every Risk defined in the database. This is used for testing values '
        .'in the security risk assessment matrix. It will only run when the '
        .'site is in dev mode';

    private static $segment = 'RandomControlWeightSet';

    public function run($request)
    {
        //don't run unless the site is in dev mode
        if(!Director::isDev()) return;

        $risks = Risk::get()->map('ID', 'ID')->toArray();

        foreach (SecurityComponent::get() as $sc) {
            foreach ($sc->Controls() as $ctrl) {
                shuffle($risks);
                $cws = ControlWeightSet::create()->update([
                    'Likelihood' => random_int(0, 10),
                    'Impact' => random_int(0, 10),
                    'LikelihoodPenalty' => random_int(0, 50),
                    'ImpactPenalty' => random_int(0, 50),
                    'RiskID' => $risks[0],
                    'SecurityControlID' => $ctrl->ID,
                    'SecurityComponentID' => $sc->ID,
                ]);
                try {
                    $cws->write();
                } catch (\Exception $e) {}
            }
        }
    }

    public function isEnabled()
    {
        return Director::isDev();
    }
}
