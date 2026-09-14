const validateBody = (schema) => (req, res, next) => {
    try {
        req.body = schema.parse(req.body);
        next();
    } catch (err) {
        next(err);
    }
};

const validateParams = (schema) => (req, res, next) => {
    req.params = schema.parse(req.params);
    next();
};

export { validateBody, validateParams };
