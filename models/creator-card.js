const { ModelSchema, SchemaTypes, DatabaseModel } = require('@app-core/mongoose');

const modelName = 'creator_cards';

const schemaConfig = {
  _id: { type: SchemaTypes.ULID },
  title: { type: SchemaTypes.String },
  slug: { type: SchemaTypes.String, index: true, unique: true },
  description: { type: SchemaTypes.String },
  access_type: { type: SchemaTypes.String },
  access_code: { type: SchemaTypes.String },
  status: { type: SchemaTypes.String, default: 'draft' },
  links: { type: SchemaTypes.Array, default: [] },
  pricing: { type: SchemaTypes.Array, default: [] },
  creator_reference: { type: SchemaTypes.String, index: true },
  created: { type: SchemaTypes.Number },
  updated: { type: SchemaTypes.Number },
};

const modelSchema = new ModelSchema(schemaConfig, { collection: modelName });

module.exports = DatabaseModel.model(modelName, modelSchema, { paranoid: true });
