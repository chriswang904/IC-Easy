import { BrowserRouter, Routes, Route } from "react-router-dom";
import Homepage from "./pages/Homepage";
import EssayEditor from "./pages/EssayEditor";
import CollectionsPage from "./pages/CollectionsPage";
import TestConnection from "./pages/TestConnection";
import ExplorePage from "./pages/ExplorePage";
import AIToolPage from "./pages/AIToolPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/essay/:id" element={<EssayEditor />} />
        <Route path="/collections" element={<CollectionsPage />} />
        <Route path="/test-connection" element={<TestConnection />} />
        <Route path="/explore" element={<ExplorePage />} />
        <Route path="/aitool" element={<AIToolPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
