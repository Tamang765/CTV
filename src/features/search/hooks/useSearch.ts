import { useCallback, useEffect, useRef, useState } from "preact/hooks";
import { fetchCategory, readCategoryPage, searchCategory } from "../../../api/swapi";
import type { Category } from "../../../types/common";
import type { Entity } from "../../../types/entities";
import { errorMessage } from "../../../utils/errors";

export type SearchState =
  | { status: "loading" }
  | {
      status: "success";
      data: Entity[];
      total: number;
      next: string | null;
      loadingMore: boolean;
    }
  | { status: "error"; message: string };

interface SearchResult {
  key: string;
  state: SearchState;
}

const LOADING_STATE: SearchState = { status: "loading" };

export function useSearch(category: Category | null, query: string) {
  const cleanQuery = query.trim();
  const [attempt, setAttempt] = useState(0);
  const requestKey = JSON.stringify([category, cleanQuery, attempt]);
  const [result, setResult] = useState<SearchResult>({
    key: requestKey,
    state: LOADING_STATE,
  });
  const moreRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!category) return;
    const controller = new AbortController();
    setResult({ key: requestKey, state: LOADING_STATE });

    const load = cleanQuery
      ? searchCategory(category, cleanQuery, controller.signal)
      : fetchCategory(category, controller.signal);
    void load.then(
      (page) => {
        if (controller.signal.aborted) return;
        setResult({
          key: requestKey,
          state: {
            status: "success",
            data: page.data,
            total: page.total,
            next: page.next,
            loadingMore: false,
          },
        });
      },
      (error: unknown) => {
        if (controller.signal.aborted) return;
        setResult({
          key: requestKey,
          state: { status: "error", message: errorMessage(error) },
        });
      },
    );
    return () => {
      controller.abort();
      moreRef.current?.abort();
      moreRef.current = null;
    };
  }, [category, cleanQuery, requestKey]);

  const state = result.key === requestKey ? result.state : LOADING_STATE;

  const loadMore = useCallback(
    () => {
      if (
        category === null ||
        moreRef.current !== null ||
        state.status !== "success" ||
        state.next === null ||
        state.loadingMore
      )
        return;

      const controller = new AbortController();
      moreRef.current = controller;
      setResult({
        key: requestKey,
        state: { ...state, loadingMore: true },
      });
      void readCategoryPage(category, state.next, controller.signal).then(
        (page) => {
          if (controller.signal.aborted) return;
          if (moreRef.current === controller) moreRef.current = null;
          setResult({
            key: requestKey,
            state: {
              status: "success",
              data: state.data.concat(page.data),
              total: page.total,
              next: page.next,
              loadingMore: false,
            },
          });
        },
        (error: unknown) => {
          if (controller.signal.aborted) return;
          if (moreRef.current === controller) moreRef.current = null;
          setResult({
            key: requestKey,
            state: { status: "error", message: errorMessage(error) },
          });
        },
      );
    },
    [category, requestKey, state],
  );

  return {
    state,
    retry: () => setAttempt((value) => value + 1),
    loadMore,
  };
}
