const { logEvents } = require("./logger");

// overwrite default express error handler (err as first parameter)
const errorHandler = (err, req, res, next) => {
  // write error logs to file
  logEvents(
    `${err.name}: ${err.message}\t${req.method}\t${req.url}\t${req.headers.origin}`,
    "errLog.log"
  );
  console.log("Error stack ===>", err.stack);

  if (err.code === 11000) {
    if (Object.keys(err.keyValue)[0] === "username")
      return res.json({ message: "Duplicate username" });
    if (Object.keys(err.keyValue)[0] === "title")
      return res.json({ message: "Duplicate note title" });
  }

  const status = res.statusCode ? res.statusCode : 500; // Server Error

  res.status(status);

  res.json({ message: err.message, isErrorL true });
};

module.exports = errorHandler;
