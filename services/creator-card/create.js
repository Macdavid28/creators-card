const validator = require('@app-core/validator');
const { throwAppError, ERROR_CODE } = require('@app-core/errors');
const { appLogger } = require('@app-core/logger');
const { randomBytes } = require('@app-core/randomness');
const { CreatorCardMessages } = require('@app/messages');
const creatorCardRepository = require('@app/repository/creator-card');

const createSpec = `root {
  title string<trim|minLength:1>
  slug? string<trim>
  description? string<trim>
  access_type string(public|private)
  access_code? string<trim>
  status? string(draft|published)
  links[]? {
    title string<trim|minLength:1>
    url string<trim|minLength:1>
  }
  pricing[]? {
    title string<trim|minLength:1>
    price number<min:0>
  }
  creator_reference string<trim|minLength:1>
}`;

const parsedSpec = validator.parse(createSpec);

function formatCardResponse(card) {
  if (!card) return null;
  const formatted = card.toObject ? card.toObject() : { ...card };
  if (formatted._id) {
    formatted.id = formatted._id;
    delete formatted._id;
  }
  delete formatted.__v;
  return formatted;
}

function slugifyTitle(title) {
  const lower = title.toLowerCase();
  let result = '';
  let prevWasHyphen = false;

  for (let i = 0; i < lower.length; i++) {
    const char = lower[i];
    const code = lower.charCodeAt(i);
    const isAlpha = code >= 97 && code <= 122;
    const isDigit = code >= 48 && code <= 57;
    const isHyphen = char === '-';

    if (isAlpha || isDigit) {
      result += char;
      prevWasHyphen = false;
    } else if (isHyphen || char === ' ' || char === '\t') {
      if (!prevWasHyphen && result.length > 0) {
        result += '-';
        prevWasHyphen = true;
      }
    }
  }

  if (result.length > 0 && result[result.length - 1] === '-') {
    result = result.slice(0, result.length - 1);
  }

  return result;
}

async function resolveUniqueSlug(baseSlug, attempt) {
  const candidate = attempt === 0 ? baseSlug : `${baseSlug}-${randomBytes(6)}`;
  const conflict = await creatorCardRepository.findOne({ query: { slug: candidate } });
  if (!conflict) return candidate;
  if (attempt >= 10) return candidate;
  return resolveUniqueSlug(baseSlug, attempt + 1);
}

async function createCreatorCard(serviceData, options = {}) {
  let response;

  const validatedData = validator.validate(serviceData, parsedSpec);

  try {
    if (validatedData.access_type === 'private') {
      if (!validatedData.access_code) {
        throwAppError(CreatorCardMessages.MISSING_ACCESS_CODE, ERROR_CODE.AC01);
      }
    } else if (validatedData.access_type === 'public') {
      if (validatedData.access_code) {
        throwAppError(CreatorCardMessages.ACCESS_CODE_ON_PUBLIC_CARD, ERROR_CODE.AC05);
      }
    }

    let finalSlug;
    if (!validatedData.slug) {
      let baseSlug = slugifyTitle(validatedData.title);

      if (!baseSlug || baseSlug.length < 3) {
        baseSlug = 'card';
      }

      finalSlug = await resolveUniqueSlug(baseSlug, 0);
    } else {
      finalSlug = validatedData.slug;
      const exists = await creatorCardRepository.findOne({ query: { slug: finalSlug } });
      if (exists) {
        throwAppError(CreatorCardMessages.DUPLICATE_SLUG, ERROR_CODE.SL02);
      }
    }

    const cardToCreate = {
      ...validatedData,
      slug: finalSlug,
      status: validatedData.status || 'draft',
    };

    const createdCard = await creatorCardRepository.create(cardToCreate);
    response = formatCardResponse(createdCard);
  } catch (error) {
    appLogger.errorX(error, 'create-creator-card-error');
    throw error;
  }

  return response;
}

module.exports = createCreatorCard;
