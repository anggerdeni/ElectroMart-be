'use strict';

const deg2rad = deg => {
    return deg * (Math.PI / 180)
}

const calcuateDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) => new Promise((resolve, reject) => {
        const R = 6371; // Radius of the earth in km
        const dLat = deg2rad(lat2 - lat1); // deg2rad below
        const dLon = deg2rad(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const d = R * c; // Distance in km
        resolve(d);
    })


module.exports = {
    cost: async ctx => {
        const {id: courier_id} = ctx.params;

        // Get courier 
        const {cost, cost_per_km, cost_per_kg} = await strapi.services.courier.findOne({id: courier_id});

        // Get Address by user
        const {id: user_id} = ctx.state.user;
        const {latitude: cust_lat, longitude: cust_lon} = await strapi.services["customer-address"].findOne({users_permissions_user: user_id, primary: true});

        // Get cart by user
        const carts = await strapi.services.cart.find({users_permissions_user: user_id});

        // Get Address by seller
        const seller = carts
                        .map(cart => cart.product.users_permissions_user)
                        .filter((value, index, self) => self.indexOf(value) === index);

        // Calculate Total Distance 
        let total_length = 0;
        for(const seller_id of seller) {
            const {latitude: seller_lat, longitude: seller_lon} = await strapi.services["seller-address"].findOne({users_permissions_user: seller_id, primary: true});
                        
            total_length += await calcuateDistanceFromLatLonInKm(cust_lat, cust_lon, seller_lat, seller_lon);
        }
        
        // Calculate cost
        let total_weight = 0
        carts.forEach(cart => {
            total_weight += cart.product.weightInGrams
        });

        return ctx.send({
            cost: total_weight / 1000 * cost_per_kg + cost + cost_per_km * total_length
        })
    }
};
