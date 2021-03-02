import firebase from "firebase/app";
import "firebase/auth";

const app = firebase.initializeApp({
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_API_ID,
});

const getCurrentUsername = () => {
  return app.auth().currentUser && app.auth().currentUser.displayName;
}


const setPersistence = (persistence = "session") => {
  if (persistence === "session") {
    firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION);
  }
  else {
    firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL);
  }
}

const postRequestWithToken = (url, idToken, data = {}) => {
  data["idToken"] = idToken;
  const response = fetch(url, {
    method: "post",
    cache: 'no-cache',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
    .then(res => res.json())

  return response;
}

export { postRequestWithToken, setPersistence, getCurrentUsername };
export const auth = app.auth();
export default app;
