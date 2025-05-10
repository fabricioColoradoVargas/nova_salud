import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import Select from 'react-select';

export default function Ventas() {
  const [ventas, setVentas] = useState([]);
  const [productos, setProductos] = useState([]);
  const [detalleVenta, setDetalleVenta] = useState([]);
  const [modalDetalle, setModalDetalle] = useState({ mostrar: false, ventaId: null });
  const [loadingVentas, setLoadingVentas] = useState(true);
  const [rows, setRows] = useState([{ id: "", cantidad: "", precio: 0, subtotal: 0 }]);
  const [filtro, setFiltro] = useState("");
  const usuario = JSON.parse(localStorage.getItem("usuario"));

  useEffect(() => {
    fetchVentas();
    fetchProductos();
  }, []);

  function fetchVentas() {
    setLoadingVentas(true);
    fetch("http://localhost:3001/api/ventas/listar")
      .then((r) => r.json())
      .then((data) => {
        setVentas(data);
        setLoadingVentas(false);
      })
      .catch((err) => {
        console.error("Error al obtener ventas:", err);
        setLoadingVentas(false);
        Swal.fire("Error", "No se pudieron cargar las ventas", "error");
      });
  }

  function fetchProductos() {
    fetch("http://localhost:3001/api/productos/listar")
      .then((r) => r.json())
      .then(setProductos)
      .catch((err) => console.error("Error al obtener productos:", err));
  }

  function handleSearchInputChange(inputValue) {
    const trimmedValue = inputValue.trim();

    if (trimmedValue === "") {
      fetchProductos();
    } else if (trimmedValue.length >= 3) {
      fetch(`http://localhost:3001/api/productos/productos/buscar?producto=${trimmedValue}`)
        .then((r) => r.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setProductos(data);
          } else {
            console.error("La respuesta no es un array:", data);
            setProductos([]);
          }
        })
        .catch((err) => console.error("Error al buscar productos:", err));
    }
  }

  function addRow() {
    setRows([...rows, { id: "", cantidad: "", precio: 0, subtotal: 0 }]);
  }

  function removeRow(idx) {
    if (rows.length === 1) return;
    setRows(rows.filter((_, i) => i !== idx));
  }

  function onChangeRow(idx, field, val) {
    const newRows = [...rows];

    if (field === "id") {
      const prod = productos.find((p) => p.id === Number(val));
      const precio = prod ? prod.precio : 0;
      const cantidad = Number(newRows[idx].cantidad) > 0 ? Number(newRows[idx].cantidad) : 1;
      newRows[idx].id = val;
      newRows[idx].precio = precio;
      newRows[idx].cantidad = cantidad;
      newRows[idx].subtotal = precio * cantidad;
    } else if (field === "cantidad") {
      const cantidad = Number(val);
      const precio = Number(newRows[idx].precio) || 0;
      newRows[idx].cantidad = cantidad;
      newRows[idx].subtotal = precio * cantidad;
    }

    setRows(newRows);
  }

  const totalVenta = rows.reduce((sum, r) => sum + r.subtotal, 0);

  async function crearVenta() {
    if (!usuario) {
      Swal.fire("Error", "Debes iniciar sesión", "error");
      return;
    }
    if (rows.some((r) => !r.id || !r.cantidad || r.cantidad <= 0)) {
      Swal.fire("Error", "Todos los productos deben tener una cantidad válida (> 0)", "error");
      return;
    }

    const payload = {
      id_usuario: usuario.id,
      productos: rows.map((r) => ({
        id: Number(r.id),
        cantidad: Number(r.cantidad),
        subtotal: r.subtotal,
      })),
    };

    try {
      const res = await fetch("http://localhost:3001/api/ventas/crear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      Swal.fire("Éxito", data.message, "success");
      fetchVentas();
      setRows([{ id: "", cantidad: "", precio: 0, subtotal: 0 }]);
    } catch (err) {
      Swal.fire("Error", err.message, "error");
    }
  }

  function showDetalleModal(ventaId) {
    fetch(`http://localhost:3001/api/ventas/detalle/${ventaId}`)
      .then((r) => r.json())
      .then((data) => {
        setDetalleVenta(data);
        setModalDetalle({ mostrar: true, ventaId });
      })
      .catch((err) => {
        console.error("Error al obtener detalle:", err);
        Swal.fire("Error", "No se pudo cargar el detalle de la venta", "error");
      });
  }

  function closeDetalleModal() {
    setModalDetalle({ mostrar: false, ventaId: null });
    setDetalleVenta([]);
  }

  const ventasFiltradas = ventas.filter(v => {
    const termino = filtro.toLowerCase();
    return (
      v.id.toString().includes(termino) ||
      v.usuario_nombre.toLowerCase().includes(termino) ||
      new Date(v.fecha_venta).toLocaleString().toLowerCase().includes(termino) ||
      v.total_venta.toFixed(2).includes(termino)
    );
  });

  const customSelectStyles = {
    control: (base) => ({
      ...base,
      width: "100%",
      maxWidth: "300px", 
    }),
    menu: (base) => ({
      ...base,
      maxHeight: "200px", 
      overflowY: "auto", 
    }),
    option: (base) => ({
      ...base,
      whiteSpace: "normal", 
    }),
  };

  return (
    <div className="container mt-4">
      <h2>Crear Venta</h2>
      <table className="table">
        <thead>
          <tr>
            <th>Producto</th>
            <th>Cantidad</th>
            <th>Precio</th>
            <th>Subtotal</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              <td>
                <Select
                  className="form-control"
                  value={r.id ? { value: r.id, label: productos.find(p => p.id === Number(r.id))?.producto_nombre } : null}
                  onChange={(e) => onChangeRow(i, "id", e ? e.value : "")}
                  options={productos.map((p) => ({ value: p.id, label: p.producto_nombre }))}
                  isSearchable={true} 
                  onInputChange={handleSearchInputChange} 
                  placeholder="Selecciona un producto..."
                  styles={customSelectStyles} 
                />
              </td>
              <td>
                <input
                  type="number"
                  min="1"
                  className="form-control"
                  value={r.cantidad}
                  onChange={(e) => onChangeRow(i, "cantidad", e.target.value)}
                />
              </td>
              <td>
                <input
                  className="form-control"
                  value={`S/ ${r.precio.toFixed(2)}`}
                  disabled
                />
              </td>
              <td>
                <input
                  className="form-control"
                  value={`S/ ${r.subtotal.toFixed(2)}`}
                  disabled
                />
              </td>
              <td>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => removeRow(i)}
                >
                  <i className="bi bi-x-circle"></i>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={3} className="text-end">Total:</td>
            <td><strong>S/ {totalVenta.toFixed(2)}</strong></td>
            <td></td>
          </tr>
        </tfoot>
      </table>

      <div className="mb-4">
        <button className="btn btn-primary me-2" onClick={addRow}>
          <i className="bi bi-plus-circle me-1"></i> Agregar fila
        </button>
        <button className="btn btn-success" onClick={crearVenta}>
          <i className="bi bi-send me-1"></i> Guardar Venta
        </button>
      </div>

      <h2 className="mt-5">Listado de Ventas</h2>

      <div className="mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Buscar..."
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
        />
      </div>

      {loadingVentas ? (
        <p>Cargando ventas...</p>
      ) : (
        <table className="table table-striped">
          <thead className="table-light">
            <tr>
              <th>ID</th>
              <th>Usuario</th>
              <th>Fecha</th>
              <th>Total</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {ventasFiltradas.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center">
                  No hay ventas registradas
                </td>
              </tr>
            ) : ventasFiltradas.map((v) => (
              <tr key={v.id}>
                <td>{v.id}</td>
                <td>{v.usuario_nombre}</td>
                <td>{new Date(v.fecha_venta).toLocaleString()}</td>
                <td>S/ {v.total_venta.toFixed(2)}</td>
                <td>
                  <button className="btn btn-info btn-sm" onClick={() => showDetalleModal(v.id)}>
                    <i className="bi bi-eye me-1"></i> Ver detalle
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {modalDetalle.mostrar && (
        <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Detalle de Venta #{modalDetalle.ventaId}</h5>
                <button type="button" className="btn-close" onClick={closeDetalleModal}></button>
              </div>
              <div className="modal-body">
                {detalleVenta.length === 0 ? (
                  <p>Cargando detalle...</p>
                ) : (
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Producto</th>
                        <th>Cantidad</th>
                        <th>Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detalleVenta.map((d) => (
                        <tr key={d.detalle_id}>
                          <td>{d.producto_nombre}</td>
                          <td>{d.cantidad}</td>
                          <td>S/ {d.subtotal.toFixed(2)}</td>
                        </tr>
                      ))}
                      <tr>
                        <td colSpan="2" className="text-end fw-bold">Total</td>
                        <td className="fw-bold">
                          S/{" "}
                          {detalleVenta.reduce((total, d) => total + parseFloat(d.subtotal), 0).toFixed(2)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                )}
              </div>
              <div className="modal-footer">
                <button className="btn btn-danger" onClick={closeDetalleModal}>Cerrar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
