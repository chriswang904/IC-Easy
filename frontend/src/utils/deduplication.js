// src/utils/deduplication.js

/**
 * Remove duplicate papers by DOI and title
 */
export function deduplicatePapers(papers) {
  const uniquePapers = [];
  const seenDOIs = new Set();
  const seenTitles = new Set();

  for (const paper of papers) {
    // Check DOI
    if (paper.doi) {
      if (seenDOIs.has(paper.doi)) {
        console.log(`[Dedup] Skipping duplicate DOI: ${paper.doi}`);
        continue;
      }
      seenDOIs.add(paper.doi);
    }

    // Check normalized title
    const normalizedTitle = paper.title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s]/g, '');
    
    if (seenTitles.has(normalizedTitle)) {
      console.log(`[Dedup] Skipping duplicate title: "${paper.title.substring(0, 50)}..."`);
      continue;
    }
    seenTitles.add(normalizedTitle);
    
    uniquePapers.push(paper);
  }

  console.log(`[Dedup] ${papers.length} → ${uniquePapers.length} unique papers`);
  return uniquePapers;
}