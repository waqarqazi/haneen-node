const winston = require('winston');
require('winston-mongodb');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json(),
  ),
  tryReconnect: true,
  transports: [
    new winston.transports.File({
      filename: 'logfile.log',
      format: winston.format.json({ space: 2 }),
    }),
    new winston.transports.MongoDB({
      options: { useUnifiedTopology: true },
      db: process.env.MONGO_ATLAS_URL,
      level: 'error',
      collection: 'log-errors',
    }),
    new winston.transports.Console({
      format: winston.format.combine(winston.format.prettyPrint()),
      handleExceptions: true,
    }),
  ],
});

logger.exceptions.handle(
  new winston.transports.File({
    filename: 'uncaughtExceptions.log',
    format: winston.format.json(),
  }),
),
  process.on('unhandledRejection', ex => {
    throw ex;
  });

module.exports.logger = logger;
