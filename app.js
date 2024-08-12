let createError = require("http-errors");
let express = require("express");
let path = require("path");
let cookieParser = require("cookie-parser");
let logger = require("morgan");

let indexRouter = require("./routes/index");
let apiRouter = require("./routes/api");
let trackController = require("./controllers/trackController");
let trackAzulController = require("./controllers/trackAzulController");
let cron = require("node-cron");
let app = express();

app.listen(3000, () => {
  console.log("Server is running on port 3000");
  app.use(logger("dev"));
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(cookieParser());
  app.use(express.static(path.join(__dirname, "public")));

  app.use("/", indexRouter);
  app.use("/api", apiRouter);

  app.use(function (req, res, next) {
    next(createError(404));
  });

  app.use(function (err, req, res, next) {
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};

    res.status(err.status || 500);
  });
});

cron.schedule("*/10 * * * *", () => {
  // trackController.track({ body: { cron: true, cpf: "" } });
  // trackAzulController.track({ body: { cron: true, trackCode: "" } });
});
module.exports = app;
