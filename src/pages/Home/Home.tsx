import { getCurrentFocusKey } from "@noriginmedia/norigin-spatial-navigation";
import { useEffect, useRef } from "preact/hooks";
import { Button } from "../../components/Button/Button";
import { FocusButton, FocusRegion } from "../../components/Focusable/Focusable";
import { Icon } from "../../components/Icon/Icon";
import { CATEGORY_META } from "../../constants/categories";
import { useHomeFeed, type FeedCategory } from "../../hooks/useHomeFeed";
import type { Category } from "../../types/common";
import type { Entity } from "../../types/entities";
import { displayValue } from "../../utils/formatters";
import { focus, homeItemKey } from "../../utils/navigation";
import styles from "./Home.module.css";

const Categories: {
  category: FeedCategory;
  limit: number;
}[] = [
  { category: "films", limit: 9 },
  { category: "people", limit: 8 },
  { category: "starships", limit: 8 },
];

const art = (category: string) =>
  `${import.meta.env.BASE_URL}assets/images/categories/${category}.svg`;

export function Home({
  onOpenCategory,
  onOpenEntity,
}: {
  onOpenCategory: (category: Category) => void;
  onOpenEntity: (entity: Entity) => void;
}) {
  const feed = useHomeFeed();
  const films = feed.films.state;
  const hero =
    films.status === "success"
      ? (films.data.find(
          (entity) =>
            entity.category === "films" && entity.attributes.episode === 4,
        ) ??
        films.data[0] ??
        null)
      : null;

  const entryKey = (category: FeedCategory) => {
    const current = feed[category].state;
    if (current.status === "error") return `retry-${category}`;
    const first = current.status === "success" ? current.data[0] : undefined;
    return first ? homeItemKey(first) : `home-rail-${category}`;
  };

  return (
    <FocusRegion
      id="home"
      className={styles.home}
      preferred="home-hero"
      label="Home"
    >
      <div className={styles.scroll} data-scroll-region>
        <section
          className={styles.hero}
          data-hero
          aria-labelledby="home-heading"
        >
          <img
            className={styles.heroArt}
            src={art("films")}
            alt="films hero art"
            aria-hidden="true"
          />
          <div className={styles.heroScrim} />

          <div className={styles.heroCopy}>
            {hero ? (
              <>
                <p className={styles.heroKicker}>FILMS</p>
                <h1 id="home-heading">{hero.name}</h1>
                <p className={styles.heroText}>{displayValue(hero.summary)}</p>
              </>
            ) : (
              <>
                <p className={styles.heroKicker}>THE COLLECTION</p>
                <h1 id="home-heading">Explore the archive.</h1>
                <p className={styles.heroText}>
                  Six collections of records are waiting to be rediscovered.
                </p>
              </>
            )}
            <div className={styles.heroActions}>
              <Button
                variant="primary"
                id="home-hero"
                onPress={() => onOpenCategory("films")}
                onArrow={(direction) => {
                  if (direction === "up" || direction === "left") {
                    focus("nav-home");
                    return false;
                  }
                  if (direction === "down") {
                    focus(entryKey("films"));
                    return false;
                  }
                  return true;
                }}
                label="Enter films"
              >
                Enter films <Icon name="arrow" />
              </Button>
            </div>
          </div>
        </section>
        <div className={styles.feeds}>
          {Categories.map((rail, railIndex) => (
            <Rail
              key={rail.category}
              rail={rail}
              prevKey={
                railIndex === 0
                  ? "home-hero"
                  : entryKey(Categories[railIndex - 1]!.category)
              }
              nextKey={
                railIndex + 1 < Categories.length
                  ? entryKey(Categories[railIndex + 1]!.category)
                  : null
              }
              feed={feed[rail.category]}
              onOpenCategory={onOpenCategory}
              onOpenEntity={onOpenEntity}
            />
          ))}
        </div>
      </div>
    </FocusRegion>
  );
}

