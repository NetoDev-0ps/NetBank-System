import { expect, test } from "@playwright/test";

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

const managerUser = {
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
};

const buildStats = (users) => {
  const count = (status) => users.filter((user) => user.status === status).length;
  const ativos = count("ATIVA");
  const pendentes = count("PENDENTE");
  const suspensas = count("SUSPENSA");
  const bloqueadas = count("BLOQUEADA");
  const recusadas = count("RECUSADA");

  return {
    total: ativos + pendentes + suspensas + bloqueadas + recusadas,
    ativos,
    pendentes,
    suspensas,
    bloqueadas,
    recusadas,
  };
};

const makeApiUser = (dbUser) => ({
  id: dbUser.id,
  nome: dbUser.nome,
  email: dbUser.email,
  cpf: dbUser.cpf,
  telefone: dbUser.telefone,
  saldo: dbUser.saldo,
  status: dbUser.status,
  dataNascimento: dbUser.dataNascimento,
  cargo: dbUser.cargo,
  primeiroLogin: dbUser.primeiroLogin,
});

const createMockDatabase = (initialUsers = []) => {
  const users = initialUsers.map((user, index) => ({
    id: index + 1,
    cargo: "CLIENTE",
    saldo: 0,
    primeiroLogin: true,
    status: "PENDENTE",
    ...user,
  }));

  return {
    users,
    nextId: users.length + 1,
    firstAccessPatchCount: 0,
  };
};

const normalizeCpf = (value) => String(value || "").replace(/\D/g, "");
const normalizePhone = (value) => String(value || "").replace(/\D/g, "");
const normalizeEmail = (value) => String(value || "").trim().toLowerCase();

