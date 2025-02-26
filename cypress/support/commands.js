
let LOCAL_STORAGE = {};

const username = Cypress.env("email");
const password = Cypress.env("password");

Cypress.Commands.add("loginByGUI", () => {
  cy.session([Cypress.env("email"), Cypress.env("email")], () => {
    cy.visit(Cypress.env("baseUrl"));
    cy.get("#userEmail").clear().type(Cypress.env("email"));
    cy.get("#userPassword").clear().type(Cypress.env("password"), { sensitive: true });
    cy.get(".login-btn").click();
    cy.intercept("POST", `${Cypress.env("apiUrl")}auth/login`).as("login");

    cy.wait("@login").its("response.statusCode").should("eq", 200);
    cy.url().should("contain", Cypress.env("dashboardUrl"));
  });
  cy.visit(Cypress.env("baseUrl"))
})

// Caching session when logging in via API
Cypress.Commands.add(
  "loginByAPI",
  (username, password, { cacheSession = false } = {}) => {
    cy.log("Logging using API");
    cy.session([username, password], () => {
      cy.request({
        method: "POST",
        url: `${Cypress.env("apiUrl")}/sso/api/login`,
        body: {
          username,
          password,
        },
      }).then(({ body }) => {
        const {
          data: { app_url, token, ttl },
        } = body;
        cy.setCookie("token", token);
        cy.getCookie("token").should("have.property", "value", token);
      });
    });
  }
);

Cypress.Commands.add("loginByAPI_sample", (username, password) => {
  cy.log("Logging using API");
  cy.request({
    method: "POST",
    url: `${Cypress.env("apidn")}/sso/api/login`,
    body: {
      username,
      password,
    },
  }).then(({ body }) => {
    const {
      data: { app_url, token, ttl },
    } = body;
    cy.setCookie("token", token);

    cy.request({
      method: "GET",
      url: `${Cypress.env("apidn")}/sso/api/user`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then(({ body }) => {
      const userItem = ({
        data: {
          app: body.data.app,
          email: body.data.email,
          full_name: body.data.full_name,
          id: body.data.id,
          phone: body.data.phone,
          username: body.data.username,
          // id, app, email, full_name, phone,
        },
      } = body);
      window.localStorage.setItem("persist:primary", JSON.stringify(userItem));
    });

    cy.request({
      method: "GET",
      url: `${Cypress.env("apidn")}/console/user/setting`,
      headers: {
        Authorization: `VTCCSSO ${token}`,
      },
    }).then(({ body }) => {
      const userItem = ({
        data: {
          default_organization: body.data.default_organization,
          first_setting: body.data.first_setting,
        },
      } = body);
      window.localStorage.setItem("persist:primary", JSON.stringify(userItem));
    });
  });
});

Cypress.Commands.add("getAndSetToken", () => {
  Cypress.log({
    message: "Request get and set token",
    displayName: "GetToken",
  });
  cy.request({
    url: "https://rahulshettyacademy.com/api/ecom/auth/login",
    method: "POST",
    body: {
      user: {
        username,
        password,
      },
    },
  }).then((response) => {
    const { token } = response.body.user;
    localStorage.setItem("jwt", token);
  });
});

Cypress.Commands.add("logout", () => {
  cy.window().its("localStorage").invoke("removeItem", "session");

  cy.visit("https://rahulshettyacademy.com/client/auth/login");
});

Cypress.Commands.add("saveLocalStorage", () => {
  Object.keys(localStorage).forEach((key) => {
    LOCAL_STORAGE[key] = localStorage[key];
  });
});

Cypress.Commands.add("restoreLocalStorage", () => {
  Object.keys(localStorage).forEach((key) => {
    localStorage.setItem(key, LOCAL_STORAGE[key]);
  });
});

/*
getBySel yields elements with a data-test attribute that match a specified selector.
*/
Cypress.Commands.add("getBySel", (selector, ...args) => {
  return cy.get(`[data-test=${selector}]`, ...args);
});

/*
getBySelLike yields elements with a data-test attribute that contains a specified selector.
*/
Cypress.Commands.add("getBySelLike", (selector, ...args) => {
  return cy.get(`[data-test*=${selector}]`, ...args);
});

/* Click element*/
Cypress.Commands.add("clickElement", ($ele)=>{
  cy.get($ele).click()
})

Cypress.Commands.add("clickElementWithIndex", ($ele, index)=>{
  cy.get($ele).eq(index).click()
})

/** Assert element is visible */
Cypress.Commands.add("assertElementVisible", ($ele)=>{
  cy.get($ele).should("be.visible");
})