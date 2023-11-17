require("dotenv").config();
const passport = require("passport");
const cookieSession = require("cookie-session");
const GoogleStartegy = require("passport-google-oauth20");


passport.use(
    new GoogleStartegy(
      {
        clientID: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        callBackURL:"/user/google/callback",
        scope:[ "profile", "email" ]
      },
      function ( accessToken, refereshToken, profile, callback ) {
        callback(profile);
      } 
    )
  );
  
  passport.serializeUser(( user, done) => {
    done(null, user);
  });
  
  passport.deserializeUser(( user, done) => {
    done(null, user);
  });