import { useEffect, useState } from "react";
import { getIntegrations } from "../services/mockApi";

export default function useIntegrations() {
  const [integrations, setIntegrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getIntegrations();
      setIntegrations(data);
    } catch (err) {
      setError(err.message || "Unable to load integrations.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  return { error, integrations, loading, refresh, setIntegrations };
}
