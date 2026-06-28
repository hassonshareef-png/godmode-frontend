// DirectorUI.js
import { RUNDOWNS } from "./director_rundowns";
import {
  generate_rundown,
  ttt_standard,
  plus_minus_workout,
  compare_rundowns
} from "./director_engine";

export default function DirectorUI() {
  const [base, setBase] = React.useState("");
  const [selected, setSelected] = React.useState("");
  const [output, setOutput] = React.useState(null);

  const run = () => {
    if (!base || !selected) return;
    const pattern = RUNDOWNS[selected];
    const grid = generate_rundown(parseInt(base), pattern);
    setOutput(grid);
  };

  const runTTT = () => {
    if (!base) return;
    const grid = ttt_standard(parseInt(base));
    setOutput(grid);
  };

  const runPlusMinus = () => {
    if (!base) return;
    const grid = plus_minus_workout(parseInt(base));
    setOutput(grid);
  };

  return (
    <div className="director-ui">
      <h2>Director Mode</h2>

      <input
        type="text"
        placeholder="Enter base number"
        value={base}
        onChange={(e) => setBase(e.target.value)}
      />

      <select
        value={selected}
        onChange={(e) => setSelected(e.target.value)}
      >
        <option value="">Select Rundown</option>
        {Object.keys(RUNDOWNS).map((name) => (
          <option key={name} value={name}>{name}</option>
        ))}
      </select>

      <button onClick={run}>Run Rundown</button>
      <button onClick={runTTT}>Tic-Tac-Toe</button>
      <button onClick={runPlusMinus}>Plus/Minus Workout</button>

      {output && (
        <div className="output">
          <h3>Output</h3>
          <pre>{JSON.stringify(output, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
