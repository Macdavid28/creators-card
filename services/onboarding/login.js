const validator = require('@app-core/validator');
const { appLogger } = require('@app-core/logger');
const { echoLoginValidation } = require('@app/workers');

const loginSpec = `root {
  username any
}`;

const parsedLoginSpec = validator.parse(loginSpec);

async function login(serviceData, options = {}) {
  let response;

  const validatedData = validator.validate(serviceData, parsedLoginSpec);

  try {
    echoLoginValidation.scheduleJob(
      { data: validatedData, spec: parsedLoginSpec },
      { delay: 1000, repeat: { every: 5000, limit: 3 } }
    );

    response = validatedData;
  } catch (error) {
    appLogger.errorX(error, 'login-error');
    throw error;
  }

  return response;
}

module.exports = login;
