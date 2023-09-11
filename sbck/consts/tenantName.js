// Tenant name can only consist of lowercase letters, digits and underscores
// and should not contain two consecutive underscores.
// This is owing to ElasticSearch restrictions combined with SQL restrictions on identifiers
// since `name` is used both as the basis of each tenant's indices as well as
// PostgreSQL schema name.
export default /^(?!.*?__)[a-z0-9_]+$/;
