// src/utils/paperTransformer.js

/**
 * Transform API paper data to UI format
 */
export function transformPaper(paper, index, topicImages) {
  // Extract year from published_date
  let year = "N/A";
  if (paper.published_date) {
    const match = paper.published_date.match(/^(\d{4})/);
    year = match ? match[1] : "N/A";
  }

  // Get author names
  const authorNames = paper.authors
    ? paper.authors.map((a) => a.name || a).filter(Boolean)
    : [];

  // Format citation text
  let citationText = "";
  if (paper.source === "arxiv") {
    citationText = "Preprint (no citation data)";
  } else if (paper.citation_count !== null && paper.citation_count !== undefined) {
    citationText = `${paper.citation_count} citations`;
  } else {
    citationText = "Citation data unavailable";
  }

  return {
    id: paper.doi || paper.url || `paper-${index}`,
    image: topicImages[index % topicImages.length],
    title: paper.title || "Untitled",
    category: paper.journal || paper.source || "Research Paper",
    metadata: `${citationText} • ${year}`,
    description: paper.abstract || "No abstract available.",
    color: `bg-${["blue", "green", "purple", "pink", "yellow"][index % 5]}-50`,
    authors: authorNames,
    doi: paper.doi,
    url: paper.url,
    source: paper.source,
    citationCount: paper.citation_count,
  };
}

/**
 * Determine topic category from search keyword
 */
export function detectTopicFromKeyword(keyword) {
  const kw = keyword.toLowerCase();
  
  if (kw.includes("bio")) return "biology";
  if (kw.includes("med") || kw.includes("health")) return "medicine";
  if (kw.includes("eco")) return "economics";
  if (kw.includes("phys")) return "physics";
  if (kw.includes("env") || kw.includes("climate") || kw.includes("green")) return "environment";
  
  return "ai"; // default
}