import {
  FocusButton,
  type FocusButtonProps,
} from "../Focusable/Focusable";
import styles from "./Button.module.css";

export function Button({
  variant,
  className = "",
  ...props
}: FocusButtonProps & { variant: "small" | "primary" }) {
  return (
    <FocusButton {...props} className={`${styles[variant]} ${className}`} />
  );
}