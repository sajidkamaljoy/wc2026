import { useEffect, useState } from "react";

export function useUserSession() {
  const [deviceId, setDeviceId] = useState<string | null>(null);

  useEffect(() => {
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(";").shift();
      return null;
    };

    let id = getCookie("deviceId");
    if (!id) {
      id = crypto.randomUUID();
      // Set a long-lived cookie
      document.cookie = `deviceId=${id}; path=/; max-age=31536000; SameSite=Lax`;
    }
    setDeviceId(id);
  }, []);

  return { deviceId };
}
