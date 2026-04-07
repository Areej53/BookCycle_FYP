/** Safe read of token stored as JSON string or legacy plain text */
export function getStoredAuthToken() {
  const raw = localStorage.getItem("auth");
  if (raw == null || raw === "") return "";

  try {
    const parsed = JSON.parse(raw);
    return typeof parsed === "string" ? parsed : "";
  } catch {
    return raw;
  }
}
