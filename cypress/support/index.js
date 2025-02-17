require('./commands.js')

before(function () {
  // cy.visit(Cypress.env('login_url'));
});

const username = Cypress.env('username');
const password = Cypress.env('password');

