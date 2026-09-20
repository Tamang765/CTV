import { useEffect, useLayoutEffect, useRef, useState } from "preact/hooks";
import { FocusRegion } from "../../../components/Focusable/Focusable";
import { CATEGORY_META } from "../../../constants/categories";
import type { Entity } from "../../../types/entities";
import { displayValue, entityStats } from "../../../utils/formatters";
import { focus, scrollBehavior } from "../../../utils/navigation";
import styles from "../styles/DetailView.module.css";
import { DetailActions } from "./DetailActions";

export function DetailView({
  entity,
  onBack,
}: {
  entity: Entity;
  onBack: () => void;
}) {
  const bodyRef = useRef<HTMLDivElement>(null);
  const [canScroll, setCanScroll] = useState(false);

  useLayoutEffect(() => {
    const body = bodyRef.current;
    if (!body) return;
    const measure = () =>
      setCanScroll(body.scrollHeight > body.clientHeight + 1);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(body);
    for (const child of body.children) observer.observe(child);
    return () => observer.disconnect();
  }, [entity]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => focus("detail-back"));
    return () => cancelAnimationFrame(frame);
  }, []);

  const scrollBody = (direction: string) => {
    if (direction !== "up" && direction !== "down") return true;
    bodyRef.current?.scrollBy({
      top: direction === "down" ? 260 : -260,
      behavior: scrollBehavior(),
    });
    return false;
  };

  return (
    <FocusRegion
      id="detail"
      className={styles.page}
      boundary
      preferred="detail-back"
      label={`${entity.name}, ${CATEGORY_META[entity.category].label.toLowerCase()} details`}
    >
      <div className={styles.visual}>
        <img
          className={styles.cover}
          src={`${import.meta.env.BASE_URL}assets/images/categories/${entity.category}.svg`}
          alt=""
          aria-hidden="true"
          draggable={false}
        />
        <div className={styles.scrim} />
        <div className={styles.visualCaption}>
          <span className={styles.visualKicker}>
            {CATEGORY_META[entity.category].label.toUpperCase()}
          </span>
        </div>
      </div>
      <div className={styles.content}>
        <DetailActions
          category={entity.category}
          onBack={onBack}
          onArrow={scrollBody}
        />
        <h1 id="detail-title">{entity.name}</h1>
        <p className={styles.summary}>{displayValue(entity.summary)}</p>
        <div
          className={styles.body}
          ref={bodyRef}
          data-scroll-region
          data-scroll-axis="y"
          data-scroll-mode="manual"
        >
          <dl className={styles.stats}>
            {entityStats(entity).map((item) => (
              <div key={item.label}>
                <dt>{item.label}</dt>
                <dd>{item.value}</dd>
              </div>
            ))}
          </dl>
          {entity.category === "films" && (
            <section className={styles.crawl} aria-label="Opening crawl">
              <h3>Opening crawl</h3>
              <p>{entity.attributes.openingCrawl}</p>
            </section>
          )}
        </div>
        {canScroll && <p className={styles.scrollHint}>↑ ↓ Scroll details</p>}
      </div>
    </FocusRegion>
  );
}
