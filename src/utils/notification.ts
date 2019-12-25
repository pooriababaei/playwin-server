import fetch from "node-fetch";
const SEND_URL = `https://api.cheshmak.me/v1/push/app/${process.env.NOTIFICATION_APP_ID}/send`;
const API_KEY = process.env.NOTIFICATION_API_KEY;

export async function sendNotification(
  title: string,
  shortMessage: string,
  start: Date,
  end: Date
) {
  const body = {
    afterOpenType: "openProgram",
    pushData: { title, shortMessage },
    start,
    end
  };
  const result = await fetch(SEND_URL, {
    method: "post",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json", key: API_KEY }
  }).then(res => res.json());
  return result;
}

async function test() {
  const fetch = require("node-fetch");
  const result = await fetch(
    "https://api.cheshmak.me/v1/push/app/12313d2ecsdc/send",
    {
      method: "post",
      body: JSON.stringify({}),
      headers: { "Content-Type": "application/json", key: "1232edsdcxc" }
    }
  ).then(res => res.json());
  console.log(result);
}

//test();
