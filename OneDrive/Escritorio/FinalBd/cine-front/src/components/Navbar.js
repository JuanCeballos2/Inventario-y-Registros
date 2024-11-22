import React from 'react';
import { Navbar as BootstrapNavbar, Nav, Container } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';

function Navbar({ user, selectedMovie, setUser }) {
  const navigate = useNavigate(); // Hook para redirigir

  // Función para manejar el cierre de sesión
  const handleLogout = () => {
    setUser(null); // Eliminar el usuario del estado
    navigate('/'); // Redirigir al formulario de registro/login
  };

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

          {/* Enlace de compra si hay una película seleccionada */}
          {selectedMovie && (
            <Nav.Link as={Link} to={`/transacciones/${selectedMovie._id}`} style={{ color: 'white', textDecoration: 'none' }}>
              Comprar Entradas
            </Nav.Link>
          )}

          {/* Enlace para acceder al historial de compras si el usuario está autenticado */}
          {user && (
            <Nav.Link as={Link} to={`/usuarios/${user.nombre}/historial`} style={{ color: 'white', textDecoration: 'none' }}>
              Historial de Compras
            </Nav.Link>
          )}

          {/* Si el usuario está autenticado, mostrar opciones de usuario */}
          {user ? (
            <Nav.Link 
              as="span" 
              style={{ color: 'white', cursor: 'pointer', textDecoration: 'none' }} 
              onClick={handleLogout}
            >
              {user.nombre} (Cerrar sesión)
            </Nav.Link>
          ) : (
            <Nav.Link as={Link} to="/" style={{ color: 'white', textDecoration: 'none' }}>
              Iniciar sesión
            </Nav.Link>
          )}
        </Nav>
      </Container>
    </BootstrapNavbar>
  );
}

export default Navbar;
