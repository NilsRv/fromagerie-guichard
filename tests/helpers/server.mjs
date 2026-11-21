import { spawn } from "node:child_process";
import { once } from "node:events";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

export async function startTestServer() {
  const dir = await mkdtemp(path.join(tmpdir(), "guichard-qa-"));
  const server = spawn(
    process.execPath,
    [fileURLToPath(new URL("../../server/index.js", import.meta.url))],
    {
      env: {
        ...process.env,
        PORT: "0",
        HOST: "127.0.0.1",
        DATA_DIR: dir,
        ADMIN_TOKEN: "",
      },
      stdio: "pipe",
    },
  );
  async function close() {
    if (server.pid && server.exitCode === null && server.signalCode === null) {
      const exit = once(server, "exit");
      server.kill("SIGTERM");
      const timeout = setTimeout(() => server.kill("SIGKILL"), 2000);
      await exit.finally(() => clearTimeout(timeout));
    }
    await rm(dir, { recursive: true, force: true });
  }
  try {
    const base = await new Promise((resolve, reject) => {
      let output = "";
      const timer = setTimeout(
        () => reject(new Error("Le serveur de test ne démarre pas.")),
        15000,
      );
      const finish = (error, url) => {
        clearTimeout(timer);
        if (error) reject(error);
        else resolve(url);
      };
      server.stdout.on("data", (data) => {
        output = (output + data).slice(-16000);
        const url = output.match(/http:\/\/localhost:\d+/)?.[0];
        if (url) finish(null, url);
      });
      server.stderr.on("data", (data) => process.stderr.write(data));
      server.once("error", (error) => finish(error));
      server.once("exit", (code) =>
        finish(new Error(`Serveur de test arrêté (${code}).`)),
      );
    });
    return { base, dir, close };
  } catch (error) {
    await close();
    throw error;
  }
}
