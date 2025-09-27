import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "../services/firebase";

async function isUsernameTaken(username: string): Promise<boolean> {
    const docRef = doc(db, "usernames", username);
    const docSnap = await getDoc(docRef);
    return docSnap.exists();
}

async function saveUsername(username: string, uid: string): Promise<void> {
    await setDoc(doc(db, "users", uid), { username }, { merge: true });
    await setDoc(doc(db, "usernames", username), { uid });
}

export async function register(email: string, password: string, username: string) {
    if (await isUsernameTaken(username)) {
        throw new Error("Username is already taken");
    }

    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    await saveUsername(username, user.uid);
    return user;
}

export async function login(email: string, password: string) {
    const { user } = await signInWithEmailAndPassword(auth, email, password);
    return user;
}

export async function logout() {
    await signOut(auth);
}