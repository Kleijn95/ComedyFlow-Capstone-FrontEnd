import { BrowserRouter, Route, Routes } from "react-router";
import "./App.css";
import LoginPage from "./components/home/LoginPage";
import Dashboard from "./components/dashboard/Dashboard";
import DashboardUser from "./components/dashboardUser/DashboardUser";
import EventiUser from "./components/dashboardUser/EventiUser";
import RicercaEventi from "./components/dashboardUser/RicercaEventi";
import MyProfile from "./components/auth/MyProfile";
import DashboardComico from "./components/dashboardComico/DashBoardComico";
import EventiComico from "./components/dashboardComico/EventiComico";
import RecensioniComico from "./components/dashboardComico/RecensioniComico";
import MyNavBar from "./components/navbar/MyNavBar";
import DashboardLocale from "./components/dashboardLocale/DashboardLocale";
import CreaEvento from "./components/dashboardLocale/CreaEvento";
import EventiLocale from "./components/dashboardLocale/EventiLocale";
import RecensioniLocale from "./components/dashboardLocale/RecensioniLocale";
import PartecipantiEvento from "./components/dashboardLocale/PartecipantiEvento";
import CercaComici from "./components/dashboardLocale/CercaComici";
import MieRecensioni from "./components/dashboardUser/MieRecensioni";
import Wishlist from "./components/dashboardUser/Wishlist";

function App() {
  return (
    <>
      <BrowserRouter>
        <MyNavBar />
        <Routes>
          <Route path="/" element={<LoginPage />} />
          {/* ❌ RIMOSSE rotte login/register */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboardUser" element={<DashboardUser />} />
          <Route path="/EventiUser" element={<EventiUser />} />
          <Route path="/RicercaEventi" element={<RicercaEventi />} />
          <Route path="/profile" element={<MyProfile />} />
          <Route path="/dashboardComico" element={<DashboardComico />} />
          <Route path="/EventiComico" element={<EventiComico />} />
          <Route path="/RecensioniComico" element={<RecensioniComico />} />
          <Route path="/dashboardLocale" element={<DashboardLocale />} />
          <Route path="/dashboardLocale/nuovoEvento" element={<CreaEvento />} />
          <Route path="/dashboardLocale/eventiLocale" element={<EventiLocale />} />
          <Route path="/dashboardLocale/RecensioniLocale" element={<RecensioniLocale />} />
          <Route path="/dashboardLocale/partecipanti" element={<PartecipantiEvento />} />
          <Route path="/dashboardLocale/cercaComici" element={<CercaComici />} />
          <Route path="/mieRecensioni" element={<MieRecensioni />} />
          <Route path="/Wishlist" element={<Wishlist />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
