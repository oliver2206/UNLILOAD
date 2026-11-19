import { useState, useEffect } from "react";
import { promos, appLabel, priceLabel } from "../data/promos";
import { detectNetworks } from "../data/prefixes";
import { brandOf, appColor } from "../data/brands";

const MOBILE_NETWORKS = ["Globe", "Smart", "TNT", "TM", "GOMO", "DITO"];

// Turn 09171234567 / +639171234567 / 639171234567 into 09171234567
function normalizeMobile(input) {
  const d = input.replace(/\D/g, "");
  if (d.startsWith("63")) return "0" + d.slice(2);
  return d;
}

function Avatar({ network, small }) {
  const b = brandOf(network);
  return (
    <span className={"avatar" + (small ? " sm" : "")} style={{ background: b.color }}>
      {b.short}
    </span>
  );
}

export default function LoadFlow({ onChange }) {
  const [number, setNumber] = useState("");
  const [cignal, setCignal] = useState(false);
  const [manualNetwork, setManualNetwork] = useState("");
  const [promoId, setPromoId] = useState(null);
  const [payApp, setPayApp] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [done, setDone] = useState(false);

  const cleaned = cignal ? number.replace(/\D/g, "") : normalizeMobile(number);
  const numberValid = cignal ? cleaned.length >= 8 : /^09\d{9}$/.test(cleaned);

  // Detect from the first 4 digits
  const candidates = !cignal && cleaned.length >= 4 ? detectNetworks(cleaned.slice(0, 4)) : [];
  const unknownPrefix = !cignal && cleaned.length >= 4 && candidates.length === 0;

  // Network used for the promo list: manual choice wins, otherwise the first detected one
  const network = cignal ? "Cignal" : manualNetwork || candidates[0] || "";

  useEffect(() => {
    if (onChange) onChange({ ready: numberValid && !!network, network });
  }, [numberValid, network]); // eslint-disable-line react-hooks/exhaustive-deps

  const networkPromos = promos
    .filter((p) => p.network === network)
    .sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity));
  const promo = promos.find((p) => p.id === promoId);

  const reset = () => { setPromoId(null); setPayApp(""); setDone(false); setSheetOpen(false); };

  const onNumber = (v) => {
    setNumber(v);
    setManualNetwork("");
    reset();
  };

  const toggleCignal = () => {
    setCignal((c) => !c);
    setNumber("");
    setManualNetwork("");
    reset();
  };

  const pickNetwork = (n) => { setManualNetwork(n); reset(); };

  const pickPromo = (p) => {
    setPromoId(p.id);
    setPayApp(p.via[0] || "");
    setDone(false);
    setSheetOpen(true);
  };

  const closeSheet = () => { setSheetOpen(false); if (done) reset(); };

  return (
    <>
      <aside className="side">
        <div className="panel">
          <h2 className="panel-title">Buy Load</h2>
        {/* Step 1: number */}
          <div className="label">{cignal ? "Cignal card / account number" : "Mobile number"}</div>
          <div className="numfield">
            {!cignal && <span className="prefix">+63</span>}
            <input
              type="tel"
              inputMode="numeric"
              placeholder={cignal ? "Card / account number" : "09XX XXX XXXX"}
              value={number}
              onChange={(e) => onNumber(e.target.value)}
            />
            {network && numberValid && <span className="netbadge"><Avatar network={network} small /></span>}
          </div>
          <button className="linkbtn" onClick={toggleCignal}>
            {cignal ? "← Back to mobile number" : "Loading Cignal TV instead?"}
          </button>

          {!cignal && number && !numberValid && cleaned.length >= 11 && (
            <div className="error">Enter an 11-digit number starting with 09.</div>
          )}

          {/* Step 2: detected network */}
          {!cignal && cleaned.length >= 4 && (
            <div style={{ marginTop: 16 }}>
              <div className="label">Network</div>
              {unknownPrefix ? (
                <div className="detect warn">
                  Prefix {cleaned.slice(0, 4)} not recognized. Pick the network below.
                </div>
              ) : (
                <div className="detect">
                  Prefix {cleaned.slice(0, 4)} looks like{" "}
                  <strong>{candidates.join(" / ")}</strong>.
                  {candidates.length > 1 && " Pick the exact one if you know it."}
                </div>
              )}
              <div className="chips">
                {MOBILE_NETWORKS.map((n) => (
                  <button
                    key={n}
                    className={"chip" + (n === network ? " active" : "")}
                    onClick={() => pickNetwork(n)}
                  >
                    <span className="dot" style={{ background: brandOf(n).color }} />
                    {n}
                    {candidates.includes(n) && n !== network ? " ✓" : ""}
                  </button>
                ))}
              </div>
              <div className="hint">
                Numbers can be moved between networks, so the guess may be wrong. Tap another network to change it.
              </div>
            </div>
          )}
        </div>

        {/* Step 3: promos for that network */}
        {network && numberValid && (
          <>
            <div className="section-title">
              Choose a promo
              <small>{network}</small>
            </div>
            {networkPromos.length === 0 && (
              <div className="detect warn">No promos listed for {network} yet.</div>
            )}
            <div className="promo-grid">
            {networkPromos.map((p) => (
              <button
                key={p.id}
                className={"promo-row" + (p.id === promoId ? " selected" : "")}
                onClick={() => pickPromo(p)}
              >
                <Avatar network={p.network} />
                <span className="promo-body">
                  <span className="name">
                    {p.name}
                    {p.popular && <span className="badge">Popular</span>}
                  </span>
                  <span className="meta" style={{ display: "block" }}>{p.validity} · {p.perks}</span>
                </span>
                <span className="price-col"><span className="price">{priceLabel(p)}</span></span>
              </button>
            ))}
            </div>
          </>
        )}
      </aside>

      {/* Review / checkout bottom sheet */}
      {sheetOpen && promo && numberValid && (
        <>
          <div className="backdrop" onClick={closeSheet} />
          <div className="sheet" role="dialog" aria-modal="true">
            <div className="grab" />
            {!done ? (
              <>
                <h2>Review your load</h2>
                <div className="receipt">
                  <div className="line"><span>Network</span><span>{promo.network}</span></div>
                  <div className="line"><span>Promo</span><span>{promo.name}</span></div>
                  <div className="line"><span>Validity</span><span>{promo.validity}</span></div>
                  <div className="line"><span>Send to</span><span>{cleaned}</span></div>
                  <div className="line totalline"><span>Total</span><span>{priceLabel(promo)}</span></div>
                </div>

                <div className="label" style={{ marginTop: 16 }}>Pay with</div>
                {promo.via.map((a) => (
                  <button
                    key={a}
                    className={"payopt" + (a === payApp ? " active" : "")}
                    onClick={() => setPayApp(a)}
                  >
                    <span className="avatar sm" style={{ background: appColor[a] || "#6f7a90" }}>
                      {appLabel(a)[0]}
                    </span>
                    {appLabel(a)}
                    <span className="radio" />
                  </button>
                ))}

                <button className="confirm" onClick={() => setDone(true)}>
                  Confirm {priceLabel(promo)}
                </button>
              </>
            ) : (
              <div className="success">
                <div className="check">
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
                </div>
                <h2>Demo complete</h2>
                <p>No real load was sent. Connect a real load provider to make this work.</p>
                <button className="confirm" onClick={closeSheet}>Done</button>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}
