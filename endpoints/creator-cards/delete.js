const { createHandler } = require('@app-core/server');
const deleteService = require('@app/services/creator-card/delete');

module.exports = createHandler({
  path: '/creator-cards/:slug',
  method: 'delete',
  middlewares: [],
  async handler(rc, helpers) {
    const { slug } = rc.params;
    const creatorReference =
      rc.query.creator_reference || rc.body.creator_reference || rc.headers['creator-reference'];
    const response = await deleteService({ slug, creator_reference: creatorReference });
    return {
      status: helpers.http_statuses.HTTP_200_OK,
      data: response,
    };
  },
});
