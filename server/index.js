import { publicRoutes } from "../src/routes.js";
import express from "express";
import { fileURLToPath } from "node:url";
import path from "node:path";
import {
  mkdir,
  readFile,
  writeFile,
  readdir,
  rename,
  unlink,
} from "node:fs/promises";
import { randomUUID, randomBytes, timingSafeEqual } from "node:crypto";
import { products, plateauProductPaths } from "../src/catalog.js";
import { validateOrder } from "./validation.js";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const data = process.env.DATA_DIR || path.join(root, ".data");
await mkdir(path.join(data, "orders"), { recursive: true, mode: 0o700 });
let token = process.env.ADMIN_TOKEN;
if (!token) {
  try {
    token = (await readFile(path.join(data, "admin-token"), "utf8")).trim();
  } catch {
    token = randomBytes(24).toString("hex");
    await writeFile(path.join(data, "admin-token"), token, { mode: 0o600 });
  }
}
async function purgeExpiredOrders() {
  const cutoff = Date.now() - 90 * 86400000;
  for (const name of await readdir(path.join(data, "orders"))) {
    if (!name.endsWith(".json")) continue;
    const file = path.join(data, "orders", name);
    try {
      const order = JSON.parse(await readFile(file, "utf8"));
      if (new Date(order.createdAt).getTime() < cutoff) await unlink(file);
    } catch (error) {
      console.error("Conservation demande:", error.code || error.name);
    }
  }
}
await purgeExpiredOrders();
setInterval(() => purgeExpiredOrders().catch(() => {}), 86400000).unref();
const app = express();
app.disable("x-powered-by");
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  next();
});
app.get(plateauProductPaths, (req, res) => res.redirect(301, "/plateaux"));
app.use("/api", express.json({ limit: "20kb" }));
app.use("/api", (req, res, next) => {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "GET" && req.headers.origin) {
    try {
      if (new URL(req.headers.origin).host !== req.headers.host)
        return res.status(403).json({ message: "Origine non autorisée." });
    } catch {
      return res.status(403).json({ message: "Origine invalide." });
    }
  }
  next();
});
const requests = new Map();
app.post("/api/orders", async (req, res, next) => {
  try {
    const checked = validateOrder(req.body);
    if (!checked.ok) return res.status(400).json({ message: checked.message });
    const orderPath = path.join(
      data,
      "orders",
      checked.value.requestId + ".json",
    );
    try {
      const existing = JSON.parse(await readFile(orderPath, "utf8"));
      return res.json({
        reference: existing.reference,
        status: existing.status,
      });
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }
    const recent = (requests.get(req.ip) || []).filter(
      (t) => Date.now() - t < 3600000,
    );
    if (recent.length >= 10)
      return res.status(429).json({
        message: "Trop de demandes. Appelez la boutique au 01 46 64 26 10.",
      });
    requests.set(req.ip, [...recent, Date.now()]);
    const order = {
      ...checked.value,
      reference: "G-" + randomBytes(4).toString("hex").toUpperCase(),
      status: "À confirmer",
      createdAt: new Date().toISOString(),
    };
    try {
      await writeFile(orderPath, JSON.stringify(order, null, 2), {
        flag: "wx",
        mode: 0o600,
      });
    } catch (error) {
      if (error.code === "EEXIST") {
        const existing = JSON.parse(await readFile(orderPath, "utf8"));
        return res.json({
          reference: existing.reference,
          status: existing.status,
        });
      }
      throw error;
    }
    console.log(`Nouvelle demande ${order.reference} — consulter /gestion`);
    res.status(201).json({ reference: order.reference, status: order.status });
  } catch (error) {
    next(error);
  }
});
function auth(req, res, next) {
  const supplied = (req.headers.authorization || "").replace(/^Bearer /, "");
  const a = Buffer.from(supplied),
    b = Buffer.from(token);
  if (a.length !== b.length || !timingSafeEqual(a, b))
    return res.status(401).json({ message: "Clé de gestion incorrecte." });
  next();
}
app.get("/api/admin/orders", auth, async (req, res, next) => {
  try {
    const files = await readdir(path.join(data, "orders"));
    const orders = await Promise.all(
      files
        .filter((f) => f.endsWith(".json"))
        .map(async (f) =>
          JSON.parse(await readFile(path.join(data, "orders", f), "utf8")),
        ),
    );
    res.json(orders.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
  } catch (e) {
    next(e);
  }
});
app.patch("/api/admin/orders/:id", auth, async (req, res, next) => {
  try {
    if (
      !/^[0-9a-f-]{36}$/i.test(req.params.id) ||
      !["À confirmer", "Confirmée", "Prête", "Retirée", "Annulée"].includes(
        req.body?.status,
      )
    )
      return res.status(400).json({ message: "Modification invalide." });
    const target = path.join(data, "orders", req.params.id + ".json");
    let order;
    try {
      order = JSON.parse(await readFile(target, "utf8"));
    } catch {
      return res.status(404).json({ message: "Demande introuvable." });
    }
    order.status = req.body.status;
    order.updatedAt = new Date().toISOString();
    const temp = target + "." + randomUUID() + ".tmp";
    await writeFile(temp, JSON.stringify(order, null, 2), { mode: 0o600 });
    await rename(temp, target);
    res.json({ status: order.status });
  } catch (e) {
    next(e);
  }
});
app.use("/api", (req, res) =>
  res.status(404).json({ message: "Ressource introuvable." }),
);
app.use((err, req, res, next) => {
  console.error("Erreur requête:", err.code || err.name);
  res
    .status(
      err.type === "entity.too.large"
        ? 413
        : err instanceof SyntaxError
          ? 400
          : 500,
    )
    .json({
      message:
        "La demande n’a pas pu être enregistrée. Réessayez ou appelez la boutique.",
    });
});
if (process.argv.includes("--dev")) {
  const { createServer } = await import("vite");
  const vite = await createServer({
    root,
    server: { middlewareMode: true },
    appType: "spa",
  });
  app.use(vite.middlewares);
} else {
  app.use(
    "/assets",
    express.static(path.join(root, "dist/assets"), {
      maxAge: "1y",
      immutable: true,
    }),
  );
  app.use(
    express.static(path.join(root, "dist"), { index: false, maxAge: "1h" }),
  );
  app.get("*", (req, res) => {
    const route = req.path.replace(/\/$/, "") || "/";
    if (route === "/gestion")
      res.setHeader("X-Robots-Tag", "noindex, nofollow");
    res
      .status(
        publicRoutes.has(route) ||
          products.some((p) => route === `/produit/${p.id}`)
          ? 200
          : 404,
      )
      .sendFile(path.join(root, "dist/index.html"));
  });
}
const port = process.env.PORT === undefined ? 5173 : Number(process.env.PORT);
const server = app.listen(port, process.env.HOST || "127.0.0.1", () =>
  console.log(
    `Fromagerie Guichard → http://localhost:${server.address().port}\nGestion : /gestion (clé privée dans .data/admin-token)`,
  ),
);
server.on("error", (error) => {
  console.error(error.message);
  process.exit(1);
});
