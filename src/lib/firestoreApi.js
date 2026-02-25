import {
  addDoc, collection, deleteDoc, doc, getDoc, getDocs, orderBy, query, setDoc, updateDoc, where
} from "firebase/firestore"
import { getDb } from "./firebase.js"

/**
 * Modelo Firestore (sugestão):
 *
 * /prescribers (clientes)
 *   { team, name, crm, specialty, phone, address, clinicName, secretaryName, notes, createdAt }
 *
 * /prescribers/{id}/availability
 *   { dayOfWeek, weekOfMonth: [1,2,3,4,5] | ["ALL"], timeHHMM, label }
 *
 * /visits
 *   { team, prescriberId, prescriberName, specialty, visitedAtISO, notes, requests, createdAt }
 */

export async function listPrescribers(team) {
  const db = getDb()
  const q = query(
    collection(db, "prescribers"),
    where("team", "==", team),
    orderBy("name", "asc")
  )
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export async function createPrescriber(team, data) {
  const db = getDb()
  const payload = {
    team,
    ...data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  const ref = await addDoc(collection(db, "prescribers"), payload)
  return ref.id
}

export async function updatePrescriber(id, data) {
  const db = getDb()
  await updateDoc(doc(db, "prescribers", id), {
    ...data,
    updatedAt: new Date().toISOString()
  })
}

export async function deletePrescriber(id) {
  const db = getDb()
  await deleteDoc(doc(db, "prescribers", id))
}

export async function getAvailability(prescriberId) {
  const db = getDb()
  const q = query(collection(db, "prescribers", prescriberId, "availability"), orderBy("dayOfWeek", "asc"))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export async function addAvailability(prescriberId, slot) {
  const db = getDb()
  const ref = await addDoc(collection(db, "prescribers", prescriberId, "availability"), slot)
  return ref.id
}

export async function removeAvailability(prescriberId, slotId) {
  const db = getDb()
  await deleteDoc(doc(db, "prescribers", prescriberId, "availability", slotId))
}

export async function createVisit(team, payload) {
  const db = getDb()
  const ref = await addDoc(collection(db, "visits"), {
    team,
    ...payload,
    createdAt: new Date().toISOString()
  })
  return ref.id
}

export async function listVisits(team, limitN = 50) {
  const db = getDb()
  const q = query(
    collection(db, "visits"),
    where("team", "==", team),
    orderBy("visitedAtISO", "desc")
  )
  const snap = await getDocs(q)
  return snap.docs.slice(0, limitN).map(d => ({ id: d.id, ...d.data() }))
}