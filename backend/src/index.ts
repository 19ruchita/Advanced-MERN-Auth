import "dotenv/config";
import cors, { CorsOptions } from "cors";
import express, { NextFunction, Request, Response } from "express";
import cookieParser from "cookie-parser";
import { config } from "./config/app.config";
import connectDatabase from "./database/database";
import { errorHandler } from "./middlewares/errorHandler";
import { HTTPSTATUS } from "./config/http.config";
import { asyncHandler } from "./middlewares/asyncHandler";
import authRoutes from "./modules/auth/auth.routes";
import passport from "./middlewares/passport";
import sessionRoutes from "./modules/session/session.routes";
import { authenticateJWT } from "./common/strategies/jwt.strategy";
import mfaRoutes from "./modules/mfa/mfa.routes";

const app = express();
const BASE_PATH = config.BASE_PATH;

// Ensure APP_ORIGIN is always an array
let allowedOrigins: string[] = Array.isArray(config.APP_ORIGIN) ? config.APP_ORIGIN : [config.APP_ORIGIN];

console.log("Allowed Origins:", allowedOrigins);

const corsOptions: CorsOptions = {
  origin: (origin: string | undefined, callback: (error: Error | null, success: boolean) => void) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true); // Allow the origin if it's in the list
    } else {
      callback(new Error("Not allowed by CORS"), false); // Deny if the origin is not allowed
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Include all methods that you need to support
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'], // Ensure these headers are included
  credentials: true,  // Allows cookies to be sent with requests
  preflightContinue: false,  // Don't pass the request to the next handler, handled by CORS
  optionsSuccessStatus: 200,  // Handle old browsers that may not accept 204 status for preflight
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Handle OPTIONS preflight requests
app.options('*', cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));  // Global OPTIONS handling

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(passport.initialize());

// Sample route for testing
app.get(
  "/",
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    res.status(HTTPSTATUS.OK).json({
      message: "Hello World!!!",
    });
  })
);

// Register routes
app.use(`${BASE_PATH}/auth`, authRoutes);
app.use(`${BASE_PATH}/mfa`, mfaRoutes);
app.use(`${BASE_PATH}/session`, authenticateJWT, sessionRoutes);

// Error handler middleware
app.use(errorHandler);

// Start the server and connect to the database
app.listen(config.PORT, async () => {
  console.log(`Server listening on port ${config.PORT} in ${config.NODE_ENV}`);
  await connectDatabase();
});
