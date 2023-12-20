import {
  type IncomingMessage,
  type ServerResponse,
  createServer,
} from "node:http";
import { Logger } from "./Logger.js";

/**
 * Global logger instance.
 */
const logger = new Logger();
logger.metadata({ app: "example-logger" });

logger.log("app started");

const httpServer = createServer((req, res) => {
  logger.region(() =>
    processRequest(req, res).catch((error) => {
      using guard = logger.metadata({ error });
      logger.log("error processing request");
    }),
  );
});
httpServer.listen(8080, () => {});

async function processRequest(req: IncomingMessage, res: ServerResponse) {
  using guard = logger.metadata({
    url: req.url,
    ipAddress: req.socket.remoteAddress,
  });
  logger.log("processing request");
  const userId = getUserId();
  using guard2 = logger.metadata({ userId });
  await new Promise((resolve) => setTimeout(resolve, 200));
  logger.log("request processed");
  res.end("Hello World!");
}

/**
 * Function to get userId.
 */
function getUserId(): string {
  return String(Math.floor(Math.random() * 1000));
}
