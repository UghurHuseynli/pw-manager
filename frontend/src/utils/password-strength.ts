export type PasswordStrength = {
  score: 0 | 1 | 2 | 3 | 4;
  label: "Very weak" | "Weak" | "Fair" | "Strong" | "Very strong";
  color: "danger" | "warning" | "success";
};

// Lightweight heuristic — no zxcvbn dependency needed for a strength hint.
export function getPasswordStrength(value: string): PasswordStrength {
  let score = 0;
  if (value.length >= 8) score++;
  if (value.length >= 12) score++;
  if (/[a-z]/.test(value) && /[A-Z]/.test(value)) score++;
  if (/[0-9]/.test(value)) score++;
  if (/[^a-zA-Z0-9]/.test(value)) score++;

  const clamped = Math.min(score, 4) as PasswordStrength["score"];

  const labels: PasswordStrength["label"][] = [
    "Very weak",
    "Weak",
    "Fair",
    "Strong",
    "Very strong",
  ];
  const colors: PasswordStrength["color"][] = [
    "danger",
    "danger",
    "warning",
    "success",
    "success",
  ];

  return { score: clamped, label: labels[clamped], color: colors[clamped] };
}
