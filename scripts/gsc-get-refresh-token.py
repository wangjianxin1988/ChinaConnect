# =============================================================================
# ChinaConnect GSC OAuth — 独立 refresh_token 获取脚本
# =============================================================================
#
# 铁律（最高优先级，违反任何一条 = 重新写脚本）：
#   1. 禁止读 mi-to-ai (D:\suoyouxiangmu\ai-student-survival\) 下任何文件
#   2. 禁止复制 mi-to-ai 的 OAuth 脚本内容
#   3. 禁止在终端打印 client_id / client_secret / refresh_token / access_token
#   4. 禁止把任何凭据写进聊天消息
#
# 用途：首次配置 ChinaConnect 的 GSC OAuth 时，跑一次本脚本拿 refresh_token。
#       拿到后存到 references/gsc-refresh-token.json，供 gsc-daily-report.py 使用。
#
# 方案 A：纯 urllib + http.server，**不**用 google_auth_oauthlib.flow.Flow。
#         原因：Flow 类强制 PKCE code_verifier，但我们是 web app (client secret)
#         不用 PKCE；用 Flow 会撞上 "missing code_verifier" 错误。
#
# OAuth 范围：https://www.googleapis.com/auth/webmasters (full scope)
#   - readonly 不够：sitemaps.add 之类 PUT 操作会 403
#   - 必须是 webmasters full scope
#
# 端口选择：127.0.0.1 上 8080-8099 随机可用端口。
#   - 优先用 8080（老板给的 GCP OAuth client 注册的就是 8080）
#   - 如果 8080 被占，自动切到 8081-8099
#   - server 超时 120 秒（Google OAuth code TTL 是 5 分钟 = 300 秒，留余量）
#
# 文件输出：references/gsc-refresh-token.json
#   {
#     "refresh_token": "...",
#     "client_id": "...",
#     "client_secret": "...",
#     "updated_at": "YYYY-MM-DD"
#   }
#
# 依赖：Python 3.8+ 标准库（urllib, http.server, json, secrets, webbrowser）
# =============================================================================

import json
import secrets
import socket
import sys
import urllib.parse
import webbrowser
from datetime import date
from http.server import BaseHTTPRequestHandler, HTTPServer
from pathlib import Path

# =============================================================================
# 路径常量
# =============================================================================

# 脚本所在：scripts/gsc-get-refresh-token.py
SCRIPT_DIR = Path(__file__).resolve().parent
# 项目根：scripts/ 的父目录 = chinaconnect/
PROJECT_ROOT = SCRIPT_DIR.parent
# OAuth client_id / client_secret 存放位置
CLIENT_FILE = PROJECT_ROOT / "references" / "gcp-oauth-client.json"
# refresh_token 输出位置
TOKEN_FILE = PROJECT_ROOT / "references" / "gsc-refresh-token.json"

# OAuth endpoints
AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
TOKEN_URL = "https://oauth2.googleapis.com/token"

# webmasters full scope（P52 铁律：必须 full，不能 readonly）
SCOPE = "https://www.googleapis.com/auth/webmasters"

# 端口范围（按优先级尝试）
PORT_PREFERENCE = [8080] + list(range(8081, 8100))


# =============================================================================
# 端口选择
# =============================================================================

def find_free_port(preferred: list[int]) -> int:
    """从 preferred 列表里挑第一个可用端口。fallback：系统分配。"""
    for port in preferred:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            try:
                s.bind(("127.0.0.1", port))
                return port
            except OSError:
                continue
    # 全部被占 → 让 OS 选
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind(("127.0.0.1", 0))
        return s.getsockname()[1]


# =============================================================================
# 凭据读取（绝不打印到终端）
# =============================================================================

def load_client_credentials() -> tuple[str, str]:
    """从 references/gcp-oauth-client.json 读 client_id / client_secret。

    期望格式：
        {"client_id": "...", "client_secret": "..."}
    """
    if not CLIENT_FILE.exists():
        print(f"[FATAL] 凭据文件不存在：{CLIENT_FILE}", file=sys.stderr)
        print(
            "请先按 references/gsc-setup-instructions.md 创建 OAuth client，"
            "把 client_id / client_secret 存到该路径。",
            file=sys.stderr,
        )
        sys.exit(1)

    try:
        data = json.loads(CLIENT_FILE.read_text(encoding="utf-8"))
    except json.JSONDecodeError as e:
        print(f"[FATAL] 凭据文件 JSON 解析失败：{e}", file=sys.stderr)
        sys.exit(1)

    client_id = data.get("client_id", "").strip()
    client_secret = data.get("client_secret", "").strip()

    if not client_id or not client_secret:
        print(
            "[FATAL] client_id 或 client_secret 为空，请检查 references/gcp-oauth-client.json",
            file=sys.stderr,
        )
        sys.exit(1)

    return client_id, client_secret


