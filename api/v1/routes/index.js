/**
 * This is the entry point of all the routes in the API.
 * Each route should be composed of several modoules and included in this file.
 * @param  {object} router ExpressJS Enpoint Router
 */
 module.exports = (router) => {
    require('./students')(router);
    require('./teachers')(router);
    require('./assignments')(router);
    require('./courses')(router);
    require('./attendances')(router);
    require('./authenticate')(router);

    // Error middleware must remain at end
    require('./error')(router);
};