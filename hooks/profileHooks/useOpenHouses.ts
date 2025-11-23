import { useCallback, useEffect, useState } from "react";
import type { OpenHouse } from "@/types/database";

export type { OpenHouse };

export function useOpenHouses(API: string, userId?: number | string) {
  const [openHouses, setOpenHouses] = useState<OpenHouse[]>([]);
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}OpenHouse/getByUser/${userId}`);
      if (!res.ok) throw new Error("Failed to fetch open houses");
      const data = await res.json();
      console.log(data); // שמירה על לוג המקור
      if (!Array.isArray(data)) {
        setOpenHouses([]);
        return;
      }
      const formatted: OpenHouse[] = data.map((item: any) => ({
        id: item.ID,
        apartmentId: item.ApartmentID,
        location: JSON.parse(item.Location).address,
        date: item.Date ? String(item.Date).split("T")[0] : "",
        startTime: item.StartTime?.substring(0, 5) || "",
        endTime: item.EndTime?.substring(0, 5) || "",
        amountOfPeoples: item.AmountOfPeople ?? 0,
        totalRegistrations: item.TotalRegistrations ?? 0,
      }));
      setOpenHouses(formatted);
    } catch (e) {
      console.error("Error fetching open houses:", e);
      setOpenHouses([]);
    } finally {
      setLoading(false);
    }
  }, [API, userId]);

  useEffect(() => { load(); }, [load]);

  return { openHouses, loading, reload: load, setOpenHouses };
}
