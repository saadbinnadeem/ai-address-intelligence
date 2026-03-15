import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "../config/env.js";
import { structuredAddressSchema } from "../schemas/address.js";
import type { StructuredAddress } from "../types/address.js";

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const promptTemplate = `You are an address parsing engine specialized for Pakistan and India.

Users may write addresses in:
- English
- Roman Urdu
- Roman Hindi
- Informal spelling

Extract structured fields from the address.

Recognize abbreviations:

dha → DHA (Defence Housing Authority)
ph → Phase
blk → Block
st → Street
rd → Road
apt → Apartment
pl → Plot

Recognize landmarks such as:

near
opposite
beside
behind

Return JSON with these fields:

house_number
plot_number
street
block
phase
area
city
state
country
landmark
normalized_address

Return only valid JSON.`;

const defaultAddress: StructuredAddress = {
  house_number: null,
  plot_number: null,
  street: null,
  block: null,
  phase: null,
  area: null,
  city: null,
  state: null,
  country: null,
  landmark: null,
  normalized_address: ""
};

const extractJson = (text: string) => {
  const cleaned = text.trim().replace(/```json|```/g, "");
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start < 0 || end < 0 || end <= start) {
    throw new Error("Invalid Gemini JSON response");
  }
  return JSON.parse(cleaned.slice(start, end + 1));
};

export const parseAddressWithGemini = async (address: string): Promise<StructuredAddress> => {
  const result = await model.generateContent(`${promptTemplate}\n\nAddress: ${address}`);
  const text = result.response.text();
  const parsed = extractJson(text);
  return structuredAddressSchema.parse({ ...defaultAddress, ...parsed });
};
