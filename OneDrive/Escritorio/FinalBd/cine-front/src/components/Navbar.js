import React from 'react';
import { Navbar as BootstrapNavbar, Nav, Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <BootstrapNavbar bg="dark" variant="dark" expand="lg">
      <Container>
        {/* Usamos Link para redirigir a la página principal */}
        <BootstrapNavbar.Brand as={Link} to="/" style={{ color: 'white', textDecoration: 'none' }}>
          Cine Pelis
        </BootstrapNavbar.Brand>
        <Nav className="ml-auto">
          {/* Link para el botón de inicio */}
          <Nav.Link as={Link} to="/" style={{ color: 'white', textDecoration: 'none' }}>
            Inicio
          </Nav.Link>
        </Nav>
      </Container>
    </BootstrapNavbar>
  );
}

export default Navbar;
