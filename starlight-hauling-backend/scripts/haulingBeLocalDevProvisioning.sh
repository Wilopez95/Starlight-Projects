cp ./hauling-be-provisioning/local.env ./.env
cp ./shauling-be-provisioning/local.npmrc ./.npmrc


# [IN CASE IF YOU HAVE OLD CONTAINERS]
yarn docker:local:stop
yarn docker:local:prune
# [ONLY IF YOU HAVE PROBLEMS WITH CONTAINERS]
# yarn docker:stop
# yarn docker:clean
# yarn docker:prune

yarn docker:local:start

sleep 120 # to ensure containers initialized with their entry script

# to run initial migrations and init queues
yarn db:init



## OUTDATED???

# export PGPASSWORD='starlight_hauling_local'; psql -h localhost -d starlight_hauling_local -U starlight_hauling_local -p 7435 -c 'DROP schema IF EXISTS crpt CASCADE;'
# export PGPASSWORD='starlight_hauling_local'; psql -h localhost -d starlight_hauling_local -U starlight_hauling_local -p 7435 -c 'DROP schema IF EXISTS starlight CASCADE;'
# export PGPASSWORD='starlight_hauling_local'; psql -h localhost -d starlight_hauling_local -U starlight_hauling_local -p 7435 -c 'DROP schema IF EXISTS admin CASCADE;'

# sleep 5 # to ensure that DB has performed all background operations after schemas drop

# export PGPASSWORD='starlight_hauling_local'; psql -h localhost -d starlight_hauling_local -U starlight_hauling_local -p 7435 -f ~/Downloads/starlight_hauling_be_provisioning_pack/hauling_admin.sql
# export PGPASSWORD='starlight_hauling_local'; psql -h localhost -d starlight_hauling_local -U starlight_hauling_local -p 7435 -f ~/Downloads/starlight_hauling_be_provisioning_pack/hauling_starlight.sql
# export PGPASSWORD='starlight_hauling_local'; psql -h localhost -d starlight_hauling_local -U starlight_hauling_local -p 7435 -f ~/Downloads/starlight_hauling_be_provisioning_pack/hauling_tenant.sql

# sleep 5 # to ensure that DB has performed all background operations after schemas load

# export PGPASSWORD='starlight_hauling_local'; psql -h localhost -d starlight_hauling_local -U starlight_hauling_local -p 7435 -c "DELETE FROM admin.companies WHERE tenant_id NOT IN (1, 2);"
# export PGPASSWORD='starlight_hauling_local'; psql -h localhost -d starlight_hauling_local -U starlight_hauling_local -p 7435 -c "DELETE FROM admin.company_mail_settings WHERE tenant_id NOT IN (1, 2);"
# export PGPASSWORD='starlight_hauling_local'; psql -h localhost -d starlight_hauling_local -U starlight_hauling_local -p 7435 -c "DELETE FROM admin.tenants WHERE name NOT IN ('crpt', 'starlight');"
# export PGPASSWORD='starlight_hauling_local'; psql -h localhost -d starlight_hauling_local -U starlight_hauling_local -p 7435 -c "DELETE FROM admin.tenant_migrations WHERE tenant NOT IN ('crpt', 'starlight');"

# # load aggregate functions that wasn't restored loaded from dump
# export PGPASSWORD='starlight_hauling_local'; psql -h localhost -d starlight_hauling_local -U starlight_hauling_local -p 7435 -f ~/Downloads/starlight_hauling_be_provisioning_pack/hauling_functions.sql

#  # to run final migrations and init elasticsearch indexes
# yarn db:init
