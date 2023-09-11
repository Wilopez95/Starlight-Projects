# Pricing Engine Refactoring Plan

1. Design Phase

   1.1. Design new DB Structure (by Tech Lead).
   [See result](./DB%20Structure/README.md)

   1.2. BE efforts estimate (by BE dev)

   1.2. Develop BE API interfaces (routes, validation schemas)

   1.3. Analysis of FE changes, Design FE solution, FE efforts estimate (by FE dev)

   1.4. Tweak BE API interfaces in sync with FE

   1.5. BE and FE efforts re-estimate (final)

2. Configurations (without an impact on existing Subscriptions and Independent Orders)
   development Phase on BE and FE

   - separate interfaces, routes, containers, stores, services, forms on FE
   - separate repositories, services, routes, controllers, utils on BE
     2.1. Develop BE repositories for prices. There shouldn't be any kind of business logic.
     Only DB querying and mapping to and from DB
     2.2. Develop BE unit tests (by dev) for prices services (business logic, calculations)
     and utils.
     Work on test cases in co-operation with QA Lead
     2.3. Develop BE prices services (business logic, calculations) and utils
     2.4. Develop BE API controllers, integrate all BE functionality
     2.5. Develop BE API e2e tests (by Automation QA) in co-operation with QA Lead and dev
     2.6. Complete FE and integration with BE
     2.7. Develop FE e2e tests (by Automation QA) in co-operation with QA Lead and dev

3. Independent Order-related changes development Phase on BE and FE

   - move calculations from FE to BE
   - interfaces, routes, containers, stores, services, forms on FE
   - repositories, services, routes, controllers, utils on BE

     3.1. Refactor BE repositories for Independent Order with sub-entities.
     Isolate pricing and calculations logic, split files,
     move business logic to services

     3.2. Develop BE unit tests (by dev) for
     Independent Order-related prices services (business logic, calculations) and utils.
     Work on test cases in co-operation with QA Lead

     3.3. Develop BE Independent Order-related prices services
     (business logic, calculations) and utils

     3.4. Develop BE Independent Order-related prices API controllers,
     integrate all BE functionality

     3.5. Develop BE Independent Order-related prices API e2e tests
     (by Automation QA) in co-operation with QA Lead and dev

     3.6. Complete FE and integration with BE

     3.7. Develop FE Independent Order-related prices e2e tests
     (by Automation QA) in co-operation with QA Lead and dev

4. Subscription-related changes development Phase on BE and FE

   - interfaces, routes, containers, stores, services,
     forms on FE (should be 0 efforts only on this one)
   - repositories, services, routes, controllers, utils on BE

     4.1. Refactor BE repositories for Subscriptions with sub-entities.
     Complete Isolating pricing and calculations logic
     (some part has been completed already),
     split files, complete moving business logic to services
     (some part has been completed already)

     4.2. Complete development of BE unit tests (by dev) for
     Subscription-related prices services (business logic, calculations) and utils.
     Work on test cases in co-operation with QA Lead

     4.3. Complete development of BE Subscription-related prices services
     (business logic, calculations) and utils (some part has been completed already)

     4.4. Complete integration of all BE functionality

     4.5. Develop BE Subscription-related prices API e2e tests (by Automation QA)
     in co-operation with QA Lead and dev

     4.6. Complete FE and integration with BE (should be 0 efforts only on this one)

     4.7. Develop FE Subscription-related prices e2e tests (by Automation QA)
     in co-operation with QA Lead and dev

5. Configurations Impact on existing Subscriptions and
   Independent Orders development Phase on BE and FE

   - queue jobs
   - cron jobs

     5.1. Develop BE unit tests (by dev) for Queue Jobs.
     Work on test cases in co-operation with QA Lead

     5.2. Develop BE unit tests (by dev) for Cron Jobs.
     Work on test cases in co-operation with QA Lead

     5.3. Extend BE unit tests (by dev) for prices services (business logic, calculations)
     and utils.
     Work on test cases in co-operation with QA Lead

     5.4. Extend BE repositories (more queries and mappers if needed)

     5.5. Extend BE prices services and utils

     5.6. Implement BE Queue Jobs

     5.7. Implement BE Cron Jobs

     5.8. Extend BE API e2e tests (by Automation QA) in co-operation with QA Lead and dev

     5.9. Extend FE e2e tests (by Automation QA) in co-operation with QA Lead and dev

6. Invoicing-related changes development Phase on BE and FE

   6.1. Refactor BE repositories.
   Refactor queries to depend only on new Pricing Engine.
   Make sure all related business logic has been moved to invoicing services

   6.2. Development of BE unit tests (by dev) for
   invoicing services (business logic, calculations) and utils.
   Work on test cases in co-operation with QA Lead

   6.3. Develop BE invoicing services
   (business logic, calculations) and utils (move all logic from repositories)

   6.4. Develop BE invoicing-related API e2e tests (by Automation QA)
   in co-operation with QA Lead and dev

   6.5. Develop FE and integration with BE (should be 0 efforts only on this one)

   6.6. Develop FE invoicing-related e2e tests (by Automation QA)
   in co-operation with QA Lead and dev

7. ??? Customer Portal changes development Phase on BE and FE
