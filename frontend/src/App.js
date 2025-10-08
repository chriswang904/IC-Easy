import { BrowserRouter, Routes, Route } from "react-router-dom";
import Homepage from "./pages/Homepage";
import EssayEditor from "./pages/EssayEditor";
import CollectionsPage from "./pages/CollectionsPage";
import ExplorePage from "./pages/ExplorePage";
import AIToolPage from "./pages/AIToolPage";
import RecentPage from "./pages/RecentPage";
import History from "./pages/History";
import Login from "./pages/Login";
import Sidebar from "./components/Sidebar"; 
import PlagiarismResultPage from "./pages/PlagiarismResultPage";

function App() {
  return (
    <BrowserRouter>
      <Sidebar />

      <div className="ml-20">
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/essay/:id" element={<EssayEditor />} />
          <Route path="/collections" element={<CollectionsPage />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/aitool" element={<AIToolPage />} />
          <Route path="/plagiarism-result" element={<PlagiarismResultPage />} />
          <Route path="/recent" element={<RecentPage />} />
          <Route path="/history" element={<History />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
