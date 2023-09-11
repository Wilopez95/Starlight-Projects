WITH "so" AS (
    SELECT
        ROW_NUMBER() OVER () AS "id",
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
),
"data" AS (
    SELECT
        "so"."id" AS "subscription_order_id",
        CASE
            WHEN "so"."service_date" <= CURRENT_DATE
                THEN ('[0:9]={COMPLETED,COMPLETED,COMPLETED,COMPLETED,COMPLETED,COMPLETED,COMPLETED,COMPLETED,COMPLETED,CANCELED}'::TEXT[])[TRUNC(RANDOM()*10)]
            WHEN "so"."service_date" <= CURRENT_DATE + INTERVAL '1 day'
                THEN 'IN_PROGRESS'
            ELSE ('[0:9]={SCHEDULED,SCHEDULED,SCHEDULED,SCHEDULED,SCHEDULED,SCHEDULED,SCHEDULED,SCHEDULED,SCHEDULED,CANCELED}'::TEXT[])[TRUNC(RANDOM()*10)]
        END AS "status",
        "so"."service_date" AS "service_date",
        "so"."quantity" AS "quantity",
        ('[0:9]={"Denver Route #1","Denver Route #2","Denver Master Route #1","Denver Master Route #2","Denver Master Route #3","Colorado Route #1","Colorado Route #2","Colorado Route #3","Colorado Route #4","Colorado Route #5"}'::TEXT[])[TRUNC(RANDOM()*10)] AS "assigned_route",
        ('[0:9]={"John Snow","Jack Daniels","Jack Sparrow","Tom Riddle","Tom Tailor","Harry Potter","Bruce Lee","Lana Del Rei","Lady Gaga","Cory Tailor"}'::TEXT[])[TRUNC(RANDOM()*10)] AS "driver_name",
        "s"."driver_instructions" AS "instructions_for_driver",
        ('[0:19]={"here is a weird hug dog near the site","","","","","","","","","","","","","","","","","","","the road became a river"}'::TEXT[])[TRUNC(RANDOM()*20)] AS "comment_from_driver"
    FROM
        "so"
        INNER JOIN "starlight"."subscription_service_item" "ssi" ON "ssi"."id" = "so"."subscription_service_item_id"
        INNER JOIN "starlight"."subscriptions" "s" ON "s"."id" = "ssi"."subscription_id"
)
SELECT
    "data"."subscription_order_id",
    "data"."status",
    "data"."service_date",
    "data"."assigned_route",
    "data"."driver_name",
    "data"."instructions_for_driver",
    "data"."comment_from_driver"
FROM
    "data", generate_series(1, "data"."quantity") AS "g" ("item")
;
