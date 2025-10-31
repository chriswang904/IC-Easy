import apiClient from "./client";

// Format a single reference using backend API
export const formatReference = async (data) => {
  const response = await apiClient.post("/api/literature/format-reference", data);
  return response.data;
};

// Export references to BibTeX format
export const exportBibtex = async (refs = []) => {
  const response = await apiClient.post("/api/literature/export-bibtex", refs, {
    responseType: "blob",
  });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const a = document.createElement("a");
  a.href = url;
  a.download = "references.bib";
  a.click();
};

// Export references to RIS format
export const exportRis = async (refs = []) => {
  const response = await apiClient.post("/api/literature/export-ris", refs, {
    responseType: "blob",
  });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const a = document.createElement("a");
  a.href = url;
  a.download = "references.ris";
  a.click();
};
