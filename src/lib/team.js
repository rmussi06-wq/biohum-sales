const KEY = "biohum.team"
export const TEAMS = ["Equipe CL63"]

export function getTeam() {
  return localStorage.getItem(KEY) || TEAMS[0]
}
export function setTeam(value) {
  localStorage.setItem(KEY, value)
}