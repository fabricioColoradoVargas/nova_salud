const express = require("express");
const router = express.Router();
const db = require("../config/db"); 

router.post("/login", (req, res) => {
    try {
        const { correo, contraseña } = req.body;

        if (!correo || !contraseña) {
            return res.status(400).json({ message: "Faltan correo o contraseña" });
        }
        const query = "SELECT * FROM usuarios WHERE correo = ?";
        db.query(query, [correo], (err, results) => {
            if (err) {
                console.error("Error en la consulta:", err);
                return res.status(500).json({ message: "Error al consultar el usuario" });
            }
            if (results.length === 0) {
                return res.status(401).json({ message: "Correo o contraseña incorrectos" });
            }
            const usuario = results[0];
            if (usuario.contraseña !== contraseña) {
                return res.status(401).json({ message: "Correo o contraseña incorrectos" });
            }
            res.status(200).json({
                message: "Login exitoso",
                usuario: {
                    id: usuario.id,
                    nombre: usuario.nombre,
                    apellido: usuario.apellido,
                    correo: usuario.correo
                }
            });
        });
    } catch (error) {
        console.error("Error en el servidor:", error);
        res.status(500).json({ message: "Error inesperado en el servidor" });
    }
});


router.post("/register", (req, res) => {
    const { nombre, apellido, correo, contraseña } = req.body;

    if (!nombre || !apellido || !correo || !contraseña) {
        return res.status(400).json({ message: "Faltan campos obligatorios" });
    }
    const query = "INSERT INTO usuarios (nombre, apellido, correo, contraseña, fecha_creacion) VALUES (?, ?, ?, ?, NOW())";
    
    db.query(query, [nombre, apellido, correo, contraseña], (err, result) => {
        if (err) {
            console.error("Error al registrar usuario:", err);
            return res.status(500).json({ message: "Error en el servidor" });
        }
        res.status(201).json({ message: "Usuario registrado con éxito" });
    });
});

module.exports = router;
