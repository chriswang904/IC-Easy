// src/hooks/useTopicImages.js
import { useState, useEffect } from 'react';
import { getTopicImages } from '../services/image_service';
import { TOPICS } from '../constants/topics';

export function useTopicImages() {
  const [topicImages, setTopicImages] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function preloadImages() {
      console.log("[useTopicImages] Starting image preload");
      const loaded = {};
      
      for (const topic of TOPICS) {
        console.log(`[Unsplash] Fetching images for: ${topic.name}`);
        const remote = await getTopicImages(topic.name, 5);
        console.log(`[Unsplash] ${topic.name} →`, remote);
        
        if (remote.length > 0) {
          loaded[topic.id] = remote;
        } else {
          // Fallback to local images
          loaded[topic.id] = [
            topic.image,
            `/images/topics/${topic.id}/1.jpg`,
            `/images/topics/${topic.id}/2.jpg`,
            `/images/topics/${topic.id}/3.jpg`,
          ];
        }
      }
      
      console.log("[useTopicImages] Loaded topic images:", loaded);
      setTopicImages(loaded);
      setLoading(false);
    }
    
    preloadImages();
  }, []);

  return { topicImages, loading };
}