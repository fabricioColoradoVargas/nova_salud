const mysql = require("mysql");

const db = mysql.createConnection({
    host: "host.docker.internal",
    user: "root",
    password: "",
    database: "nova_salud"
});


module.exports = db;
