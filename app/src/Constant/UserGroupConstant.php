<?php

/**
 * This file contains the "UserGroupConstant" class.
 *
 * @category SilverStripe_Project
 * @package SDLT
 * @author  Catalyst I.T. SilverStripe Team 2018 <silverstripedev@catalyst.net.nz>
 * @copyright NZ Transport Agency
 * @license BSD-3
 * @link https://www.catalyst.net.nz
 */

namespace NZTA\SDLT\Constant;

/**
 * Class UserGroupConstant
 *
 * This class contains constants for user groups
 *
 */
class UserGroupConstant
{
    /**
     * @var string SilverStripe {@link Group} "Code" values.
     */
    const GROUP_CODE_CISO = 'sdlt-ciso';
    const GROUP_CODE_SA = 'sdlt-security-architect';
    const GROUP_CODE_USER = 'sdlt-users';
    const GROUP_CODE_REPORTER = 'sdlt-reporters';
    const GROUP_CODE_ADMIN = 'administrators';

    /**
     * @var string Role names used in {@link Member} logic throughout the system.
     */
    const ROLE_CODE_CISO = 'CISO';
    const ROLE_CODE_SA = 'SecurityArchitect';
    const ROLE_CODE_USER = 'Users';
    const ROLE_CODE_REPORTER = 'Reporters';
    const ROLE_CODE_ADMIN = 'Administrators';
    const ROLE_CODE_BO = 'BusinessOwner'; // Note: This role is not represented in a de-facto "Member" record
}
