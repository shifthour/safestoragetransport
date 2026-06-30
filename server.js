// Passenger (cPanel) entry point. Boots Next.js in production and hands every
// request to it. Passenger sets PORT; we fall back to 3000 for manual runs.
const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");

const app = next({ dev: false });
const handle = app.getRequestHandler();

app
  .prepare()
  .then(() => {
    createServer((req, res) => handle(req, res, parse(req.url, true))).listen(
      process.env.PORT || 3000
    );
  })
  .catch((err) => {
    console.error("[server] failed to start:", err);
    process.exit(1);
  });
