import { useEffect, useState } from "react";
import { fetchAISystems } from "./api";
import { AISystemDetail } from "./components/AISystemDetail";
import { AISystemForm } from "./components/AISystemForm";
import { AISystemTable } from "./components/AISystemTable";
import { MaturityDashboard } from "./components/MaturityDashboard";
import type { AISystem } from "./types";

export function App() {
  const [aiSystems, setAiSystems] = useState<AISystem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedAiSystemId, setSelectedAiSystemId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetchAISystems()
      .then((systems) => {
        if (!cancelled) setAiSystems(systems);
      })
      .catch(() => {
        if (!cancelled) setLoadError("No se pudo cargar el inventario de sistemas de IA");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  function handleCreated(system: AISystem) {
    setAiSystems((current) => [...current, system]);
  }

  if (selectedAiSystemId) {
    return (
      <main className="shell">
        <p className="eyebrow">S2A2 Dynamics</p>
        <h1>AI Governance</h1>
        <AISystemDetail
          key={selectedAiSystemId}
          aiSystemId={selectedAiSystemId}
          onBack={() => setSelectedAiSystemId(null)}
        />
      </main>
    );
  }

  return (
    <main className="shell">
      <p className="eyebrow">S2A2 Dynamics</p>
      <h1>AI Governance</h1>
      <p className="summary">
        Inventario de sistemas de IA, riesgos, controles y evidencia.
      </p>

      <section className="panel">
        <h2>Dashboard de madurez</h2>
        <MaturityDashboard />
      </section>

      <section className="panel">
        <h2>Sistemas de IA</h2>
        {loadError ? (
          <p className="form-error">{loadError}</p>
        ) : (
          <AISystemTable aiSystems={aiSystems} loading={loading} onSelect={setSelectedAiSystemId} />
        )}
      </section>

      <section className="panel">
        <h2>Añadir sistema de IA</h2>
        <AISystemForm onCreated={handleCreated} />
      </section>
    </main>
  );
}
