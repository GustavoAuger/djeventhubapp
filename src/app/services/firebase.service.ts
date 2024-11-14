import { inject, Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { signInWithEmailAndPassword, getAuth ,createUserWithEmailAndPassword,updateProfile, sendPasswordResetEmail } from 'firebase/auth';
import { User } from '../models/user.model';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { getFirestore, setDoc, doc, getDoc,addDoc,collection,collectionData,query, where, getDocs, updateDoc, deleteDoc } from '@angular/fire/firestore';
import { UtilsService } from './utils.service';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { getStorage, uploadString, ref, getDownloadURL, deleteObject} from "firebase/storage";
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class FirebaseService {




  auth = inject(AngularFireAuth);
  firestore = inject(AngularFirestore);
  utilsSvc = inject(UtilsService);
  storage = inject(AngularFireStorage);

  //////////////////////////// Autenticacion ////////////////////////////


  getAuth() {
    return getAuth();
  }

  // acceder
  signIn(user: User) {
    return signInWithEmailAndPassword(getAuth(), user.email, user.password);
  }

  // cerrar sesion
  signOut() {
     getAuth().signOut();
     localStorage.removeItem('user');
      this.utilsSvc.routerlink('/auth');
  }

  // registrar
  signUp(user: User) {
    return createUserWithEmailAndPassword(getAuth(), user.email, user.password);
  }

  // actualizar perfil
  updateProfile(displayName: string) {
    return updateProfile(getAuth().currentUser, { displayName })
  }

  // enviar correo de recuperacion
  sendRecoveryEmail(email: string) {
    return sendPasswordResetEmail(getAuth(), email);
  }

  //////////////////////////// Firestore(baseDatos) ////////////////////////////
  ///


  getCollectionData(path: string, collectionQuery?: any) {
    const ref = collection(getFirestore(), path);
    const q = collectionQuery ? query(ref, collectionQuery) : ref;
    return collectionData(q, { idField: 'id' });
  }

  // obtener coleccion filtrada por creatorId
  getCollectionUser(path: string, userId: string) {
    const firestore = getFirestore();
    const collectionRef = collection(firestore, path);
    const q = query(collectionRef, where('creatorId', '==', userId));
    return collectionData(q, { idField: 'id' });
  }

  //  setear documento
  setDocument(path: string, data: any) {
    return setDoc(doc(getFirestore(), path), data);
  
  }

  
  updateDocument(path: string, data: any) {
    return updateDoc(doc(getFirestore(), path), data);
  
  }

  // eliminar documento
  deleteDocument(path: string) {
    return deleteDoc(doc(getFirestore(), path));
  
  }

  // obtener documento
  async getDocument(path: string) {
    return (await getDoc(doc(getFirestore(), path))).data();
  
  }

   // agregar documento con ID personalizado
   addDocument(path: string, data: any, id?: string) {
    const firestore = getFirestore();
    const docRef = id ? doc(firestore, path, id) : doc(collection(firestore, path)); // Si se proporciona un ID, se usa ese, sino Firebase generará uno.
    return setDoc(docRef, data); // Usa setDoc en lugar de addDoc
  }


  //////////////////////////// Storage ////////////////////////////

  // subir imagen
  async uploadImage(path: string, dataUrl: string, oldImagePath?: string): Promise<string> {
    const storage = getStorage();
    const storageRef = ref(storage, path);

    try {
        // Elimina la imagen anterior si se proporciona una ruta
        if (oldImagePath) {
            const oldImageRef = ref(storage, oldImagePath);
            await deleteObject(oldImageRef);
            console.log(`Old image at ${oldImagePath} deleted successfully.`);
        }

        // Sube la nueva imagen
        await uploadString(storageRef, dataUrl, 'data_url');
        const downloadURL = await getDownloadURL(storageRef);
        return downloadURL;
    } catch (error) {
        console.error('Error uploading image:', error);
        throw error;
    }
  }


  async addapplicants(eventId: string, applicantsData: any) {
    const path = `events/${eventId}/applicants`;
    try {
      // Aquí se usa addDocument para agregar el applicants a la colección
      await this.addDocument(path, applicantsData);
      console.log('applicants agregado con éxito');
    } catch (error) {
      console.error('Error al agregar applicants:', error);
      throw error; 
    }
  }

  async isUserRegistered(eventId: string, userId: string): Promise<boolean> {
    const path = `events/${eventId}/applicants`;
    const applicantsCollection = collection(getFirestore(), path);
    const q = query(applicantsCollection, where('userId', '==', userId));
  
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty; // Retorna true si ya existe, false si no
  }


  getEventById(eventId: string) {
    return this.firestore.collection('events').doc(eventId).get().toPromise();
  }

  getEvents(): Observable<any[]> {
    return this.firestore.collection('events').valueChanges({ idField: 'id' });
  }


  async getFilePath(url: string) {
    return ref(getStorage(), url).fullPath;
  }

  deletefile(path: string) {
    return deleteObject(ref(getStorage(), path));
  }

}
