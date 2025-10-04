import { BrowserRouter, Routes, Route } from "react-router-dom";
import Homepage from "./pages/Homepage";
import EssayEditor from "./pages/EssayEditor";
import RecentPage from "./pages/RecentPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/essay/:id" element={<EssayEditor />} />
        <Route path="/recent" element={<RecentPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
