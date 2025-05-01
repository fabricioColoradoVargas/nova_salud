import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

function Productos() {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [modalProducto, setModalProducto] = useState({
    mostrar: false,
    editar: false,
    producto: { id: null, nombre: '', descripcion: '', categoria: '', precio: '', stock: '' },
  });
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    fetchProductos();
    fetchCategorias();
  }, []);

  const fetchProductos = () => {
    fetch('http://localhost:3001/api/productos/listar')
      .then(res => res.json())
      .then(data => setProductos(data))
      .catch(err => console.error(err));
  };

  const fetchCategorias = () => {
    fetch('http://localhost:3001/api/categorias/listar')
      .then(res => res.json())
      .then(data => setCategorias(data))
      .catch(err => console.error(err));
  };

  const abrirModalAgregar = () => {
    setModalProducto({
      mostrar: true,
      editar: false,
      producto: { id: null, nombre: '', descripcion: '', categoria: '', precio: '', stock: '' },
    });
  };

  const abrirModalEditar = p => {
    setModalProducto({
      mostrar: true,
      editar: true,
      producto: {
        id: p.id,
        nombre: p.producto_nombre,
        descripcion: p.producto_descripcion,
        categoria: String(p.categoria),
        precio: p.precio,
        stock: p.stock,
      },
    });
  };

  const cerrarModal = () => {
    setModalProducto(prev => ({ ...prev, mostrar: false }));
  };

  const guardarProducto = async () => {
    const { id, nombre, descripcion, categoria, precio, stock } = modalProducto.producto;
  
    if (!nombre || !descripcion || !categoria || !precio || !stock) {
      alert('Todos los campos son obligatorios');
      return;
    }
  
    if (stock < 0) {
      Swal.fire('Error', 'El stock no puede ser un número negativo.', 'error');
      return;
    }
    if (precio < 0) { 
      Swal.fire('Error', 'El precio no puede ser un número negativo.', 'error');
      return;
    }
  
  
    const url = modalProducto.editar
      ? `http://localhost:3001/api/productos/actualizar/${id}`
      : 'http://localhost:3001/api/productos/crear';
    const metodo = modalProducto.editar ? 'PUT' : 'POST';
  
    try {
      const res = await fetch(url, {
        method: metodo,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre,
          descripcion,
          categoria: parseInt(categoria, 10),
          precio: parseFloat(precio),
          stock: parseInt(stock, 10),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error inesperado');
      Swal.fire('Éxito', data.message, 'success');
      fetchProductos();
      cerrarModal();
    } catch (err) {
      Swal.fire('Error', err.message, 'error');
    }
  };
  

  const eliminarProducto = (id, nombre) => {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Deseas eliminar el producto "${nombre}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#dc3545',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then(result => {
      if (result.isConfirmed) {
        fetch(`http://localhost:3001/api/productos/eliminar/${id}`, { method: 'PUT' })
          .then(res => res.json())
          .then(() => {
            Swal.fire('Eliminado', 'El producto ha sido eliminado.', 'success');
            fetchProductos();
          })
          .catch(err => {
            Swal.fire('Error', 'No se pudo eliminar el producto.', 'error');
            console.error(err);
          });
      }
    });
  };

  const productosFiltrados = productos.filter(p => {
    const term = busqueda.toLowerCase();
    return (
      p.producto_nombre.toLowerCase().includes(term) ||
      p.producto_descripcion.toLowerCase().includes(term) ||
      p.categoria_nombre.toLowerCase().includes(term) ||
      String(p.precio).includes(term) ||
      String(p.stock).includes(term)
    );
  });

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Productos</h2>
        <button className="btn btn-success" onClick={abrirModalAgregar}>
          <i className="bi bi-plus-circle me-2"></i>Agregar Producto
        </button>
      </div>

      <div className="mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Buscar..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
        />
      </div>

      {productosFiltrados.length === 0 ? (
        <p>No se encontraron productos.</p>
      ) : (
        <table className="table table-striped">
          <thead className="table-light">
            <tr>
              <th>Nombre</th>
              <th>Descripción</th>
              <th>Categoría</th>
              <th>Precio</th>
              <th>Stock</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {productosFiltrados.map(p => (
              <tr key={p.id}>
                <td>{p.producto_nombre}</td>
                <td>{p.producto_descripcion}</td>
                <td>{p.categoria_nombre}</td>
                <td>S/ {p.precio.toFixed(2)}</td>
                <td>
                  {p.stock === 0 ? (
                    <span style={{ color: 'red', fontWeight: 'bold' }}>Agotado</span>
                  ) : (
                    p.stock
                    )}
                    </td>
                <td>
                  <button
                    className="btn btn-sm btn-outline-secondary me-2"
                    onClick={() => abrirModalEditar(p)}
                  >
                    <i className="bi bi-pencil"></i>
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => eliminarProducto(p.id, p.producto_nombre)}
                  >
                    <i className="bi bi-trash-fill"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {modalProducto.mostrar && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          role="dialog"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {modalProducto.editar ? 'Editar Producto' : 'Agregar Producto'}
                </h5>
                <button type="button" className="btn-close" onClick={cerrarModal}></button>
              </div>
              <div className="modal-body">
                <input
                  className="form-control mb-2"
                  placeholder="Nombre"
                  value={modalProducto.producto.nombre}
                  onChange={e =>
                    setModalProducto(prev => ({
                      ...prev,
                      producto: { ...prev.producto, nombre: e.target.value }
                    }))
                  }
                />
                <input
                  className="form-control mb-2"
                  placeholder="Descripción"
                  value={modalProducto.producto.descripcion}
                  onChange={e =>
                    setModalProducto(prev => ({
                      ...prev,
                      producto: { ...prev.producto, descripcion: e.target.value }
                    }))
                  }
                />
                <select
                  className="form-select mb-2"
                  value={String(modalProducto.producto.categoria)}
                  onChange={e =>
                    setModalProducto(prev => ({
                      ...prev,
                      producto: { ...prev.producto, categoria: e.target.value }
                    }))
                  }
                >
                  <option value="">Selecciona una categoría</option>
                  {categorias.map(cat => (
                    <option key={cat.id} value={String(cat.id)}>
                      {cat.nombre}
                    </option>
                  ))}
                </select>
                <input
                  className="form-control mb-2"
                  type="number"
                  placeholder="Precio"
                  value={modalProducto.producto.precio}
                  onChange={e =>
                    setModalProducto(prev => ({
                      ...prev,
                      producto: { ...prev.producto, precio: e.target.value }
                    }))
                  }
                />
                <input
                  className="form-control mb-2"
                  type="number"
                  placeholder="Stock"
                  value={modalProducto.producto.stock}
                  onChange={e =>
                    setModalProducto(prev => ({
                      ...prev,
                      producto: { ...prev.producto, stock: e.target.value }
                    }))
                  }
                />
              </div>
              <div className="modal-footer">
                <button className="btn btn-danger" onClick={cerrarModal}>
                  Cancelar
                </button>
                <button className="btn btn-success" onClick={guardarProducto}>
                  {modalProducto.editar ? 'Actualizar' : 'Guardar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Productos;
