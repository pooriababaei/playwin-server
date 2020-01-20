import Kavenegar from 'kavenegar';
import Ghasedak from 'ghasedak';
import fetch from 'node-fetch';
import request from 'request';

export function sendSMS(phone, code) {
  const kavenegar = Kavenegar.KavenegarApi({
    // apikey: '724658576A51787A35486A4C7546714A534F376A4A433856495372384A5A3673' // Pooria
    apikey:
      '7341483264363438453031555343314A3934554972735A5943463233493768467174613535676F475161673D'
  });
  kavenegar.Send({
    //  message: `کد فعال سازی شما در پلی وین: ${code}`,
    message: `کد فعال سازی شما در پلی وین: ${code}`,
    receptor: phone
  });

  // const ghasedak = new Ghasedak(
  //   '65e8166faf249abdf3591782366b413333856066d1ff120d1e51a65566d8ff59'
  // );
  // ghasedak.verification({
  //   template: 'playwin',
  //   type: 1,
  //   param1: code,
  //   receptor: phone
  // });
  // fetch('https://api.ghasedak.io/v2/verification/send/simple', {
  //   method: 'POST',
  //   body: JSON.stringify({
  //     template: 'playwin',
  //     type: 1,
  //     param1: code,
  //     receptor: phone
  //   }),
  //   headers: {
  //     // 'Content-Type': 'application/x-www-form-urlencoded',
  //     apikey:
  //       '65e8166faf249abdf3591782366b413333856066d1ff120d1e51a65566d8ff59',
  //   }
  // })
  //   .then(res => res.json())
  //   .then(json => console.log(json))
  //   .catch(() => {});

  // var options = {
  //   method: 'POST',
  //   url: 'https://api.ghasedak.io/v2/sms/send/simple',
  //   headers: {
  //     apikey: '65e8166faf249abdf3591782366b413333856066d1ff120d1e51a65566d8ff59'
  //   },
  //   form: { message: 'سلام', Receptor: phone }
  // };
  // request(options, function(error, response, body) {
  //   if (error) console.log(error);
  //   console.log(body);
  // });
}
