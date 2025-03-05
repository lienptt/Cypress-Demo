import HomePageUI from "../../../../ui/HomePageUI";
import CommonPage from "../../../../pages/CommonPage";
import HomePage from "../../../../pages/HomePage";

const homePageUI = new HomePageUI();
const homePage = new HomePage();
const commonPage = new CommonPage();

describe("Add to cart", () => {
    beforeEach('Login with valid account', () => {
        cy.intercept("POST", `${Cypress.env("apiUrl")}/auth/login`).as(
            "login"
        );

        cy.intercept("POST", `${Cypress.env("apiUrl")}/user/add-to-cart`).as(
            "addToCart"
        );

        cy.intercept("POST", `${Cypress.env("apiUrl")}/product/get-all-products`).as(
            "getAllProducts"
        );

        cy.intercept("GET", `${Cypress.env("apiUrl")}/order/get-orders-for-customer/67603773e2b5443b1ff5b05e`).as(
            "getOrdersForCustomer"
        );

        cy.loginByGUI();
    })

    it('TC_01 Add product to cart', () => {
        cy.wait("@getAllProducts").its('response').then((response) => {
            const allProductsResponseData = response.body.data;
            cy.get(homePageUI.productItems).then(($listProduct) => {
                if ($listProduct.length > 0) {
                    homePage.addToCart(allProductsResponseData);
                } else {
                    this.skip();
                }
            })
        });
    });

    it('TC_02 Place an order', () => {
        cy.wait("@getAllProducts").its('response').then((response) => {
            const allProductsResponseData = response.body.data;
            cy.get(homePageUI.productItems).then(($listProduct) => {
                if ($listProduct.length > 0) {
                    homePage.addToCart(allProductsResponseData);
                    homePage.placeOrder();
                } else {
                    this.skip();
                }
            });
        });
    });


    it('TC_03 View & delete list order', () => {
        cy.get(homePageUI.ordersBtn).click().then(() => {
            cy.url().should("contain", "/dashboard/myorders");
            cy.wait("@getOrdersForCustomer").its("response").then((response) => {
                commonPage.expectStatusCode200(response);
                cy.wrap(response.body.data).then((responseData) => {
                    const orderCount = responseData.length;
                    if (orderCount > 0) {
                        // Assert for rule Maximum order count: 7
                        expect(response.body.count).not.to.be.greaterThan(7);
                    } else if (orderCount <= 0) {
                        cy.log("Don't have any order => add to cart & order")
                        // Redirect to Dasboard & place an order
                        commonPage.redirectToTab("");
                        cy.wait("@getAllProducts").its('response').then((response) => {
                            const allProductsResponseData = response.body.data;
                            cy.get(homePageUI.productItems).then(($listProduct) => {
                                if ($listProduct.length > 0) {
                                    homePage.addToCart(allProductsResponseData);
                                    commonPage.redirectToTab("cart");
                                    homePage.placeOrder();
                                } else {
                                    this.skip();
                                }
                            })
                        });
                    }

                    // Delete order
                    commonPage.redirectToTab("myorders");
                    cy.wrap(".table .ng-star-inserted").then(($body)=>{
                        cy.get($body + " [scope='row']").first().invoke("text").then((firstOrderId)=>{
                            cy.intercept("DELETE", `${Cypress.env("apiUrl")}/order/delete-order/` + `${firstOrderId}`).as(
                                "deleteOrder"
                            );
                            cy.contains($body + " .btn-danger", "Delete").first().click();
                            cy.wait("@deleteOrder").its("response").then((response)=>{
                                commonPage.expectStatusCode200(response);
                                // Assert UI toast & list not contain deleted order
                                expect(response.body.message).to.eq("Orders Deleted Successfully");
                                cy.contains($body + " [scope='row']", firstOrderId).should("not.exist");
                            });
                        });
                    });
                });
            });
        });
    });
});