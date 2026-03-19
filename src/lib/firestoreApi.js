import {
  addDoc, collection, deleteDoc, doc, getDocs,
  orderBy, query, updateDoc, where
} from "firebase/firestore"
import { db } from "./firebase.js"

/**
 * Modelo Firestore:
 *
 * /prescribers (médicos)
 *   { team, name, crm, specialty, phone, address, clinicName, secretaryName, notes, createdAt }
 *
 * /prescribers/{id}/availability
 *   { dayOfWeek, weekOfMonth: [1,2,3,4,5] | ["ALL"], timeHHMM, label }
 *
 * /visits
 *   { team, prescriberId, prescriberName, specialty, visitedAtISO, notes, requests, createdAt }
 */

export async function listPrescribers(team) {
  const q = query(
    collection(db, "prescribers"),
    where("team", "==", team),
    orderBy("name", "asc")
  )
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export async function createPrescriber(team, data) {
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
  await updateDoc(doc(db, "prescribers", id), {
    ...data,
    updatedAt: new Date().toISOString()
  })
}

export async function deletePrescriber(id) {
  await deleteDoc(doc(db, "prescribers", id))
}

export async function getAvailability(prescriberId) {
  const q = query(
    collection(db, "prescribers", prescriberId, "availability"),
    orderBy("dayOfWeek", "asc")
  )
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export async function addAvailability(prescriberId, slot) {
  const ref = await addDoc(
    collection(db, "prescribers", prescriberId, "availability"),
    slot
  )
  return ref.id
}

export async function removeAvailability(prescriberId, slotId) {
  await deleteDoc(doc(db, "prescribers", prescriberId, "availability", slotId))
}

export async function createVisit(team, payload) {
  const ref = await addDoc(collection(db, "visits"), {
    team,
    ...payload,
    createdAt: new Date().toISOString()
  })
  return ref.id
}

export async function listVisits(team, limitN = 50) {
  const q = query(
    collection(db, "visits"),
    where("team", "==", team),
    orderBy("visitedAtISO", "desc")
  )
  const snap = await getDocs(q)
  return snap.docs.slice(0, limitN).map(d => ({ id: d.id, ...d.data() }))
}
