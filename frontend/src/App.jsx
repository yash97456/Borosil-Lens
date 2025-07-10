import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import UploadPage from "./pages/UploadPage";
import SearchPage from "./pages/SearchPage";
import FeedbackPage from "./pages/FeedbackPage";
import UserPanelPage from "./pages/UserPanelPage";
import ScrollToTop from "./ScrollToTop";

import "./App.css";

function App() {
  return (
    <Router>
      <ScrollToTop />

      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/feedback" element={<FeedbackPage />} />
          <Route path="/user-panel" element={<UserPanelPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
