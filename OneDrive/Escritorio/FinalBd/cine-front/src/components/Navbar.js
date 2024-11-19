import React from 'react';
import { Navbar as BootstrapNavbar, Nav, Container } from 'react-bootstrap';
import { Link } from 'react-router-dom'; // Importa el Link

function Navbar() {
  return (
    <BootstrapNavbar bg="dark" variant="dark" expand="lg">
      <Container>
        {/* Usamos Link para redirigir a la página principal */}
        <BootstrapNavbar.Brand>
          {/* Redirige a la ruta principal de la aplicación */}
          <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>
            Cine Pelis
          </Link>
        </BootstrapNavbar.Brand>
        <Nav className="ml-auto">
          {/* Link para el botón de inicio, que lleva a la página principal */}
          <Nav.Link>
            <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>
              Inicio
            </Link>
          </Nav.Link>
        </Nav>
      </Container>
    </BootstrapNavbar>
  );
}

export default Navbar;
