const PT_DOW = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]

export function dowLabel(dow) {
  return PT_DOW[dow] || ""
}

export function parseWeekOfMonth(text) {
  // Aceita: "ALL" ou "1,3" ou "2" etc.
  const t = (text || "").trim().toUpperCase()
  if (!t) return ["ALL"]
  if (t === "ALL" || t === "TODAS") return ["ALL"]
  const nums = t.split(",").map(s => parseInt(s.trim(), 10)).filter(n => Number.isFinite(n) && n >= 1 && n <= 5)
  return nums.length ? nums : ["ALL"]
}