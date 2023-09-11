INSERT INTO "starlight"."subscription_orders" (
    "subscription_service_item_id",
    "billable_service_id",
    "global_rates_services_id",
    "custom_rates_group_services_id",
    "service_date",
    "price",
    "quantity"
)
SELECT
    "ssi"."id" AS "subscription_service_item_id",
    "ssi"."billable_service_id" AS "billable_service_id",
    "ssi"."global_rates_services_id" AS "global_rates_services_id",
    "ssi"."custom_rates_group_services_id" AS "custom_rates_group_services_id",
    "s"."start_date" + INTERVAL '1 day' * "g2"."day_number" AS "service_date",
    "ssi"."price" AS "price",
    "ssi"."quantity" AS "quantity"
FROM
    generate_series(1, 15) AS "g1" ("id")
    INNER JOIN "starlight"."subscription_service_item" "ssi" ON "ssi"."id" = "g1"."id"
    INNER JOIN "starlight"."subscriptions" s ON "s"."id" = "ssi"."subscription_id"
    CROSS JOIN (SELECT * FROM generate_series(1, 30) AS "g" ("day_number") ) "g2"
;
