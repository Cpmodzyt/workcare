import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { isFirebaseLive } from './firebase';

export async function uploadMediaFile(file: File, folder: 'reports' | 'messages' = 'reports'): Promise<string> {
  // If live Firebase Storage is active
  if (isFirebaseLive()) {
    try {
      const storage = getStorage();
      const filename = `${folder}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
      const storageRef = ref(storage, filename);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadUrl = await getDownloadURL(snapshot.ref);
      return downloadUrl;
    } catch (e) {
      console.warn('Firebase Storage upload failed, falling back to local object/data URL:', e);
    }
  }

  // Fallback: Read as Data URL or Object URL for immediate preview and offline testing
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result as string);
    };
    reader.onerror = (error) => {
      reject(error);
    };
    reader.readAsDataURL(file);
  });
}
