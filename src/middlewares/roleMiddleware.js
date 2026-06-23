export const roleMiddleware = (...ROLES) => {
  return (req, res, next) => {
    if (!ROLES.includes(req.user.role)) {
      return res
        .status(STATUS_CODES.FORBIDDEN)
        .json("You do not have to permission to perform this acction");
    }
    next();
  };
};
