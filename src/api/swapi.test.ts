import { beforeEach, describe, expect, it, vi } from "vitest";
import { categoryEndpoint } from "./endpoints";
import { fetchCategory, readCategoryPage, searchCategory } from "./swapi";

const mocks = vi.hoisted(() => ({
  request: vi.fn(),
}));

vi.mock("./client", () => ({ request: mocks.request }));

const film = {
  title: "A New Hope",
  episode_id: 4,
  opening_crawl: "It is a period of civil war...",
  director: "George Lucas",
  producer: "Gary Kurtz",
  release_date: "1977-05-25",
  characters: ["x", "y"],
  planets: ["z"],
  starships: [],
  vehicles: [],
  species: [],
  url: "https://swapi.dev/api/films/1/",
  created: "2014-12-10T14:23:31.880000Z",
  edited: "2014-12-20T19:49:45.256000Z",
};

const planet = {
  name: "Tatooine",
  rotation_period: "23",
  orbital_period: "304",
  diameter: "10465",
  climate: "arid",
  gravity: "1",
  terrain: "desert",
  surface_water: "1",
  population: "200000",
  residents: ["r1", "r2"],
  films: ["f1", "f2", "f3"],
  url: "https://swapi.dev/api/planets/1/",
  created: "2014-12-09T13:50:49.641000Z",
  edited: "2014-12-20T20:58:18.411000Z",
};

const signal = () => new AbortController().signal;

describe("swapi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads a category page and serves subsequent reads from cache", async () => {
    mocks.request.mockResolvedValueOnce({
      count: 1,
      next: "https://swapi.dev/api/films/?page=2",
      previous: null,
      results: [film],
    });

    const page = await fetchCategory("films", signal());

    expect(page.total).toBe(1);
    expect(page.data).toHaveLength(1);
    expect(page.data[0]).toMatchObject({ name: "A New Hope", category: "films" });
    expect(page.next).toBe(`${categoryEndpoint("films")}?page=2`);
    expect(mocks.request).toHaveBeenCalledTimes(1);

    const cached = await fetchCategory("films", signal());
    expect(mocks.request).toHaveBeenCalledTimes(1);
    expect(cached).toBe(page);
  });

  it("does not issue a request or cache anything for an aborted call", async () => {
    const controller = new AbortController();
    controller.abort();

    await expect(fetchCategory("starships", controller.signal)).rejects.toBeTruthy();
    expect(mocks.request).not.toHaveBeenCalled();
  });

  it("searches without caching and preserves the original query in next", async () => {
    mocks.request
      .mockResolvedValueOnce({
        count: 1,
        next: "https://swapi.dev/api/people/?search=lando&page=2",
        previous: null,
        results: [],
      })
      .mockResolvedValueOnce({
        count: 1,
        next: null,
        previous: "https://swapi.dev/api/people/?search=lando&page=1",
        results: [],
      });

    const first = await searchCategory("people", "lando", signal());
    expect(first.next).toBe(`${categoryEndpoint("people")}?search=lando&page=2`);

    await searchCategory("people", "lando", signal());
    expect(mocks.request).toHaveBeenCalledTimes(2);
  });

  it("rejects a malformed next page link", async () => {
    mocks.request.mockResolvedValueOnce({
      count: 0,
      next: "https://swapi.dev/api/species/?page=abc",
      previous: null,
      results: [],
    });

    await expect(fetchCategory("species", signal())).rejects.toThrow(
      "unexpected format",
    );
  });

  it("maps records into archive entities", async () => {
    mocks.request.mockResolvedValueOnce({
      count: 1,
      next: null,
      previous: null,
      results: [planet],
    });

    const { data, next } = await readCategoryPage(
      "planets",
      `${categoryEndpoint("planets")}?page=1`,
      signal(),
    );

    expect(next).toBeNull();
    expect(data[0]).toMatchObject({
      id: "1",
      category: "planets",
      name: "Tatooine",
      summary: "desert",
    });
  });
});