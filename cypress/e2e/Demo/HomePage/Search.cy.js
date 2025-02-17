import HomePageUI from "../../../../ui/HomePage";
import LoginPage from "../../../../pages/LoginPage";

const homePageUI = new HomePageUI();
const loginPage = new LoginPage();;

const productNameInput = "ZARA COAT 3";

describe("Filter search items", () => {
    beforeEach('Login with valid account', () => {
        cy.intercept("POST", `${Cypress.env("apiUrl")}auth/login`).as(
            "login"
        );
        loginPage.loginUser();
    })

    it('TC_01 Search by name', () => {
        cy.intercept("POST", `${Cypress.env("apiUrl")}product/get-all-products`).as(
            "getAllProducts"
        );
        cy.get(homePageUI.searchNameInput).type(productNameInput + "{enter}").then(() => {
            cy.wait("@getAllProducts").then(({ request, response }) => {
                expect(response.statusCode).to.equal(200);
                expect(request.body.productName).to.eq(productNameInput);
                cy.wrap(response.body.data).then(($responseData) => {
                    if ($responseData.length > 0) {
                        expect(response.body.message).to.eq("All Products fetched Successfully");
                        expect(response.body.data[0].productName).to.contain(productNameInput)
                    } else if ($responseData <= 0) {
                        expect(response.body.message).to.eq("No Products Found");
                    }
                });
            });
        });
    });
});