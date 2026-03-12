import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import MainLayout from "./components/MainLayout";
import HomePage from "./components/pages/HomePage";
import AboutPage from "./components/pages/AboutPage";
import AttorneysPage from "./components/pages/AttorneysPage";
import PracticeAreasPage from "./components/pages/PracticeAreasPage";
import CaseStudiesPage from "./components/pages/CaseStudiesPage";
import BlogPage from "./components/pages/BlogPage";
import ContactPage from "./components/pages/ContactPage";
import ConsultationPage from "./components/pages/ConsultationPage";
import ClientPortalPage from "./components/pages/ClientPortalPage";
import NotFound from "./pages/NotFound";

const App = () => (
  <ThemeProvider>
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/attorneys" element={<AttorneysPage />} />
          <Route path="/practice-areas" element={<PracticeAreasPage />} />
          <Route path="/case-studies" element={<CaseStudiesPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/consultation" element={<ConsultationPage />} />
          <Route path="/client-portal" element={<ClientPortalPage />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
    <Toaster />
  </ThemeProvider>
);

export default App;
