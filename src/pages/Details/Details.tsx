import type { Entity } from "../../types/entities";
import { ErrorBoundary } from "../../components/ErrorBoundary/ErrorBoundary";
import { DetailView } from "../../features/details/components/DetailView";

export function Details({
  entity,
  onBack,
}: {
  entity: Entity;
  onBack: () => void;
}) {
  return (
    <ErrorBoundary dismiss={onBack}>
      <DetailView entity={entity} onBack={onBack} />
    </ErrorBoundary>
  );
}
