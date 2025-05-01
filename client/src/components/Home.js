import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';

export default function Home({ usuario, setUsuario }) {
  const handleLogout = () => {
    setUsuario(null);
    localStorage.removeItem('usuario');
  };

  const linkClass = ({ isActive }) =>
    `nav-link text-white d-flex align-items-center ${isActive ? 'active' : ''}`;

  return (
    <div className="d-flex vh-100">
      <nav className="sidebar">
        <div className="sidebar-header p-4 text-center">
          <h4 className="m-0">Nova Salud</h4>
        </div>

        <ul className="nav flex-column sidebar-menu p-2">
          <li className="nav-item mb-2">
            <NavLink to="productos" className={linkClass}>
              <i className="bi bi-boxes me-2"></i> Productos
            </NavLink>
          </li>
          <li className="nav-item mb-2">
            <NavLink to="ventas" className={linkClass}>
              <i className="bi bi-cart me-2"></i> Ventas
            </NavLink>
          </li>
          <li className="nav-item mb-2">
            <NavLink to="categorias" className={linkClass}>
              <i className="bi bi-tags me-2"></i> Categorías
            </NavLink>
          </li>
        </ul>

        <div className="sidebar-footer p-4">
          <button
            className="btn btn-outline-light w-100"
            onClick={handleLogout}
          >
            <i className="bi bi-door-open-fill me-2"></i> Cerrar Sesión
          </button>
        </div>
      </nav>

      <div className="flex-fill p-4 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
}
