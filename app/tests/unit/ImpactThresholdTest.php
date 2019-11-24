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
        $this->assertEquals('Insignificant', ImpactThreshold::match(5)->Name);
        $this->assertEquals('Insignificant', ImpactThreshold::match(9)->Name);
        $this->assertEquals('Insignificant', ImpactThreshold::match(10)->Name);
        $this->assertEquals('Minor', ImpactThreshold::match(11)->Name);
        $this->assertEquals('Minor', ImpactThreshold::match(39)->Name);
        $this->assertEquals('Moderate', ImpactThreshold::match(40)->Name);
        $this->assertEquals('Moderate', ImpactThreshold::match(74)->Name);
        $this->assertEquals('Severe', ImpactThreshold::match(75)->Name);
        $this->assertEquals('Severe', ImpactThreshold::match(89)->Name);
        $this->assertEquals('Extreme', ImpactThreshold::match(90)->Name);
        $this->assertEquals('Extreme', ImpactThreshold::match(91)->Name);
    }

    public function testNoMatch()
    {
        ImpactThreshold::get()->removeAll();

        $this->assertNull(ImpactThreshold::match(91));
    }
}
