// frontend/src/api/knowledge.js
import apiClient from "./client";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "https://ic-easy-backend.onrender.com";

// Citation network around a DOI
export const getCitationGraph = async (doi, maxNodes = 60) => {
  const res = await apiClient.get(
    `/api/knowledge/citation-graph/${encodeURIComponent(
      doi
    )}?max_nodes=${maxNodes}`
  );
  return res.data;
};

// Co-author network for an OpenAlex author id, e.g., A1969205039
export const getAuthorNetwork = async (authorId, limit = 50) => {
  const res = await apiClient.get(
    `${API_BASE_URL}/api/knowledge/author-network/${authorId}?limit=${limit}`
  );
  return res.data;
};

// Topic evolution by year
export const getTopicEvolution = async (keyword, years = 10) => {
  const res = await apiClient.get(
    `${API_BASE_URL}/api/knowledge/topic-evolution?keyword=${encodeURIComponent(
      keyword
    )}&years=${years}`
  );
  return res.data;
};
