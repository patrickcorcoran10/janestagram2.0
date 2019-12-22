const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

const app = require("express")();

const firebaseConfig = {
  apiKey: "AIzaSyAoC_XfqJL_c3gwLqeZRkTkBPIAa0JpGDU",
  authDomain: "janestagram-8af46.firebaseapp.com",
  databaseURL: "https://janestagram-8af46.firebaseio.com",
  projectId: "janestagram-8af46",
  storageBucket: "janestagram-8af46.appspot.com",
  messagingSenderId: "948865152268",
  appId: "1:948865152268:web:f46f6345b8e1f8e9dac529",
  measurementId: "G-351FZZ4TDX"
};

const firebase = require("firebase");

firebase.initializeApp(firebaseConfig);

const db = admin.firestore();

app.get("/pictures", (req, res) => {
  db.collection("pictures")
    .orderBy("createdAt", "desc")
    .get()
    .then(data => {
      let pictures = [];
      data.forEach(doc => {
        pictures.push({
          pictureId: doc.id,
          body: doc.data().body,
          userHandle: doc.data().userHandle,
          createdAt: doc.data().createdAd
        });
      });
      return res.json(pictures);
    })
    .catch(err => {
      console.error(err);
    });
});

app.post("/create-picture", (req, res) => {
  const newPicture = {
    body: req.body.body,
    userHandle: req.body.userHandle,
    createdAt: new Date().toISOString()
  };

  db.collection("pictures")
    .add(newPicture)
    .then(doc => {
      res.json({ message: `document ${doc.id} created successfully` });
    })
    .catch(err => {
      res.status(500).json({ error: "something went wrong" });
      console.error(err);
    });
});

// Sign Up Route
app.post("/sign-up", (req, res) => {
  const newUser = {
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    handle: req.body.handle
  };

  db.doc(`/users/${newUser.handle}`)
    .get()
    .then(doc => {
      if (doc.exists) {
        return res.status(400).json({ handle: "this handle is already taken" });
      } else {
        return firebase
          .auth()
          .createUserWithEmailAndPassword(newUser.email, newUser.password);
      }
    })
    .then(data => {
      return data.user.getIdToken();
    })
    .then(token => {
      return res.status(201).json({ token });
    })
    .catch(err => {
      console.error(err);
      return res.status(500).json({ error: err.code });
    });
});

exports.api = functions.https.onRequest(app);