const wireMockApi = async (page, db) => {
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

  await page.route("**/auth/logout", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ ok: true }),
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

  await page.route("**/usuarios/paginado**", async (route) => {
    const url = new URL(route.request().url());
    const pageNumber = Number(url.searchParams.get("page") || 0);
    const pageSize = Number(url.searchParams.get("size") || 12);
    const rawSearch = (url.searchParams.get("busca") || "").trim().toLowerCase();
    const includeRejected = url.searchParams.get("incluirRecusadas") === "true";

    const filteredUsers = db.users.filter((user) => {
      if (!includeRejected && user.status === "RECUSADA") {
        return false;
      }

      if (!rawSearch) {
        return true;
      }

      const candidate = `${user.nome} ${user.email} ${user.cpf}`.toLowerCase();
      return candidate.includes(rawSearch);
    });

    const offset = pageNumber * pageSize;
    const items = filteredUsers.slice(offset, offset + pageSize).map(makeApiUser);
    const totalElements = filteredUsers.length;
    const totalPages = totalElements === 0 ? 0 : Math.ceil(totalElements / pageSize);

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        items,
        page: pageNumber,
        size: pageSize,
        totalElements,
        totalPages,
        stats: buildStats(db.users),
      }),
    });
  });

  await page.route("**/usuarios", async (route) => {
    if (route.request().method() !== "POST") {
      await route.fallback();
      return;
    }

    const body = route.request().postDataJSON();
    const user = {
      id: db.nextId++,
      nome: body.nome,
      telefone: normalizePhone(body.telefone),
      cpf: normalizeCpf(body.cpf),
      dataNascimento: body.dataNascimento,
      email: normalizeEmail(body.email),
      senha: body.senha,
      cargo: "CLIENTE",
      saldo: 0,
      status: "PENDENTE",
      primeiroLogin: true,
    };

    db.users.push(user);

    await route.fulfill({
      status: 201,
      contentType: "application/json",
      body: JSON.stringify({ usuario: makeApiUser(user) }),
    });
  });

  await page.route("**/usuarios/*/status", async (route) => {
    if (route.request().method() !== "PATCH") {
      await route.fallback();
      return;
    }

    const match = route.request().url().match(/\/usuarios\/(\d+)\/status$/);
    const userId = Number(match?.[1]);
    const body = route.request().postDataJSON();
    const user = db.users.find((item) => item.id === userId);

    if (!user) {
      await route.fulfill({
        status: 404,
        contentType: "application/json",
        body: JSON.stringify({ erro: "USUARIO_NAO_ENCONTRADO" }),
      });
      return;
    }

    user.status = body.status;

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ usuario: makeApiUser(user) }),
    });
  });

  await page.route("**/usuarios/*/primeiro-acesso-concluido", async (route) => {
    if (route.request().method() !== "PATCH") {
      await route.fallback();
      return;
    }

    const match = route.request().url().match(/\/usuarios\/(\d+)\/primeiro-acesso-concluido$/);
    const userId = Number(match?.[1]);
    const user = db.users.find((item) => item.id === userId);

    if (!user) {
      await route.fulfill({
        status: 404,
        contentType: "application/json",
        body: JSON.stringify({ erro: "USUARIO_NAO_ENCONTRADO" }),
      });
      return;
    }

    if (user.primeiroLogin) {
      user.primeiroLogin = false;
      user.saldo = Number(user.saldo) + 5000;
      db.firstAccessPatchCount += 1;
    }

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ usuario: makeApiUser(user) }),
    });
  });

  await page.route("**/usuarios/*", async (route) => {
    if (route.request().method() !== "GET") {
      await route.fallback();
      return;
    }


    if (route.request().url().includes("/usuarios/paginado")) {
      await route.fallback();
      return;
    }
    const match = route.request().url().match(/\/usuarios\/(\d+)$/);
    const userId = Number(match?.[1]);
    const user = db.users.find((item) => item.id === userId);

    if (!user) {
      await route.fulfill({
        status: 404,
        contentType: "application/json",
        body: JSON.stringify({ erro: "USUARIO_NAO_ENCONTRADO" }),
      });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(makeApiUser(user)),
    });
  });

  await page.route("**/auth/login", async (route) => {
    const body = route.request().postDataJSON();
    const type = String(body?.tipoAcesso || "").toUpperCase();

    if (type === "GERENTE") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        headers: {
          "set-cookie": "NETBANK_AUTH=test-auth; Path=/; HttpOnly",
        },
        body: JSON.stringify({ usuario: managerUser }),
      });
      return;
    }

    if (type === "CLIENTE") {
      const email = normalizeEmail(body?.email);
      const cpf = normalizeCpf(body?.cpf);
      const senha = String(body?.senha || "");
      const user = db.users.find((item) => item.email === email);

      if (!user) {
        await route.fulfill({
          status: 400,
          contentType: "application/json",
          body: JSON.stringify({ erro: "EMAIL_NAO_ENCONTRADO" }),
        });
        return;
      }

      if (normalizeCpf(user.cpf) !== cpf) {
        await route.fulfill({
          status: 400,
          contentType: "application/json",
          body: JSON.stringify({ erro: "DADOS_DIVERGENTES" }),
        });
        return;
      }

      if (String(user.senha) !== senha) {
        await route.fulfill({
          status: 400,
          contentType: "application/json",
          body: JSON.stringify({ erro: "SENHA_INCORRETA" }),
        });
        return;
      }

      if (user.status !== "ATIVA") {
        const statusCodeMap = {
          PENDENTE: "STATUS_PENDENTE",
          SUSPENSA: "STATUS_SUSPENSO",
          BLOQUEADA: "STATUS_BLOQUEADO",
          RECUSADA: "STATUS_RECUSADO",
        };

        await route.fulfill({
          status: 400,
          contentType: "application/json",
          body: JSON.stringify({ erro: statusCodeMap[user.status] || "STATUS_DESCONHECIDO" }),
        });
        return;
      }

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        headers: {
          "set-cookie": "NETBANK_AUTH=test-auth; Path=/; HttpOnly",
        },
        body: JSON.stringify({ usuario: makeApiUser(user) }),
      });
      return;
    }

    await route.fulfill({
      status: 400,
      contentType: "application/json",
      body: JSON.stringify({ erro: "TIPO_ACESSO_INVALIDO" }),
    });
  });
};

const solveCaptcha = async (page) => {
  await page.getByTestId("human-puzzle-slider").fill("62");
  await page.getByRole("button", { name: "Validar humano" }).click();
};

const loginAsManager = async (page) => {
  await page.goto("/login-gerente");
  await page.locator("input[type='email']").fill("admin@netbank.com.br");
  await page.locator("input[type='password']").fill("Senha@Gerente123");
  await solveCaptcha(page);
  await page.getByRole("button", { name: "Entrar como gerente" }).click();
  await expect(page).toHaveURL(/\/painel$/);
};

const loginAsCustomer = async (page, customer) => {
  await page.goto("/login-cliente");
  await page.locator("input[placeholder='000.000.000-00']").fill(customer.cpf);
  await page.locator("input[type='email']").fill(customer.email);
  await page.locator("input[type='password']").fill(customer.senha);
  await solveCaptcha(page);
  await page.getByRole("button", { name: /^Entrar$/ }).click();
};

