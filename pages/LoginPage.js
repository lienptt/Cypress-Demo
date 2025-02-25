import LoginPageUI from '../ui/LoginPageUI';
const loginPageUI = new LoginPageUI();

class LoginPage {
  loginUser() {
    cy.session(["LoginByGUI with", Cypress.env("email")], () => {
      cy.visit(Cypress.env("baseUrl"));
      cy.get(loginPageUI.emmailInput).type(Cypress.env("email"));
      cy.get(loginPageUI.passwordInput).type(Cypress.env("password"));
      cy.get(loginPageUI.loginButton).click();
      cy.url().should("contain", "/dashboard/dash");
      cy.contains(loginPageUI.toastSuccess, "Login Successfully").should("be.visible");
      cy.get("@login").its("response").then((response) => {
        expect(response.statusCode).to.eq(200)
      });
    });
    cy.visit(Cypress.env("baseUrl") + Cypress.env("dashboardUrl"));
  }
}

export default LoginPage;