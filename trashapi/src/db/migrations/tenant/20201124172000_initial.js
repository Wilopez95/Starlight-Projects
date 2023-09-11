export const up = async knex => {
  // squashed on 20.10.2021
  // tables structure
  await knex.raw(`
    create table locations
    (
        id           bigserial
            primary key,
        name         varchar(255)                              null,
        longitude    float4                                    null,
        latitude     float4                                    null,
        type         varchar(255) default 'LOCATION'           not null,
        waypoint_type varchar(256)                              null,
        seed_name     text                                      null,
        waypoint_name varchar(256)                              null,
        created_by    varchar(128)                              null,
        created_date  timestamp(3) default current_timestamp(3) null,
        modified_by   varchar(128)                              null,
        modified_date timestamp(3) default current_timestamp(3) null,
        deleted      boolean      default false                    not null,
        description  text                                      null,
        license_plate varchar(25)                               null,

        constraint nameloc
            unique (name, longitude, latitude, type)
    );

    create table cans
    (
        id                  bigserial
            primary key,
        name                varchar(128)                              null,
        serial              varchar(128)                              null,
        size                varchar(30)                               null,
        requires_maintenance boolean      default false                    not null,
        out_of_service        boolean      default false                    not null,
        deleted             boolean      default false                    not null,
        location_id          int                                       null,
        source              varchar(256)                              null,
        start_date           timestamp    default current_timestamp(3) null,
        hazardous           boolean      default false                    not null,
        action              varchar(256)                              null,
        timestamp           timestamp(3) default current_timestamp(3) not null,
        created_by           varchar(128)                              null,
        created_date         timestamp(3) default current_timestamp(3) null,
        modified_by          varchar(128)                              null,
        modified_date        timestamp(3) default current_timestamp(3) null,
        prev_location_id      int                                       null,
        in_use               boolean      default false                    not null,
        hauling_business_unit_id          bigint                           not null,
        truck_id                          bigint                        null,
        constraint cans_location_id_fk
            foreign key (location_id) references locations (id),
        constraint cans_prevLocationId_fk
            foreign key (prev_location_id) references locations (id)
    );

    create index cans__name
        on cans (name);

    create index cans__serial
        on cans (serial);

    create index locations__deleted
        on locations (deleted);

    create index locations__type
        on locations (type);

    create index locations__type__deleted
        on locations (type, deleted);

    create index waypoint__name
        on locations (waypoint_name);

    create index waypoint__type
        on locations (waypoint_type);

    create table materials
    (
        id           bigserial
            primary key,
        name         varchar(255)                              not null,
        created_by    varchar(128)                              null,
        created_date  timestamp(3) default current_timestamp(3) not null,
        modified_by   varchar(128)                              null,
        modified_date timestamp(3) default current_timestamp(3) not null,
        deleted      boolean      default false                    not null,
        constraint materials_uk
            unique (name)
    );

    create table settings
    (
        id           bigserial
            primary key,
        "key"        varchar(255)                              not null,
        value        jsonb                                     not null,
        created_by    varchar(128)                              null,
        created_date  timestamp(3) default current_timestamp(3) not null,
        modified_by   varchar(128)                              null,
        modified_date timestamp(3) default current_timestamp(3) not null,
        hauling_business_unit_id          bigint                not null,
        constraint settings_hauling_business_unit_id_key
            unique (hauling_business_unit_id, "key")
    );

    create table sizes
    (
        id           bigserial
            primary key,
        name         varchar(255)                              not null,
        created_by    varchar(128)                              null,
        created_date  timestamp(3) default current_timestamp(3) not null,
        modified_by   varchar(128)                              null,
        modified_date timestamp(3) default current_timestamp(3) not null,
        deleted      boolean      default false                    not null,
        constraint sizes_uk
            unique (name)
    );

    create table templates
    (
        id              bigserial
            primary key,
        name            varchar(128)                              null,
        description     text                                      null,
        logo            varchar(256)                              null,
        company_name     varchar(256)                              null,
        address         varchar(256)                              null,
        address_2        varchar(256)                              null,
        city            varchar(256)                              null,
        state           varchar(75)                               null,
        zipcode         varchar(10)                               null,
        phone_number     varchar(13)                               null,
        content         text                                      null,
        content_raw      jsonb                                     null,
        footer          text                                      null,
        footer_raw       jsonb                                     null,
        header          text                                      null,
        header_raw       jsonb                                     null,
        acknowledgement text                                      null,
        deleted         boolean      default false                    not null,
        created_by       varchar(128)                              null,
        created_date     timestamp(3) default current_timestamp(3) null,
        modified_by      varchar(128)                              null,
        modified_date    timestamp(3) default current_timestamp(3) null,
        constraint templates_name_uindex
            unique (name)
    );

    create table documents
    (
        id           bigserial
            primary key,
        url          text                                      null,
        template_id   int                                       null,
        work_order_id  int                                       null,
        printed_name  varchar(128)                              null,
        driver       varchar(128)                              null,
        lon          decimal(11, 8)                            null,
        lat          decimal(10, 8)                            null,
        created_by    varchar(128)                              null,
        created_date  timestamp(3) default current_timestamp(3) null,
        modified_by   varchar(128)                              null,
        modified_date timestamp(3) default current_timestamp(3) null,
        constraint documents_templateId_fk
            foreign key (template_id) references templates (id)
                on update cascade on delete cascade
    );

    create table timecards
    (
        id           bigserial
            primary key,
        driver_id     bigint                                    null,
        start_time    timestamp(3)                              null,
        stop_time     timestamp(3)                              null,
        created_by    varchar(128)                              null,
        created_date  timestamp(3) default current_timestamp(3) not null,
        modified_by   varchar(128)                              null,
        modified_date timestamp(3) default current_timestamp(3) not null,
        deleted      boolean      default false                    not null
    );

    create table transactions
    (
        id           bigserial
            primary key,
        timestamp    timestamp(3) default current_timestamp(3) not null,
        action       varchar(256)                              not null,
        payload      jsonb                                     null,
        location_id_1  bigint                                    null,
        location_id_2  bigint                                    null,
        can_id        bigint                                    null,
        created_by    varchar(128)                              null,
        created_date  timestamp(3) default current_timestamp(3) null,
        modified_by   varchar(128)                              null,
        modified_date timestamp(3) default current_timestamp(3) null,
        constraint transactions_can_id_fk
            foreign key (can_id) references cans (id),
        constraint transactions_location1_id_fk
            foreign key (location_id_1) references locations (id),
        constraint transactions_location2_id_fk
            foreign key (location_id_2) references locations (id)
    );

    create table trips
    (
        id           bigserial
            primary key,
        truck_id      bigint                                    null,
        driver_id     bigint                                    null,
        trip_type     varchar(256)                              not null,
        created_date  timestamp(3) default current_timestamp(3) not null,
        created_by    varchar(128)                              null,
        modified_date timestamp(3) default current_timestamp(3) not null,
        modified_by   varchar(128)                              null,
        deleted      boolean      default false                    not null,
        odometer     float8       default 0                    not null
    );

    create table work_orders
    (
        id                      bigserial
            primary key,
        status                  varchar(256)                              null,
        action                  varchar(256)                              null,
        size                    varchar(60)                               null,
        material                varchar(256)                              null,
        scheduled_date           date                                      null,
        scheduled_start          time                                      null,
        scheduled_end            time                                      null,
        po_number                varchar(256)                              null,
        contact_name             varchar(256)                              null,
        contact_number           varchar(60)                               null,
        customer_name            varchar(256)                              null,
        instructions            text                                      null,
        alley_placement          boolean      default false                    not null,
        early_pick_up             boolean      default false                    not null,
        ok_to_roll                boolean      default false                    not null,
        negotiated_fill          boolean      default false                    not null,
        profile_number           varchar(60)                               null,
        customer_provided_profile boolean      default false                    not null,
        priority                boolean      default false                    not null,
        step                    varchar(256)                              null,
        created_by               varchar(128)                              null,
        created_date             timestamp(3) default current_timestamp(3) null,
        modified_by              varchar(128)                              null,
        modified_date            timestamp(3) default current_timestamp(3) null,
        driver_id                int                                       null,
        deleted                 boolean      default false                    not null,
        location_id_1             bigint                                    null,
        location_id_2             bigint                                    null,
        index                   int          default 0                    null,
        cow                     boolean      default false                    null,
        sos                     boolean      default false                    null,
        cab_over                 boolean      default false                    null,
        permitted_can            boolean      default false                    null,
        text_on_way               varchar(255)                              null,
        permit_number            varchar(255)                              null,
        signature_required       boolean      default false                    not null,
        template_id              bigint                                    null,
        document_id              bigint                                    null,
        suspension_location_id    bigint                                    null,
        pending_suspend          boolean      default false                    null,
        suspend_requested        boolean      default false                    null,
        suspended_can_id          bigint                                    null,
        service_description      varchar(255)                              null,
        hauling_sync          boolean         default false                 null,
        hauling_billable_service_id          bigint                                    null,
        hauling_material_id          bigint                                    null,
        hauling_disposal_site_id          bigint                                    null,
        tenant_id          bigint                                    null,
        customer_id          bigint                                    null,
        hauling_business_unit_id          bigint                                not null,
        constraint work_orders_cans_id_fk
            foreign key (suspended_can_id) references cans (id),
        constraint work_orders_documentId_fk
            foreign key (document_id) references documents (id)
                on update cascade on delete cascade,
        constraint work_orders_location1_id_fk
            foreign key (location_id_1) references locations (id),
        constraint work_orders_location2_id_fk
            foreign key (location_id_2) references locations (id),
        constraint work_orders_templateId_fk
            foreign key (template_id) references templates (id)
                on update cascade on delete cascade
    );

    alter table documents
        add constraint documents_work_order_id_fk
            foreign key (work_order_id) references work_orders (id)
                on update cascade on delete cascade;

    create table wo_notes
    (
        id           bigserial
            primary key,
        note         jsonb                                     null,
        created_date  timestamp(3) default current_timestamp(3) null,
        modified_date timestamp(3) default current_timestamp(3) null,
        deleted      boolean      default false                    not null,
        work_order_id  bigint                                    null,
        location_id   bigint                                    null,
        type         varchar(75)                               null,
        created_by    varchar(128)                              null,
        modified_by   varchar(128)                              null,
        constraint wo_notes_location_id_fk
            foreign key (location_id) references locations (id),
        constraint wo_notes_work_order_id_fk
            foreign key (work_order_id) references work_orders (id)
    );

    create index wo_notes__deleted
        on wo_notes (deleted);

    create index wo_notes__type
        on wo_notes (type);

    create index work_orders__deleted
        on work_orders (deleted);

    create index work_orders__scheduled_date
        on work_orders (scheduled_date);

    create index work_orders__action
        on work_orders (action);

    create index work_orders__status
        on work_orders (status);
  `);

  // triggers
  await knex.raw(`
    create function update_work_order_completed()
      returns trigger
      language plpgsql
    as
    $$
    BEGIN
      -- assuming work order step is WORK ORDER COMPLETE;
      -- update work order status to equal completed
      IF (NEW.step = 'WORK ORDER COMPLETE')
      THEN
        SET NEW.status = 'COMPLETED';
      END IF;
      RETURN NEW;
    END;
    $$;

    create trigger work_order_completed_trigger
      before update
      on work_orders
      for each row
    execute procedure update_work_order_completed();
  `);

  await knex.raw(`
    create function complete_work_order()
      returns trigger
      language plpgsql
    as
    $$
    BEGIN
      -- On insert for a work order note, if the body of note contains
      -- newState = WORK ORDER COMPLETE;
      -- update work order where the id matches the work_order_id on the note
      -- so that step = WORK ORDER COMPLETE and status = COMPLETED
      IF (NEW.note::json ->> 'newState' = 'WORK ORDER COMPLETE')
      THEN
        UPDATE work_orders
        SET status = 'COMPLETED', step = 'WORK ORDER COMPLETE'
        WHERE work_orders.id = NEW.work_order_id;
      END IF;
      RETURN NULL;
    END;
    $$;

    create trigger complete_work_order_trigger
      after insert
      on wo_notes
      for each row
    execute procedure complete_work_order()
  `);
};

const tablesToBeRemoved = [
  'cans',
  'documents',
  'locations',
  'materials',
  'settings',
  'sizes',
  'templates',
  'timecards',
  'transactions',
  'trips',
  'wo_notes',
  'work_orders',
];

export const down = async knex => {
  await Promise.all(
    tablesToBeRemoved.map(
      async table => await knex.raw(`DROP TABLE IF EXISTS ${table} CASCADE`)
    ),
  );
};
