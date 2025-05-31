import { Card, Container, Image, Spinner } from "react-bootstrap";
import { useSelector } from "react-redux";
import logo from "../../assets/logo.png";
import { Link } from "react-router";
import { ArrowRight } from "react-bootstrap-icons";

export default function DashboardComico() {
  const user = useSelector((state) => state.user.user);

  if (!user) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Caricamento in corso...</p>
      </Container>
    );
  }

  const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

  return (
    <Container fluid className="p-0" style={{ minHeight: "100vh", position: "relative", backgroundColor: "#f8f9fa" }}>
      {/* Header */}
      <Card className="border-0 rounded-0 shadow-sm mb-3">
        <Card.Body className="d-flex align-items-center justify-content-between bg-white px-4 py-3">
          <div className="d-flex align-items-center">
            <Image src={user?.avatar} roundedCircle width={50} height={50} className="me-3" />
            <div>
              <div className="text-muted small">Benvenuto</div>
              <h5 className="mb-0">
                {capitalize(user?.nome)} {capitalize(user?.cognome)}
              </h5>
            </div>
          </div>
          <Image src={logo} height={40} />
        </Card.Body>
      </Card>

      {/* Sezioni */}
      <Container className="mb-5">
        {/* I miei eventi */}
        <Card className="mb-3 shadow-sm border-0 text-decoration-none colorDiv" as={Link} to="/EventiComico">
          <Card.Body className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center px-4 py-3">
            <div>
              <h5 className="mb-1">I miei eventi</h5>
              <p className="mb-2 small">Visualizza gli eventi in cui ti esibirai</p>
            </div>
            <p className="text-end mb-0">
              Vai ai miei eventi
              <ArrowRight className="ms-2" />
            </p>
          </Card.Body>
        </Card>

        {/* Recensioni ricevute */}
        <Card className="shadow-sm border-0 text-decoration-none colorDiv" as={Link} to="/RecensioniComico">
          <Card.Body className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center px-4 py-3">
            <div>
              <h5 className="mb-1">Recensioni ricevute</h5>
              <p className="mb-2 small">Leggi cosa pensano gli spettatori delle tue esibizioni</p>
            </div>
            <p className="text-end mb-0 ">
              Vai alle recensioni
              <ArrowRight className="ms-2" />
            </p>
          </Card.Body>
        </Card>
      </Container>
    </Container>
  );
}
