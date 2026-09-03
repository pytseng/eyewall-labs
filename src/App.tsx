import { useState } from "react";
import { Leva } from "leva";
import { StormLab } from "./StormLab";
import { VideoLanding } from "./VideoLanding";
import { ViewSwitch, type LandingView } from "./ViewSwitch";

export default function App() {
  const [view, setView] = useState<LandingView>("default");

  return (
    <>
      <Leva
        hidden={view !== "generate"}
        titleBar={{ filter: false, position: { x: 0, y: 48 } }}
      />
      <ViewSwitch view={view} onChange={setView} />
      {view === "default" ? <VideoLanding /> : <StormLab />}
    </>
  );
}
