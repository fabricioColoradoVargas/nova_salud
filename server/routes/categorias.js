const express = require("express");
const router = express.Router();
const db = require("../config/db"); 

router.get("/listar", (req, res) => {
    try {
        const query = "SELECT * FROM categorias";
        db.query(query, (err, results) => {
            if (err) {
                console.error("Error al listar categorías:", err);
                return res.status(500).json({ message: "Error al obtener categorías" });
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
        const { nombre, descripcion } = req.body;

        if (!nombre || !descripcion) {
            return res.status(400).json({ message: "Faltan campos obligatorios" });
        }

        const query = "INSERT INTO categorias (nombre, descripcion) VALUES (?, ?)";
        db.query(query, [nombre, descripcion], (err, result) => {
            if (err) {
                console.error("Error al crear categoría:", err);
                return res.status(500).json({ message: "Error al crear categoría" });
            }
            res.status(201).json({ message: "Categoría creada exitosamente" });
        });
    } catch (error) {
        console.error("Error en el servidor:", error);
        res.status(500).json({ message: "Error inesperado" });
    }
});

router.put("/actualizar/:id", (req, res) => {
    try {
        const { nombre, descripcion } = req.body;
        const { id } = req.params;

        if (!nombre || !descripcion) {
            return res.status(400).json({ message: "Faltan campos obligatorios" });
        }

        const query = "UPDATE categorias SET nombre = ?, descripcion = ? WHERE id = ?";
        db.query(query, [nombre, descripcion, id], (err, result) => {
            if (err) {
                console.error("Error al actualizar categoría:", err);
                return res.status(500).json({ message: "Error al actualizar categoría" });
            }
            res.status(200).json({ message: "Categoría actualizada exitosamente" });
        });
    } catch (error) {
        console.error("Error en el servidor:", error);
        res.status(500).json({ message: "Error inesperado" });
    }
});

router.delete("/eliminar/:id", (req, res) => {
    try {
        const { id } = req.params;

        const query = "DELETE FROM categorias WHERE id = ?";
        db.query(query, [id], (err, result) => {
            if (err) {
                console.error("Error al eliminar categoría:", err);
                return res.status(500).json({ message: "Error al eliminar categoría" });
            }
            res.status(200).json({ message: "Categoría eliminada exitosamente" });
        });
    } catch (error) {
        console.error("Error en el servidor:", error);
        res.status(500).json({ message: "Error inesperado" });
    }
});

module.exports = router;
