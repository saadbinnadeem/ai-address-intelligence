export type StructuredAddress = {
  house_number: string | null;
  plot_number: string | null;
  street: string | null;
  block: string | null;
  phase: string | null;
  area: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  landmark: string | null;
  normalized_address: string;
};

export type BulkResult = {
  original: string;
  structured: StructuredAddress;
};