function Rail({
  rail,
  prevKey,
  nextKey,
  feed: { state: feed, retry },
  onOpenCategory,
  onOpenEntity,
}: {
  rail: (typeof Categories)[number];
  prevKey: string;
  nextKey: string | null;
  feed: ReturnType<typeof useHomeFeed>["films"];
  onOpenCategory: (category: Category) => void;
  onOpenEntity: (entity: Entity) => void;
}) {
  const meta = CATEGORY_META[rail.category];
  const viewAllKey = `home-rail-${rail.category}`;
  const retryPending = useRef(false);
  const items = feed.status === "success" ? feed.data.slice(0, rail.limit) : [];

  useEffect(() => {
    if (!retryPending.current || feed.status === "loading") return;
    retryPending.current = false;
    if (getCurrentFocusKey() !== viewAllKey) return;
    if (feed.status === "error") focus(`retry-${rail.category}`);
    else if (feed.data[0]) focus(homeItemKey(feed.data[0]));
  }, [feed, rail.category, viewAllKey]);
  const railArrows =
    (index: number, isLast: boolean) =>
    (direction: string): boolean => {
      if (nextKey && direction === "down") {
        focus(nextKey);
        return false;
      }
      if (direction === "down" && !nextKey) return true;
      if (direction === "up") {
        focus(prevKey);
        return false;
      }
      if (direction === "left" && index === 0) {
        focus("nav-home");
        return false;
      }
      if (direction === "right" && isLast) return false;
      return true;
    };

  return (
    <FocusRegion
      id={`rail-${rail.category}`}
      className={styles.rail}
      label={`${rail.category} rail`}
    >
      <div className={styles.railHead}>
        <h2>
          {meta.label}
          {feed.status === "success" && ` · ${feed.total} available`}
        </h2>
      </div>
      {feed.status === "error" && (
        <div className={styles.railError}>
          <Icon name="alert" size={26} />
          <span role="alert">{feed.message}</span>
          <Button
            variant="small"
            id={`retry-${rail.category}`}
            onArrow={railArrows(0, false)}
            onPress={() => {
              retryPending.current = true;
              focus(viewAllKey);
              retry();
            }}
          >
            Try again
          </Button>
        </div>
      )}
      <div
        className={styles.strip}
        data-scroll-region
        data-strip
        aria-busy={feed.status === "loading"}
      >
        {feed.status === "loading" &&
          Array.from({ length: 4 }, (_, index) => (
            <div
              key={`loading-${index}`}
              className={styles.skeletonPoster}
              aria-hidden="true"
            />
          ))}
        {items.map((entity, index) => (
          <FocusButton
            key={homeItemKey(entity)}
            id={homeItemKey(entity)}
            className={styles.poster}
            label={`Open ${entity.name}`}
            onPress={() => onOpenEntity(entity)}
            onArrow={railArrows(index, false)}
          >
            <img
              className={styles.posterArt}
              src={art(rail.category)}
              alt=""
              loading="lazy"
              draggable={false}
            />
            <div className={styles.posterShade} />
            <div className={styles.posterInfo}>
              <h3>{entity.name}</h3>
              <p>{displayValue(entity.summary)}</p>
            </div>
          </FocusButton>
        ))}
        <FocusButton
          key={viewAllKey}
          id={viewAllKey}
          className={styles.seeAll}
          label={`View all ${meta.label.toLowerCase()}`}
          onPress={() => onOpenCategory(rail.category)}
          onArrow={(direction) => {
            if (
              feed.status === "error" &&
              (direction === "up" || direction === "left")
            ) {
              focus(`retry-${rail.category}`);
              return false;
            }
            return railArrows(items.length, true)(direction);
          }}
        >
          <span>View all {meta.label.toLowerCase()}</span>
          <Icon name="arrow" size={28} />
        </FocusButton>
      </div>
    </FocusRegion>
  );
}
