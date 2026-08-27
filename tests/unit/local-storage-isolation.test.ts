/**
 * Unit tests: per-user isolation of AI localStorage data.
 *
 * Guards against cross-account leakage when two accounts share one browser:
 * saved routes, conversations, snapshots and share indexes must be scoped to
 * the bound user id, and legacy unscoped keys must be migrated once and then
 * removed so they can never leak across accounts.
 */
import { describe, it, expect, beforeEach, vi } from "vitest";
type LocalStorageManager = ReturnType<typeof import("@/lib/ai/local-storage-manager").getLocalStorageManager>;

async function freshManager(userId?: string | null): Promise<LocalStorageManager> {
  const mod = await import("@/lib/ai/local-storage-manager");
  return mod.getLocalStorageManager(userId);
}

describe("LocalStorageManager per-user isolation", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.resetModules();
  });

  it("keeps saved routes isolated between users on the same browser", async () => {
    const a = await freshManager("userA");
    a.upsertSavedRoute({ id: "route-a", title: "A's Shanghai trip", userId: "userA" });

    // User B on the same browser must not see A's locally cached route.
    const b = await freshManager("userB");
    expect(b.loadSavedRoutes()).toEqual([]);

    // Switching back to A restores A's data.
    const aAgain = await freshManager("userA");
    const routes = aAgain.loadSavedRoutes();
    expect(routes).toHaveLength(1);
    expect(routes[0].id).toBe("route-a");
  });

  it("keeps conversations isolated between users", async () => {
    const a = await freshManager("userA");
    a.upsertConversation({
      id: "conv-a",
      name: "A's conversation",
      createdAt: "2026-08-27T00:00:00.000Z",
      updatedAt: "2026-08-27T00:00:00.000Z",
      messageCount: 3,
      hasItinerary: true,
    });

    const b = await freshManager("userB");
    expect(b.loadConversations()).toEqual([]);

    const aAgain = await freshManager("userA");
    expect(aAgain.loadConversations()).toHaveLength(1);
    expect(aAgain.loadConversations()[0].id).toBe("conv-a");
  });

  it("isolates snapshots by user", async () => {
    const a = await freshManager("userA");
    a.saveSnapshot(
      "conv-a",
      [
        {
          id: "m1",
          role: "user" as const,
          content: "上海三日游",
          timestamp: new Date("2026-08-27T00:00:00.000Z"),
        },
      ],
      undefined,
      false,
    );

    const b = await freshManager("userB");
    expect(b.loadSnapshot("conv-a")).toBeNull();
    expect(b.getAllSnapshotConversationIds()).toEqual([]);

    const aAgain = await freshManager("userA");
    expect(aAgain.loadSnapshot("conv-a")).not.toBeNull();
    expect(aAgain.getAllSnapshotConversationIds()).toEqual(["conv-a"]);
  });

  it("migrates legacy saved routes to their owner and removes the legacy key", async () => {
    localStorage.setItem(
      "cc_ai_saved_routes",
      JSON.stringify([
        { id: "r1", userId: "userA" },
        { id: "r2", userId: "userB" },
        { id: "r3" },
      ]),
    );

    const a = await freshManager("userA");
    const aRoutes = a.loadSavedRoutes();
    // A gets A-owned routes plus legacy routes without an owner (attributed to
    // the first migrating user so they keep their own pre-upgrade data).
    expect(aRoutes.map((r) => r.id)).toEqual(["r1", "r3"]);
    // B-owned routes must never leak into A's scope.
    expect(aRoutes.map((r) => r.id)).not.toContain("r2");
    // Legacy unscoped key is removed after the one-time migration so it can
    // never leak across accounts later.
    expect(localStorage.getItem("cc_ai_saved_routes")).toBeNull();

    // The user who owns r2 still gets it from Supabase (ai_routes is the
    // source of truth) and never sees A's migrated local routes.
    const b = await freshManager("userB");
    expect(b.loadSavedRoutes().map((r) => r.id)).not.toContain("r1");
    expect(b.loadSavedRoutes().map((r) => r.id)).not.toContain("r3");
  });

  it("isolates the share index per user", async () => {
    const a = await freshManager("userA");
    a.saveShareIndex({ "token-a": "route-a" });

    const b = await freshManager("userB");
    expect(b.loadShareIndex()).toEqual({});

    const aAgain = await freshManager("userA");
    expect(aAgain.loadShareIndex()).toEqual({ "token-a": "route-a" });
  });
});
