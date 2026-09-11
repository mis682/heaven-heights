import Swal from "sweetalert2";

function themeColorHex() {
  const root = document.documentElement;
  const triplet = getComputedStyle(root).getPropertyValue("--color-primary").trim();
  const [r, g, b] = triplet.split(" ").map(Number);
  return `rgb(${r || 249} ${g || 115} ${b || 22})`;
}

function isDark() {
  return document.documentElement.classList.contains("dark");
}

export async function confirmAction({ title, text, confirmText = "Confirm", cancelText = "Cancel", danger = false }) {
  const result = await Swal.fire({
    title,
    text,
    icon: danger ? "warning" : "question",
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    confirmButtonColor: danger ? "#DC2626" : themeColorHex(),
    background: isDark() ? "#1f2937" : "#ffffff",
    color: isDark() ? "#f3f4f6" : "#111827",
    reverseButtons: true,
  });
  return result.isConfirmed;
}

export async function alertMessage(text, { title = "Notice", icon = "warning" } = {}) {
  await Swal.fire({
    title,
    text,
    icon,
    confirmButtonText: "OK",
    confirmButtonColor: themeColorHex(),
    background: isDark() ? "#1f2937" : "#ffffff",
    color: isDark() ? "#f3f4f6" : "#111827",
  });
}
