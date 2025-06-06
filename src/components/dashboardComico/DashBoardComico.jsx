import { Card, Container, Image, Spinner } from "react-bootstrap";
import { useSelector } from "react-redux";
import logo from "../../assets/logo.png";
import { Link } from "react-router-dom";
import { ArrowRight } from "react-bootstrap-icons";
import decorCurve from "../../assets/linea.png";
import decorStar from "../../assets/stella.png";

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

  const cards = [
    {
      to: "/EventiComico",
      title: "I miei eventi",
      desc: "Visualizza gli eventi in cui ti esibirai",
      btn: "Vai ai miei eventi",
    },
    {
      to: "/RecensioniComico",
      title: "Recensioni ricevute",
      desc: "Leggi cosa pensano gli spettatori delle tue esibizioni",
      btn: "Vai alle recensioni",
    },
  ];

  return (
    <Container
      fluid
      className="p-0 position-relative"
      style={{ background: "linear-gradient(135deg, #fff9f4, #eaf7ff)" }}
    >
      {/* Decorazioni */}
      <img
        src={decorStar}
        alt="decorazione stella"
        style={{ position: "absolute", top: "20px", left: "20px", width: "90px", zIndex: 0, opacity: 0.4 }}
      />
      <img
        src={decorCurve}
        alt="decorazione curva"
        style={{ position: "absolute", bottom: "20px", right: "30px", width: "120px", zIndex: 0, opacity: 0.5 }}
      />

      {/* Header */}
      <Card className="border-0 rounded-0 shadow-sm mb-3 bg-white">
        <Card.Body className="d-flex align-items-center justify-content-between px-4 py-3">
          <div className="d-flex align-items-center">
            <Image src={user?.avatar} roundedCircle width={50} height={50} className="me-3 border border-2" />
            <div>
              <div className="text-muted small">Benvenuto</div>
              <h5 className="mb-0">
                {capitalize(user.nome)} {capitalize(user.cognome)}
              </h5>
            </div>
          </div>
          <Image src={logo} width={100} height={100} />
        </Card.Body>
      </Card>

      {/* Sezioni */}
      <Container className="mb-5">
        {cards.map((card, idx) => (
          <Card
            key={idx}
            className="mb-3 shadow-sm border-0 text-decoration-none colorDiv hover-shadow"
            as={Link}
            to={card.to}
            style={{ transition: "transform 0.2s", backgroundColor: "#ffffffcc", backdropFilter: "blur(5px)" }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.02)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            <Card.Body className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center px-4 py-3">
              <div>
                <h5 className="mb-1">{card.title}</h5>
                <p className="mb-2 small text-muted">{card.desc}</p>
              </div>
              <p className="text-end mb-0 text-primary">
                {card.btn} <ArrowRight className="ms-2" />
              </p>
            </Card.Body>
          </Card>
        ))}
      </Container>
    </Container>
  );
}
