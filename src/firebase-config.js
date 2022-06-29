import { initializeApp } from "firebase/app";
import {getFirestore} from "@firebase/firestore"
import {getStorage} from "@firebase/storage"
import {getAuth} from "@firebase/auth"

const firebaseConfig = {
    apiKey: "AIzaSyAMVp1eonYSYg7eEhcRsUn1XjD1C7s-fUU",
    authDomain: "jokes-b63a8.firebaseapp.com",
    projectId: "jokes-b63a8",
    storageBucket: "jokes-b63a8.appspot.com",
    messagingSenderId: "442005339068",
    appId: "1:442005339068:web:3a1333666b4b47bd1749b9",
    measurementId: "G-ZJM44LKGPZ"
  };
  const app = initializeApp(firebaseConfig);
  export const db = getFirestore(app);
  export const storage = getStorage(app);
  export const auth = getAuth(app);





