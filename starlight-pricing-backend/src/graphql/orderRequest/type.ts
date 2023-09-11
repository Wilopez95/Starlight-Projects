import {
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLInt,
  GraphQLBoolean,
  GraphQLString,
} from 'graphql';
import { GraphQLDateTime } from 'graphql-scalars';

const orderRequestType: GraphQLObjectType = new GraphQLObjectType({
  name: 'orderRequest',
  description: 'display every order request on the system',
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLInt) },
    customer_id: { type: new GraphQLNonNull(GraphQLInt) },
    contractor_id: { type: new GraphQLNonNull(GraphQLInt) },
    status: { type: new GraphQLNonNull(GraphQLString) },
    job_site_id: { type: new GraphQLNonNull(GraphQLInt) },
    job_site_2_id: { type: new GraphQLNonNull(GraphQLInt) },
    billable_service_id: { type: new GraphQLNonNull(GraphQLInt) },
    equipment_item_id: { type: GraphQLInt },
    material_id: { type: new GraphQLNonNull(GraphQLInt) },
    service_date: { type: GraphQLDateTime },
    billable_service_price: { type: new GraphQLNonNull(GraphQLInt) },
    billable_service_quantity: { type: new GraphQLNonNull(GraphQLInt) },
    billable_service_total: { type: GraphQLInt },
    initial_grand_total: { type: GraphQLInt },
    grand_total: { type: GraphQLInt },
    media_urls: { type: GraphQLString },
    driver_instructions: { type: GraphQLString },
    alley_placement: { type: new GraphQLNonNull(GraphQLBoolean) },
    someone_on_site: { type: new GraphQLNonNull(GraphQLBoolean) },
    send_receipt: { type: new GraphQLNonNull(GraphQLBoolean) },
    payment_method: { type: GraphQLString },
    credit_card_id: { type: GraphQLInt },
    purchase_order_id: { type: GraphQLInt },
    service_area_id: { type: GraphQLInt },
    created_at: { type: GraphQLDateTime },
    updated_at: { type: GraphQLDateTime },
  }),
});

export default orderRequestType;
