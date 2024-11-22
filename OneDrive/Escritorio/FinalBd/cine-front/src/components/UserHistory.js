import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ListGroup, Alert, Button, Modal } from 'react-bootstrap';

function UserHistory() {
  const { userName } = useParams(); // Obtener el nombre del usuario desde la URL
  const [historial, setHistorial] = useState([]);
  const [error, setError] = useState(null);
  const [selectedCompra, setSelectedCompra] = useState(null); // Compra seleccionada para mostrar en el recibo
  const [showModal, setShowModal] = useState(false); // Estado para controlar el modal

  // Fetch historial de compras del usuario
  useEffect(() => {
    const fetchHistorial = async () => {
      try {
        const response = await fetch(`http://localhost:5000/usuarios/${userName}/historial`);
        if (!response.ok) {
          throw new Error('No se pudo obtener el historial de compras');
        }
        const data = await response.json();
        setHistorial(data.historial_compras || []);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchHistorial();
  }, [userName]); // Ejecutar la solicitud cuando cambie el nombre del usuario

  // Manejar la apertura del modal con la compra seleccionada
  const handleShowRecibo = (compra) => {
    setSelectedCompra(compra);
    setShowModal(true);
  };

  // Manejar el cierre del modal
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedCompra(null);
  };

  return (
    <div>
      <h1>Historial de Compras de {userName}</h1>

      {error && <Alert variant="danger">{error}</Alert>}

      <ListGroup>
        {historial.length > 0 ? (
          historial.map((compra, index) => (
            <ListGroup.Item key={index}>
              <strong>Película:</strong> {compra.pelicula_nombre}<br />
              <strong>Fecha:</strong> {compra.fecha_transaccion}<br />
              <strong>Cantidad de Entradas:</strong> {compra.cantidad_entradas}<br />
              <strong>Total Pagado:</strong> {compra.total_pagado}€<br />
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleShowRecibo(compra)}
              >
                Ver Recibo de Pago
              </Button>
            </ListGroup.Item>
          ))
        ) : (
          <ListGroup.Item>No tienes historial de compras.</ListGroup.Item>
        )}
      </ListGroup>

      {/* Modal para mostrar el recibo */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Recibo de Pago</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedCompra ? (
            <div>
              <p><strong>Cinepelis</strong></p>
              <p><strong>Película:</strong> {selectedCompra.pelicula_nombre}</p>
              <p><strong>Fecha:</strong> {selectedCompra.fecha_transaccion}</p>
              <p><strong>Total Pagado:</strong> {selectedCompra.total_pagado}€</p>
            </div>
          ) : (
            <p>No hay datos disponibles para esta compra.</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default UserHistory;
