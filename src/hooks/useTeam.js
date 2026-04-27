import { useEffect, useState } from "react";
import { getTeamMembers } from "../services/mockApi";

export default function useTeam() {
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getTeamMembers();
      setTeam(data);
    } catch (err) {
      setError(err.message || "Unable to load team.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  return { error, loading, refresh, setTeam, team };
}
