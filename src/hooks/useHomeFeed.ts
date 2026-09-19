import { useEffect, useState } from "preact/hooks";
import { fetchCategory } from "../api/swapi";
import type { Entity } from "../types/entities";
import { errorMessage } from "../utils/errors";

export interface HomeFeedPage {
  data: Entity[];
  total: number;
}

export type FeedCategory = "films" | "people" | "starships";

type HomeFeedState =
  | { status: "loading" }
  | { status: "success"; feeds: Record<FeedCategory, HomeFeedPage> }
  | { status: "error"; message: string };

export function useHomeFeed() {
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<HomeFeedState>({ status: "loading" });

  useEffect(() => {
    const controller = new AbortController();
    void Promise.all([
      fetchCategory("films", controller.signal),
      fetchCategory("people", controller.signal),
      fetchCategory("starships", controller.signal),
    ]).then(
      ([films, people, starships]) => {
        if (!controller.signal.aborted)
          setState({
            status: "success",
            feeds: { films, people, starships },
          });
      },
      (error: unknown) => {
        if (!controller.signal.aborted) {
          setState({
            status: "error",
            message: errorMessage(error),
          });
        }
      },
    );
    return () => controller.abort();
  }, [attempt]);

  return {
    state,
    retry: () => {
      setState({ status: "loading" });
      setAttempt((value) => value + 1);
    },
  };
}
