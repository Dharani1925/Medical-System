/**
 * Wraps an async controller function so any thrown error or
 * rejected promise is automatically passed to next(err),
 * where our central errorHandler middleware deals with it.
 *
 * Usage:
 *   router.get("/", asyncHandler(async (req, res) => { ... }));
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
