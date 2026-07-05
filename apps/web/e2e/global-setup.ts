import { execSync } from "node:child_process";
import net from "node:net";
import path from "node:path";

const rootDir = path.resolve(__dirname, "../../..");
const databaseUrl =
  process.env.DATABASE_URL ?? "postgresql://adalah:adalah_dev@localhost:5432/adalah";

function waitForPort(host: string, port: number, maxAttempts = 30): Promise<void> {
  return new Promise((resolve, reject) => {
    let attempt = 0;

    const tryConnect = () => {
      attempt += 1;
      const socket = net.createConnection({ host, port });

      socket.once("connect", () => {
        socket.end();
        resolve();
      });

      socket.once("error", () => {
        socket.destroy();
        if (attempt >= maxAttempts) {
          reject(
            new Error(
              `PostgreSQL is not reachable on ${host}:${port}. Start it with: docker compose up -d postgres`,
            ),
          );
          return;
        }
        setTimeout(tryConnect, 1000);
      });
    };

    tryConnect();
  });
}

export default async function globalSetup() {
  try {
    await waitForPort("localhost", 5432, 3);
  } catch {
    execSync("docker compose up -d postgres", { cwd: rootDir, stdio: "inherit" });
    await waitForPort("localhost", 5432);
  }

  execSync("npm run db:migrate -w @adalah/api", {
    cwd: rootDir,
    stdio: "inherit",
    env: { ...process.env, DATABASE_URL: databaseUrl },
  });
}
