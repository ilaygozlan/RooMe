import { useCallback, useEffect, useState } from "react";

export type UserProfile = {
  id?: number | string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  profilePicture?: string;
  gender?: "M" | "F" | "O" | string;
  birthDate?: string | Date;
  ownPet?: boolean;
  smoke?: boolean;
  jobStatus?: string;
  token?: string;
};

// ---------- MOCK DATA (קל למחיקה) ----------
const MOCK_PROFILE: UserProfile = {
  id: 999,
  fullName: "Ilay Gozlan (MOCK)",
  email: "ilay.mock@example.com",
  phoneNumber: "0501234567",
  profilePicture: "https://www.w3schools.com/howto/img_avatar.png",
  gender: "M",
  birthDate: new Date("1999-01-01").toISOString(),
  ownPet: true,
  smoke: false,
  jobStatus: "Student / Developer",
  token: "",
};

type Options = {
  mock?: boolean;   // הפעלת מצב MOCK
  delayMs?: number; // דיליי מדומה לקריאות רשת
};

export function useUserProfile(API: string, userId?: number | string, options?: Options) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setErr] = useState<unknown>(null);

  const isMock = options?.mock === true;
  const delay = options?.delayMs ?? 300;

  const load = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    setErr(null);

    // ----- MOCK MODE -----
    if (isMock) {
      // דימוי רשת קצרה
      const t = setTimeout(() => {
        // אפשר גם לשלב userId לתוך המוק אם רוצים
        setProfile({ ...MOCK_PROFILE, id: userId });
        console.log("gg")
        setLoading(false);
         console.log("rr")
      }, delay);
      return () => clearTimeout(t);
    }

    // ----- REAL MODE -----
    try {
      const res = await fetch(`${API}User/GetUserById/${userId}`);
      if (!res.ok) throw new Error("שגיאה בטעינת פרופיל");
      const data: UserProfile = await res.json();
      setProfile(data);
      setErr(null);
    } catch (e) {
      setErr(e);
    } finally {
      setLoading(false);
    }
  }, [API, userId, isMock, delay]);

  useEffect(() => {
    const cleanup = load();
    // במקרה של MOCK יש החזרה של פונקציית ניקוי ל-timeout
    return typeof cleanup === "function" ? cleanup : undefined;
  }, [load]);

  const update = useCallback(
    async (updated: UserProfile) => {
      const toSend = { ...updated, id: userId, token: updated.token ?? "" };

      // ----- MOCK MODE -----
      if (isMock) {
        await new Promise((r) => setTimeout(r, delay)); // לדמות רשת
        setProfile(toSend);
        return toSend;
      }

      // ----- REAL MODE -----
      const res = await fetch(`${API}User/UpdateUserDetails`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(toSend),
      });
      if (!res.ok) throw new Error("Failed to update profile");
      setProfile(toSend);
      return toSend;
    },
    [API, userId, isMock, delay]
  );

  return { profile, loading, error, reload: load, updateProfile: update, setProfile };
}
