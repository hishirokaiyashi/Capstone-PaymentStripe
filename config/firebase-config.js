var admin = require("firebase-admin");

// var serviceAccount = require("./serviceAccount.json");
require("dotenv").config();

admin.initializeApp({
  // credential: admin.credential.cert(serviceAccount),
  credential: admin.credential.cert({
    type: "service_account",
    project_id: "my-app-c6127",
    private_key_id: process.env.FIREBASE_KEY_ID,
    private_key:
      "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDP3T59TP7eR8F9\n/w3MjLrjDa/U6Ahrv6i8hMWQ6qUzQskrVmgbXDVTCJZ4CSLLCIXuj7vTZSp8wQMh\nSV7L6e9VLRlbVVVOETGNMuBEDm9PLzkL7UMZL9M1RITi8Y0QBbCidc0/KB6LpI81\nxdjb5Q8XzQfgL9HoFC7pTtGp0fXN/HI2WSYdme/DsaJ3J2krbsVda9UcDpBdkJ2i\nJXc6MVcQnwLYkruCYhSRcoXlHVjeCFtcokOyneNMFbJxxHA22F2dp0QAAn2M9ilO\njKYWiTSLp1ouuRX4E4bqmQ+a295oN0JQYHV2EoFJcs/DffTnAI/MUQoOFxs24c4R\n+fJ26lVVAgMBAAECggEAFIMCR+gUqgea37colYisZ0jYku7KTr1ARklNztT9moQN\n705czv8q4R45IInT2p6YZM54z02UEAp8QUkigLnKQ1v3cBlVsr+K/1V7AIw+59zC\nyUGcL1Yv7Kyg9l1PhiC7NogSyf3IaEKqKFLCAw6X9JY0n3O1YXlR/1wNRklw2Zod\nqoV9NwFONCjZPL9xA2SPkf2TcFIl6bq+Ks6f0MvLM0qF2U9qACLPKkP+HDEbOQYP\nuhjztmPfVJCFq8SaolT0fS97s3kN4DB8bSKxWflqHF34dbP8GvjgKsGHT4OPVEHR\nefkIXwRQiA8ILYIunp94/3iKqFco+U7gma6sYvJtwwKBgQDuvo5Di3qZ/hXBvKBH\ne22nuGiFtLDJxkEujcXdyQ+J7syUJpfEtQr9AcrWBcaWLBTiZXXawL00DU8ss6rT\nsILClBFmQQVkZb/rTp2iYY1PJc8PSFbCERNoZUqQnRPQzg1bOc6PWl3kedY9jVFO\n8QsqSwU/wegEg0JgER+ZiT6RGwKBgQDe41GnlNxidtg3pDwERUO2CGevRE903mcX\nC2lnV6WYfRibaLvXaMQqGIicG7aYXZ+yY50HX8Yqb6gpzo53WFlVbPfzTD/aOSQ0\n5vqAp3+rzWty26mn1AIi8fCaENa9zVtoBU99Rv8Hx0/kwrHaxVk5m4kOBTEJIxud\nh9i90FmKTwKBgAQJTLZvoT8BQLTpz3vl5lCzmXDJQUPoCioTU4kQYSbf1q2aiW5V\n8T2dziQYLOdVD3VUac2s/IXow7Hpx7WUgmFvx2uHJeQwpDICPkAEjjMMXJfRjUXy\nq/VT4RLY1QDuuuMT8x4RVQ0L0kdwIDPJd3rbkdcmHBoXbgPZxkL+QwSJAoGBAJYb\nj/2FwprJoTpv8D+MClsI9BNUtRJnShR6CgWgQJUfArh/Y6piE2KqXS6Nd37L5uZ0\nMegqd0JTKnTleIslxBxFJAQGASbNvvWl7WVB6TjiQo/7Iho2LS4ttLV9y7HOINZA\nZVVgwBcUA1l0SeWlbT7f4gDAPFMEAvAn8i97pyH/AoGAAg9G6bm7xOBdFbV3QClm\n9HAe9MnjrkNfxx3G3HFd3GsCqG1j0bxSnWbaYbnR6QTLYxulWwvk78JDgVVNxFJs\nd621u4WqKGVIdRSA7mLNW8Z8SX899P15xD+8mYUZ15nsO2gCY6Z3SWr44/sCVyaS\naSTZt2LmtOTTmwy7sVEpN/U=\n-----END PRIVATE KEY-----\n",
    client_email:
      "firebase-adminsdk-wlyw4@my-app-c6127.iam.gserviceaccount.com",
    client_id: "111911340542181181610",
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url:
      "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-wlyw4%40my-app-c6127.iam.gserviceaccount.com",
  }),
  storageBucket: "gs://my-app-c6127.appspot.com",
});
module.exports = admin;
