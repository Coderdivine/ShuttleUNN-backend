require("express-async-errors");
const app = require("express")();
require("./middlewares/pre-route.middleware")(app);
app.use(require("./routes"));
require("./middlewares/error.middleware")(app);
const PORT = process.env.PORT || 4109;

app.listen(PORT, async () => {
  require("./database/mongo");
  console.log(`:::> Server listening on port ${PORT} http://localhost:${PORT}`);
});

// On server error
app.on("error", (error) => {
  console.error(`<::: An error occurred on the server: \n ${error}`);
});

module.exports = app;
