const express = require("express");
const app = express();
const cors = require("cors");

app.use(cors());
app.use(express.json());

const authRoutes = require("./routes/auth");
const productoRoutes = require("./routes/productos");
const categoriaRoutes = require("./routes/categorias");
const ventaRoutes = require("./routes/ventas");

app.use("/api/auth", authRoutes);
app.use("/api/productos", productoRoutes);
app.use("/api/categorias", categoriaRoutes);
app.use("/api/ventas", ventaRoutes);

app.listen(3001, () => {
    console.log("Servidor corriendo en el puerto 3001");
});
