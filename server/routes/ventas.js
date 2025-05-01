const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { enviarAlertaStockBajo } = require("../correo");

router.get("/listar", (req, res) => {
  try {
    const query = `
      SELECT 
        v.id,
        v.fecha_venta,
        v.total_venta,
        CONCAT(u.nombre, ' ', u.apellido) AS usuario_nombre
      FROM ventas v
      JOIN usuarios u ON v.id_usuario = u.id
      ORDER BY v.fecha_venta DESC
    `;
    db.query(query, (err, results) => {
      if (err) {
        console.error("Error al listar ventas:", err);
        return res.status(500).json({ message: "Error al obtener ventas" });
      }
      res.status(200).json(results);
    });
  } catch (error) {
    console.error("Error en el servidor:", error);
    res.status(500).json({ message: "Error inesperado" });
  }
});

router.get("/detalle/:id", (req, res) => {
  try {
    const { id } = req.params;
    const query = `
      SELECT 
        dv.id AS detalle_id,
        p.nombre AS producto_nombre,
        dv.cantidad,
        dv.subtotal
      FROM detalle_venta dv
      JOIN productos p ON dv.id_producto = p.id
      WHERE dv.id_venta = ?
    `;
    db.query(query, [id], (err, results) => {
      if (err) {
        console.error("Error al obtener los detalles de la venta:", err);
        return res.status(500).json({ message: "Error al obtener los detalles de la venta" });
      }
      if (results.length === 0) {
        return res.status(404).json({ message: "Detalles de la venta no encontrados" });
      }
      res.status(200).json(results);
    });
  } catch (error) {
    console.error("Error en el servidor:", error);
    res.status(500).json({ message: "Error inesperado" });
  }
});

router.post("/crear", (req, res) => {
  const { id_usuario, productos } = req.body;

  if (!id_usuario || !Array.isArray(productos) || productos.length === 0) {
    return res.status(400).json({ message: "Datos de venta incompletos" });
  }

  const validaciones = productos.map(p => new Promise((resolve, reject) => {
    const query = "SELECT nombre, stock FROM productos WHERE id = ?";
    db.query(query, [p.id], (err, results) => {
      if (err) return reject(err);
      if (results.length === 0) return reject(new Error("Producto no encontrado"));

      const producto = results[0];
      const stockActual = Number(producto.stock);
      const cantidadSolicitada = Number(p.cantidad);

      if (stockActual < cantidadSolicitada) {
        return reject(new Error(`Stock insuficiente para "${producto.nombre}". Stock actual: ${stockActual}, solicitado: ${cantidadSolicitada}`));
      }

      resolve(); 
    });
  }));

  Promise.all(validaciones)
    .then(() => {
      const total = productos.reduce((sum, p) => sum + Number(p.subtotal), 0);
      const insertVenta = "INSERT INTO ventas (id_usuario, fecha_venta, total_venta) VALUES (?, NOW(), ?)";
      db.query(insertVenta, [id_usuario, total], (err, result) => {
        if (err) {
          console.error("Error al crear venta:", err);
          return res.status(500).json({ message: "Error al crear venta" });
        }

        const ventaId = result.insertId;
        const detalleValues = productos.map(p => [ventaId, p.id, p.cantidad, p.subtotal]);
        const insertDetalle = "INSERT INTO detalle_venta (id_venta, id_producto, cantidad, subtotal) VALUES ?";

        db.query(insertDetalle, [detalleValues], (err2) => {
          if (err2) {
            console.error("Error al crear detalle_venta:", err2);
            return res.status(500).json({ message: "Error al crear detalle de venta" });
          }

          const productosBajoStock = [];

          const updates = productos.map(p => new Promise((resolve, reject) => {
            const descontar = "UPDATE productos SET stock = stock - ? WHERE id = ?";
            db.query(descontar, [p.cantidad, p.id], (uErr) => {
              if (uErr) return reject(uErr);

              const consultarStock = "SELECT nombre, stock FROM productos WHERE id = ?";
              db.query(consultarStock, [p.id], (sErr, results) => {
                if (sErr) return reject(sErr);

                const producto = results[0];
                if (producto.stock < 5) {
                  productosBajoStock.push({
                    nombre: producto.nombre,
                    stock: producto.stock
                  });
                }
                resolve();
              });
            });
          }));

          Promise.all(updates)
            .then(() => {
              if (productosBajoStock.length > 0) {
                enviarAlertaStockBajo(productosBajoStock);
              }
              res.status(201).json({ message: "Venta creada correctamente", ventaId });
            })
            .catch(stockErr => {
              console.error("Error al descontar stock:", stockErr);
              res.status(500).json({ message: "Venta registrada, pero falló actualización de stock" });
            });
        });
      });
    })
    .catch(err => {
      console.error("Stock insuficiente:", err.message);
      res.status(400).json({ message: `No se pudo completar la venta: Stock insuficiente` });
    });
});

module.exports = router;
