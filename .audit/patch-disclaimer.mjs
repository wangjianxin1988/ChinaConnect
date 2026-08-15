import fs from "node:fs";
const path = "src/components/Guide/CompanyRegistrationClient.tsx";
let s = fs.readFileSync(path, "utf8").replace(/\r\n/g, "\n");
const old = '{jaText("本指南仅供参考。注册要求时常变化，因城市、行业和国籍而异。在开始注册流程前，请务必咨询持有执照的中国企业服务商或律师。", lang)}';
const neu = '{lang === "ja" ? "本ガイドは参考情報です。登録要件は頻繁に変更され、都市・業種・国籍によって異なります。登録手続きを開始する前に、必ず中国の有資格企業サービスプロバイダーまたは弁護士にご相談ください。" : jaText("本指南仅供参考。注册要求时常变化，因城市、行业和国籍而异。在开始注册流程前，请务必咨询持有执照的中国企业服务商或律师。", lang)}';
if (!s.includes(old)) { console.error("MISSING target"); process.exit(1); }
s = s.split(old).join(neu);
const tmp = path + ".tmp";
fs.writeFileSync(tmp, s);
fs.renameSync(tmp, path);
console.log("patched", path);
