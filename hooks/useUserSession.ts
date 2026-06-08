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
      // Fallback to localStorage if the cookie was cleared
      id = localStorage.getItem("deviceId");
      if (!id) {
        // Generate new device ID if both are missing
        id = crypto.randomUUID();
      }
      // Set/Restore the cookie
      document.cookie = `deviceId=${id}; path=/; max-age=31536000; SameSite=Lax`;
    }

    // Ensure localStorage stays in sync with the current device ID
    localStorage.setItem("deviceId", id);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDeviceId(id);
  }, []);

  return { deviceId };
}
