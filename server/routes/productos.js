const express = require("express");
const router = express.Router();
const db = require("../config/db"); 

router.get("/listar", (req, res) => {
    try {
        const query = `
            SELECT
            p.id AS id,
            p.nombre AS producto_nombre,
            p.descripcion AS producto_descripcion,
            p.precio AS precio,
            p.stock AS stock,
            p.categoria,
            c.nombre AS categoria_nombre
            FROM productos p
            JOIN categorias c
            ON c.id = p.categoria
            WHERE p.estado = 1;
            `;
        db.query(query, (err, results) => {
            if (err) {
                console.error("Error al listar productos:", err);
                return res.status(500).json({ message: "Error al obtener productos" });
            }
            res.status(200).json(results);
        });
    } catch (error) {
        console.error("Error en el servidor:", error);
        res.status(500).json({ message: "Error inesperado" });
    }
});


router.post("/crear", (req, res) => {
    try {
        const { nombre, descripcion, categoria, precio, stock } = req.body;

        if (!nombre || !descripcion || !categoria || !precio || !stock) {
            return res.status(400).json({ message: "Faltan campos obligatorios" });
        }

        const query = "INSERT INTO productos (nombre, descripcion, categoria, precio, stock) VALUES (?, ?, ?, ?, ?)";
        db.query(query, [nombre, descripcion, categoria, precio, stock], (err, result) => {
            if (err) {
                console.error("Error al crear producto:", err);
                return res.status(500).json({ message: "Error al crear producto" });
            }
            res.status(201).json({ message: "Producto creado exitosamente" });
        });
    } catch (error) {
        console.error("Error en el servidor:", error);
        res.status(500).json({ message: "Error inesperado" });
    }
});

router.put("/actualizar/:id", (req, res) => {
    try {
        const { nombre, descripcion, categoria, precio, stock } = req.body;
        const { id } = req.params;

        if (!nombre || !descripcion || !categoria || !precio || !stock) {
            return res.status(400).json({ message: "Faltan campos obligatorios" });
        }

        const query = "UPDATE productos SET nombre = ?, descripcion = ?, categoria = ?, precio = ?, stock = ? WHERE id = ?";
        db.query(query, [nombre, descripcion, categoria, precio, stock, id], (err, result) => {
            if (err) {
                console.error("Error al actualizar producto:", err);
                return res.status(500).json({ message: "Error al actualizar producto" });
            }
            res.status(200).json({ message: "Producto actualizado exitosamente" });
        });
    } catch (error) {
        console.error("Error en el servidor:", error);
        res.status(500).json({ message: "Error inesperado" });
    }
});

router.put("/eliminar/:id", (req, res) => {
    try {
        const { id } = req.params;

        const query = "UPDATE productos SET estado = FALSE WHERE id = ?";
        db.query(query, [id], (err, result) => {
            if (err) {
                console.error("Error al desactivar producto:", err);
                return res.status(500).json({ message: "Error al desactivar producto" });
            }
            res.status(200).json({ message: "Producto desactivado exitosamente" });
        });
    } catch (error) {
        console.error("Error en el servidor:", error);
        res.status(500).json({ message: "Error inesperado" });
    }
});
    

module.exports = router;
