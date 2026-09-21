import { act } from "@testing-library/preact";
import { describe, expect, it, vi, beforeEach } from "vitest";
import type { Category } from "../../../types/common";
import type { Planet } from "../../../types/planet";
import { renderHook, type RenderHookResult } from "../../../test/utils";
import { useSearch } from "./useSearch";

const mocks = vi.hoisted(() => ({
  fetchCategory: vi.fn(),
  readCategoryPage: vi.fn(),
  searchCategory: vi.fn(),
}));

vi.mock("../../../api/swapi", () => mocks);

const planet = (id: string, name: string): Planet => ({
  id,
  category: "planets",
  name,
  summary: "desert",
  attributes: {
    climate: "arid",
    terrain: "desert",
    population: "200000",
    diameter: "10465",
    gravity: "1",
    rotationPeriod: "23",
    orbitalPeriod: "304",
    surfaceWater: "1",
    residents: 0,
    films: 5,
  },
});

const TATOOINE = planet("1", "Tatooine");
const HOTH = planet("2", "Hoth");

interface Props {
  category: Category | null;
  query: string;
}

function deferred(): {
  promise: Promise<unknown>;
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
} {
  let resolve: (value: unknown) => void = () => undefined;
  let reject: (reason?: unknown) => void = () => undefined;
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

async function mount(props: Props): Promise<RenderHookResult<ReturnType<typeof useSearch>, Props>> {
  let hook!: RenderHookResult<ReturnType<typeof useSearch>, Props>;
  await act(async () => {
    hook = renderHook(
      (current) => useSearch(current.category, current.query),
      props,
    );
  });
  return hook;
}

const flush = () => act(async () => undefined);

describe("useSearch", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads the first page through fetchCategory and reports success", async () => {
    const request = deferred();
    mocks.fetchCategory.mockReturnValueOnce(request.promise);
    const hook = await mount({ category: "planets", query: "" });

    expect(mocks.fetchCategory).toHaveBeenCalledTimes(1);
    expect(hook.result.current.state.status).toBe("loading");

    await act(async () => {
      request.resolve({ data: [TATOOINE, HOTH], total: 2, next: null });
      await request.promise;
    });

    expect(hook.result.current.state).toEqual({
      status: "success",
      data: [TATOOINE, HOTH],
      total: 2,
      next: null,
      loadingMore: false,
    });
  });

  it("appends the next page when loadMore resolves", async () => {
    mocks.fetchCategory.mockResolvedValueOnce({
      data: [TATOOINE],
      total: 2,
      next: "https://swapi.dev/api/planets/?page=2",
    });
    mocks.readCategoryPage.mockResolvedValueOnce({
      data: [HOTH],
      total: 2,
      next: null,
    });
    const hook = await mount({ category: "planets", query: "" });
    await flush();

    await act(async () => {
      hook.result.current.loadMore();
    });
    await flush();

    expect(mocks.readCategoryPage).toHaveBeenCalledTimes(1);
    expect(mocks.readCategoryPage).toHaveBeenCalledWith(
      "planets",
      "https://swapi.dev/api/planets/?page=2",
      expect.any(AbortSignal),
    );
    expect(hook.result.current.state).toEqual({
      status: "success",
      data: [TATOOINE, HOTH],
      total: 2,
      next: null,
      loadingMore: false,
    });
  });

  it("ignores loadMore when no further pages exist", async () => {
    mocks.fetchCategory.mockResolvedValueOnce({
      data: [TATOOINE],
      total: 1,
      next: null,
    });
    const hook = await mount({ category: "planets", query: "" });
    await flush();

    await act(async () => {
      hook.result.current.loadMore();
    });

    expect(mocks.readCategoryPage).not.toHaveBeenCalled();
  });

  it("keeps a single pagination request in flight", async () => {
    mocks.fetchCategory.mockResolvedValueOnce({
      data: [TATOOINE],
      total: 3,
      next: "https://swapi.dev/api/planets/?page=2",
    });
    const pageTwo = deferred();
    mocks.readCategoryPage.mockReturnValueOnce(pageTwo.promise);
    const hook = await mount({ category: "planets", query: "" });
    await flush();

    await act(async () => {
      hook.result.current.loadMore();
      hook.result.current.loadMore();
    });

    expect(mocks.readCategoryPage).toHaveBeenCalledTimes(1);

    await act(async () => {
      pageTwo.resolve({ data: [HOTH], total: 3, next: null });
      await pageTwo.promise;
    });
  });

  it("ignores stale in-flight responses after the category changes", async () => {
    const planetsRequest = deferred();
    const peopleRequest = deferred();
    mocks.fetchCategory.mockReturnValueOnce(planetsRequest.promise);
    mocks.fetchCategory.mockReturnValueOnce(peopleRequest.promise);
    const hook = await mount({ category: "planets", query: "" });

    await act(async () => {
      hook.rerender({ category: "people", query: "" });
    });

    await act(async () => {
      peopleRequest.resolve({ data: [], total: 0, next: null });
      await peopleRequest.promise;
    });
    expect(hook.result.current.state).toEqual({
      status: "success",
      data: [],
      total: 0,
      next: null,
      loadingMore: false,
    });

    await act(async () => {
      planetsRequest.resolve({ data: [TATOOINE, HOTH], total: 2, next: null });
      await planetsRequest.promise;
    });

    expect(hook.result.current.state).toEqual({
      status: "success",
      data: [],
      total: 0,
      next: null,
      loadingMore: false,
    });
  });

  it("reports errors and retries a fresh request", async () => {
    mocks.fetchCategory.mockRejectedValueOnce(new Error("boom"));
    const hook = await mount({ category: "planets", query: "" });
    await flush();

    expect(hook.result.current.state).toEqual({
      status: "error",
      message: "boom",
    });

    mocks.fetchCategory.mockResolvedValueOnce({
      data: [TATOOINE],
      total: 1,
      next: null,
    });
    await act(async () => {
      hook.result.current.retry();
    });
    await flush();

    expect(hook.result.current.state.status).toBe("success");
    expect(mocks.fetchCategory).toHaveBeenCalledTimes(2);
  });

  it("searchCategory drives query results and trims the query", async () => {
    mocks.searchCategory.mockResolvedValueOnce({
      data: [TATOOINE],
      total: 1,
      next: null,
    });
    const hook = await mount({ category: "planets", query: "" });
    await flush();

    await act(async () => {
      hook.rerender({ category: "planets", query: "  tatooine  " });
    });
    await flush();

    expect(mocks.searchCategory).toHaveBeenCalledWith(
      "planets",
      "tatooine",
      expect.any(AbortSignal),
    );
    expect(hook.result.current.state.status).toBe("success");
  });

  it("does not update state after unmount", async () => {
    const request = deferred();
    mocks.fetchCategory.mockReturnValueOnce(request.promise);
    const hook = await mount({ category: "planets", query: "" });

    await act(async () => {
      hook.unmount();
    });
    await act(async () => {
      request.resolve({ data: [TATOOINE], total: 1, next: null });
      await request.promise;
    });

    expect(hook.result.current.state.status).toBe("loading");
  });
});