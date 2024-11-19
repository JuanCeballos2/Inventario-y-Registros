import React from 'react';

function MovieDetail({ movie }) {
  return (
    <div>
      <h2>{movie.titulo}</h2>
      <p><strong>Género:</strong> {movie.genero}</p>
      <p><strong>Duración:</strong> {movie.duracion} minutos</p>
      <p><strong>Horarios:</strong></p>
      <ul>
        {movie.horarios.map((horario, index) => (
          <li key={index}>{horario.hora} - Asientos disponibles: {horario.asientos_disponibles}</li>
        ))}
      </ul>
    </div>
  );
}

export default MovieDetail;
