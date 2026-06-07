import "dotenv/config";
import express from "express";
import configViewEngine from "./config/viewEngine.js";
import initWebRoutes from "./routes/web.js";
import connection from "./config/connect.js";
import cors from "cors";
import initApiRoutes from "./routes/api.js";
import cookieParser from "cookie-parser";
const app = express(); // req.body undifile
app.use(express.urlencoded({ extended: true })); // form submit (x-www-form-urlencoded)
app.use(express.json());
// cookie
app.use(cookieParser());

// CORS
// Local dev + explicit allowlist via env:
// - CORS_ORIGINS="https://app.vercel.app,https://mydomain.com"
// Optional:
// - ALLOW_VERCEL_WILDCARD="true" to allow https://*.vercel.app (preview deploys)
const parseOrigins = (value) =>
  String(value || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

const staticAllowedOrigins = new Set([
  "http://localhost:3000",
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5176",
  "http://localhost:3001",
  "https://fullstack-frontend-77iy.vercel.app",
  "https://fullstack-frontend-lyart.vercel.app",
  ...parseOrigins(process.env.CORS_ORIGINS),
]);
const allowVercelWildcard =
  String(process.env.ALLOW_VERCEL_WILDCARD || "").toLowerCase() === "true";
const vercelAppRegex = /^https:\/\/[a-z0-9-]+\.vercel\.app$/i;
const localDevRegex =
  /^http:\/\/(?:localhost|127\.0\.0\.1):(?:3000|3001|5173|5174|5175|5176|5177|5178|5179)$/;

const corsOptions = {
  origin(origin, callback) {
    // Allow non-browser clients / same-origin server calls
    if (!origin) return callback(null, true);

    if (staticAllowedOrigins.has(origin)) return callback(null, true);
    if (localDevRegex.test(origin)) return callback(null, true);
    if (allowVercelWildcard && vercelAppRegex.test(origin))
      return callback(null, true);

    return callback(new Error(`CORS blocked origin: ${origin}`));
  },
  credentials: true,
};

app.use(cors(corsOptions));
// app.options("*", cors(corsOptions));
app.options(/.*/, cors(corsOptions));
// init wed routes
configViewEngine(app);
initWebRoutes(app);
initApiRoutes(app);

// 404 handler (keep after routes)
app.use((req, res) => {
  return res.status(404).send("not found 404");
});

const startServer = async () => {
  try {
    await connection();

    const PORT = Number(process.env.PORT) || 8080;
    const HOST = process.env.HOST || "::";
    const server = app.listen(
      { port: PORT, host: HOST, ipv6Only: false },
      () => {
        console.log(`backend listening on http://localhost:${PORT}`);
      },
    );

    server.on("error", (err) => {
      console.error("Failed to start server:", err);
      process.exitCode = 1;
    });
  } catch {
    process.exitCode = 1;
  }
};

startServer();
