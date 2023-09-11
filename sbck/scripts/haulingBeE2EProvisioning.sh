cp ./starlight_billing_be_provisioning_pack/e2e.env ./e2e.env

cpy .env ./ --rename=backup.env
cpy e2e.env ./ --rename=.env

cp ./starlight_billing_be_provisioning_pack/e2e.npmrc ./.npmrc
yarn

# [IN CASE IF YOU HAVE OLD CONTAINERS]
yarn docker:e2e:stop
yarn docker:e2e:prune
# [ONLY IF YOU HAVE PROBLEMS WITH CONTAINERS]
# yarn docker:stop
# yarn docker:clean
# yarn docker:prune

yarn docker:e2e:start

sleep 120 # to ensure containers initialized with their entry script

 # to run initial migrations and init queues
yarn db:init

cpy backup.env ./ --rename=.env && rm -f ./backup.env
