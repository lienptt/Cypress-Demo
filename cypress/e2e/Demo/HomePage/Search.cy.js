import HomePageUI from "../../../../ui/HomePageUI";
import LoginPageUI from "../../../../ui/LoginPageUI";
import CommonPage from "../../../../pages/CommonPage";
import HomePage from "../../../../pages/HomePage";

const homePageUI = new HomePageUI();
const loginPageUI = new LoginPageUI();
const commonPage = new CommonPage();
const homePage = new HomePage();
const categories = ["fashion", "electronics", "household"];

describe("Filter search items", () => {
    beforeEach('Login with valid account', () => {
        cy.intercept("POST", `${Cypress.env("apiUrl")}/auth/login`).as(
            "login"
        );

        cy.loginByGUI();
    })

    it('TC_01 Search by name', () => {
        cy.intercept("POST", `${Cypress.env("apiUrl")}/product/get-all-products`).as(
            "getAllProducts"
        );
        cy.get(homePageUI.productItems).then(($listProduct) => {
            if ($listProduct.length > 0) {
                cy.get(homePageUI.productName).first().invoke('text').then((productNameText) => {
                    cy.get(homePageUI.searchNameInput).type(productNameText + "{enter}").then(() => {
                        cy.wait("@getAllProducts").then(({ request, response }) => {
                            homePage.assertSearchSuccess(request, response, productNameText, "All Products fetched Successfully");
                            expect(response.body.data.length).to.be.greaterThan(0);
                            expect(response.body.data[0].productName).to.contain(productNameText);
                        });
                    })
                });
            } else {
                this.skip();
            }
        })
    });

    it('TC_02 Search by name -  no items matched', () => {
        cy.intercept("POST", `${Cypress.env("apiUrl")}/product/get-all-products`).as(
            "getAllProducts"
        );

        cy.get(homePageUI.productName).first().invoke('text').then((productNameText) => {
            const invalidProductname = productNameText + Cypress._.random(1, 100); 
            cy.get(homePageUI.searchNameInput).type(invalidProductname + "{enter}").then(() => {
                cy.wait("@getAllProducts").then(({ request, response }) => {
                    homePage.assertSearchSuccess(request, response, invalidProductname, "No Products Found");
                    expect(response.body.data.length).to.eq(0)
                    commonPage.assertEleContainTextVisible(loginPageUI.toastErr, "No Products Found");
                });
            });
        });
    });

    it('TC_03 Filter Categories', () => {
        const index = Cypress._.random(categories.length - 1); // Radom categories filter index
        cy.contains("#sidebar .form-group label", categories[index]).parent().then(($ele) => {
            cy.intercept('POST', `${Cypress.env("apiUrl")}/product/get-all-products`
            ).as('getAllProducts');

            cy.wrap($ele).find("input[type='checkbox']").click().then(() => {
                cy.wait("@getAllProducts").then(({ request, response }) => {
                    const responseBody = response.body;
                    // Assert request, response API get-all-products & UI list
                    commonPage.expectStatusCode200(response);
                    expect(request.body.productCategory[0]).to.eq(categories[index]);
                    cy.wrap(responseBody.count).then((itemCount) => {
                        if (itemCount > 0) {
                            //Assert total & category response
                            expect((responseBody.data).length).to.eq(itemCount);
                            expect(responseBody.data[0].productCategory).to.eq(categories[index]);

                            // Assert UI list products vs response API get-all-products
                            cy.get(homePageUI.productItems).then((items) => {
                                expect(items.length).to.eq(itemCount);
                            })
                        } else {
                            // Assert UI & API case list product is empty
                            expect(responseBody.message).to.eq("No Products Found");
                            commonPage.assertEleContainTextVisible(loginPageUI.toastErr, "No Products Found");
                            expect(responseBody.data.length).to.eq(0);
                        }
                    })
                })
            })
        })
    })
});