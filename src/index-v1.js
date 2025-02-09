require("express-async-errors");
const app = require("express")();
require("./v1/middlewares/pre-route.middleware")(app);
app.use(require("./v1/routes"));
require("./v1/middlewares/error.middleware")(app);
const PORT = process.env.PORT || 5001;
const passport = require("passport");
const passportSetup = require("./Passport");
const cookieSession = require("cookie-session");
const rateLimit = require('express-rate-limit');
const useragent = require('express-useragent');
const { logConsole } = require("./v2/utils/logConsole");
app.use(useragent.express());

const apiLimiter = rateLimit({
  windowMs: 199 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
});

app.use(
  cookieSession({
    name: "session",
    keys:["cyberwolve"],
    maxAge: 24 * 60 * 60 * 100
  })
)


app.use("/", apiLimiter);
app.use(passport.initialize());
app.use(passport.session()); 

app.listen(PORT, async () => {
  require("./v1/database/mongo");
  logConsole(`:::> Server listening on port ${PORT} http://localhost:${PORT}`);
});

app.on("error", (error) => {
  console.error(`<::: An error occurred on the server: \n ${error}`);
});

module.exports = app;
