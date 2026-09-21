import { render } from "@testing-library/preact";
import type { ComponentChildren } from "preact";

export interface RenderHookResult<Result, Props> {
  result: { current: Result };
  rerender: (props: Props) => void;
  unmount: () => void;
}

// Minimal Preact hook harness: renders a component that invokes the hook and
// records its latest return value across rerenders.
export function renderHook<Result, Props>(
  callback: (props: Props) => Result,
  initialProps: Props,
): RenderHookResult<Result, Props> {
  const result: { current: Result } = { current: undefined as Result };
  const propsBox: { value: Props } = { value: initialProps };

  function Harness(): ComponentChildren {
    result.current = callback(propsBox.value);
    return null;
  }

  const view = render(<Harness />);
  return {
    result,
    rerender: (props: Props) => {
      propsBox.value = props;
      view.rerender(<Harness />);
    },
    unmount: view.unmount,
  };
}