import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import Login from './components/Login';
import Home from './components/Home';
import Productos from './components/Productos';
import Ventas from './components/Ventas';
import Welcome from './components/Welcome';
import Categorias from './components/Categorias';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  const [usuario, setUsuario] = useState(null);

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={
            !usuario
              ? <Login setUsuario={setUsuario} />
              : <Navigate to="/" replace />
          }
        />

        <Route
          path="/"
          element={
            usuario
              ? <Home usuario={usuario} setUsuario={setUsuario} />
              : <Navigate to="/login" replace />
          }
        >
          <Route index element={<Welcome usuario={usuario} />} />

          <Route path="productos" element={<Productos />} />
          <Route path="ventas" element={<Ventas />} />
          <Route path="categorias" element={<Categorias />} /> 
          
        </Route>

        <Route path="*" element={<Navigate to={usuario ? "/" : "/login"} replace />} />
      </Routes>
    </Router>
  );
}

export default App;
