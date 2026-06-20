const { createHandler } = require('@app-core/server');
const getService = require('@app/services/creator-card/get');

module.exports = createHandler({
  path: '/creator-cards/:slug',
  method: 'get',
  middlewares: [],
  async handler(rc, helpers) {
    const { slug } = rc.params;
    const accessCode =
      rc.query.access_code || rc.headers['access-code'] || rc.headers['x-access-code'];
    const response = await getService({ slug, access_code: accessCode });
    return {
      status: helpers.http_statuses.HTTP_200_OK,
      data: response,
    };
  },
});
