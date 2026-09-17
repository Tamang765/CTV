import { Component, createRef, type ComponentChildren } from "preact";
import { focus } from "../../utils/navigation";
import { isBackKey } from "../../constants/keys";
import { Button } from "../Button/Button";
import { FocusRegion } from "../Focusable/Focusable";
import { Icon } from "../Icon/Icon";
import modalStyles from "../Modal/Modal.module.css";
import ui from "../../styles/ui.module.css";
import styles from "./ErrorBoundary.module.css";

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

interface ErrorBoundaryProps {
  children: ComponentChildren;
  title?: string;
  message?: string;
  dismiss?: () => void;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false, message: "" };
  private dialogRef = createRef<HTMLDivElement>();
  static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    return {
      hasError: true,
      message:
        error instanceof Error && error.message
          ? error.message
          : "An unexpected error interrupted the archive.",
    };
  }
  componentDidCatch(error: unknown, errorInfo: unknown) {
    console.error("[UKTV error boundary]", error, errorInfo);
    const key = this.props.dismiss ? "crash-dismiss" : "crash-reload";
    requestAnimationFrame(() => focus(key));
  }
  componentDidUpdate(
    _prevProps: ErrorBoundaryProps,
    prevState: ErrorBoundaryState,
  ) {
    if (this.state.hasError && !prevState.hasError)
      window.addEventListener("keydown", this.handleKey);
    if (!this.state.hasError && prevState.hasError)
      window.removeEventListener("keydown", this.handleKey);
  }
  componentWillUnmount() {
    window.removeEventListener("keydown", this.handleKey);
  }
  private handleKey = (event: KeyboardEvent) => {
    if (event.key === "Tab") {
      event.preventDefault();
      const buttons = [
        ...(this.dialogRef.current?.querySelectorAll<HTMLButtonElement>(
          "button",
        ) ?? []),
      ];
      const current = buttons.indexOf(
        document.activeElement as HTMLButtonElement,
      );
      const next =
        (current + (event.shiftKey ? -1 : 1) + buttons.length) %
        buttons.length;
      const key = buttons[next]?.dataset.focusKey;
      if (key) focus(key);
    } else if (isBackKey(event) || event.key === "Backspace") {
      event.preventDefault();
      if (this.props.dismiss) this.reset();
    }
  };
  private reset = () => {
    this.setState({ hasError: false, message: "" });
    this.props.dismiss?.();
  };
  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div
        className={modalStyles.backdrop}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="crash-title"
      >
        <FocusRegion id="crash" boundary preferred="crash-reload">
          <div
            ref={this.dialogRef}
            className={`${modalStyles.modal} ${styles.errorCard}`}
          >
            <Icon name="alert" size={44} />
            <h3 id="crash-title" className={styles.errorTitle}>
              {this.props.title ?? "Something went wrong."}
            </h3>
            <p className={styles.errorMessage}>
              {this.props.message ?? this.state.message}
            </p>
            <div className={ui.keyboardActions} style={{ justifyContent: "center" }}>
              {this.props.dismiss && (
                <Button
                  variant="small"
                  id="crash-dismiss"
                  onPress={this.reset}
                  label="Dismiss this message"
                >
                  Dismiss
                </Button>
              )}
              <Button
                variant="primary"
                id="crash-reload"
                onPress={() => window.location.reload()}
                label="Reload the archive"
              >
                <Icon name="reset" /> Reload
              </Button>
            </div>
          </div>
        </FocusRegion>
      </div>
    );
  }
}
