const TWILIO_ACCOUNT_SID = 'ACdf782fda7a84e3480d9ef185678c9df6';
const TWILIO_AUTH_TOKEN = 'b9967ef4aaad6d3af14ac7a193d5bb3d';
const TWILIO_SERVICE_SID = 'VAbe8d8e451aabddd65eb0675d31003f01';
const { customAlphabet } = require('nanoid');
const client = require('twilio')(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, {
  lazyLoading: true,
});

const generateOtp = async () => {
  const nanoid = customAlphabet('0123456789', 4);
  const otp = await nanoid();
  return otp;
};
const generatePromoCode = async () => {
  const nanoid = customAlphabet('0123456789', 4);
  const otp = await nanoid();
  return otp;
};

async function sendOTP(phoneNumber) {
  try {
    console.log('phoneNumber', phoneNumber);
    // Send SMS using Twilio

    const response = await client.verify.v2
      .services(TWILIO_SERVICE_SID)
      .verifications.create({
        channel: 'sms',
        to: phoneNumber,
      });
    console.log('response', response);
    console.log(
      `OTP sent successfully to ${phoneNumber}. SID: ${response.sid}`,
    );
    return `OTP sent successfully to ${phoneNumber}. SID: ${response.sid}`;
  } catch (error) {
    console.error('Error sending OTP:', error);
    return error;
  }
}
async function verifyOTP(phoneNumber, otp) {
  try {
    const response = await client.verify.v2
      .services(TWILIO_SERVICE_SID)
      .verificationChecks.create({ to: phoneNumber, code: otp });
    return response;
  } catch (error) {
    console.error('Error sending OTP:', error);
    return error;
  }
}
module.exports = { generateOtp, generatePromoCode, sendOTP, verifyOTP };
