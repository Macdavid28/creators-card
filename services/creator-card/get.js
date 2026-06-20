const validator = require('@app-core/validator');
const { throwAppError, ERROR_CODE } = require('@app-core/errors');
const { appLogger } = require('@app-core/logger');
const { CreatorCardMessages } = require('@app/messages');
const creatorCardRepository = require('@app/repository/creator-card');

const getSpec = `root {
  slug string<trim|minLength:1>
  access_code? string<trim>
}`;

const parsedSpec = validator.parse(getSpec);

function formatCardResponse(card) {
  if (!card) return null;
  const formatted = { ...card };
  if (formatted._id) {
    formatted.id = formatted._id;
    delete formatted._id;
  }
  delete formatted.__v;
  return formatted;
}

async function getCreatorCard(serviceData, options = {}) {
  let response;

  const validatedData = validator.validate(serviceData, parsedSpec);

  try {
    const { slug, access_code: accessCode } = validatedData;

    const card = await creatorCardRepository.findOne({ query: { slug } });
    if (!card) {
      throwAppError(CreatorCardMessages.CARD_NOT_FOUND, ERROR_CODE.NF01);
    }

    if (card.status === 'draft') {
      throwAppError(CreatorCardMessages.DRAFT_CARD_ACCESS_BLOCKED, ERROR_CODE.NF02);
    }

    if (card.access_type === 'private') {
      if (!accessCode) {
        throwAppError(CreatorCardMessages.PRIVATE_CARD_MISSING_ACCESS_CODE, ERROR_CODE.AC03);
      }
      if (card.access_code !== accessCode) {
        throwAppError(CreatorCardMessages.INVALID_ACCESS_CODE, ERROR_CODE.AC04);
      }
    }

    response = formatCardResponse(card);
  } catch (error) {
    appLogger.errorX(error, 'get-creator-card-error');
    throw error;
  }

  return response;
}

module.exports = getCreatorCard;
