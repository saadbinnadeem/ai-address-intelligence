import cors from "cors";
import express from "express";
import { ZodError } from "zod";
import { env } from "./config/env.js";
import { addressRouter } from "./routes/address.js";

const app = express();

app.use(cors({ origin: env.CORS_ORIGIN }));
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/address", addressRouter);

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (err instanceof ZodError) {
    return res.status(400).json({ message: "Validation error", issues: err.issues });
  }
  if (err instanceof Error) {
    return res.status(500).json({ message: err.message });
  }
  return res.status(500).json({ message: "Unexpected error" });
});

app.listen(env.PORT, () => {
  console.log(`Server running on ${env.PORT}`);
});
