const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'https://www.nfe.fazenda.gov.br/portal',
    supportFile: false,
    setupNodeEvents(on, config) {
      const sendEmail = require('./send-email');
      on('task', {
        enviarEmail(params) {
          return sendEmail(params);
        }
      });
    }
  }
});
