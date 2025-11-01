// frontend/src/services/image_service.js
import axios from "axios";

console.log(
  "[Unsplash] Service loaded. Key:",
  process.env.REACT_APP_UNSPLASH_ACCESS_KEY ? "found" : "missing"
);

const UNSPLASH_KEY = process.env.REACT_APP_UNSPLASH_ACCESS_KEY;

// Search Unsplash for topic images
export async function getTopicImages(topicName, limit = 5) {
  if (!UNSPLASH_KEY) {
    console.warn("Missing Unsplash Access Key, using local backup only.");
    return [];
  }

  try {
    const res = await axios.get("https://api.unsplash.com/search/photos", {
      params: { query: topicName, per_page: limit, orientation: "landscape" },
      headers: { Authorization: `Client-ID ${UNSPLASH_KEY}` },
    });
    return res.data.results.map((img) => img.urls.small);
  } catch (err) {
    console.error(
      `[Unsplash] Error fetching for topic: ${topicName}`,
      err.message
    );
    return [];
  }
}
