<?php

use SilverStripe\Dev\SapphireTest;
use NZTA\SDLT\Formulae\NztaApproxRepresentation;

class NztaApproxRepresentationTest extends SapphireTest
{
    public function testMedian()
    {
        $formula = NztaApproxRepresentation::create()->setWeightings([1,2,3,4,5]);
        $this->assertEquals(2.5, $formula->median());
        $formula = NztaApproxRepresentation::create()->setWeightings([1,2,3,4,5,6]);
        $this->assertEquals(3, $formula->median());
        $formula = NztaApproxRepresentation::create()->setWeightings([1,2,3,3,4,5]);
        $this->assertEquals(3, $formula->median());
        $formula = NztaApproxRepresentation::create()->setWeightings([1,2]);
        $this->assertEquals(1, $formula->median());
        $formula = NztaApproxRepresentation::create()->setWeightings([2,1]); // <-- order shouldn't matter
        $this->assertEquals(1, $formula->median());
        $formula = NztaApproxRepresentation::create()->setWeightings([1,2,3]);
        $this->assertEquals(1.5, $formula->median());
        $formula = NztaApproxRepresentation::create()->setWeightings([0]);
        $this->assertEquals(0, $formula->median());
        $formula = NztaApproxRepresentation::create()->setWeightings([0,0]);
        $this->assertEquals(0, $formula->median());
        $formula = NztaApproxRepresentation::create()->setWeightings([0,0,0]);
        $this->assertEquals(0, $formula->median());
    }

    public function testMean()
    {
        $formula = NztaApproxRepresentation::create()->setWeightings([1,2,3,4,5]);
        $this->assertEquals(2.5, $formula->mean());
        $formula = NztaApproxRepresentation::create()->setWeightings([1,2,3,4,5,6]);
        $this->assertEquals(3, $formula->mean());
        $formula = NztaApproxRepresentation::create()->setWeightings([1,2]);
        $this->assertEquals(1, $formula->mean());
        $formula = NztaApproxRepresentation::create()->setWeightings([1,2,3]);
        $this->assertEquals(1.5, $formula->mean());
        $formula = NztaApproxRepresentation::create()->setWeightings([0]);
        $this->assertEquals(0, $formula->mean());
        $formula = NztaApproxRepresentation::create()->setWeightings([0,0]);
        $this->assertEquals(0, $formula->mean());
        $formula = NztaApproxRepresentation::create()->setWeightings([0,0,0]);
        $this->assertEquals(0, $formula->mean());
    }

    public function testHighest()
    {
        $formula = NztaApproxRepresentation::create()->setWeightings([1,2,11,41,2.5]);
        $this->assertEquals(41, $formula->highest());
        $formula = NztaApproxRepresentation::create()->setWeightings([-1,0,44,-33,11,6]);
        $this->assertEquals(44, $formula->highest());
        $formula = NztaApproxRepresentation::create()->setWeightings([1,2]);
        $this->assertEquals(2, $formula->highest());
        $formula = NztaApproxRepresentation::create()->setWeightings([0,0,0]);
        $this->assertEquals(0, $formula->highest());
    }

    public function testCalculate()
    {
        $formula = NztaApproxRepresentation::create()->setWeightings([20,40,40,40,50,60,100]);
        $this->assertEquals(151.25, $formula->calculate());
        $formula = NztaApproxRepresentation::create()->setWeightings([1,2]);
        $this->assertEquals(3.25, $formula->calculate());
        $formula = NztaApproxRepresentation::create()->setWeightings([0,1,2]);
        $this->assertEquals(2.38, $formula->calculate());
    }
}
