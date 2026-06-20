const { ModelSchema, SchemaTypes, DatabaseModel } = require('@app-core/mongoose');

const modelName = 'notifications';

const schemaConfig = {
  _id: { type: SchemaTypes.ULID },
  payload: { type: SchemaTypes.Mixed },
  template: { type: SchemaTypes.String },
  recipient: { type: SchemaTypes.String, index: true },
  subject: { type: SchemaTypes.String },
  nextResendTimestamp: { type: SchemaTypes.Number },
  resendDelayMillis: { type: SchemaTypes.Number },
  context: { type: SchemaTypes.String, index: true },
  type: { type: SchemaTypes.String, index: true },
  userId: { type: SchemaTypes.String, index: true },
  meta: { type: SchemaTypes.Mixed },
  created: { type: SchemaTypes.Number },
  updated: { type: SchemaTypes.Number },
};

const modelSchema = new ModelSchema(schemaConfig, { collection: modelName });

module.exports = DatabaseModel.model(modelName, modelSchema);
