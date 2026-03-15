import { parse } from "csv-parse/sync";
import pdf from "pdf-parse";

const dedupeAndClean = (lines: string[]) =>
  Array.from(new Set(lines.map((line) => line.trim()).filter((line) => line.length > 2)));

export const extractAddressesFromCsv = (buffer: Buffer): string[] => {
  const content = buffer.toString("utf-8");
  const rows = parse(content, { columns: false, skip_empty_lines: true, relax_column_count: true }) as string[][];
  const candidates = rows.flatMap((row) => row).map((value) => String(value));
  return dedupeAndClean(candidates);
};

export const extractAddressesFromPdf = async (buffer: Buffer): Promise<string[]> => {
  const parsed = await pdf(buffer);
  return dedupeAndClean(parsed.text.split(/\r?\n/));
};
