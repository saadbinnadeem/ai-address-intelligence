import { z } from "zod";

export const parseAddressSchema = z.object({
  address: z.string().trim().min(3)
});

export const structuredAddressSchema = z.object({
  house_number: z.string().nullable(),
  plot_number: z.string().nullable(),
  street: z.string().nullable(),
  block: z.string().nullable(),
  phase: z.string().nullable(),
  area: z.string().nullable(),
  city: z.string().nullable(),
  state: z.string().nullable(),
  country: z.string().nullable(),
  landmark: z.string().nullable(),
  normalized_address: z.string()
});
