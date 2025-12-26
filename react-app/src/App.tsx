
import React, { useState } from "react";
import FamilyTree from "./components/FamilyTree";
import SaveButton from "./components/SaveButton";

function App() {
  const [f3Chart, setF3Chart] = useState<any>(null);
  return (
    <div>
      <FamilyTree onChartReady={setF3Chart} />
      {f3Chart && <SaveButton f3Chart={f3Chart} />}
    </div>
  );
}

export default App;
