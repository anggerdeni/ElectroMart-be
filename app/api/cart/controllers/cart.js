'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */
const { parseMultipartData, sanitizeEntity } = require('strapi-utils');

module.exports = {
    /**
     * Create a record.
     *
     * @return {Object}
     */
  
    async create(ctx) {
      // check if user-product not exist -> create
      // if exists add quantity
      // validate if product stock available first

      let entity;
      let product;
      product = await strapi.services.product.findOne({ id: ctx.request.body.product });
      const cartExists = await strapi.services.cart.findOne({ product: ctx.request.body.product, users_permissions_user: ctx.request.body.users_permissions_user });
      if(!cartExists) {
          if(product.stock >= ctx.request.body.quantity) {
            entity = await strapi.services.cart.create(ctx.request.body);
            await strapi.services.product.update({ id: product.id }, {stock: product.stock - ctx.request.body.quantity});
          } else {
            return ctx.response.badRequest(['stock unavailable'], [])
          }
      } else {
          if(product.stock >= ctx.request.body.quantity) {
            entity = await strapi.services.cart.update({ id: cartExists.id }, {quantity: cartExists.quantity + ctx.request.body.quantity});
            await strapi.services.product.update({ id: product.id }, {stock: product.stock - ctx.request.body.quantity});
          } else {
            return ctx.response.badRequest(['stock unavailable'], [])
          }
      }

      return sanitizeEntity(entity, { model: strapi.models.cart });
    },

    async update(ctx) {
      let entity;
      let product;
      product = await strapi.services.product.findOne({ id: ctx.request.body.product });
      const cartExists = await strapi.services.cart.findOne({ product: ctx.request.body.product, users_permissions_user: ctx.request.body.users_permissions_user });
      if(!cartExists) {
          if(product.stock >= ctx.request.body.quantity) {
            entity = await strapi.services.cart.create(ctx.request.body);
            await strapi.services.product.update({ id: product.id }, {stock: product.stock - ctx.request.body.quantity});
          } else {
            return ctx.response.badRequest(['stock unavailable'], [])
          }
      } else {
          if(product.stock + cartExists.quantity >= ctx.request.body.quantity) {
            entity = await strapi.services.cart.update({ id: cartExists.id }, {quantity: ctx.request.body.quantity});
            if(entity.quantity == 0 ) await strapi.services.cart.delete({ id: entity.id });
            await strapi.services.product.update({ id: product.id }, {stock: product.stock + cartExists.quantity - ctx.request.body.quantity});
          } else {
            return ctx.response.badRequest(['stock unavailable'], [])
          }
      }

      return sanitizeEntity(entity, { model: strapi.models.cart });
    },
};