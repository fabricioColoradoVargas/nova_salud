import React from 'react';

export default function Welcome({ usuario }) {
  return (
    <div className="d-flex justify-content-center align-items-center welcome-bg">
      <div className="card shadow-sm welcome-card text-center">
        <div className="card-body">
          <h2 className="card-title text-primary mb-3">¡Bienvenido, {usuario.nombre}!</h2>
          <p className="lead text-secondary">
            Selecciona una opción del menú para comenzar.
          </p>
        </div>
      </div>
    </div>
  );
}
