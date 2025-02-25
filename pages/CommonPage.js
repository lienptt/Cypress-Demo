class CommonPage {
    assertEleContainTextVisible($ele, text){
        cy.contains($ele, text).should('be.visible')
    }
}
export default CommonPage;