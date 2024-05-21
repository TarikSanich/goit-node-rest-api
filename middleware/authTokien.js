import jwt from "jsonwebtoken";

export const authToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (typeof authHeader === "undefined") {
    return res.status(401).send({ message: "Invalid token" });
  }
  const [bearer, token] = authHeader.split(" ", 2);
  if (bearer !== "Bearer") {
    return res.status(401).send({ message: "Invalid token" });
  }
  jwt.verify(token, process.env.SECRET, (err, decode) => {
    if (err) {
      return res.status(401).send({ message: "Invalid token" });
    }
    req.user = {
      id: decode.id, // або user._id
      email: decode.email, // або user.email
    };
    next();
  });
};

export default authToken;