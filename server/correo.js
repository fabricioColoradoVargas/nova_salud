const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "novasalud603@gmail.com",
    pass: "lvkn qnse jtlp sbfz",
  },
});

function enviarAlertaStockBajo(productos) {
  const filas = productos.map(p => {
    const stockDisplay = p.stock === 0
      ? '<span style="color: red; font-weight: bold;">Agotado</span>'
      : `${p.stock} unidades`;

    return `
      <tr>
        <td style="padding: 10px; border: 1px solid #dee2e6;">${p.nombre}</td>
        <td style="padding: 10px; border: 1px solid #dee2e6;">${stockDisplay}</td>
      </tr>
    `;
  }).join("");

  const mailOptions = {
    from: "novasalud603@gmail.com",
    to: "coloradovargasfabricio@gmail.com",
    subject: "Aviso de Stock Bajo - Nova Salud",
    html: `
      <div style="font-family: 'Segoe UI', sans-serif; padding: 24px; background-color: #ffffff; color: #212529; border-radius: 8px; border: 1px solid #ced4da; max-width: 640px; margin: auto;">
        <h2 style="color: #198754; margin-bottom: 8px;">Aviso de productos con stock bajo</h2>
        <p style="font-size: 16px; line-height: 1.5;">
          Estimado equipo de <strong>Nova Salud</strong>,<br><br>
          Se detectaron productos cuyo stock actual es inferior al nivel mínimo recomendado. A continuación, se detallan los artículos:
        </p>
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
          <thead>
            <tr style="background-color: #e9ecef;">
              <th style="padding: 10px; border: 1px solid #dee2e6; text-align: left;">Producto</th>
              <th style="padding: 10px; border: 1px solid #dee2e6; text-align: left;">Stock Disponible</th>
            </tr>
          </thead>
          <tbody>
            ${filas}
          </tbody>
        </table>
        <p style="margin-top: 24px;">
          Por favor, considere gestionar el reabastecimiento para mantener la disponibilidad continua de estos productos en nuestra farmacia.
        </p>
        <p style="margin-top: 32px; font-size: 14px; color: #6c757d;">
          Este mensaje fue generado automáticamente por el sistema de gestión de ventas de Nova Salud.
        </p>
      </div>
    `,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error al enviar correo:", error);
    } else {
      console.log("Correo enviado:", info.response);
    }
  });
}

module.exports = { enviarAlertaStockBajo };
