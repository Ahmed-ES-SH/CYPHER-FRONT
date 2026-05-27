import { describe, it, expect } from "vitest";
import { userKeys } from "../constants/user.constants";

describe("userKeys", () => {
  it("all has ['users'] prefix", () => {
    expect(userKeys.all).toEqual(["users"]);
  });

  it("lists() appends 'list' after the prefix", () => {
    expect(userKeys.lists()).toEqual(["users", "list"]);
  });

  it("list(filters) appends filters after list prefix", () => {
    const filters = { role: "admin" };
    expect(userKeys.list(filters)).toEqual(["users", "list", filters]);
  });

  it("list() defaults to empty object when no filters provided", () => {
    expect(userKeys.list()).toEqual(["users", "list", {}]);
  });

  it("details() appends 'detail' after the prefix", () => {
    expect(userKeys.details()).toEqual(["users", "detail"]);
  });

  it("detail(id) appends id after detail prefix", () => {
    expect(userKeys.detail(42)).toEqual(["users", "detail", 42]);
  });

  it("stats() appends 'stats' after the prefix", () => {
    expect(userKeys.stats()).toEqual(["users", "stats"]);
  });
});
