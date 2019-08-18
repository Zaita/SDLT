<?php

use SilverStripe\Dev\SapphireTest;
use NZTA\SDLT\Formulae\Maximum;

class MaximumTest extends SapphireTest
{
    public function testHighest()
    {
        $formula = Maximum::create()->setWeightings([1,2,11,41,2.5]);
        $this->assertEquals(41, $formula->highest());
        $formula = Maximum::create()->setWeightings([-1,-44,0,-33,-273]);
        $this->assertEquals(0, $formula->highest());
        $formula = Maximum::create()->setWeightings([1,2]);
        $this->assertEquals(2, $formula->highest());
        $formula = Maximum::create()->setWeightings([0,1,2]);
        $this->assertEquals(2, $formula->highest());
    }

    public function testCalculate()
    {
        $formula = Maximum::create()->setWeightings([20,40,40,40,50,60,100]);
        $this->assertEquals(100, $formula->calculate());
        $formula = Maximum::create()->setWeightings([1,2]);
        $this->assertEquals(2, $formula->calculate());
        $formula = Maximum::create()->setWeightings([0,1,2]);
        $this->assertEquals(2, $formula->calculate());
    }
}