# =============================================================================
# HTTP server — 捕获 OAuth callback ?code=...
# =============================================================================

# 全局变量，callback handler 写入，主线程读
_captured_code: str | None = None
_captured_error: str | None = None


class OAuthCallbackHandler(BaseHTTPRequestHandler):
    """OAuth redirect_uri 处理器。

    期望请求形如：
        GET /?code=4/0AQlEd8x...&scope=...&authuser=0&prompt=consent HTTP/1.1
    """

    def do_GET(self):  # noqa: N802 (BaseHTTPRequestHandler API)
        global _captured_code, _captured_error
        parsed = urllib.parse.urlparse(self.path)
        qs = urllib.parse.parse_qs(parsed.query)

        code = qs.get("code", [None])[0]
        err = qs.get("error", [None])[0]

        if code:
            _captured_code = code
            body = (
                b"<html><body style='font-family:sans-serif;padding:40px;'>"
                b"<h1>&#10003; Authorization successful</h1>"
                b"<p>You can close this window. Return to the terminal.</p>"
                b"</body></html>"
            )
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
        else:
            _captured_error = err or "no_code_in_callback"
            body = (
                f"<html><body><h1>Authorization failed</h1>"
                f"<p>error={err}</p></body></html>"
            ).encode("utf-8")
            self.send_response(400)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)

    def log_message(self, format, *args):
        """静默 HTTP server 默认日志（避免污染终端）。"""
        return


def wait_for_code(server: HTTPServer, timeout_sec: int = 120) -> str | None:
    """阻塞跑 server 直到拿到 code 或超时。

    P52 经验：Google OAuth code TTL 是 5 分钟（300 秒）。
    超时 120 秒是留余量（包含老板手动操作时间）。
    """
    server.timeout = 1.0  # 1 秒 poll 一次
    elapsed = 0
    while elapsed < timeout_sec:
        server.handle_request()
        if _captured_code is not None or _captured_error is not None:
            break
        elapsed += 1
    return _captured_code


# =============================================================================
# 用 code 换 access_token + refresh_token
# =============================================================================

def exchange_code_for_token(
    code: str, client_id: str, client_secret: str, redirect_uri: str
) -> dict:
    """POST https://oauth2.googleapis.com/token 拿 token。

    P52 铁律：
      - 用 urllib.parse.urlencode (safe='') 编码 body
      - POST + application/x-www-form-urlencoded
      - 不要 json.dumps body（token endpoint 期望 form-encoded）
    """
    data = urllib.parse.urlencode(
        {
            "code": code,
            "client_id": client_id,
            "client_secret": client_secret,
            "redirect_uri": redirect_uri,
            "grant_type": "authorization_code",
        },
        safe="",  # P52 铁律：URL-encode 所有特殊字符
    ).encode("utf-8")

    req = urllib.request.Request(
        TOKEN_URL,
        data=data,
        headers={"Content-Type": "application/x-www-form-urlencoded"},
        method="POST",
    )

    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            payload = json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8", errors="replace")
        print(f"[FATAL] token 交换失败：HTTP {e.code}", file=sys.stderr)
        print(f"        响应体：{body}", file=sys.stderr)
        print(
            "        排查：client_id / client_secret / redirect_uri 是否匹配 GCP console",
            file=sys.stderr,
        )
        sys.exit(1)
    except urllib.error.URLError as e:
        print(f"[FATAL] token 交换网络错误：{e}", file=sys.stderr)
        sys.exit(1)

    refresh_token = payload.get("refresh_token")
    if not refresh_token:
        print(
            "[FATAL] 响应里没有 refresh_token。完整响应：", file=sys.stderr
        )
        # 打印字段名而不是值（绝不打印 access_token 等敏感值）
        print(f"        字段：{sorted(payload.keys())}", file=sys.stderr)
        print(
            "        可能原因：用户已授权过此 client（重复授权不会发新 refresh_token）。"
            "解决办法：到 https://myaccount.google.com/permissions 撤销 ChinaConnect "
            "GSC app 的授权，再重跑本脚本。",
            file=sys.stderr,
        )
        sys.exit(1)

    return payload


# =============================================================================
# 主流程
# =============================================================================

