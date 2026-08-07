import { spawn } from "node:child_process";
import { existsSync } from "node:fs";

const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const port = 9333;
const userDataDir = "C:\\Temp\\edge-automation";

if (!existsSync(edgePath)) {
  console.error("Edge not found at", edgePath);
  process.exit(1);
}

console.log("Starting Edge with remote-debugging-port=" + port);
const proc = spawn(
  edgePath,
  [
    "--remote-debugging-port=" + port,
    "--no-first-run",
    "--no-default-browser-check",
    "--user-data-dir=" + userDataDir,
    "https://dash.cloudflare.com/profile/api-tokens",
  ],
  { detached: true, stdio: "ignore" },
);

proc.unref();
console.log("Edge PID:", proc.pid);
console.log("Waiting for CDP endpoint...");
