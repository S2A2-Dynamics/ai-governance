import type { AISystem } from "../types";

type Props = {
  aiSystems: AISystem[];
  loading: boolean;
  onSelect: (id: string) => void;
};

export function AISystemTable({ aiSystems, loading, onSelect }: Props) {
  if (loading) {
    return <p className="table-empty">Cargando inventario…</p>;
  }

  if (aiSystems.length === 0) {
    return <p className="table-empty">Todavía no hay sistemas de IA registrados.</p>;
  }

  return (
    <table className="ai-systems-table">
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Provider</th>
          <th>GCP Project</th>
          <th>Estado</th>
          <th>Riesgos</th>
          <th>Controles</th>
          <th>Incidentes</th>
        </tr>
      </thead>
      <tbody>
        {aiSystems.map((system) => (
          <tr key={system.id} className="ai-system-row" onClick={() => onSelect(system.id)}>
            <td>
              <span className="ai-system-name">{system.name}</span>
              <span className="ai-system-purpose">{system.purpose}</span>
            </td>
            <td>{system.provider}</td>
            <td>{system.gcpProject ?? "—"}</td>
            <td>
              <span className={`status-pill status-pill--${system.status}`}>{system.status}</span>
            </td>
            <td>{system.riskCount}</td>
            <td>{system.controlCount}</td>
            <td>{system.incidentCount}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
