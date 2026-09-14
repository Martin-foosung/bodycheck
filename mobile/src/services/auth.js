import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY='bodycheck_token';

export async function getToken(){ return SecureStore.getItemAsync(TOKEN_KEY); }
export async function setToken(token){ return SecureStore.setItemAsync(TOKEN_KEY,token); }
export async function clearToken(){ return SecureStore.deleteItemAsync(TOKEN_KEY); }
