import type { Entity } from "../../types/entities";
import { displayValue } from "../../utils/formatters";
import { cardKey } from "../../utils/navigation";
import { FocusButton } from "../Focusable/Focusable";
import { Icon } from "../Icon/Icon";
import styles from "./Card.module.css";

export function Card({
  entity,
  onOpen,
  onArrow,
  onFocus,
}: {
  entity: Entity;
  onOpen: () => void;
  onArrow: (direction: string) => boolean;
  onFocus?: () => void;
}) {
  return (
    <FocusButton
      id={cardKey(entity)}
      className={styles.card}
      onPress={onOpen}
      onArrow={onArrow}
      onFocus={onFocus}
      label={`Open ${entity.name}`}
    >
      <div className={styles.cardArt}>
        <img
          className={styles.cardImage}
          src={`${import.meta.env.BASE_URL}assets/images/categories/${entity.category}.svg`}
          alt=""
          loading="lazy"
          draggable={false}
        />
      </div>
      <div className={styles.cardBody}>
        <div>
          <h3>{entity.name}</h3>
          <p>{displayValue(entity.summary)}</p>
        </div>
        <span className={styles.cardArrow}>
          <Icon name="arrow" size={22} />
        </span>
      </div>
    </FocusButton>
  );
}