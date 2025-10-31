import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";

import Home from "./pages/Home";
import ExplorePage from "./pages/ExplorePage";
import CollectionsPage from "./pages/CollectionsPage";
import EssayEditor from "./pages/EssayEditor";
import AIToolPage from "./pages/AIToolPage";
import SearchResultPage from "./pages/SearchResultPage";
import PlagiarismResultPage from "./pages/PlagiarismResultPage";
import SummarizeResultPage from "./pages/SummarizeResultPage";
import PolishPage from "./pages/PolishPage";
import Profile from "./pages/Profile";
import RecentPage from "./pages/RecentPage";
import History from "./pages/History";
import Login from "./pages/Login";
import Welcome from "./pages/Welcome";
import ReferencesPage from "./pages/ReferencesPage";
import KnowledgeGraphPage from "./pages/KnowledgeGraphPage";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <BrowserRouter>
      <ToastContainer position="top-right" autoClose={2000} theme="light" />

      <Routes>
        {/* === Routes WITHOUT Sidebar === */}
        <Route path="/login" element={<Login />} />
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/" element={<Home />} />

        {/* === Routes WITH Sidebar === */}
        <Route element={<MainLayout />}>
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/essay/:id" element={<EssayEditor />} />
          <Route path="/collections" element={<CollectionsPage />} />
          <Route path="/aitool" element={<AIToolPage />} />
          <Route path="/search-results" element={<SearchResultPage />} />
          <Route path="/plagiarism-result" element={<PlagiarismResultPage />} />
          <Route path="/recent" element={<RecentPage />} />
          <Route path="/history" element={<History />} />
          <Route path="/summarize-result" element={<SummarizeResultPage />} />
          <Route path="/polish" element={<PolishPage />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/references" element={<ReferencesPage />} />
          <Route path="/knowledge" element={<KnowledgeGraphPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
