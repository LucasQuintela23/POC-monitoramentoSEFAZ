const nodemailer = require('nodemailer');
const fs = require('fs');

module.exports = (params) => {
  const { autorizador, status, dataHora, screenshotPath } = params;

  const transporter = nodemailer.createTransport({
    host: 'smtp.seuservidor.com',
    port: 587,
    secure: false,
    auth: {
      user: 'seu-email@dominio.com',
      pass: 'sua-senha'
    }
  });

  const mailOptions = {
    from: '"Monitor NF-e" <seu-email@dominio.com>',
    to: 'destinatario@empresa.com',
    subject: `⚠️ Instabilidade detectada: ${autorizador}`,
    text: `Boa noite pessoal, tudo bem??\n\nPercebemos algumas instabilidades na SEFAZ ${autorizador}.\n\nHá alguma instabilidade detectada por vocês? Temos alguma previsão de normalizar os serviços?\nHá expectativa para ativação do ambiente de contingência?\n\nData e Hora da queda: ${dataHora}\n\nAtenciosamente.`,
    attachments: [
      {
        filename: `queda-${autorizador}.png`,
        content: fs.createReadStream(screenshotPath)
      }
    ]
  };

  return transporter.sendMail(mailOptions)
    .then(() => {
      console.log(`📧 Email enviado para ${mailOptions.to} sobre ${autorizador}`);
      return true;
    })
    .catch((error) => {
      console.error(`Erro ao enviar email: ${error}`);
      throw error;
    });
};
