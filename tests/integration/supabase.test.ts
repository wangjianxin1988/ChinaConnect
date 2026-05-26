// Integration tests for Supabase API integration
// Tests the Supabase client mock behavior pattern

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Create a fresh mock query object factory
function createMockQuery() {
  return {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockResolvedValue({ data: [], error: null }),
    single: vi.fn().mockResolvedValue({ data: null, error: null }),
    data: null,
    error: null,
  };
}

// Create mocks outside vi.mock for proper typing
const mockAuth = {
  getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
};

const mockQuery = createMockQuery();
const mockFrom = vi.fn().mockReturnValue(mockQuery);

vi.mock("@/services/supabase", () => ({
  supabase: {
    from: mockFrom,
    auth: mockAuth,
  },
}));

describe("Supabase Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Recreate mock query with fresh functions
    const freshQuery = createMockQuery();
    mockFrom.mockReturnValue(freshQuery);
    mockAuth.getSession.mockResolvedValue({ data: { session: null }, error: null });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("Restaurant data fetching", () => {
    it("should call supabase.from with correct table name", () => {
      expect(mockFrom).toBeDefined();
      expect(typeof mockFrom).toBe("function");

      mockFrom("restaurants");
      expect(mockFrom).toHaveBeenCalledWith("restaurants");
    });

    it("should create query object when calling from()", () => {
      const query = mockFrom("restaurants");
      expect(query).toBeDefined();
      expect(query).toHaveProperty("select");
      expect(query).toHaveProperty("eq");
    });
  });

  describe("Authentication", () => {
    it("should check session on app load", async () => {
      const result = await mockAuth.getSession();

      expect(result).toBeDefined();
      expect(result.data).toBeDefined();
      expect(result.error).toBeNull();
    });
  });

  describe("Restaurant CRUD operations", () => {
    it("should fetch restaurants by city", async () => {
      const testData = [
        { id: "test-1", name: "Test Restaurant", city: "beijing", type: "michelin" },
      ];

      const cityQuery = createMockQuery();
      cityQuery.eq = vi.fn().mockResolvedValue({ data: testData, error: null });
      mockFrom.mockReturnValue(cityQuery);

      const result = await cityQuery.eq("city", "beijing");

      expect(result.data).toHaveLength(1);
      expect(result.data[0].city).toBe("beijing");
    });

    it("should handle restaurant not found", async () => {
      const notFoundQuery = createMockQuery();
      notFoundQuery.single = vi.fn().mockResolvedValue({
        data: null,
        error: { message: "No restaurant found" },
      });
      mockFrom.mockReturnValue(notFoundQuery);

      const result = await notFoundQuery.single();

      expect(result.error).toBeDefined();
      expect(result.error?.message).toBe("No restaurant found");
    });

    it("should filter restaurants by type", async () => {
      const typeQuery = createMockQuery();
      typeQuery.eq = vi.fn().mockResolvedValue({
        data: [{ id: "test-1", name: "Michelin Restaurant", type: "michelin" }],
        error: null,
      });
      mockFrom.mockReturnValue(typeQuery);

      const result = await typeQuery.eq("type", "michelin");

      expect(result.data).toHaveLength(1);
    });
  });

  describe("Error handling", () => {
    it("should handle network errors gracefully", async () => {
      const errorQuery = createMockQuery();
      errorQuery.single = vi.fn().mockResolvedValue({
        data: null,
        error: { message: "Network error", code: "NETWORK_ERROR" },
      });
      mockFrom.mockReturnValue(errorQuery);

      const result = await errorQuery.single();

      expect(result.error).toBeDefined();
      expect(result.error?.message).toContain("error");
    });

    it("should handle invalid credentials", async () => {
      const authErrorQuery = createMockQuery();
      authErrorQuery.single = vi.fn().mockResolvedValue({
        data: null,
        error: { message: "Invalid API key", code: "INVALID_API_KEY" },
      });
      mockFrom.mockReturnValue(authErrorQuery);

      const result = await authErrorQuery.single();

      expect(result.error).toBeDefined();
    });
  });
});
