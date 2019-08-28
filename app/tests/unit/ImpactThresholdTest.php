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
        // Looking at the fixtures, you'd assume "Catastrophic", but we're using
        // "first-match-wins" and "201" is both > 200 _and_ >= 200
        // We're assuming SA's wouldn't configure the SDLT such that a scenario like
        // this might happen. If/when the SDLT should support something like this
        // we'd need to build a separate conflict resolution logic, which can be set
        // globally via admin settings or YML config
        $this->assertEquals('Severe', ImpactThreshold::match(201)->Name);
    }
}