test("fluxo completo: cadastro -> aprovacao gerente -> login cliente", async ({ page }) => {
  const db = createMockDatabase();
  await wireMockApi(page, db);

  await page.goto("/cadastro-cliente");
  await page.locator("input[placeholder='Apenas letras...']").fill("Carlos Monteiro");
  await page.locator("input[placeholder='(00) 0 0000-0000']").fill("85999887766");
  await page.locator("input[placeholder='000.000.000-00']").fill("12345678901");
  await page.locator("input[type='date']").fill("1995-05-20");
  await page.locator("input[placeholder='email@gmail.com']").fill("carlos@gmail.com");
  await page.locator("input[placeholder='Repita o email']").fill("carlos@gmail.com");
  await page.locator("input[placeholder='********']").first().fill("Senha@Cliente1");
  await page.locator("input[placeholder='********']").nth(1).fill("Senha@Cliente1");
  await solveCaptcha(page);
  await page.locator("#termos").check();
  await page.getByRole("button", { name: "Solicitar Abertura de Conta" }).click();

  await expect(page.getByText("Conta Criada!")).toBeVisible();
  await page.getByRole("button", { name: "Voltar ao Inicio" }).click();
  await expect(page).toHaveURL(/\/home$/);

  await loginAsManager(page);
  await expect(page.getByRole("button", { name: "Aprovar" }).first()).toBeVisible({ timeout: 15000 });
  await page.getByRole("button", { name: "Aprovar" }).first().click();
  await expect(page.getByRole("button", { name: "Suspender" }).first()).toBeVisible();

  await page.evaluate(() => window.sessionStorage.clear());
  await loginAsCustomer(page, {
    cpf: "123.456.789-01",
    email: "carlos@gmail.com",
    senha: "Senha@Cliente1",
  });

  await expect(page).toHaveURL(/\/dashboard$/);
});

test("primeiro acesso aplica bonus e persiste primeiroLogin=false", async ({ page }) => {
  const db = createMockDatabase([
    {
      nome: "Maria Primeira",
      telefone: "85999990000",
      cpf: "12312312312",
      dataNascimento: "1992-09-11",
      email: "maria@gmail.com",
      senha: "Senha@Cliente1",
      status: "ATIVA",
      saldo: 0,
      primeiroLogin: true,
    },
  ]);
  await wireMockApi(page, db);

  await loginAsCustomer(page, {
    cpf: "123.123.123-12",
    email: "maria@gmail.com",
    senha: "Senha@Cliente1",
  });
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByText("R$ 5.000,00", { exact: true })).toBeVisible();
  expect(db.firstAccessPatchCount).toBe(1);

  await page.evaluate(() => window.sessionStorage.clear());
  await loginAsCustomer(page, {
    cpf: "123.123.123-12",
    email: "maria@gmail.com",
    senha: "Senha@Cliente1",
  });
  await expect(page).toHaveURL(/\/dashboard$/);
  expect(db.firstAccessPatchCount).toBe(1);
});

test("suspender e reativar cliente altera comportamento de login", async ({ page }) => {
  const db = createMockDatabase([
    {
      nome: "Joao Status",
      telefone: "85988887777",
      cpf: "11122233344",
      dataNascimento: "1991-03-10",
      email: "joao@gmail.com",
      senha: "Senha@Cliente1",
      status: "ATIVA",
      saldo: 100,
      primeiroLogin: false,
    },
  ]);
  await wireMockApi(page, db);

  await loginAsManager(page);
  await expect(page.getByRole("button", { name: "Suspender" }).first()).toBeVisible({ timeout: 15000 });
  await page.getByRole("button", { name: "Suspender" }).first().click();

  await page.evaluate(() => window.sessionStorage.clear());
  await loginAsCustomer(page, {
    cpf: "111.222.333-44",
    email: "joao@gmail.com",
    senha: "Senha@Cliente1",
  });
  await expect(page.getByText("Conta suspensa")).toBeVisible();

  await page.evaluate(() => window.sessionStorage.clear());
  await loginAsManager(page);
  await page.getByRole("button", { name: "Reativar" }).first().click();
  await expect(page.getByRole("button", { name: "Suspender" }).first()).toBeVisible();

  await page.evaluate(() => window.sessionStorage.clear());
  await loginAsCustomer(page, {
    cpf: "111.222.333-44",
    email: "joao@gmail.com",
    senha: "Senha@Cliente1",
  });
  await expect(page).toHaveURL(/\/dashboard$/);
});
