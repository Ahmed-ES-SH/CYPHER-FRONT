const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  let intercepted = false;
  await page.route("**/auth/login", async (route) => {
    intercepted = true;
    console.log("INTERCEPTED: /auth/login");
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        user: { id: 1, name: "Test", email: "test@test.com", avatar: "", role: "user" },
        access_token: "test",
      }),
    });
  });

  await page.goto("http://localhost:3000/signin");

  page.on("response", (response) => {
    if (response.url().includes("/auth/")) {
      console.log(`RESPONSE: ${response.status()} ${response.url()}`);
    }
  });
  page.on("request", (request) => {
    if (request.url().includes("/auth/")) {
      console.log(`REQUEST: ${request.method()} ${request.url()}`);
    }
  });

  await page.getByPlaceholder("Enter your email").fill("test@test.com");
  await page.getByPlaceholder("Enter your password").fill("password123");
  await page.getByRole("button", { name: /login/i }).click();
  await new Promise((r) => setTimeout(r, 3000));

  console.log(`Intercepted: ${intercepted}`);
  await browser.close();
})();
