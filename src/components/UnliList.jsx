import { useState, useMemo, useEffect } from "react";
import { promos, apps, appLabel, priceLabel } from "../data/promos";
import { brandOf, appColor } from "../data/brands";

export default function UnliList({ initialNetwork = "All" }) {
  const [network, setNetwork] = useState(initialNetwork);
  const [query, setQuery] = useState("");
  const [app, setApp] = useState("Any");
  const [sort, setSort] = useState("price-asc");
  const [copiedId, setCopiedId] = useState(null);

  // Follow the detected network (or go back to "All") without wiping the search text
  useEffect(() => {
    setNetwork(initialNetwork);
  }, [initialNetwork]);

  const networks = useMemo(
    () => ["All", ...new Set(promos.map((p) => p.network))],
    []
  );

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    return promos
      .filter(
        (p) =>
          (network === "All" || p.network === network) &&
          (app === "Any" || p.via.includes(app)) &&
          (!q ||
            `${p.network} ${p.name} ${p.perks} ${p.price ?? ""} ${p.validity}`
              .toLowerCase()
              .includes(q))
      )
      .sort((a, b) => {
        // promos without a known price always go last
        if (sort !== "name" && (a.price == null || b.price == null)) {
          return (a.price == null) - (b.price == null);
        }
        return sort === "price-asc" ? a.price - b.price :
               sort === "price-desc" ? b.price - a.price :
               a.name.localeCompare(b.name);
      });
  }, [network, app, query, sort]);

  const copy = async (p) => {
    const text = `${p.network} ${p.name} - ${priceLabel(p)} (${p.validity}) - ${p.perks} (via ${p.via.map(appLabel).join(", ")})`;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(p.id);
      setTimeout(() => setCopiedId(null), 1200);
    } catch {
      /* clipboard not available */
    }
  };

  return (
    <section className="main">
      <h2 className="section-title">All Unli Promos</h2>

      <div className="searchbar">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
        <input
          type="search"
          placeholder="Search promo (e.g. data, 99)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="filter-block">
        <div className="label">Network</div>
        <div className="chips scroll">
          {networks.map((n) => (
            <button
              key={n}
              className={"chip" + (n === network ? " active" : "")}
              onClick={() => setNetwork(n)}
            >
              {n !== "All" && <span className="dot" style={{ background: brandOf(n).color }} />}
              {n}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-block">
        <div className="label">Buy / pay with</div>
        <div className="chips scroll">
          {[{ code: "Any", label: "Any" }, ...apps].map((a) => (
            <button
              key={a.code}
              className={"chip" + (a.code === app ? " active" : "")}
              onClick={() => setApp(a.code)}
            >
              {a.code !== "Any" && <span className="dot" style={{ background: appColor[a.code] }} />}
              {a.label}
            </button>
          ))}
        </div>
      </div>

      <div className="sortrow">
        <div className="count" style={{ margin: 0 }}>
          {items.length} {items.length === 1 ? "promo" : "promos"}
        </div>
        <select value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="price-asc">Price: low to high</option>
          <option value="price-desc">Price: high to low</option>
          <option value="name">Name A–Z</option>
        </select>
      </div>

      {items.length === 0 && <div className="empty">No promos found.</div>}

      <div className="promo-grid">
      {items.map((p) => {
        const b = brandOf(p.network);
        return (
          <div className="card" key={p.id}>
            <span className="avatar" style={{ background: b.color }}>{b.short}</span>
            <div className="promo-body">
              <div className="net">{p.network}</div>
              <div className="name">
                {p.name}
                {p.popular && <span className="badge">Popular</span>}
              </div>
              <div className="meta">{p.validity} · {p.perks}</div>
              <div className="via">
                {p.via.map((a) => (
                  <span className="tag" key={a}>
                    <i style={{ background: appColor[a] || "#6f7a90" }} />
                    {appLabel(a)}
                  </span>
                ))}
              </div>
            </div>
            <div className="price-col">
              <div className="price">{priceLabel(p)}</div>
              <button className="copy" onClick={() => copy(p)}>
                {copiedId === p.id ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>
        );
      })}
      </div>

      <p className="note">Sample data. Edit promos in src/data/promos.js</p>
    </section>
  );
}
