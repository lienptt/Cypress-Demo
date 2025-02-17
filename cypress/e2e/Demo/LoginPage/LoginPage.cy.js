import LoginPageUI from '../../../../ui/LoginPageUI'

describe("HomePage", () => {
    const loginPageUI = new LoginPageUI();

    beforeEach("open login web", () => {
        cy.intercept("POST", `${Cypress.env("apiUrl")}auth/login`).as(
            "login"
        );

        cy.visit(Cypress.env("baseUrl"))
    });

    describe('Login by GUI', () => {
        it('Login with valid info', () => {
            cy.get(loginPageUI.emmailInput).type(Cypress.env("email"));
            cy.get(loginPageUI.passwordInput).type(Cypress.env("password"));
            cy.get(loginPageUI.loginButton).click();
            cy.url().should("contain", "/dashboard/dash");
            cy.contains(loginPageUI.toastSuccess, "Login Successfully").should("be.visible");
            cy.get("@login").its("response").then((response) => {
                expect(response.statusCode).to.eq(200)
            });
        });

        it('Login with invalid username', () => {
            cy.visit(Cypress.env("baseUrl"));
            cy.get(loginPageUI.emmailInput).type("invalidEmail@gmail.com");
            cy.get(loginPageUI.passwordInput).type("123Abc^");
            cy.get(loginPageUI.loginButton).click();
            cy.url().should("contain", "auth/login");
            cy.contains(loginPageUI.toastErr, "Incorrect email or password").should("be.visible");
            cy.get("@login").its("response").then((response) => {
                expect(response.statusCode).to.eq(400)
                expect(response.body.message).to.contain("Incorrect email or password.");
            });
        });

        it('Login with invalid password', () => {
            cy.visit(Cypress.env("baseUrl"));
            cy.get(loginPageUI.emmailInput).type(Cypress.env("email"));
            cy.get(loginPageUI.passwordInput).type("123Abc^");
            cy.get(loginPageUI.loginButton).click();
            cy.url().should("contain", "auth/login");
            cy.contains(loginPageUI.toastErr, "Incorrect email or password").should("be.visible");
            cy.get("@login").its("response").then((response) => {
                expect(response.statusCode).to.eq(400)
                expect(response.body.message).to.contain("Incorrect email or password.");
            });
        });
    });
});
