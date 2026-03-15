import { Router } from "express";
import multer from "multer";
import { parseAddressSchema } from "../schemas/address.js";
import { parseAddressWithGemini } from "../services/gemini.js";
import { extractAddressesFromCsv, extractAddressesFromPdf } from "../services/fileParser.js";
import type { BulkResult } from "../types/address.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }
});

export const addressRouter = Router();

addressRouter.post("/parse", async (req, res, next) => {
  try {
    const { address } = parseAddressSchema.parse(req.body);
    const structured = await parseAddressWithGemini(address);
    res.json({ original: address, structured });
  } catch (error) {
    next(error);
  }
});

addressRouter.post("/bulk", upload.single("file"), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "File is required" });
    }

    const mime = req.file.mimetype;
    const addresses = mime.includes("csv")
      ? extractAddressesFromCsv(req.file.buffer)
      : mime.includes("pdf")
        ? await extractAddressesFromPdf(req.file.buffer)
        : [];

    if (!addresses.length) {
      return res.status(400).json({ message: "Unsupported or empty file" });
    }

    const results: BulkResult[] = [];
    for (const address of addresses) {
      const structured = await parseAddressWithGemini(address);
      results.push({ original: address, structured });
    }

    return res.json(results);
  } catch (error) {
    next(error);
  }
});
