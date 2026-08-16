import fs from "node:fs";
const real = new Set(JSON.parse(fs.readFileSync(".audit/guide-strings.json","utf8")).strings);
const file = "src/data/guide/overrides-vi.ts";
let text = fs.readFileSync(file,"utf8");
const re = /^\s*"((?:[^"\\]|\\.)*)"\s*:\s*"((?:[^"\\]|\\.)*)",?\s*$/gm;
const un = (s)=>s.replace(/\\"/g,'"').replace(/\\\\/g,'\\').replace(/\\n/g,"\n");
const esc = (s)=>s.replace(/\\/g,"\\\\").replace(/"/g,'\\"').replace(/\n/g,"\\n");
const map = new Map();
for (const m of text.matchAll(re)) map.set(un(m[1]), un(m[2]));
const fixes = {
  "Mobile payments, taxi, food delivery": "Thanh toán di động, taxi, giao đồ ăn",
  "Didi (60-100 CNY)": "Didi (60–100 CNY)",
  "wǒ guòmǐn jiānguǒ": "Tôi bị dị ứng với các loại hạt",
  "Free option available": "Có lựa chọn miễn phí",
  "白咖啡": "Cà phê trắng",
  "Proxy:": "Máy chủ proxy:",
  "中国に到着する前にVPNをダウンロードして設定してください。国内では多くのVPNサイトがブロックされており、アプリストアに希望のVPNがない場合もあります。出発前にインストールしてテストしておきましょ": "Hãy tải và cài đặt VPN trước khi đến Trung Quốc. Nhiều trang VPN bị chặn trong nước, và VPN mong muốn có thể không có trên cửa hàng ứng dụng. Hãy cài đặt và kiểm tra trước khi khởi hành.",
};
for (const [k,v] of Object.entries(fixes)) {
  if (!map.has(k)) console.log("WARN key not in map:", k.slice(0,50));
  map.set(k, v);
}
const entries = [...real].map((k) => `  "${esc(k)}": "${esc(map.get(k) ?? k)}",`).join("\n");
const content = `// Auto-generated vi override dictionary for guide data.
// Key: original string (EN or ZH) -> Vietnamese.
export const VI_GUIDE_OVERRIDES: Record<string, string> = {\n${entries}\n};\n`;
fs.writeFileSync(file, content, "utf8");
console.log("written", real.size, "entries");
