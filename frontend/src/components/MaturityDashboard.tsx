import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { fetchMaturity } from "../api";
import type { MaturityDomain } from "../types";

const COLOR_SIN_DATOS = "#d1d5db"; // gris: dominio sin ningún control registrado todavía
const COLOR_CON_DATOS = "#2563eb"; // azul: score real calculado sobre evidencia

// Altura mínima visible para dominios "sin datos": con score real 0 la barra
// tendría 0px de alto y sería indistinguible de "no hay nada que mostrar",
// justo lo que el criterio de aceptación pide evitar (0 por falta de evidencia
// no debe leerse como "cumplimiento pésimo"). Solo afecta la altura de la
// barra; el tooltip sigue mostrando "Sin datos", nunca un valor numérico.
const PLACEHOLDER_HEIGHT_SIN_DATOS = 4;

export function MaturityDashboard() {
  const [domains, setDomains] = useState<MaturityDomain[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetchMaturity()
      .then((data) => {
        if (!cancelled) setDomains(data);
      })
      .catch(() => {
        if (!cancelled) setLoadError("No se pudo cargar el dashboard de madurez");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <p>Cargando dashboard de madurez…</p>;
  if (loadError) return <p className="form-error">{loadError}</p>;

  const chartData = domains.map((domain) => ({
    ...domain,
    displayScore: domain.totalControls === 0 ? PLACEHOLDER_HEIGHT_SIN_DATOS : domain.score,
  }));

  return (
    <div>
      <div className="maturity-legend">
        <span>
          <span className="maturity-swatch" style={{ background: COLOR_CON_DATOS }} /> Score calculado
        </span>
        <span>
          <span className="maturity-swatch" style={{ background: COLOR_SIN_DATOS }} /> Sin datos (sin controles registrados)
        </span>
      </div>
      <ResponsiveContainer width="100%" height={360}>
        <BarChart data={chartData} margin={{ top: 8, right: 16, bottom: 64, left: 8 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="code" angle={-35} textAnchor="end" interval={0} height={80} />
          <YAxis domain={[0, 100]} />
          <Tooltip
            formatter={(value, _name, item) => {
              const domain = item.payload as MaturityDomain;
              if (domain.totalControls === 0) return ["Sin datos", "Score"];
              return [`${value}%`, "Score"];
            }}
            labelFormatter={(_label, items) => {
              const domain = items?.[0]?.payload as MaturityDomain | undefined;
              return domain?.name ?? "";
            }}
          />
          <Bar dataKey="displayScore">
            {chartData.map((domain) => (
              <Cell key={domain.id} fill={domain.totalControls === 0 ? COLOR_SIN_DATOS : COLOR_CON_DATOS} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
