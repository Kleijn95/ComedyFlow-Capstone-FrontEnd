// Navbar aggiornata in stile moderno ComedyFlow con design ispirato al mockup
import { useState } from "react";
import { Container, Button, Modal, Row, Col, Image } from "react-bootstrap";
import logo from "../../assets/logo.png";
import MyLogin from "../auth/MyLogin";
import MyRegister from "../auth/MyRegister";
import comicoImg from "../../assets/572b3c3a-093a-4b6d-8ba8-13bf43998249.png"; // aggiorna percorso se necessario
import stella from "../../assets/stella.png";
import linea from "../../assets/linea.png";
import { useSelector } from "react-redux";

const LoginPage = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  const openLogin = () => setShowLogin(true);
  const closeLogin = () => setShowLogin(false);
  const openRegister = () => setShowRegister(true);
  const closeRegister = () => setShowRegister(false);
  const user = useSelector((state) => state.user.user);

  return (
    <>
      <div
        style={{
          background: "linear-gradient(135deg, #fdf6ff, #e9f4ff)",
          paddingBottom: "100px",
          display: "flex",
          alignItems: "center",
        }}
      >
        <Container
          fluid
          className="d-flex align-items-center justify-content-center px-3 py-5 pb-5"
          style={{ background: "linear-gradient(135deg, #fdf6ff, #e9f4ff)" }}
        >
          <Row className="w-100 justify-content-center align-items-center gap-5" style={{ maxWidth: "1200px" }}>
            {/* Immagine comico con decorazione stella */}
            <Col xs={12} md={5} style={{ position: "relative" }}>
              <div
                style={{
                  borderRadius: "20px",
                  overflow: "hidden",
                  boxShadow: "0 6px 16px rgba(0,0,0,0.2)",
                  aspectRatio: "3/4",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Image src={comicoImg} alt="Stand-up comedian" fluid style={{ height: "100%", width: "auto" }} />
              </div>
              {/* Stella decorativa */}
              <img
                src={stella}
                alt="stella decorativa"
                style={{
                  position: "absolute",
                  top: "-25px",
                  left: "-10px",
                  width: "50px",
                  maxWidth: "15%",
                  zIndex: 0,
                }}
              />
            </Col>

            {/* Contenuto testuale */}
            <Col xs={12} md={6} className="text-center text-md-start">
              <h1 className="fw-bold text-primary" style={{ fontSize: "2.5rem" }}>
                Scopri, Prenota, <span className="text-info">Divertiti</span>
              </h1>
              <p className="text-muted mt-3 mb-4" style={{ maxWidth: "500px" }}>
                Trova i migliori eventi comici, segui i tuoi comici preferiti e condividi la tua esperienza.
              </p>

              {/* Bottoni con decorazione linea */}
              {!user && (
                <div
                  className="d-flex flex-column flex-sm-row gap-3 justify-content-center justify-content-md-start"
                  style={{ position: "relative" }}
                >
                  <Button className="btn-comedy-fill" onClick={openLogin}>
                    Accedi
                  </Button>
                  <Button className="btn-comedy-fill" onClick={openRegister}>
                    Registrati
                  </Button>

                  <img
                    src={linea}
                    alt="linea decorativa"
                    style={{
                      position: "absolute",
                      top: "100%",
                      right: "-30px",
                      width: "120px",
                      maxWidth: "30%",
                      marginTop: "10px",
                      zIndex: 0,
                    }}
                  />
                </div>
              )}

              <section className="py-5">
                <Container style={{ maxWidth: "900px" }}>
                  <h2 className="text-center fw-bold mb-4 text-primary">Cos'è ComedyFlow?</h2>
                  <p className="text-center text-muted fs-5">
                    ComedyFlow è la piattaforma per chi ama ridere. Trova serate di stand-up, segui i tuoi comici
                    preferiti e scopri nuovi locali con un click. Organizziamo la risata, tu goditi lo show!
                  </p>

                  <Row className="mt-5 text-center">
                    <Col xs={12} md={4} className="mb-4">
                      <h5 className="fw-bold text-info">🎭 Eventi Live</h5>
                      <p className="small text-muted">Scopri show in tutta Italia, prenota e partecipa dal vivo.</p>
                    </Col>
                    <Col xs={12} md={4} className="mb-4">
                      <h5 className="fw-bold text-info">🌟 Comici Preferiti</h5>
                      <p className="small text-muted">
                        Segui i tuoi stand-up artist e resta aggiornato sui loro eventi.
                      </p>
                    </Col>
                    <Col xs={12} md={4} className="mb-4">
                      <h5 className="fw-bold text-info">📍 Locali</h5>
                      <p className="small text-muted">Scopri nuovi locali che ospitano eventi comici vicino a te.</p>
                    </Col>
                  </Row>
                </Container>
              </section>
            </Col>
          </Row>

          {/* Modal Login */}
          <Modal show={showLogin} onHide={closeLogin} centered>
            <Modal.Body className="p-0">
              <MyLogin
                inline
                closeModal={closeLogin}
                onSuccess={closeLogin}
                openRegisterModal={() => {
                  closeLogin();
                  openRegister();
                }}
              />
            </Modal.Body>
          </Modal>

          {/* Modal Register */}
          <Modal show={showRegister} onHide={closeRegister} centered>
            <Modal.Body className="p-0">
              <MyRegister inline closeModal={closeRegister} />
            </Modal.Body>
          </Modal>
        </Container>
      </div>
    </>
  );
};

export default LoginPage;
