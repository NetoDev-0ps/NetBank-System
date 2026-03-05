import assert from "node:assert/strict";

let failed = 0;
let passed = 0;

const run = async (name, fn) => {
  try {
    await fn();
    passed += 1;
    console.log(`PASS: ${name}`);
  } catch (error) {
    failed += 1;
    console.error(`FAIL: ${name}`);
    console.error(error);
  }
};

class MemoryStorage {
  constructor() {
    this.store = new Map();
  }

  getItem(key) {
    return this.store.has(key) ? this.store.get(key) : null;
  }

  setItem(key, value) {
    this.store.set(key, String(value));
  }

  removeItem(key) {
    this.store.delete(key);
  }
}

const importSessionModule = (tag) => import(`../src/core/auth/session.js?${tag}`);

const runSessionTests = async () => {
  const originalSessionStorage = globalThis.sessionStorage;
  const originalWindow = globalThis.window;
  const originalFetch = globalThis.fetch;

  let fetchCalls = [];
  const useSuccessfulFetch = () => {
    globalThis.fetch = async (...args) => {
      fetchCalls.push(args);
      return { ok: true };
    };
  };

  try {
    globalThis.sessionStorage = new MemoryStorage();
    globalThis.window = { location: { href: "" } };
    useSuccessfulFetch();

    const session = await importSessionModule(`browser-${Date.now()}`);

    const reset = () => {
      session.clearAllSessions();
      fetchCalls = [];
      globalThis.window.location.href = "";
      useSuccessfulFetch();
    };

    await run("session: saveManagerSession should persist manager and clear customer", () => {
      reset();

      session.saveCustomerSession({ cargo: "CLIENTE", nome: "Cliente" });
      session.saveManagerSession({
        nome: "Admin",
        email: "admin@netbank.com",
        cargo: "GERENTE",
      });

      assert.equal(session.getCustomerData(), null);
      assert.equal(session.isManagerAuthenticated(), true);
      assert.deepEqual(session.getManagerData(), {
        nome: "Admin",
        email: "admin@netbank.com",
        cargo: "GERENTE",
      });
    });

    await run("session: saveCustomerSession should persist customer and clear manager", () => {
      reset();

      session.saveManagerSession({
        nome: "Admin",
        email: "admin@netbank.com",
        cargo: "GERENTE",
      });
      session.saveCustomerSession({
        id: 1,
        nome: "Cliente",
        email: "cliente@netbank.com",
        cargo: "CLIENTE",
      });

      assert.equal(session.getManagerData(), null);
      assert.equal(session.isCustomerAuthenticated(), true);
      assert.deepEqual(session.getCustomerData(), {
        id: 1,
        nome: "Cliente",
        email: "cliente@netbank.com",
        cargo: "CLIENTE",
      });
    });

    await run("session: getCustomerData should return null for invalid JSON payload", () => {
      reset();

      globalThis.sessionStorage.setItem("cliente_dados", "{broken");
      assert.equal(session.getCustomerData(), null);
      assert.equal(session.isCustomerAuthenticated(), false);
    });

    await run("session: isManagerAuthenticated should accept ADMIN and reject others", () => {
      reset();

      session.saveManagerSession({
        nome: "Admin",
        email: "admin@netbank.com",
        cargo: "ADMIN",
      });
      assert.equal(session.isManagerAuthenticated(), true);

      session.saveManagerSession({
        nome: "Supervisor",
        email: "sup@netbank.com",
        cargo: "CLIENTE",
      });
      assert.equal(session.isManagerAuthenticated(), false);
    });

    await run("session: logout should call API, clear sessions and update location", async () => {
      reset();

      session.saveCustomerSession({ cargo: "CLIENTE", nome: "Cliente" });
      await session.logout("/login-cliente");

      assert.equal(fetchCalls.length, 1);
      assert.equal(session.getCustomerData(), null);
      assert.equal(session.getManagerData(), null);
      assert.equal(globalThis.window.location.href, "/login-cliente");
    });

    await run("session: logout should tolerate fetch failure and missing window", async () => {
      reset();

      session.saveCustomerSession({ cargo: "CLIENTE", nome: "Cliente" });
      globalThis.fetch = async () => {
        throw new Error("network down");
      };

      delete globalThis.window;
      await session.logout("/ignored");

      assert.equal(session.getCustomerData(), null);
      assert.equal(session.getManagerData(), null);
      assert.equal(typeof globalThis.window, "undefined");

      globalThis.window = { location: { href: "" } };
      useSuccessfulFetch();
    });

    await run("session: should use in-memory storage when sessionStorage is unavailable", async () => {
      delete globalThis.sessionStorage;
      globalThis.window = { location: { href: "" } };
      useSuccessfulFetch();

      const sessionWithoutStorage = await importSessionModule(`memory-${Date.now()}`);
      sessionWithoutStorage.saveManagerSession({
        nome: "Admin",
        email: "admin@netbank.com",
        cargo: "ADMIN",
      });

      assert.equal(sessionWithoutStorage.isManagerAuthenticated(), true);
      assert.deepEqual(sessionWithoutStorage.getManagerData(), {
        nome: "Admin",
        email: "admin@netbank.com",
        cargo: "ADMIN",
      });

      await sessionWithoutStorage.logout("/home");
      assert.equal(globalThis.window.location.href, "/home");
    });
  } finally {
    if (typeof originalSessionStorage === "undefined") {
      delete globalThis.sessionStorage;
    } else {
      globalThis.sessionStorage = originalSessionStorage;
    }

    if (typeof originalWindow === "undefined") {
      delete globalThis.window;
    } else {
      globalThis.window = originalWindow;
    }

    if (typeof originalFetch === "undefined") {
      delete globalThis.fetch;
    } else {
      globalThis.fetch = originalFetch;
    }
  }
};

