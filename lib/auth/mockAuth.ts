import * as SecureStore from "expo-secure-store";

type User = { id: string; email: string; displayName: string };
const MOCK_USER = {
  email: "test@roome.app",
  password: "Test!1234",
  id: "u_dev_1",
  displayName: "Roome Dev",
};

const KEY = "roome.session";

export async function signInMock(email: string, password: string): Promise<User> {
  if (email === MOCK_USER.email && password === MOCK_USER.password) {
    const user = { id: MOCK_USER.id, email: MOCK_USER.email, displayName: MOCK_USER.displayName };
    await SecureStore.setItemAsync(KEY, JSON.stringify(user));
    return user;
  }
  throw new Error("Invalid credentials");
}

export async function signUpMock(email: string, _password: string, displayName: string): Promise<User> {
  // Dev stub: Pretend signup succeeds and returns the same user
  const user = { id: MOCK_USER.id, email, displayName: displayName || "New User" };
  await SecureStore.setItemAsync(KEY, JSON.stringify(user));
  return user;
}

export async function getSession(): Promise<User | null> {
  const raw = await SecureStore.getItemAsync(KEY);
  return raw ? JSON.parse(raw) : null;
}

export async function signOutMock() {
  await SecureStore.deleteItemAsync(KEY);
}



