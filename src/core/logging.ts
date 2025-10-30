import winston from "winston";
import { format } from "winston";

const { combine, timestamp, colorize, printf } = format;

// Logger instance
let logger: winston.Logger | undefined;

// Type definitions
interface LogInfo {
  level: string;
  message: string;
  timestamp?: string;
  error?: Error;
  [key: string]: any;
}

interface LoggerOptions {
  level: string;
  disabled?: boolean;
  defaultMeta?: Record<string, any>;
  extraTransports?: winston.transport[];
}

/**
 * Create custom log format
 */
const loggerFormat = () => {
  const formatMessage = (info: any): string => {
    const { level, message, timestamp, ...rest } = info;
    return `${timestamp} | ${level} | ${message} | ${JSON.stringify(rest)}`;
  };

  // Errors don't have a decent toString, so we need to format them manually
  const formatError = (info: any): string => {
    const { error, ...rest } = info;
    const stack = error?.stack || "No stack trace available";
    return `${formatMessage(rest)}\n\n${stack}\n`;
  };

  const format = (info: any): string =>
    info.error instanceof Error ? formatError(info) : formatMessage(info);

  return combine(colorize(), timestamp(), printf(format));
};

/**
 * Get the root logger.
 * @throws {Error} If logger has not been initialized
 * @returns {winston.Logger} The winston logger instance
 */
export const getLogger = (): winston.Logger => {
  if (!logger) {
    throw new Error("You must first initialize the logger");
  }
  return logger;
};

/**
 * Initialize the root logger.
 * @param {LoggerOptions} options - The log options
 * @param {string} options.level - The log level (e.g., 'info', 'debug', 'error')
 * @param {boolean} [options.disabled=false] - Disable all logging
 * @param {object} [options.defaultMeta={}] - Default metadata to show
 * @param {winston.transport[]} [options.extraTransports=[]] - Extra transports to add besides console
 */
export const initializeLogger = ({
  level,
  disabled = false,
  defaultMeta = {},
  extraTransports = [],
}: LoggerOptions): void => {
  logger = winston.createLogger({
    level,
    defaultMeta,
    format: loggerFormat(),
    transports: [
      new winston.transports.Console({
        silent: disabled,
      }),
      ...extraTransports,
    ],
  });

  logger.info(`🚀 Logger initialized with minimum log level ${level}`);
};
