class HomePageUI{
    searchNameInput = "div[class='py-2 border-bottom ml-3'] input[placeholder='search']";
    productItems = "#products .card";
    productName = ".card-body h5";
    addToCartBtn = " .btn.w-10.rounded";
    cartBtn = ".btn.btn-custom[routerlink='/dashboard/cart']";
    productItemsInCart = ".cart .items .infoWrap";
    cartInfoSection  = " .cartSection";
    itemNumber = " .itemNumber"
    buyNowBtn = " .cartSection .btn-primary";
    paymentInfoSection = ".payment__info";
    cardNumberInput = ".payment__cc .input.text-validated";
    expiryDateDropdown = "select.input.ddl"
    userNameInput = ".details__user .user__name .ng-valid";
    countrySelect = "input[placeholder='Select Country']";
    listCountryItems = ".ta-item.list-group-item";
    submitBtn = ".action__submit";
}

export default HomePageUI;