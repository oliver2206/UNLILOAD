import { useState } from "react";
import LoadFlow from "./components/LoadFlow";
import UnliList from "./components/UnliList";

export default function App() {
  const [status, setStatus] = useState({ ready: false, network: "" });

  // Browse mode: the list is always visible and searchable.
  // Once a valid number is entered, it switches to the detected network.
  const initialNetwork = status.ready && status.network ? status.network : "All";

  return (
    <>
      <header className="hero">
        <div className="container hero-inner">
          <span className="logo">U</span>
          <div>
            <h1>Unli Load</h1>
            <p>Browse unli promos or enter a number to buy load.</p>
          </div>
        </div>
      </header>

      <div className="container layout">
        <LoadFlow onChange={setStatus} />
        <UnliList initialNetwork={initialNetwork} />
      </div>
    </>
  );
}
