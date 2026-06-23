import http from "http";
import fs from "fs/promises";
import path from "path";

const DIST = "D:/suoyouxiangmu/chinaconnect/dist";
const server = http.createServer(async (req, res) => {
  const urlPath = decodeURIComponent(req.url.split("?")[0]);
  let file = path.join(DIST, urlPath);
  try {
    let content;
    const stat = await fs.stat(file);
    if (stat.isDirectory()) {
      file = path.join(file, "index.html");
      content = await fs.readFile(file);
    } else {
      content = await fs.readFile(file);
    }
    const ext = path.extname(file);
    const ct = ext === ".html" ? "text/html; charset=utf-8"
      : ext === ".js" ? "application/javascript"
      : ext === ".css" ? "text/css"
      : ext === ".json" ? "application/json"
      : "application/octet-stream";
    res.writeHead(200, { "Content-Type": ct });
    res.end(content);
  } catch (e) {
    res.writeHead(404);
    res.end("Not found");
  }
});
server.listen(4322, () => console.log("Static server on 4322"));
