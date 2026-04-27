import { useEffect, useState } from "react";
import { getSales } from "../services/mockApi";

export default function useSales(initialFilters = {}) {
  const [filters, setFilters] = useState(initialFilters);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = async (nextFilters = filters) => {
    setLoading(true);
    setError("");
    try {
      const data = await getSales(nextFilters);
      setSales(data);
    } catch (err) {
      setError(err.message || "Unable to load sales.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh(filters);
  }, [filters.endDate, filters.productId, filters.startDate]);

  return { error, filters, loading, refresh, sales, setFilters, setSales };
}
