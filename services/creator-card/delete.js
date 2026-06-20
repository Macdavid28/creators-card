const validator = require('@app-core/validator');
const { throwAppError, ERROR_CODE } = require('@app-core/errors');
const { appLogger } = require('@app-core/logger');
const { CreatorCardMessages } = require('@app/messages');
const creatorCardRepository = require('@app/repository/creator-card');

const deleteSpec = `root {
  slug string<trim|minLength:1>
  creator_reference string<trim|minLength:1>
}`;

const parsedSpec = validator.parse(deleteSpec);

async function deleteCreatorCard(serviceData, options = {}) {
  let response;

  const validatedData = validator.validate(serviceData, parsedSpec);

  try {
    const { slug, creator_reference: creatorReference } = validatedData;

    const card = await creatorCardRepository.findOne({ query: { slug } });
    if (!card) {
      throwAppError(CreatorCardMessages.CARD_NOT_FOUND, ERROR_CODE.NF01);
    }

    if (card.creator_reference !== creatorReference) {
      throwAppError(CreatorCardMessages.INVALID_CREATOR_REFERENCE, ERROR_CODE.PERMERR);
    }

    await creatorCardRepository.deleteOne({ query: { slug } });

    response = { success: true };
  } catch (error) {
    appLogger.errorX(error, 'delete-creator-card-error');
    throw error;
  }

  return response;
}

module.exports = deleteCreatorCard;
