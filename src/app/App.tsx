import { useState } from "preact/hooks";
import { Button } from "../components/Button/Button";
import { FocusRegion } from "../components/Focusable/Focusable";
import { useBackNavigation } from "../hooks/useBackNavigation";
import { useStageScale } from "../hooks/useStageScale";
import styles from "./App.module.css";

export function App() {
  const [active, setActive] = useState("Home");
  const scale = useStageScale();
  useBackNavigation(() => setActive("Home"));

  return (
    <div className={styles.viewport}>
      <div
        className={styles.stage}
        style={{ transform: `translate(-50%, -50%) scale(${scale})` }}
      >
        <main className={styles.application}>
          <section className={styles.main}>
            <p>UKTV STAR WARS ARCHIVE</p>
            <h1>{active}</h1>
            <FocusRegion id="prototype" preferred="browse">
              <Button id="browse" variant="primary" onPress={() => setActive("Browse")}>Browse</Button>
              <Button id="search" variant="small" onPress={() => setActive("Search")}>Search</Button>
            </FocusRegion>
          </section>
        </main>
      </div>
    </div>
  );
}
