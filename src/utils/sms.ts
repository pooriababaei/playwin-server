import Kavenegar from "kavenegar";

export function sendSMS(phone, code) {
  let api = Kavenegar.KavenegarApi({
    apikey: "724658576A51787A35486A4C7546714A534F376A4A433856495372384A5A3673"
  });
  api.Send({
    message: `کد فعال سازی شما در پلی وین: ${code}`,
    receptor: phone
  });
}
