import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';  // Cambié Switch por Routes
import Navbar from './components/Navbar';
import MovieList from './components/MovieList';
import UserForm from './components/UserForm';
import MovieDetail from './components/MovieDetail'; // Asegúrate de tener este componente si lo usas
import PurchaseForm from './components/PurchaseForm';
import { Container } from 'react-bootstrap';

function App() {
  const [movies, setMovies] = useState([]); // State para la lista de películas
  const [selectedMovie, setSelectedMovie] = useState(null); // Estado para película seleccionada
  const [user, setUser] = useState(null); // Estado para el usuario

  // Fetch movies desde la API cuando el componente se monta
  useEffect(() => {
    fetch('http://localhost:5000/peliculas')
      .then(response => response.json())
      .then(data => setMovies(data))
      .catch(err => console.error('Error fetching movies:', err));
  }, []);

  return (
    <Router>
      <Navbar />
      <Container className="my-4">
        <Routes>
          {/* Ruta principal */}
          <Route
            path="/"
            element={
              !user ? (
                <UserForm setUser={setUser} /> // Mostrar formulario de usuario si no hay usuario
              ) : selectedMovie ? (
                <PurchaseForm movie={selectedMovie} user={user} /> // Si hay una película seleccionada, mostrar el formulario de compra
              ) : (
                <MovieList 
                  movies={movies} 
                  setMovies={setMovies} // Pasar setMovies para que MovieList pueda actualizar la lista
                  setSelectedMovie={setSelectedMovie} // Pasar setSelectedMovie para manejar la película seleccionada
                />
              )
            }
          />

          {/* Ruta para mostrar los detalles de la película */}
          <Route path="/movie/:id" element={<MovieDetail />} />

          {/* Ruta para el formulario de compra */}
          <Route 
            path="/compra/:id" 
            element={<PurchaseForm movie={selectedMovie} user={user} />} // Asegúrate de pasar los props correctos
          />
        </Routes>
      </Container>
    </Router>
  );
}

export default App;
