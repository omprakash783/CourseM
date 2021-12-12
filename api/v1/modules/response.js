/**
 * The module sends a JSON respone to the client.
 */
 module.exports = (req, res, next) => {
    res.json(res.locals);
};