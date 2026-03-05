import { test, expect } from "@playwright/test";

const csrfResponse = {
  token: "test-csrf-token",
  headerName: "X-XSRF-TOKEN",
  parameterName: "_csrf",
};

const captchaChallenge = {
  challengeToken: "challenge-token",
  target: 62,
  min: 0,
  max: 100,
  tolerance: 4,
  expiresInSeconds: 180,
};

test.beforeEach(async ({ page }) => {
  await page.route("**/auth/csrf", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      headers: {
        "set-cookie": "XSRF-TOKEN=test-csrf-token; Path=/; SameSite=Lax",
      },
      body: JSON.stringify(csrfResponse),
    });
  });

  await page.route("**/auth/me", async (route) => {
    await route.fulfill({
      status: 401,
      contentType: "application/json",
      body: JSON.stringify({ erro: "NAO_AUTENTICADO" }),
    });
  });

  await page.route("**/auth/captcha/challenge", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(captchaChallenge),
    });
  });

  await page.route("**/auth/captcha/verify", async (route) => {
    const payload = route.request().postDataJSON();
    const isValid = payload?.challengeToken && Number(payload?.sliderValue) === 62;

    if (!isValid) {
      await route.fulfill({
        status: 400,
        contentType: "application/json",
        body: JSON.stringify({ erro: "CAPTCHA_VERIFICACAO_FALHOU" }),
      });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ proofToken: "proof-token", expiresInSeconds: 120 }),
    });
  });
});

test("redirects manager dashboard to manager login when unauthenticated", async ({ page }) => {
  await page.goto("/painel");
  await expect(page).toHaveURL(/\/login-gerente$/);
  await expect(page.getByText("Area do Gerente")).toBeVisible();
});

test("allows manager login flow and opens dashboard", async ({ page }) => {
  await page.route("**/auth/login", async (route) => {
    const captchaProof = route.request().headers()["x-captcha-proof"];

    if (!captchaProof) {
      await route.fulfill({
        status: 400,
        contentType: "application/json",
        body: JSON.stringify({ erro: "CAPTCHA_PROOF_AUSENTE" }),
      });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      headers: {
        "set-cookie": "NETBANK_AUTH=test-auth; Path=/; HttpOnly",
      },
      body: JSON.stringify({
        usuario: {
          id: 1,
          nome: "Administrador Master",
          email: "admin@netbank.com.br",
          cpf: null,
          telefone: null,
          saldo: 0,
          status: "ATIVA",
          dataNascimento: null,
          cargo: "GERENTE",
          primeiroLogin: false,
        },
      }),
    });
  });

  await page.route("**/usuarios/paginado**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        items: [],
        page: 0,
        size: 12,
        totalElements: 0,
        totalPages: 0,
        stats: {
          total: 0,
          ativos: 0,
          pendentes: 0,
          suspensas: 0,
          bloqueadas: 0,
          recusadas: 0,
        },
      }),
    });
  });

  await page.goto("/login-gerente");
  await page.locator("input[type=\"email\"]").fill("admin@netbank.com.br");
  await page.locator("input[type=\"password\"]").fill("Senha@Gerente123");
  await page.getByTestId("human-puzzle-slider").fill("62");
  await page.getByRole("button", { name: "Validar humano" }).click();
  await page.getByRole("button", { name: "Entrar como gerente" }).click();

  await expect(page).toHaveURL(/\/painel$/);
  await expect(page.getByText("Painel Administrativo")).toBeVisible();
});
