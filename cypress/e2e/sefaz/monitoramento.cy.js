const estadoFile = 'cypress/fixtures/estadoAnterior.json';
const registroFile = 'cypress/fixtures/registrosQuedas.json';

describe('Monitoramento Tabela NF-e com log e email', () => {
  it('Verifica, registra e envia email se serviço cair', () => {
    cy.visit('/disponibilidade.aspx');
    cy.get('table').should('be.visible');

    const estadoAtual = [];
    const autorizadores = [];

    cy.get('table tr').each(($row, rowIndex) => {
      if (rowIndex === 0) return;

      const autorizador = $row.find('td').first().text().trim();
      const $img = $row.find('img');
        const src = $img.attr('src') || '';

        let status = 'desconhecido';
        if (src.includes('verde')) {
            status = 'verde';
        } else if (src.includes('amarelo')) {
            status = 'amarelo';
        } else if (src.includes('vermelho')) {
            status = 'vermelho';
        }

      autorizadores.push(autorizador);
      estadoAtual.push(status);
    }).then(() => {
      cy.writeFile(estadoFile, estadoAtual);

      cy.readFile(estadoFile, { timeout: 1000 }).then((estadoAnterior) => {
        const quedas = [];
        if (estadoAnterior && Array.isArray(estadoAnterior)) {
          estadoAtual.forEach((status, index) => {
            if (estadoAnterior[index] !== status) {
              const autorizador = autorizadores[index];
              const agora = new Date().toLocaleString('pt-BR');

              cy.log(`🔔 Mudança detectada no autorizador ${autorizador}: de ${estadoAnterior[index]} para ${status} em ${agora}`);
              if (status === 'vermelho' || status === 'amarelo') {
                quedas.push({
                  autorizador,
                  status,
                  dataHora: agora
                });

                const fileName = `queda-${autorizador}-${agora.replace(/[/:]/g, '-')}`;
                cy.screenshot(fileName);

                cy.task('enviarEmail', {
                  autorizador,
                  status,
                  dataHora: agora,
                  screenshotPath: `cypress/screenshots/${fileName}.png`
                });
              }
            }
          });
        }

        if (quedas.length) {
          cy.readFile(registroFile, { timeout: 1000, log: false }).then((registroAnterior) => {
            const registros = registroAnterior && Array.isArray(registroAnterior) ? registroAnterior : [];
            const novosRegistros = registros.concat(quedas);
            cy.writeFile(registroFile, novosRegistros);
          });
        }
      });
    });
  });
});
