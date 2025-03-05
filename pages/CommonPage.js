class CommonPage {
    assertEleContainTextVisible($ele, text) {
        cy.contains($ele, text).should('be.visible')
    }

    expectStatusCode200($response) {
        expect($response.statusCode).to.eq(200);
    }

    redirectToTab(path) {
        cy.get(".btn.btn-custom[routerlink='/dashboard/" + `${path}` + "']").click();
    }
}
export default CommonPage;