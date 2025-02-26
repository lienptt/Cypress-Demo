import HomePageUI from "../../../../ui/HomePageUI";
import LoginPageUI from "../../../../ui/LoginPageUI";
import CommonPage from "../../../../pages/CommonPage";

const homePageUI = new HomePageUI();
const loginPageUI = new LoginPageUI();
const commonPage = new CommonPage();
const CVVCode = Cypress._.random(100,999);
const nameOnCard = "Cypress Demo Lienptt";
const cardNumber = "4542 9931 9292 2293";

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

        cy.loginByGUI();
    })

    it('TC_01 Add product to cart', () => {
        cy.wait("@getAllProducts").its('response').then((response) => {
            const responseBody = response.body.data;
            cy.get(homePageUI.productItems).then(($listProduct) => {
                if ($listProduct.length > 0) {
                    cy.get(homePageUI.productName).first().invoke('text').then((productNameText) => {
                        const getProductInfo = responseBody.find(item => item.productName === productNameText);
                        cy.get(homePageUI.productItems + homePageUI.addToCartBtn).first().click();
                        cy.wait("@addToCart").then(({ request, response }) => {
                            // Assert add to cart success
                            expect(response.statusCode).to.eq(200);
                            expect(response.body.message).to.eq("Product Added To Cart");
                            commonPage.assertEleContainTextVisible(loginPageUI.toastSuccess, "Product Added To Cart");
                            expect(request.body.product._id).to.eq(getProductInfo._id);
                            expect(request.body.product.productName).to.eq(productNameText);

                            // Assert product info in cart
                            cy.get(homePageUI.cartBtn).click().then(() => {
                                cy.url().should('contain', "/dashboard/cart");
                                cy.get(homePageUI.cartInfoSection + homePageUI.itemNumber).should("contain", getProductInfo._id);
                                cy.get(homePageUI.cartInfoSection + " h3").should("have.text", productNameText);
                            })
                        })

                    });
                } else {
                    this.skip();
                }
            })
        });
    });

    it('TC_02 Buy product', () => {
        cy.get(homePageUI.productItems).then(($listProduct) => {
            if ($listProduct.length > 0) {
                cy.get(homePageUI.productItems + homePageUI.addToCartBtn).first().click();
                cy.wait("@addToCart").then(({ response }) => {
                    // Assert add to cart success
                    expect(response.statusCode).to.eq(200);
                    expect(response.body.message).to.eq("Product Added To Cart");

                    // Assert product info in cart
                    cy.get(homePageUI.cartBtn).click().then(() => {
                        cy.url().should('contain', "/dashboard/cart");
                        cy.get(homePageUI.buyNowBtn).first().click();
                        cy.url().should('contain', "/order");
                        cy.assertElementVisible(homePageUI.paymentInfoSection);
                        cy.get(homePageUI.cardNumberInput).clear().type(`${cardNumber}`+"{enter}");
                        const monthRandom = Cypress._.random(0, 11);
                        const dateRandom = Cypress._.random(0, 30);
                        cy.get(homePageUI.expiryDateDropdown).eq(0).select(monthRandom);
                        cy.get(homePageUI.expiryDateDropdown).eq(1).select(dateRandom);
                        cy.contains(".title", "CVV Code ").parent().then(($ele) => {
                            cy.wrap($ele).find("input").type(CVVCode);
                        })

                        cy.contains(".title", "Name on Card ").parent().then(($ele) => {
                            cy.wrap($ele).find("input").type(nameOnCard);
                        })

                        cy.get(homePageUI.userNameInput).clear().type(Cypress.env("email"));
                        cy.get(homePageUI.countrySelect).type("Vietnam{enter}");
                        cy.clickElementWithIndex(homePageUI.listCountryItems, 0)
                        cy.clickElement(homePageUI.submitBtn)
                        cy.url().should("contain", "/thanks");
                        commonPage.assertEleContainTextVisible(".hero-primary", "Thankyou for the order. ");
                    })
                })
            } else {
                this.skip();
            }
        })
    });
});