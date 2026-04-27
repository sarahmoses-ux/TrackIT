import { useEffect, useState } from "react";
import { getReturns } from "../services/mockApi";

export default function useReturns() {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getReturns();
      setReturns(data);
    } catch (err) {
      setError(err.message || "Unable to load returns.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  return { error, loading, refresh, returns, setReturns };
}
