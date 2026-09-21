import { Button } from "../../components/Button/Button";
import { ErrorState } from "../../components/ErrorState/ErrorState";
import { FocusButton, FocusRegion } from "../../components/Focusable/Focusable";
import { Icon } from "../../components/Icon/Icon";
import { CATEGORY_META } from "../../constants/categories";
import {
  useHomeFeed,
  type FeedCategory,
  type HomeFeedPage,
} from "../../hooks/useHomeFeed";
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

// Ordered focus keys for a rail, including the trailing "View all" control.
const homeRailKeys = (
  category: FeedCategory,
  feed: HomeFeedPage,
  limit: number,
) => [...feed.data.slice(0, limit).map(homeItemKey), `home-rail-${category}`];

export function Home({
  onOpenCategory,
  onOpenEntity,
}: {
  onOpenCategory: (category: Category) => void;
  onOpenEntity: (entity: Entity) => void;
}) {
  const { state, retry } = useHomeFeed();
  const films = state.status === "success" ? state.feeds.films.data : [];
  const hero =
    state.status === "success"
      ? (films.find(
          (entity) =>
            entity.category === "films" && entity.attributes.episode === 4,
        ) ??
        films[0] ??
        null)
      : null;

  const railData =
    state.status === "success"
      ? Categories.map((rail) => {
          const feed = state.feeds[rail.category];
          return {
            ...rail,
            feed,
            keys: homeRailKeys(rail.category, feed, rail.limit),
          };
        })
      : [];

  const firstRailEntry = railData[0]?.keys[0] ?? "home-rail-films";

  return (
    <FocusRegion
      id="home"
      className={styles.home}
      preferred="home-hero"
      label="Home"
    >
      <div
        className={styles.scroll}
        data-scroll-region
        data-scroll-axis="y"
        data-scroll-mode="home"
      >
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
                <p className={styles.heroKicker}></p>
                <h1 id="home-heading"></h1>
                <p className={styles.heroText}></p>
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
                    if (state.status === "error") focus("home-retry");
                    else if (state.status === "success") focus(firstRailEntry);
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
          {state.status === "loading" && <HomeLoading />}
          {state.status === "error" && (
            <ErrorState title="We lost the signal." message={state.message}>
              <Button
                variant="primary"
                id="home-retry"
                onPress={() => {
                  focus("home-hero");
                  retry();
                }}
              >
                <Icon name="reset" /> Try again
              </Button>
            </ErrorState>
          )}
          {state.status === "success" &&
            railData.map((rail, railIndex) => (
              <Rail
                key={rail.category}
                rail={rail}
                prevKeys={
                  railIndex === 0
                    ? ["home-hero"]
                    : railData[railIndex - 1]!.keys
                }
                nextKeys={
                  railIndex + 1 < railData.length
                    ? railData[railIndex + 1]!.keys
                    : null
                }
                onOpenCategory={onOpenCategory}
                onOpenEntity={onOpenEntity}
              />
            ))}
        </div>
      </div>
    </FocusRegion>
  );
}

function HomeLoading() {
  return (
    <>
      {Categories.map(({ category }) => (
        <div key={category} className={styles.rail} aria-hidden="true">
          <div className={styles.railHead}>
            <h2>{CATEGORY_META[category].label}</h2>
          </div>
          <div className={styles.strip}>
            {Array.from({ length: 6 }, (_, index) => (
              <div key={index} className={styles.skeletonPoster} />
            ))}
          </div>
        </div>
      ))}
    </>
  );
}

function Rail({
  rail,
  prevKeys,
  nextKeys,
  onOpenCategory,
  onOpenEntity,
}: {
  rail: {
    category: FeedCategory;
    limit: number;
    feed: HomeFeedPage;
    keys: string[];
  };
  prevKeys: string[];
  nextKeys: string[] | null;
  onOpenCategory: (category: Category) => void;
  onOpenEntity: (entity: Entity) => void;
}) {
  const meta = CATEGORY_META[rail.category];
  const viewAllKey = `home-rail-${rail.category}`;
  const items = rail.feed.data.slice(0, rail.limit);

  // Nearest equivalent index in the adjacent rail, clamped when it is shorter.
  const closest = (keys: string[], index: number) =>
    keys[Math.min(index, keys.length - 1)];

  const railArrows =
    (index: number) =>
    (direction: string): boolean => {
      if (direction === "down") {
        if (!nextKeys) return true;
        const key = closest(nextKeys, index);
        if (key) focus(key);
        return false;
      }
      if (direction === "up") {
        const key = closest(prevKeys, index);
        if (key) focus(key);
        return false;
      }
      if (direction === "left") {
        if (index === 0) {
          focus("nav-home");
          return false;
        }
        const key = rail.keys[index - 1];
        if (key) focus(key);
        return false;
      }
      if (direction === "right") {
        const key = rail.keys[index + 1];
        if (!key) return false;
        focus(key);
        return false;
      }
      return true;
    };

  return (
    <FocusRegion
      id={`rail-${rail.category}`}
      className={styles.rail}
      label={`${rail.category} rail`}
    >
      <div className={styles.railHead}>
        <h2>{meta.label}</h2>
      </div>
      <div
        className={styles.strip}
        data-scroll-region
        data-strip
        data-scroll-axis="x"
        data-scroll-mode="rail"
      >
        {items.map((entity, index) => (
          <FocusButton
            key={homeItemKey(entity)}
            id={homeItemKey(entity)}
            className={styles.poster}
            label={`Open ${entity.name}`}
            onPress={() => onOpenEntity(entity)}
            onArrow={railArrows(index)}
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
          onArrow={railArrows(items.length)}
        >
          <span>View all {meta.label.toLowerCase()}</span>
          <Icon name="arrow" size={28} />
        </FocusButton>
      </div>
    </FocusRegion>
  );
}
