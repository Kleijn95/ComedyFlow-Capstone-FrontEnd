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
import BottomNav from "./components/navbar/BottomNav";
import { Modal } from "react-bootstrap";
import MyLogin from "./components/auth/MyLogin";
import { useState } from "react";
import MyRegister from "./components/auth/MyRegister";

function App() {
  const [showLogin, setShowLogin] = useState(false);

  const openLoginModal = () => setShowLogin(true);
  const closeLoginModal = () => setShowLogin(false);
  const [showRegister, setShowRegister] = useState(false);

  const openRegisterModal = () => setShowRegister(true);
  const closeRegisterModal = () => setShowRegister(false);

  const handleLoginSuccess = () => {
    closeLoginModal();
    // eventualmente fai un redirect
  };

  return (
    <>
      <BrowserRouter>
        <MyNavBar openLoginModal={openLoginModal} openRegisterModal={openRegisterModal} />
        <BottomNav openLoginModal={openLoginModal} />
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
        <Modal show={showLogin} onHide={closeLoginModal} centered>
          <Modal.Body className="p-0">
            <MyLogin
              inline
              closeModal={closeLoginModal}
              onSuccess={handleLoginSuccess}
              openRegisterModal={() => {
                closeLoginModal();
                openRegisterModal();
              }}
            />
          </Modal.Body>
        </Modal>

        <Modal show={showRegister} onHide={closeRegisterModal} centered>
          <Modal.Body className="p-0">
            <MyRegister inline={true} closeModal={closeRegisterModal} />
          </Modal.Body>
        </Modal>
      </BrowserRouter>
    </>
  );
}

export default App;
