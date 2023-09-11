# Starlight Pricing Microservice

## Docker Database connexion

##### If don't have a Postgres superuser

Use the Postgres terminal:

- Run `CREATE USER username SUPERUSER;`
- Run `ALTER USER username SUPERUSER PASSWORD 'passwordstring';`

## Enviroment setup

Do not forget to run `yarn` or `yarn install` to install the required dependencies. 2. Use
`.env.example` file as guidance and set up the environment variables listed there. 3. Run
`docker-compose up` in your command shell to spin up local DB and Elasticsearch instances. 4. Run

```shell
yarn start
```

## Technological stack

- Node.js v16
- yarn v1
- Koa 2
- TypeScript
- Postgresql 14
- Redis
- TypeORM

## Multi-tenancy setup

1.  Make sure `public` schema is empty, if not, delete it and create it again.
2.  Run the project with `yarn start:dev`.
3.  Hit the tenant sync endpoint to create the tenant DB schema,

        ```bash
        curl -X PUT [HAULING-BASE-URL]/api/v1/admin/tenants/[YOUR-TENANT-NAME]
        ```

    That should be enough to start working with your custom tenant.
