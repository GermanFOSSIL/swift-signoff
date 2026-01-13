import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";
import NewOrg from "./pages/org/NewOrg";
import OrgMembers from "./pages/org/OrgMembers";
import Projects from "./pages/projects/Projects";
import ProjectDetail from "./pages/projects/ProjectDetail";
import SystemDetail from "./pages/systems/SystemDetail";
import Tags from "./pages/tags/Tags";
import Disciplines from "./pages/disciplines/Disciplines";
import ItrTemplates from "./pages/itrs/ItrTemplates";
import Itrs from "./pages/itrs/Itrs";
import PunchList from "./pages/punch/PunchList";
import AuditLog from "./pages/audit/AuditLog";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/org/new" element={<NewOrg />} />
            <Route path="/org/members" element={<OrgMembers />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/projects/:id" element={<ProjectDetail />} />
            <Route path="/systems/:id" element={<SystemDetail />} />
            <Route path="/tags" element={<Tags />} />
            <Route path="/disciplines" element={<Disciplines />} />
            <Route path="/itr-templates" element={<ItrTemplates />} />
            <Route path="/itrs" element={<Itrs />} />
            <Route path="/punch" element={<PunchList />} />
            <Route path="/audit-log" element={<AuditLog />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
