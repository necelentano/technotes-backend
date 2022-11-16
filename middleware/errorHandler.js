const { logEvents } = require("./logger");

// overwrite default express error handler (err as first parameter)
const errorHandler = (err, req, res, next) => {
  // write error logs to file
  logEvents(
    `${err.name}: ${err.message}\t${req.method}\t${req.url}\t${req.headers.origin}`,
    "errLog.log"
  );
  console.log(err.stack);

  if (err.code === 11000) return res.json({ message: "Duplicate username" });

  const status = res.statusCode ? res.statusCode : 500; // Server Error

  res.status(status);

  res.json({ message: err.message });
};

module.exports = errorHandler;
