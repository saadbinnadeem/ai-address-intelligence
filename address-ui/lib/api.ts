import type { BulkResponse, ParseResponse } from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export const parseAddress = async (address: string): Promise<ParseResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/address/parse`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ address })
  });

  if (!response.ok) {
    throw new Error((await response.json()).message ?? "Failed to parse address");
  }

  return response.json();
};

export const parseBulkAddressFile = (file: File, onProgress: (progress: number) => void): Promise<BulkResponse> =>
  new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append("file", file);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${API_BASE_URL}/api/address/bulk`);

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable) {
        return;
      }
      onProgress(Math.round((event.loaded / event.total) * 100));
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(JSON.parse(xhr.responseText));
      } else {
        const payload = JSON.parse(xhr.responseText || "{}");
        reject(new Error(payload.message ?? "Bulk processing failed"));
      }
    };

    xhr.onerror = () => reject(new Error("Network error during upload"));
    xhr.send(formData);
  });
