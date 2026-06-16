import Cookies from "js-cookie";
import { authApi } from "./api";

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  groups: string[];
}

export async function login(username: string, password: string): Promise<boolean> {
  try {
    const { data } = await authApi.login(username, password);
    Cookies.set("access_token", data.access, { expires: 1, sameSite: "strict" });
    Cookies.set("refresh_token", data.refresh, { expires: 7, sameSite: "strict" });
    return true;
  } catch {
    return false;
  }
}

export function logout() {
  Cookies.remove("access_token");
  Cookies.remove("refresh_token");
  window.location.href = "/login";
}

export function isAuthenticated(): boolean {
  return !!Cookies.get("access_token");
}

export function getAccessToken(): string | undefined {
  return Cookies.get("access_token");
}
