"use strict";

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */
const { sanitizeEntity } = require("strapi-utils");
module.exports = {
  async create(ctx) {
    const primaryExists = await strapi.services["seller-address"].findOne({
      users_permissions_user: ctx.request.body.users_permissions_user,
      primary: true,
    });

    if (!primaryExists) ctx.request.body.primary = true;
    const knex = strapi.connections.default;
    let entity;
    if (ctx.request.body.primary === true) {
      await knex("seller_addresses")
        .where(
          "users_permissions_user",
          ctx.request.body.users_permissions_user
        )
        .update({ primary: false });
    }
    entity = await strapi.services["seller-address"].create(ctx.request.body);

    return sanitizeEntity(entity, { model: strapi.models["seller-address"] });
  },

  async update(ctx) {
    const { id } = ctx.params;
    const knex = strapi.connections.default;
    let entity;
    let addr;
    if (ctx.request.body.primary && ctx.request.body.primary === true) {
      addr = await strapi.services["seller-address"].findOne({ id });
      await knex("seller_addresses")
        .where("users_permissions_user", addr.users_permissions_user.id)
        .update({ primary: false });
    }
    entity = await strapi.services["seller-address"].update(
      { id },
      ctx.request.body
    );

    return sanitizeEntity(entity, { model: strapi.models["seller-address"] });
  },

  async delete(ctx) {
    const { id } = ctx.params;
    const currAddr = await strapi.services["seller-address"].findOne({ id });

    if(currAddr.primary) return ctx.response.badRequest(['cannot delete primary address'], []);

    const entity = await strapi.services["seller-address"].delete({ id });
    return sanitizeEntity(entity, { model: strapi.models["seller-address"] });
  },
};