const runPixUtilsTests = async () => {
  const {
    extractPixApiError,
    formatarPeloTipo,
    generateTransferIdempotencyKey,
    mascaraInputDinamica,
    normalizePixKey,
    safeParseArray,
  } = await import("../src/pages/dashboard/pix/pixUtils.js");

  await run("pixUtils: safeParseArray should parse arrays and fallback safely", () => {
    const storage = new MemoryStorage();
    storage.setItem("valid", JSON.stringify([1, 2, 3]));
    storage.setItem("invalid", "{broken");
    storage.setItem("object", JSON.stringify({ value: 1 }));

    assert.deepEqual(safeParseArray(storage, "valid"), [1, 2, 3]);
    assert.deepEqual(safeParseArray(storage, "invalid"), []);
    assert.deepEqual(safeParseArray(storage, "object"), []);
    assert.deepEqual(safeParseArray(storage, "missing"), []);
  });

  await run("pixUtils: formatarPeloTipo should handle CPF CNPJ TELEFONE and fallback", () => {
    assert.equal(formatarPeloTipo("12345678901", "CPF"), "123.456.789-01");
    assert.equal(formatarPeloTipo("12345678000199", "CNPJ"), "12.345.678/0001-99");
    assert.equal(formatarPeloTipo("85999998888", "TELEFONE"), "(85) 99999-8888");
    assert.equal(formatarPeloTipo("chave-aleatoria", "EMAIL"), "chave-aleatoria");
    assert.equal(formatarPeloTipo("", "CPF"), "");
  });

  await run("pixUtils: mascaraInputDinamica should apply CPF CNPJ and preserve emails", () => {
    assert.equal(mascaraInputDinamica("12345678901"), "123.456.789-01");
    assert.equal(mascaraInputDinamica("12345678000199"), "12.345.678/0001-99");
    assert.equal(mascaraInputDinamica("destino@netbank.com"), "destino@netbank.com");
  });

  await run("pixUtils: normalizePixKey should trim emails, strip digits and handle empty values", () => {
    assert.equal(normalizePixKey("  destino@netbank.com  "), "destino@netbank.com");
    assert.equal(normalizePixKey("123.456.789-00"), "12345678900");
    assert.equal(normalizePixKey(""), "");
    assert.equal(normalizePixKey(null), "");
  });

  await run("pixUtils: generateTransferIdempotencyKey should support UUID and fallback formats", () => {
    const keyWithUuid = generateTransferIdempotencyKey();
    assert.equal(typeof keyWithUuid, "string");
    assert.equal(keyWithUuid.startsWith("pix-"), true);

    const originalRandomUUID = globalThis.crypto?.randomUUID;
    if (globalThis.crypto) {
      globalThis.crypto.randomUUID = undefined;
    }

    const fallbackKey = generateTransferIdempotencyKey();
    assert.equal(typeof fallbackKey, "string");
    assert.equal(fallbackKey.startsWith("pix-"), true);
    assert.equal(fallbackKey.length > 10, true);

    if (globalThis.crypto) {
      globalThis.crypto.randomUUID = originalRandomUUID;
    }
  });

  await run("pixUtils: extractPixApiError should map known codes and fallback safely", () => {
    const expectedByCode = {
      NAO_AUTENTICADO: "Sessao expirada. Faca login novamente.",
      ACESSO_NEGADO: "Acesso negado para esta operacao.",
      SENHA_PIX_INVALIDA: "A senha Pix deve ter 4 digitos.",
      CHAVE_NAO_ENCONTRADA: "Chave nao encontrada no sistema.",
      CHAVE_JA_CADASTRADA_NO_SISTEMA: "Esta chave ja esta cadastrada no sistema.",
      DADOS_NAO_PERTENCEM_AO_USUARIO: "A chave informada nao pertence ao usuario autenticado.",
      SENHA_PIX_INCORRETA: "Senha Pix incorreta.",
      SALDO_INSUFICIENTE: "Saldo insuficiente para esta transferencia.",
      IDEMPOTENCY_KEY_EM_USO_COM_OUTRA_OPERACAO: "Chave de idempotencia em uso com outra operacao.",
    };

    Object.entries(expectedByCode).forEach(([code, expected]) => {
      assert.equal(
        extractPixApiError({ response: { data: { erro: code } } }, "fallback"),
        expected,
      );
    });

    assert.equal(
      extractPixApiError({ response: { data: { erro: "ERRO_CUSTOM" } } }, "fallback"),
      "ERRO_CUSTOM",
    );

    assert.equal(
      extractPixApiError({ response: { data: { message: "msg" } } }, "fallback"),
      "msg",
    );

    assert.equal(extractPixApiError({}, "fallback"), "fallback");
  });
};

await runSessionTests();
await runPixUtilsTests();

console.log(`SUMMARY: ${passed} passed, ${failed} failed`);

if (failed > 0) {
  process.exitCode = 1;
}
