import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../services/firebase";

export async function getUserSettings(uid: string): Promise<Record<string, any> | null> {
    try {
        const docRef = doc(db, "userSettings", uid);
        const docSnap = await getDoc(docRef);
        return docSnap.exists() ? docSnap.data() : null;
    } catch (error) {
        console.error("Error fetching user settings:", error);
        return null;
    }
}

export async function saveUserSettings(uid: string, settings: Record<string, any>): Promise<void> {
    try {
        const docRef = doc(db, "userSettings", uid);
        await setDoc(docRef, { ...settings, updatedAt: serverTimestamp() }, { merge: true });
    } catch (error) {
        console.error("Error saving user settings:", error);
        throw error;
    }
}