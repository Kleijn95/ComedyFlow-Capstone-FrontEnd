import { useState } from "react";
import { Container, Button, Modal } from "react-bootstrap";
import logo from "../../assets/logo.png";
import MyLogin from "../auth/MyLogin";
import MyRegister from "../auth/MyRegister";

const LoginPage = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  return (
    <>
      <Container
        fluid
        className="d-flex flex-column justify-content-center align-items-center text-center text-light"
        style={{
          backgroundImage: `url(${logo})`,
          backgroundSize: "contain",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          height: "100vh",
        }}
      ></Container>

      {/* Modale Login */}
      <Modal show={showLogin} onHide={() => setShowLogin(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Accedi</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <MyLogin inline closeModal={() => setShowLogin(false)} />
        </Modal.Body>
      </Modal>

      {/* Modale Register */}
      <Modal show={showRegister} onHide={() => setShowRegister(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Registrati</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <MyRegister inline closeModal={() => setShowRegister(false)} />
        </Modal.Body>
      </Modal>
    </>
  );
};

export default LoginPage;
