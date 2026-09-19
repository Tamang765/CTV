import { CATEGORY_META } from "../../../constants/categories";
import type { Entity } from "../../../types/entities";
import { Button } from "../../../components/Button/Button";
import { Icon } from "../../../components/Icon/Icon";
import ui from "../../../styles/ui.module.css";

export function DetailActions({
  category,
  onBack,
  onArrow,
}: {
  category: Entity["category"];
  onBack: () => void;
  onArrow: (direction: string) => boolean;
}) {
  const label = CATEGORY_META[category];
  return (
    <div className={ui.detailTop}>
      <span className={ui.eyebrow}>
        THE STAR WARS EXPLORER / {label.label.toUpperCase()}
      </span>
      <Button
        variant="small"
        id="detail-back"
        label={`Back to ${label.label.toLowerCase()}`}
        onPress={onBack}
        onArrow={onArrow}
      >
        <Icon name="back" /> Back
      </Button>
    </div>
  );
}