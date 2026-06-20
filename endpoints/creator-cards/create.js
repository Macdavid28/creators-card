const { createHandler } = require('@app-core/server');
const createService = require('@app/services/creator-card/create');

module.exports = createHandler({
  path: '/creator-cards',
  method: 'post',
  middlewares: [],
  async handler(rc, helpers) {
    const payload = rc.body;
    const response = await createService(payload);
    return {
      status: helpers.http_statuses.HTTP_200_OK,
      data: response,
    };
  },
});
