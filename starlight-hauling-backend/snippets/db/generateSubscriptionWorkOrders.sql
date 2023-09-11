INSERT INTO "starlight"."subscription_work_orders" (
    "subscription_order_id",
    "status",
    "service_date",
    "assigned_route",
    "driver_name",
    "instructions_for_driver",
    "comment_from_driver"
)
WITH "data" AS (
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
        "starlight"."subscription_orders" "so"
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
