import {
  signInWithEmailAndPassword,
  signOut,
  User,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../lib/firebase";

type FirebaseAuthError = {
  code?: string;
};

export async function loginAdmin(
  email: string,
  password: string
): Promise<User> {
  try {
    const credential = await signInWithEmailAndPassword(
      auth,
      email.trim(),
      password
    );

    const userReference = doc(db, "users", credential.user.uid);
    const userSnapshot = await getDoc(userReference);

    if (!userSnapshot.exists()) {
      await signOut(auth);
      throw new Error(
        "A conta existe, mas não possui perfil cadastrado no sistema."
      );
    }

    const profile = userSnapshot.data();

    if (profile.role !== "admin") {
      await signOut(auth);
      throw new Error("Esta conta não possui acesso de administrador.");
    }

    if (profile.active === false) {
      await signOut(auth);
      throw new Error("Esta conta está desativada.");
    }

    return credential.user;
  } catch (error) {
    const firebaseError = error as FirebaseAuthError;

    if (
      firebaseError.code === "auth/invalid-credential" ||
      firebaseError.code === "auth/wrong-password" ||
      firebaseError.code === "auth/user-not-found"
    ) {
      throw new Error("E-mail ou senha incorretos.");
    }

    if (firebaseError.code === "auth/invalid-email") {
      throw new Error("Informe um endereço de e-mail válido.");
    }

    if (firebaseError.code === "auth/too-many-requests") {
      throw new Error(
        "Muitas tentativas de acesso. Aguarde alguns minutos."
      );
    }

    if (firebaseError.code === "auth/network-request-failed") {
      throw new Error(
        "Não foi possível conectar ao Firebase. Verifique a internet e as configurações do projeto."
      );
    }

    throw error;
  }
}

export async function logout(): Promise<void> {
  await signOut(auth);
}

