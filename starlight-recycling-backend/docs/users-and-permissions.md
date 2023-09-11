[Root Docs](../README.md)

# Users and Permissions

## Table of contents

- [Permanent User Restrictions](#permanent-user-restrictions)
- [Permissions Structure](#permissions-structure)
  - [A single Available Permission](#a-single-available-permission)
  - [A matching Permission in a PolicyStatement](#a-matching-permission-in-a-policyStatement)
- [Assign Permissions](#assign-permissions)
  - [Assign user permissions via role](#assign-user-permissions-via-role)
  - [Assign user permissions directly to a user](#assign-user-permissions-directly-to-a-user)
  - [Steps to create a Policy Statement](#steps-to-create-a-policy-statement)
- [Permissions funnel](#permissions-funnel)
- [Permissions Parameters](#permissions-parameters)

## Permanent User Restrictions

- User is bound to a single Platform Account
- User can be logged into different Service Accounts at the same time. Each one will have its own access token
- all user emails are unique within our database
- one email may be bound to only one Platform Account (one email cannot be used to login into two different Platform Accounts)

## Permissions Structure

**Origin Level**: Service Permissions

**Assign Level 1**: RolePolicyStatements

**Assign Level 2**: UserPolicyStatements

**Usage Level**: Access Token with User, Resource and list of permissions

Note: In future this logic may be extended to add Assign Level 0, available permissions to Service Account

### A single Available Permission

Type: `String`

Convention of creating Service Permissions:

`admin:view` -> *functionality* `:` *action*

### A matching Permission in a PolicyStatement

PolicyStatement property: `actions`

#### Format:

Exact: `admin:view`

Pattern: `admin:*`

Note: for pattern matching [minimatch](https://www.npmjs.com/package/minimatch) is used


## Assign Permissions

There two ways to assign permissions to a user to any Service Account: via Role or directly.

### Assign user permissions via role

1. Create A role
2. Assing role to a user
3. Create RolePolicyStatement for the role from step 1

### Assign user permissions directly to a user

1. Create UserPolicyStatement with specified user in the form

### Steps to create a Policy Statement

1. Open form to create new Policy Statement (Role or User)
2. Choose Platform Account
3. Choose resource: Service Account
4. Select policy target: Role or User
5. Select Available Service Permissions, based on chosen Resource
6. Review

Key | Value
------------ | -------------
Platform Account | holder account of a Policy Statement
Resource | `srn:[platformAccount]:[service]:[service account id]`
User or Role | selected user or Role based on Policy Type
Name | name of the Policy statement
Action | `allow` or `deny`
Actions | :red_circle: :orange_circle: :yellow_circle:


Note: Only available permissions can be granted by selecting. Also there can be patterns entered.


## Permissions funnel

1. From the login information: we will obtain user and resource (srn)
2. Take all PolicyStatements from assigned roles
3. Take all PolicyStatements assigned to the user
4. Process all PolicyStatements via permissions funnel by filtering out for specified resource
5. Compile into a list of permissions


Roles PolicyStatements | User PolicyStatements
------------ | -------------
Granted Permissions for role(s) | Granted Permissions for user(s)
Allow: :red_circle: :orange_circle: :yellow_circle:; Deny: :brown_circle: | Allow: :brown_circle:; Deny: :red_circle:
:arrow_down: | :arrow_down:

:arrow_down::arrow_down::arrow_down:

Target (access token) Level: Permissions used for access

:orange_circle: :yellow_circle: :brown_circle:

Note: User permissions will overried those that are defined in Roles or higher.


## Permissions Parameters

Restrictions:

- all parameter values are used with `decodeURIComponent`
- developer is responsible of applying permission parameters in code as restrictions
- all parameter values, must be assigned using `encodeURIComponent`

Examples:

`srn:starlight:Role:list(platformAccount: acme)` - forced Platform Account id `acme`

`srn:starlight:Role:list(accessTokenKey: email)` - use `email` field from Access Token as permission parameter
`srn:starlight:Role:list(accessTokenKey: resource|serviceAccount)` - use `resource` field from Access Token as permission parameter and map it to `serviceAccount` key