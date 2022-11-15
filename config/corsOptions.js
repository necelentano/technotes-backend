const allowedOrigins = require("./allowedOrigin");

const corsOptions = {
  origin: (origin, callback) => {
    // if origin is not in allowedOrigins array or there no origin (Postman request for example)
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true, // handle header
  optionsSuccessStatus: 200,
};

module.exports = corsOptions;
