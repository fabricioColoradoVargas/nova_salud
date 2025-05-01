import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

function Categorias() {
  const [categorias, setCategorias] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [modalCategoria, setModalCategoria] = useState({
    mostrar: false,
    editar: false,
    categoria: {
      id: null,
      nombre: '',
      descripcion: '',
    },
  });

  useEffect(() => {
    fetchCategorias();
  }, []);

  const fetchCategorias = () => {
    fetch('http://localhost:3001/api/categorias/listar')
      .then(res => res.json())
      .then(data => setCategorias(data))
      .catch(err => console.error(err));
  };

  const abrirModalAgregar = () => {
    setModalCategoria({
      mostrar: true,
      editar: false,
      categoria: {
        id: null,
        nombre: '',
        descripcion: '',
      },
    });
  };

  const abrirModalEditar = categoria => {
    setModalCategoria({
      mostrar: true,
      editar: true,
      categoria: {
        id: categoria.id,
        nombre: categoria.nombre,
        descripcion: categoria.descripcion,
      },
    });
  };

  const cerrarModal = () => {
    setModalCategoria(prev => ({ ...prev, mostrar: false }));
  };

  const guardarCategoria = async () => {
    const { id, nombre, descripcion } = modalCategoria.categoria;

    if (!nombre || !descripcion) {
      alert('Todos los campos son obligatorios');
      return;
    }

    const url = modalCategoria.editar
      ? `http://localhost:3001/api/categorias/actualizar/${id}`
      : 'http://localhost:3001/api/categorias/crear';

    const metodo = modalCategoria.editar ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method: metodo,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, descripcion }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error inesperado');

      Swal.fire('Éxito', data.message, 'success');
      fetchCategorias();
      cerrarModal();
    } catch (err) {
      Swal.fire('Error', err.message, 'error');
    }
  };

  const eliminarCategoria = (id, nombre) => {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Deseas eliminar la categoría "${nombre}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#dc3545',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then(result => {
      if (result.isConfirmed) {
        fetch(`http://localhost:3001/api/categorias/eliminar/${id}`, {
          method: 'DELETE',
        })
          .then(res => res.json())
          .then(() => {
            Swal.fire('Eliminada', 'La categoría ha sido eliminada.', 'success');
            fetchCategorias();
          })
          .catch(err => {
            Swal.fire('Error', 'No se pudo eliminar la categoría.', 'error');
            console.error(err);
          });
      }
    });
  };

  const categoriasFiltradas = categorias.filter(c =>
    c.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    c.descripcion.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Categorías</h2>
        <button className="btn btn-success" onClick={abrirModalAgregar}>
          <i className="bi bi-plus-circle me-2"></i>Agregar Categoría
        </button>
      </div>

      <div className="mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Buscar..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      {categoriasFiltradas.length === 0 ? (
        <p>No hay categorías disponibles.</p>
      ) : (
        <table className="table table-striped">
          <thead className="table-light">
            <tr>
              <th>Nombre</th>
              <th>Descripción</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {categoriasFiltradas.map(c => (
              <tr key={c.id}>
                <td>{c.nombre}</td>
                <td>{c.descripcion}</td>
                <td>
                  <button className="btn btn-sm btn-outline-secondary me-2" onClick={() => abrirModalEditar(c)}>
                    <i className="bi bi-pencil"></i>
                  </button>
                  <button className="btn btn-sm btn-danger" onClick={() => eliminarCategoria(c.id, c.nombre)}>
                    <i className="bi bi-trash-fill"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {modalCategoria.mostrar && (
        <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{modalCategoria.editar ? 'Editar Categoría' : 'Agregar Categoría'}</h5>
                <button type="button" className="btn-close" onClick={cerrarModal}></button>
              </div>
              <div className="modal-body">
                <input
                  className="form-control mb-2"
                  placeholder="Nombre"
                  value={modalCategoria.categoria.nombre}
                  onChange={e => setModalCategoria(prev => ({ ...prev, categoria: { ...prev.categoria, nombre: e.target.value } }))} />
                <input
                  className="form-control mb-2"
                  placeholder="Descripción"
                  value={modalCategoria.categoria.descripcion}
                  onChange={e => setModalCategoria(prev => ({ ...prev, categoria: { ...prev.categoria, descripcion: e.target.value } }))} />
              </div>
              <div className="modal-footer">
                <button className="btn btn-danger" onClick={cerrarModal}>Cancelar</button>
                <button className="btn btn-success" onClick={guardarCategoria}>
                  {modalCategoria.editar ? 'Actualizar' : 'Guardar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Categorias;
