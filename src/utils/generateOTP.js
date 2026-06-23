export const createOTP = () => {
  const OTP = Math.floor(1000 + Math.random() * 1000000).toString();

  return OTP;
};
//
