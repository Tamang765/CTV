import type { ComponentChildren } from "preact";
import ui from "../../styles/ui.module.css";
import { Icon, type IconName } from "../Icon/Icon";

export function EmptyState({
  icon,
  title,
  message,
  children,
}: {
  icon: IconName;
  title: string;
  message?: string;
  children?: ComponentChildren;
}) {
  return (
    <div className={ui.state}>
      <Icon name={icon} size={44} />
      <h3>{title}</h3>
      {message && <p>{message}</p>}
      {children}
    </div>
  );
}