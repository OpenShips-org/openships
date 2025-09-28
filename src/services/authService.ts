import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, deleteUser } from "firebase/auth";
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
    // Basic input validation
    if (!email || !password || !username) {
        throw new Error("Email, password and username are required");
    }

    if (await isUsernameTaken(username)) {
        throw new Error("Username is already taken");
    }

    // Create the user and surface detailed Firebase errors for debugging
    let user: any;
    try {
        const credential = await createUserWithEmailAndPassword(auth, email, password);
        user = credential.user;
    } catch (err: any) {
        // Log the full error to help diagnose issues (check browser console / server logs)
        console.error("createUserWithEmailAndPassword failed:", err?.code ?? err?.message ?? err);
        throw new Error(`Registration failed: ${err?.code ?? err?.message ?? "unknown error"}`);
    }

    try {
        await saveUsername(username, user.uid);
    } catch (err: any) {
        // If saving the username fails, log it and throw a clear error.
        // Attempt a best-effort rollback by deleting the newly created auth user to avoid orphaned accounts.
        console.error("saveUsername failed:", err?.code ?? err?.message ?? err);
        try {
            if (user) {
                await deleteUser(user);
                console.info("Rolled back newly created auth user due to username save failure.");
            }
        } catch (delErr: any) {
            // Log but don't mask the original error — developer should inspect both.
            console.error("Failed to delete user during rollback:", delErr?.code ?? delErr?.message ?? delErr);
        }

        throw new Error(`Failed to save username: ${err?.code ?? err?.message ?? "unknown error"}`);
    }

    return user;
}

export async function login(email: string, password: string) {
    const { user } = await signInWithEmailAndPassword(auth, email, password);
    return user;
}

export async function logout() {
    await signOut(auth);
}

export async function getUsername(uid: string): Promise<string | null> {
    const docRef = doc(db, "users", uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        const data = docSnap.data();
        return data.username || null;
    }
    return null;
}