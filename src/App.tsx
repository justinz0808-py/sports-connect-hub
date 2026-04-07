import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import BottomTabBar from "@/components/BottomTabBar";
import Landing from "@/pages/Landing";
import Feed from "@/pages/Feed";
import SearchPage from "@/pages/SearchPage";
import ProfileView from "@/pages/ProfileView";
import Messages from "@/pages/Messages";
import Notifications from "@/pages/Notifications";
import Auth from "@/pages/Auth";
import ProfileSetup from "@/pages/ProfileSetup";
import NotFound from "./pages/NotFound";
import { supabase } from "@/lib/supabase";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [checked, setChecked] = useState(false);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthed(!!session);
      setChecked(true);
    });
  }, []);

  if (!checked) return null;
  if (!authed) return <Navigate to="/auth" replace />;
  return <>{children}</>;
};

const AppLayout = () => (
  <>
    <Navbar />
    <Routes>
      <Route path="/feed" element={<Feed />} />
      <Route path="/search" element={<SearchPage />} />
      <Route path="/profile" element={<ProfileView />} />
      <Route path="/profile/:id" element={<ProfileView />} />
      <Route path="/messages" element={<Messages />} />
      <Route path="/notifications" element={<Notifications />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
    <BottomTabBar />
  </>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/profile/setup" element={<ProfileSetup />} />
          <Route path="/*" element={<ProtectedRoute><AppLayout /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
