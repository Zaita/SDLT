<?php

/**
 * This file contains the "ImpactThreshold" class.
 *
 * @category SilverStripe_Project
 * @package SDLT
 * @author  Catalyst I.T. SilverStripe Team 2019 <silverstripedev@catalyst.net.nz>
 * @copyright 2019 Catalyst.Net Ltd
 * @license https://www.catalyst.net.nz (Commercial)
 * @link https://www.catalyst.net.nz
 */

namespace NZTA\SDLT\Model;

use SilverStripe\ORM\DataObject;
use SilverStripe\GraphQL\Scaffolding\Interfaces\ScaffoldingProvider;
use SilverStripe\GraphQL\Scaffolding\Scaffolders\SchemaScaffolder;

/**
 * Class ImpactThreshold. Represents an admin-managed record for association with
 * Base Impact Ratings.
 */
class ImpactThreshold extends DataObject implements ScaffoldingProvider
{
    /**
     * @var string
     */
    private static $table_name = 'ImpactThreshold';

    /**
     * If $operator and $operand match an impact-rating, return it.
     *
     * @param mixed int|float $operand The RHS operand to compare against the
     *                                 "Value" field.
     * @return mixed null|ImpactThreshold An instance of {@link ImpactThreshold}
     *                                    if a match is found, or null otherwise.
     * Note: This method is limited in scope. In the event that an operand is set
     *       where it's _both_ ">" and ">=" <N>, then the first "hit" is returned.
     *       This is simply a case for admin users to consider when configuring
     *       thresholds within the SDLT, with the use of incremental or "stepped"
     *       thresholds.
     */
    public static function match($operand)
    {
        $operand = str_replace(',', '', $operand);
        $sort = sprintf('ABS(Value - %s) ASC', $operand);
        $thresholds = self::get()->sort($sort);

        foreach ($thresholds as $threshold) {
            $opr = $threshold->Operator;
            $val = $threshold->Value;

            switch ($opr) {
                case '<':
                    if ($operand < $val) {
                        return $threshold;
                    }
                    break;
                case '<=':
                    if ($operand <= $val) {
                        return $threshold;
                    }
                    break;
                case '>':
                    if ($operand > $val) {
                        return $threshold;
                    }
                    break;
                case '>=':
                    if ($operand >= $val) {
                        return $threshold;
                    }
                    break;
                default:
                    return null;
            }
        }

        return null;
    }

    /**
     * @param SchemaScaffolder $scaffolder Scaffolder
     * @return SchemaScaffolder
     */
    public function provideGraphQLScaffolding(SchemaScaffolder $scaffolder)
    {
        // Provide entity type
        $typeScaffolder = $scaffolder
            ->type(ImpactThreshold::class)
            ->addFields([
                'Name',
                'Value',
                'Colour',
                'Operator'
            ])
            ->operation(SchemaScaffolder::READ)
            ->setUsePagination(false)
            ->setName('readImpactThreshold')
            ->end();

        return $scaffolder;
    }
}
