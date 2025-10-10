// src/hooks/useTopicPapers.js
import { useState, useEffect, useRef } from 'react';
import { getLatest } from '../api';
import { TOPICS } from '../constants/topics';

export function useTopicPapers(topicImages) {
  const [selectedTopic, setSelectedTopic] = useState("ai");
  const [topicMode, setTopicMode] = useState("latest");
  const [topicPapers, setTopicPapers] = useState([]);
  const [loadingTopic, setLoadingTopic] = useState(false);
  const debounceTimer = useRef(null);

  useEffect(() => {
    if (Object.keys(topicImages).length === 0) return;

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    
    debounceTimer.current = setTimeout(() => {
      loadTopicPapers(selectedTopic, topicMode);
    }, 300);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [selectedTopic, topicMode, topicImages]);

  const loadTopicPapers = async (topicKey, mode) => {
    setLoadingTopic(true);
    try {
      const { results: papers } = await getLatest({
        source: "openalex",
        topicKey,
        limit: 15,
        mode: mode,
      });
      
      const results = papers || [];
      const topicItem = TOPICS.find((t) => t.id === topicKey);
      const topicImagesList = topicImages[topicKey] || [
        topicItem?.image || "/images/note1.jpg",
      ];

      const transformed = results.map((paper, i) => ({
        id: paper.doi || paper.url || `topic-${topicKey}-${i}`,
        title: paper.title || "Untitled",
        description: paper.abstract || "No abstract available.",
        image: topicImagesList[i % topicImagesList.length],
        metadata:
          mode === "latest"
            ? `${paper.published_date?.slice(0, 10) || "N/A"} • Latest`
            : `${paper.citation_count ?? 0} citations • ${
                paper.published_date?.slice(0, 4) || "N/A"
              }`,
        url: paper.url,
        source: paper.source,
        authors: paper.authors?.map((a) => a.name).filter(Boolean) || [],
        citationCount: paper.citation_count,
      }));

      setTopicPapers(transformed);
    } catch (err) {
      console.error("[useTopicPapers] Error:", err);
      setTopicPapers([]);
    } finally {
      setLoadingTopic(false);
    }
  };

  return {
    selectedTopic,
    setSelectedTopic,
    topicMode,
    setTopicMode,
    topicPapers,
    loadingTopic,
  };
}