def main() -> int:
    # 1. 读 client_id / client_secret（绝不打印）
    client_id, client_secret = load_client_credentials()

    # 2. 选端口
    port = find_free_port(PORT_PREFERENCE)
    redirect_uri = f"http://127.0.0.1:{port}/"

    # 3. 生成 state（防 CSRF，不强制校验但加更稳）
    state = secrets.token_urlsafe(16)

    # 4. 拼 OAuth URL
    auth_params = urllib.parse.urlencode(
        {
            "client_id": client_id,
            "redirect_uri": redirect_uri,
            "response_type": "code",
            "scope": SCOPE,
            "access_type": "offline",  # 必须 offline 才发 refresh_token
            "prompt": "consent",       # 强制每次都发新 refresh_token
            "state": state,
            "include_granted_scopes": "true",
        },
        safe="",  # P52 铁律
        quote_via=urllib.parse.quote,
    )
    auth_url = f"{AUTH_URL}?{auth_params}"

    # 5. 启动 HTTP server
    server = HTTPServer(("127.0.0.1", port), OAuthCallbackHandler)
    print("=" * 70)
    print("ChinaConnect GSC OAuth — 浏览器授权流程")
    print("=" * 70)
    print(f"[INFO] 本地回调 server 已启动：{redirect_uri}")
    print(f"[INFO] 即将打开浏览器到 Google 授权页...")
    print(f"[INFO] 端口：{port}（GCP OAuth client 必须注册此 URI）")
    print(f"[INFO] 超时：120 秒")
    print("=" * 70)
    print()
    print("[STEPS] 请在浏览器里：")
    print("  1. 登录老板的 Google 账号（有 chinaengage.org GSC 权限的）")
    print("  2. 看到 'Allow ... to access your ...' 页面 → 点 'Allow'")
    print("  3. 浏览器跳回 127.0.0.1 → 看到 'Authorization successful' 即可关闭")
    print()
    print("[STEPS] 如果浏览器没自动打开，手动复制下面这个 URL 到地址栏：")
    print(f"  {auth_url}")
    print()
    print("[NOTE] client_id / client_secret / token 都不会打印到终端。")
    print()

    # 6. 尝试打开浏览器（失败不影响主流程，老板可手动复制 URL）
    try:
        webbrowser.open(auth_url)
    except Exception:
        pass

    # 7. 阻塞等 code
    code = wait_for_code(server, timeout_sec=120)

    # 8. 关 server
    try:
        server.server_close()
    except Exception:
        pass

    if not code:
        print("[FATAL] 120 秒内没收到 OAuth code。", file=sys.stderr)
        if _captured_error:
            print(f"        OAuth error: {_captured_error}", file=sys.stderr)
        print(
            "        排查：浏览器是否真的跳到 localhost？GCP OAuth client "
            "redirect_uri 是否精确匹配（含端口号、含末尾斜杠）？",
            file=sys.stderr,
        )
        return 1

    # 9. 用 code 换 token
    token_payload = exchange_code_for_token(
        code=code,
        client_id=client_id,
        client_secret=client_secret,
        redirect_uri=redirect_uri,
    )

    refresh_token = token_payload["refresh_token"]

    # 10. 写到 references/gsc-refresh-token.json
    TOKEN_FILE.parent.mkdir(parents=True, exist_ok=True)
    token_data = {
        "refresh_token": refresh_token,
        "client_id": client_id,
        "client_secret": client_secret,
        "updated_at": date.today().isoformat(),
    }
    TOKEN_FILE.write_text(
        json.dumps(token_data, indent=2, ensure_ascii=False),
        encoding="utf-8",
    )

    # 11. 静默收尾（不打印 token 内容，只确认成功）
    print("=" * 70)
    print("[OK] refresh_token 已写入：")
    print(f"     {TOKEN_FILE}")
    print()
    print("[OK] 字段：")
    print(f"     refresh_token: <已保存，长度 {len(refresh_token)}>")
    print(f"     client_id: <已保存，长度 {len(client_id)}>")
    print(f"     client_secret: <已保存，长度 {len(client_secret)}>")
    print(f"     updated_at: {token_data['updated_at']}")
    print()
    print("[NEXT] 下一步：")
    print("  1. 把 references/gsc-refresh-token.json 加进 .gitignore")
    print("  2. 测试：python scripts/gsc-daily-report.py")
    print("  3. 验证报告生成在 .audit/gsc-reports/<today>.md")
    print("=" * 70)
    return 0


if __name__ == "__main__":
    sys.exit(main())
