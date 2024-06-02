const { PubSub } = require("@google-cloud/pubsub");
const { google } = require("googleapis");

require("dotenv").config();
console.log("start");

const projectId = "emitestproject";
const subName = "projects/emitestproject-424819/subscriptions/mysubscription";
const timeout = 60;
let count = 0;
const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

const pubsub = new PubSub({
  projectId,
});

const playConsole = google.androidpublisher("v3");

google.auth
  .getClient({
    keyFile: serviceAccountPath,
    scopes: ["https://www.googleapis.com/auth/androidpublisher"],
  })
  .then((authClient) => {
    playConsole.context._options.auth = authClient;
  })
  .catch((error) => {
    console.error("Error setting up Google Play Developer API client:", error);
  });

async function handleNotification(notification) {
  const { subscriptionNotification } = notification;
  if (subscriptionNotification) {
    console.log("subscriptionNotification", subscriptionNotification);
    const { subscriptionId, purchaseToken } = subscriptionNotification;

    try {
      const purchase = await playConsole.purchases.subscriptions.get({
        packageName: "ca.equine.register.digital.stable",
        subscriptionId,
        token: purchaseToken,
      });

      console.log("purchase data", purchase.data);
    } catch (err) {
      console.error(err);
    }
  }
}

const subscription = pubsub.subscription(subName);

const messageHandler = async (message) => {
  try {
    const purchaseEvent = JSON.parse(
      Buffer.from(message.data, "base64").toString("utf-8")
    );
    await handleNotification(purchaseEvent);
    console.log("data", purchaseEvent);
  } catch (err) {
    console.error(
      "Error parsing",
      Buffer.from(message.data, "base64").toString("utf-8")
    );
  }

  console.log("count", count++);
};

subscription.on("message", messageHandler);

setTimeout(() => {
  subscription.removeListener("message", messageHandler);
  console.log(`message received ${count}`);
  console.log(`disconnect`);
}, timeout * 1000);

console.log("end");
