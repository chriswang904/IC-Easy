import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import EssayEditor from "./pages/EssayEditor";
import CollectionsPage from "./pages/CollectionsPage";
import ExplorePage from "./pages/ExplorePage";
import AIToolPage from "./pages/AIToolPage";
import RecentPage from "./pages/RecentPage";
import History from "./pages/History";
import Login from "./pages/Login";
import Sidebar from "./components/Sidebar";
import PlagiarismResultPage from "./pages/PlagiarismResultPage";
import SummarizeResultPage from "./pages/SummarizeResultPage";
import PolishPage from "./pages/PolishPage";
import Welcome from "./pages/Welcome";
import Profile from "./pages/Profile";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* No Sidebar Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/" element={<Home />} /> {/* 👈 Home without Sidebar */}
        {/* Routes WITH Sidebar */}
        <Route
          path="/*"
          element={
            <div className="flex">
              <Sidebar />
              <div className="flex-1 ml-20">
                <Routes>
                  <Route path="/explore" element={<ExplorePage />} />
                  <Route path="/essay/:id" element={<EssayEditor />} />
                  <Route path="/collections" element={<CollectionsPage />} />
                  <Route path="/aitool" element={<AIToolPage />} />
                  <Route
                    path="/plagiarism-result"
                    element={<PlagiarismResultPage />}
                  />
                  <Route path="/recent" element={<RecentPage />} />
                  <Route path="/history" element={<History />} />
                  <Route
                    path="/summarize-result"
                    element={<SummarizeResultPage />}
                  />
                  <Route path="/polish" element={<PolishPage />} />
                  <Route path="/profile" element={<Profile />} />
                </Routes>
              </div>
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
