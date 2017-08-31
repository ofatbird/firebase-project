const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccount.json');

admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
	databaseURL: "https://hot-update.firebaseio.com/",
})

// const ref = admin.database().ref('films/bdfilms')
module.exports = admin.database();
