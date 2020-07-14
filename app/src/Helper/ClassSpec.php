<?php

/**
 * This file contains the "ClassSpec" class.
 *
 * @category SilverStripe_Project
 * @package SDLT
 * @author  Catalyst I.T. SilverStripe Team 2019 <silverstripedev@catalyst.net.nz>
 * @copyright NZ Transport Agency
 * @license BSD-3
 * @link https://www.catalyst.net.nz
 */

namespace NZTA\SDLT\Helper;

use SilverStripe\Core\ClassInfo;

/**
 * Simple utility class to deal with nuances of classes that {@link ClassInfo}
 * in silverstripe/framework doesn't quite do for us.
 */
class ClassSpec
{
    /**
     * Utility method which returns the short classname, given a FQCN.
     *
     * @param  string $className A fully namespaced class name.
     * @return string
     */
    public static function short_name(string $className) : string
    {
        return ClassInfo::shortName($className);
    }

    /**
     * Utility method which returns the dahsed classname, given a FQCN.
     * Useful for referencing {@link GridField}'s by name in a {@link LeftAndMain}
     * context.
     *
     * @param  string $className A fully namespaced class name.
     * @return string
     */
    public static function dashed_name(string $className) : string
    {
        return str_replace('\\', '-', $className);
    }
}
