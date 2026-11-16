import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
const dir = path.join(process.env.DATA_DIR || ".data", "orders");
try {
  const files = (await readdir(dir)).filter((f) => f.endsWith(".json"));
  const orders = await Promise.all(
    files.map(async (f) =>
      JSON.parse(await readFile(path.join(dir, f), "utf8")),
    ),
  );
  console.table(
    orders.map(({ reference, name, phone, date, slot, status }) => ({
      reference,
      name,
      phone,
      date,
      slot,
      status,
    })),
  );
} catch (e) {
  if (e.code === "ENOENT") console.log("Aucune demande pour le moment.");
  else throw e;
}
