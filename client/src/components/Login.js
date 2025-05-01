import React, { useState } from 'react';

function Login({ setUsuario }) {
  const [correo, setCorreo] = useState('');
  const [contraseña, setContraseña] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo, contraseña }),
      });

      const data = await response.json();

      if (response.ok) {
        setUsuario(data.usuario);
        
        localStorage.setItem("usuario", JSON.stringify(data.usuario));
      } else {
        setError(data.message || 'Error al iniciar sesión');
      }
    } catch (err) {
      setError('Error de conexión con el servidor');
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 login-bg">
      <div className="card login-card">
        <div className="card-body">
          <h2 className="card-title text-center mb-4">Iniciar Sesión</h2>
          <form onSubmit={handleLogin} className='text-start'>
            <div className="mb-3">
              <label className="form-label" htmlFor="correo">Correo</label>
              <input
                id="correo"
                type="email"
                className="form-control"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label" htmlFor="contraseña">Contraseña</label>
              <input
                id="contraseña"
                type="password"
                className="form-control"
                value={contraseña}
                onChange={(e) => setContraseña(e.target.value)}
                required
              />
            </div>
            <div className="d-grid">
              <button type="submit" className="btn btn-primary">
                Ingresar
              </button>
            </div>
            {error && (
              <div className="alert alert-danger mt-3 text-center login-alert">
                {error}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
