cp ./starlight_billing_be_provisioning_pack/local.env ./.env
cp ./starlight_billing_be_provisioning_pack/local.npmrc ./.npmrc
yarn

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
