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
      moreError: string | null;
    }
  | { status: "error"; message: string };

interface Snapshot {
  category: Category | null;
  query: string;
  attempt: number;
  state: SearchState;
}

export function useSearch(category: Category | null, query: string) {
  const cleanQuery = query.trim();
  const [attempt, setAttempt] = useState(0);
  const [snapshot, setSnapshot] = useState<Snapshot>({
    category,
    query: cleanQuery,
    attempt: 0,
    state: { status: "loading" },
  });
  const moreRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!category) return;
    const controller = new AbortController();
    setSnapshot({
      category,
      query: cleanQuery,
      attempt,
      state: { status: "loading" },
    });

    const load = cleanQuery
      ? searchCategory(category, cleanQuery, controller.signal)
      : fetchCategory(category, controller.signal);
    void load.then(
      (page) => {
        if (controller.signal.aborted) return;
        setSnapshot({
          category,
          query: cleanQuery,
          attempt,
          state: {
            status: "success",
            data: page.data,
            total: page.total,
            next: page.next,
            loadingMore: false,
            moreError: null,
          },
        });
      },
      (error: unknown) => {
        if (controller.signal.aborted) return;
        setSnapshot({
          category,
          query: cleanQuery,
          attempt,
          state: { status: "error", message: errorMessage(error) },
        });
      },
    );
    return () => {
      controller.abort();
      moreRef.current?.abort();
      moreRef.current = null;
    };
  }, [category, cleanQuery, attempt]);

  const requestMore = useCallback(
    (isRetry: boolean) => {
      const current = snapshot.state;
      const active = snapshot.category;
      if (
        active === null ||
        active !== category ||
        snapshot.query !== cleanQuery ||
        snapshot.attempt !== attempt ||
        moreRef.current !== null ||
        current.status !== "success" ||
        current.next === null ||
        current.loadingMore ||
        (current.moreError !== null && !isRetry)
      )
        return;

      const nextUrl = current.next;
      const controller = new AbortController();
      moreRef.current = controller;
      setSnapshot({
        ...snapshot,
        state: { ...current, loadingMore: true, moreError: null },
      });
      void readCategoryPage(active, nextUrl, controller.signal).then(
        (page) => {
          if (controller.signal.aborted) return;
          if (moreRef.current === controller) moreRef.current = null;
          setSnapshot((prev) => {
            if (
              prev.category !== active ||
              prev.query !== cleanQuery ||
              prev.attempt !== attempt
            )
              return prev;
            const prevState = prev.state;
            if (prevState.status !== "success" || prevState.next !== nextUrl)
              return prev;
            return {
              ...prev,
              state: {
                ...prevState,
                data: prevState.data.concat(page.data),
                total: page.total,
                next: page.next,
                loadingMore: false,
                moreError: null,
              },
            };
          });
        },
        (error: unknown) => {
          if (controller.signal.aborted) return;
          if (moreRef.current === controller) moreRef.current = null;
          setSnapshot((prev) => {
            if (
              prev.category !== active ||
              prev.query !== cleanQuery ||
              prev.attempt !== attempt
            )
              return prev;
            const prevState = prev.state;
            if (prevState.status !== "success") return prev;
            return {
              ...prev,
              state: {
                ...prevState,
                loadingMore: false,
                moreError: errorMessage(error),
              },
            };
          });
        },
      );
    },
    [category, cleanQuery, attempt, snapshot],
  );

  const loadMore = useCallback(() => requestMore(false), [requestMore]);
  const retryMore = useCallback(() => requestMore(true), [requestMore]);

  const state: SearchState =
    snapshot.category === category &&
    snapshot.query === cleanQuery &&
    snapshot.attempt === attempt
      ? snapshot.state
      : { status: "loading" };

  return {
    state,
    retry: () => {
      setSnapshot({
        category,
        query: cleanQuery,
        attempt,
        state: { status: "loading" },
      });
      setAttempt((value) => value + 1);
    },
    loadMore,
    retryMore,
  };
}
