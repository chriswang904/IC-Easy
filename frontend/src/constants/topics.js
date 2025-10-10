// src/constants/topics.js
export const TOPICS = [
  { 
    id: "ai", 
    name: "Artificial Intelligence", 
    image: "/images/topics/ai.jpg", 
    color: "from-purple-500 to-indigo-500" 
  },
  { 
    id: "economics", 
    name: "Economics", 
    image: "/images/topics/economics.jpg", 
    color: "from-yellow-400 to-amber-500" 
  },
  { 
    id: "biology", 
    name: "Biology", 
    image: "/images/topics/biology.jpg", 
    color: "from-green-500 to-lime-400" 
  },
  { 
    id: "physics", 
    name: "Physics", 
    image: "/images/topics/physics.jpg", 
    color: "from-blue-600 to-indigo-600" 
  },
  { 
    id: "environment", 
    name: "Environment", 
    image: "/images/topics/environment.jpg", 
    color: "from-emerald-500 to-green-400" 
  },
  { 
    id: "medicine", 
    name: "Medicine", 
    image: "/images/topics/medicine.jpg", 
    color: "from-rose-500 to-pink-400" 
  },
];

export const DEFAULT_PAPERS = [
  {
    id: "1",
    image: "/images/note1.jpg",
    title: "Attention Is All You Need",
    category: "Machine Learning",
    metadata: "45,231 citations • Added 2 days ago",
    description:
      "Transformer architecture paper introducing self-attention mechanisms. Key findings on sequence-to-sequence models and applications in NLP tasks.",
    color: "bg-blue-50",
  },
  {
    id: "2",
    image: "/images/note2.jpg",
    title: "Climate Change Impact on Ecosystems",
    category: "Environmental Science",
    metadata: "Open Access • Added 1 week ago",
    description:
      "Comprehensive study analyzing biodiversity loss patterns and ecosystem adaptation strategies under various climate scenarios through 2050.",
    color: "bg-green-50",
  },
  {
    id: "3",
    image: "/images/note3.jpg",
    title: "CRISPR Gene Editing Applications",
    category: "Biotechnology",
    metadata: "Peer-reviewed • Added 3 weeks ago",
    description:
      "Latest developments in gene therapy techniques, focusing on disease treatment protocols and ethical considerations in clinical applications.",
    color: "bg-purple-50",
  },
];