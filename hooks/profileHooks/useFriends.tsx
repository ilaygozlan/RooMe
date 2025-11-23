import { useCallback, useEffect, useState } from "react";
import type { Friend } from "@/types/database";

export type { Friend };

export function useFriends(API: string, userId?: number | string) {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}User/GetUserFriends/${userId}`);
      const ct = res.headers.get("content-type");
      if (ct && ct.includes("application/json")) {
        const data = await res.json();
        setFriends(Array.isArray(data) ? (data as Friend[]) : []);
      } else {
        setFriends([]);
      }
    } catch {
      setFriends([]);
    } finally {
      setLoading(false);
    }
  }, [API, userId]);

  useEffect(() => { load(); }, [load]);

  return { friends, loading, reload: load };
}