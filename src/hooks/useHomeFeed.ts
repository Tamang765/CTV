import { useEffect, useState } from "preact/hooks";
import { fetchCategory } from "../api/swapi";
import type { Entity } from "../types/entities";
import { errorMessage } from "../utils/errors";

type FeedState =
  | { status: "loading" }
  | { status: "success"; data: Entity[]; total: number }
  | { status: "error"; message: string };

export type FeedCategory = "films" | "people" | "starships";

function useFeedCategory(category: FeedCategory) {
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<FeedState>({ status: "loading" });

  useEffect(() => {
    const controller = new AbortController();
    void fetchCategory(category, controller.signal).then(
      (page) => {
        if (!controller.signal.aborted)
          setState({ status: "success", data: page.data, total: page.total });
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
  }, [category, attempt]);

  return {
    state,
    retry: () => {
      setState({ status: "loading" });
      setAttempt((value) => value + 1);
    },
  };
}

export function useHomeFeed() {
  const films = useFeedCategory("films");
  const people = useFeedCategory("people");
  const starships = useFeedCategory("starships");
  return { films, people, starships };
}
