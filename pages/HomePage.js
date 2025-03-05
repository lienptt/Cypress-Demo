import HomePageUI from "../ui/HomePageUI";
import CommonPage from "./CommonPage";
import LoginPageUI from "../ui/LoginPageUI";

const homePageUI = new HomePageUI;
const commonPage = new CommonPage;
const loginPageUI = new LoginPageUI;
const CVVCode = Cypress._.random(100, 999);
const nameOnCard = "Cypress Demo Lienptt";
const cardNumber = "4542 9931 9292 2293";

class HomePage {
    addToCart(responseBody) {
        cy.get(homePageUI.productName).first().invoke('text').then((productNameText) => {
            const getProductInfo = responseBody.find(item => item.productName === productNameText);
            cy.get(homePageUI.productItems + homePageUI.addToCartBtn).first().click();

            // Assert add to cart success
            this.assertAddToCartSuccess(getProductInfo, productNameText);

            // Assert product info in cart
            this.assertProductInfoInCart(getProductInfo, productNameText);
        });
    }

    placeOrder(){
        //Redirect to order screen
        cy.get(homePageUI.buyNowBtn).first().click();
        cy.url().should('contain', "/order");
        cy.assertElementVisible(homePageUI.paymentInfoSection);

        /* Input Personal Information */
        this.inputCardNumber(cardNumber);
        // Choose Expiry Date
        this.chooseExpiryDate();
        //Input CVV
        this.inputCVVorNameCard("CVV Code ", CVVCode);
        // Input Name on card
        this.inputCVVorNameCard("Name on Card ", nameOnCard);

        /* Input Shipping Information*/
        this.inputShippingInfo()
        
        /* Assert submit order success*/
        cy.clickElement(homePageUI.submitBtn);
        cy.url().should("contain", "/thanks");
        commonPage.assertEleContainTextVisible(".hero-primary", "Thankyou for the order. ");
    }

    inputCardNumber(cardNumber){
        cy.get(homePageUI.cardNumberInput).clear().type(`${cardNumber}` + "{enter}");
    }

    chooseExpiryDate(){
        const monthRandom = Cypress._.random(0, 11);
        const dateRandom = Cypress._.random(0, 30);
        cy.get(homePageUI.expiryDateDropdown).eq(0).select(monthRandom);
        cy.get(homePageUI.expiryDateDropdown).eq(1).select(dateRandom);
    }

    inputCVVorNameCard(fieldName, text){
        cy.contains(".title", fieldName).parent().then(($ele) => {
            cy.wrap($ele).find("input").type(text);
        })
    }

    inputShippingInfo(){
        cy.get(homePageUI.userNameInput).clear().type(Cypress.env("email"));
        cy.get(homePageUI.countrySelect).type("Vietnam{enter}");
        cy.clickElementWithIndex(homePageUI.listCountryItems, 0);
    }

    assertAddToCartSuccess(getProductInfo, productNameText) {
        cy.wait("@addToCart").then(({ request, response }) => {
            commonPage.expectStatusCode200(response);
            expect(response.body.message).to.eq("Product Added To Cart");
            commonPage.assertEleContainTextVisible(loginPageUI.toastSuccess, "Product Added To Cart");
            expect(request.body.product._id).to.eq(getProductInfo._id);
            expect(request.body.product.productName).to.eq(productNameText);
        });
    }

    assertProductInfoInCart(getProductInfo, productNameText) {
        cy.get(homePageUI.cartBtn).click().then(() => {
            cy.url().should('contain', "/dashboard/cart");
            cy.get(homePageUI.cartInfoSection + homePageUI.itemNumber).should("contain", getProductInfo._id);
            cy.get(homePageUI.cartInfoSection + " h3").should("have.text", productNameText);
        });
    }

    assertSearchSuccess(request, response,productNameText, messageText) {
        commonPage.expectStatusCode200(response);
        expect(request.body.productName).to.eq(productNameText);
        expect(response.body.message).to.eq(messageText);
    }
}
export default HomePage;