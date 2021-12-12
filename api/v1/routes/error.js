module.exports = (router) => {
    router.use((err, req, res, next) => {
        res.status(err.status);
        let response = {
            code: err.status,
            message: err.message
        };
        if (err.data) {
            response.data = err.data;
        }
        res.json(response);
        return;
    });
};