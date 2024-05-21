import passport from "passport";
import passportJWT from "passport-jwt";
import User from "../models/User.js"; // Імпорт моделі
import "dotenv/config"; // імпорт модулю dotenv




const secret = process.env.JWT_SECRET; //import SECRET from .env
const ExtractJWT = passportJWT.ExtractJwt; //import ExtractJWT from "passport-jwt"
const Strategy = passportJWT.Strategy; //import Strategy from "passport-jwt"



// Опції налаштування стратегії passport-jwt
const options = {
  secretOrKey: secret,
  // Витяг токену з заголовка Authorization
  jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
};

// JWT Strategy, дає читати JWT-токен із заголовка HTTP Authorization для кожного вхідного запиту
passport.use(
  new Strategy(options, async (payload, done) => {
    try {
      const user = await User.findById(payload.id);
      if (!user) {
        return done(null, false);
      }
      return done(null, user);
    } catch (error) {
      return done(error, false);
    }
  })
);
export default passport;