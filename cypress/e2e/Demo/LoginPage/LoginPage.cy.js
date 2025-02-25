import LoginPageUI from '../../../../ui/LoginPageUI'
import CommonPage from '../../../../pages/CommonPage'

describe("HomePage", () => {
    const loginPageUI = new LoginPageUI();
    const commonPage = new CommonPage();

    beforeEach("open login web", () => {
        cy.intercept("POST", `${Cypress.env("apiUrl")}/auth/login`).as(
            "login"
        );
        cy.fixture('user').as('userInfo');

        cy.visit(Cypress.env("baseUrl"))
    });

    describe('Login by GUI', () => {
        it('Login with valid info', function() {
            cy.get(loginPageUI.emmailInput).type(this.userInfo.validUser.email);
            cy.get(loginPageUI.passwordInput).type(this.userInfo.validUser.password);
            cy.get(loginPageUI.loginButton).click();
            cy.url().should("contain", "/dashboard/dash");
            commonPage.assertEleContainTextVisible(loginPageUI.toastSuccess, "Login Successfully");
            cy.get("@login").its("response").then((response) => {
                expect(response.statusCode).to.eq(200)
            });
        });

        it('Login with invalid username', function() {
            cy.get(loginPageUI.emmailInput).type(this.userInfo.invalidUser.email);
            cy.get(loginPageUI.passwordInput).type(this.userInfo.validUser.password);
            cy.get(loginPageUI.loginButton).click();
            cy.url().should("contain", "/auth/login");
            cy.get("@login").its("response").then((response) => {
                expect(response.statusCode).to.eq(400)
                expect(response.body.message).to.contain("Incorrect email or password.");
            });
        });

        it('Login with invalid password', function() {
            cy.get(loginPageUI.emmailInput).type(this.userInfo.validUser.email);
            cy.get(loginPageUI.passwordInput).type(this.userInfo.invalidUser.password);
            cy.get(loginPageUI.loginButton).click();
            cy.url().should("contain", "auth/login");
            commonPage.assertEleContainTextVisible(loginPageUI.toastErr, "Incorrect email or password");
            cy.get("@login").its("response").then((response) => {
                expect(response.statusCode).to.eq(400)
                expect(response.body.message).to.contain("Incorrect email or password.");
            });
        });
    });
});
