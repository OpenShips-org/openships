import { getAuth } from 'firebase/auth';
import { doc, getDoc, setDoc, getFirestore } from 'firebase/firestore';

export async function getUserSettings(settingName: string): Promise<any> {
  const auth = getAuth();
  const user = auth.currentUser;
  
  if (!user) {
    console.log('Not fetching settings from Firebase: User not logged in');
    return null;
  }
  
  try {
    const db = getFirestore();
    const userSettingsRef = doc(db, 'userSettings', user.uid);
    const docSnap = await getDoc(userSettingsRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return data[settingName];
    }
    return null;
  } catch (error) {
    console.error('Error fetching user settings:', error);
    return null;
  }
}

export async function saveUserSettings(settingName: string, value: any): Promise<boolean> {
  const auth = getAuth();
  const user = auth.currentUser;
  
  if (!user) {
    console.log('Not saving settings to Firebase: User not logged in');
    return false;
  }
  
  try {
    const db = getFirestore();
    const userSettingsRef = doc(db, 'userSettings', user.uid);
    
    // Get current settings first
    const docSnap = await getDoc(userSettingsRef);
    const currentSettings = docSnap.exists() ? docSnap.data() : {};
    
    // Update only the specified setting
    await setDoc(userSettingsRef, {
      ...currentSettings,
      [settingName]: value
    });
    
    return true;
  } catch (error) {
    console.error('Error saving user settings:', error);
    return false;
  }
}