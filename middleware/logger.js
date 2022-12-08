const { format } = require("date-fns");
const { v4: uuid } = require("uuid");
const fs = require("fs");
const fsPromises = require("fs").promises;
const path = require("path");

const logEvents = async (message, logFileName) => {
  const dateTime = format(new Date(), "yyyyMMdd\tHH:mm:ss");
  const logItem = `${dateTime}\t${uuid()}\t${message}\n`;

  try {
    // check if logs directory doesn't exist
    if (!fs.existsSync(path.join(__dirname, "..", "logs"))) {
      // create logs directory
      await fsPromises.mkdir(path.join(__dirname, "..", "logs"));
    }
    // append to logs file (create file if it doesn't exist)
    await fsPromises.appendFile(
      path.join(__dirname, "..", "logs", logFileName),
      logItem
    );
  } catch (error) {
    console.log(error);
  }
};

// logger middleware
const logger = (req, res, next) => {
  logEvents(`${req.method}\t${req.url}\t${req.headers.origin}`, "reqLog.log");
  console.log(`${req.method} ${req.path}`);
  next();
};

module.exports = { logEvents, logger };
