import jwt from "jsonwebtoken";

const checkToken = (req, res, next) => {
  let token = req.cookies?.token || req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json("No token");
  }
  try {
    const decoded = jwt.verify(token, process.env.jwtKey);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json("Invalid token");
  }
};

const checkPermission = (req, res, next) => {
  const user = req.user;
  const currentUrl = req.baseUrl + req.path;
  if (user?.isAdmin) return next();
  const roles = user?.roles || [];
  const hasPermission = roles.some((r) => currentUrl.startsWith("/" + r.url));
  if (!hasPermission) {
    return res.status(403).json("No permission");
  }
  next();
};

export { checkToken, checkPermission };
