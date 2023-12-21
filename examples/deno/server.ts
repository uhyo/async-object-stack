import {
  type AsyncObjectStack,
  type StackGuard,
  createAsyncObjectStack,
} from "npm:async-object-stack";

class Logger {
  #stack: AsyncObjectStack;

  constructor() {
    this.#stack = createAsyncObjectStack();
  }

  /**
   * Runs the given function in a separate region.
   */
  region<R>(fn: () => R): R {
    return this.#stack.region(fn);
  }

  /**
   * Add metadata to the current execution.
   */
  metadata(metadata: object): StackGuard {
    return this.#stack.push(metadata);
  }

  /**
   * Emit a log message.
   */
  log(message: string): void {
    const metadata = this.#stack.render();
    console.log(JSON.stringify({ message, ...metadata }));
  }
}

const logger = new Logger();
logger.metadata({ app: "example-logger" });

logger.log("app started");
Deno.serve({ port: 8080 }, (request, serveInfo) => {
  return logger.region(() => processRequest(request, serveInfo));
});

async function processRequest(
  req: Request,
  serveInfo: Deno.ServeHandlerInfo,
): Promise<Response> {
  using guard = logger.metadata({
    url: req.url,
    ipAddress: serveInfo.remoteAddr.hostname,
  });
  logger.log("processing request");
  const userId = getUserId();
  using guard2 = logger.metadata({ userId });
  await new Promise((resolve) => setTimeout(resolve, 200));
  logger.log("request processed");
  return new Response("Hello World!");
}

/**
 * Function to get userId.
 */
function getUserId(): string {
  return String(Math.floor(Math.random() * 1000));
}
