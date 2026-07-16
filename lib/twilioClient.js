import twilio from 'twilio';

// Single shared Twilio client, used by send-otp, resend-otp, verify-otp, and notifications.
export const twilioClient = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

export async function sendVerificationCode(phone) {
  return twilioClient.verify.v2
    .services(process.env.TWILIO_VERIFY_SID)
    .verifications.create({ to: phone, channel: 'sms' });
}

export async function checkVerificationCode(phone, code) {
  return twilioClient.verify.v2
    .services(process.env.TWILIO_VERIFY_SID)
    .verificationChecks.create({ to: phone, code });
}

export async function sendSms(to, body) {
  return twilioClient.messages.create({
    to,
    from: process.env.TWILIO_PHONE_NUMBER,
    body,
  });
}
