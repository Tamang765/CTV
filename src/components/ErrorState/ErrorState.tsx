import type { ComponentChildren } from "preact";
import ui from "../../styles/ui.module.css";
import { Icon } from "../Icon/Icon";

export function ErrorState({
  title,
  message,
  children,
}: {
  title: string;
  message: string;
  children?: ComponentChildren;
}) {
  return (
    <div className={ui.state}>
      <Icon name="alert" size={44} />
      <h3 role="alert">{title}</h3>
      <p>{message}</p>
      {children}
    </div>
  );
}
