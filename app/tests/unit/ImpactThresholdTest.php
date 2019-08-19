<?php

use SilverStripe\Dev\SapphireTest;
use NZTA\SDLT\Model\ImpactThreshold;

class ImpactThresholdTest extends SapphireTest
{
    /**
     * @var boolean
     */
    protected $usesDatabase = true;

    /**
     * @var string
     */
    protected static $fixture_file = 'app/tests/fixtures/ImpactThresholdTest.yml';

    /**
     * @var array
     */
    protected static $extra_dataobjects = [
        ImpactThreshold::class,
    ];

    public function testMatch()
    {
        $this->assertEquals('Insignificant', ImpactThreshold::match(1)->Name);
        $this->assertEquals('Moderate', ImpactThreshold::match(51)->Name);
        $this->assertEquals('Moderate', ImpactThreshold::match(100)->Name);
        $this->assertEquals('Severe', ImpactThreshold::match(101)->Name);
        $this->assertEquals('Severe', ImpactThreshold::match(201)->Name);
    }
}
