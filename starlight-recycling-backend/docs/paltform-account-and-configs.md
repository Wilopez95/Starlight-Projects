[Root Docs](../README.md)

# Platform Account and configs

## Table of contents

- [Platform Account](#platform-account)
  - [Platform Account Definition](#platform-account-definition)
  - [Platform Account Config](#platform-account-config)
- [Service Account](#service-account)
  - [Service Account Definition](#service-account-definition)
  - [Service Account Config](#service-account-config)
  - [Service Account Usage](#service-account-usage)
    - [Examples of generated Service Accounts](#examples-of-generated-service-accounts)
- [General Config](#general-config)
  - [Service](#Service)
  - [Service Permission](#service-permission)

## Platform Account

### Platform Account Definition

`Platform Account` - an account of a Starlight customer that buys subscription for Starlight Services

Platform Account is kind of a container for all customer data that is not owned by any service.

Examples:

- Users are bound to a Platform Account.

### Platform Account Config

Key | Description
----|------
ID | string that will be visible every where
Name | name of the Platform Account, free form

ID is used in:

- URLs: `/[Platform Account ID]/[Service ID]/[Service Account Count]`

## Service Account

### Service Account Definition

`Service Account` - a single Starlight Customer subscription for a Starlight Service

Examples:
- Starlight Customer may request one subscription for Hauling and one for Recycling: one Service Account for each service
- Starlight Customer may request one subscription for Hauling and two for Recycling: one Service Account for Hauling and two for Recycling

Note: Schemas/multi-tenancy is based on Service Accounts.
Note: Service Account is a Client in context of OIDC provider
Note: Service Account is a Client in context of OIDC provider

### Service Account Config

Key | Description
----|------
Name | name of the Service Account, free form
Platform Account | owner Platform Account
Service | A Service for the Service Account
apiSecret | a secret used in OAuth 2.0, in capacity of Client
redirectUris | list of allowed redirect URIs in OAuth 2.0, in capacity of Client

### Service Account Usage

Service Account `ID` is used within OAuth 2.0 (OIDC Provider) as a Client.

Auto-generated ID format is the following: `srn:[Tenant Name]:[Service Name]:[Business Unit ID]`

`:` - separator

`srn` - indicator that it is a Starlight Resource Name

`[Tenant Name]` - self explanatory

`[Service Name]` - self explanatory

`[Business Unit ID]` - indicates auto incremented number of an Service Account within single Service and single Platform Account


#### Examples of generated Service Accounts

Given: Platform Account ID `acme`
  And: Service ID `recycling` for Starlight service Recycling

First Service Account for Recycling will have ID `srn:acme:recycling:1`.
Second Service Account for Recycling will have ID `srn:acme:recycling:2`.


## General Config

### Service

This is an entity that represents Starlight Service that is available for customers

### Service Permission

List of available permissions in Starlight services