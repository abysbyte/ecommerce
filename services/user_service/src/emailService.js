/**
 * Email Service
 * Handles sending emails using the Resend API.
 */

const sendOtpEmail = async (email, otp) => {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.EMAIL_FROM || 'onboarding@resend.dev';

  if (!apiKey || apiKey.startsWith('re_your_api_key')) {
    console.log(`\n==================================================`);
    console.log(`[RESEND MOCK] No valid RESEND_API_KEY configured in .env.`);
    console.log(`OTP for ${email}: ${otp}`);
    console.log(`==================================================\n`);
    return { mock: true, otp };
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: `Fashion Apocalypse <${fromEmail}>`,
        to: email,
        subject: 'Verify Your Email - OTP Code',
        html: `
          <div style="font-family: sans-serif; padding: 2rem; border: 4px solid #0f0f0f; max-width: 500px; margin: 0 auto; box-shadow: 8px 8px 0px #1c64f2;">
            <h2 style="color: #1c64f2; text-transform: uppercase; font-weight: 900; margin-bottom: 1.5rem;">Verify Your Email</h2>
            <p style="font-size: 1.1rem; line-height: 1.5; color: #333;">Thank you for registering at Fashion Apocalypse! Use the following One Time Password (OTP) to complete your sign-up or login:</p>
            <div style="font-size: 2.5rem; font-weight: 900; background: #f4f4f4; padding: 1rem; text-align: center; border: 2px solid #0f0f0f; margin: 2rem 0; letter-spacing: 0.1em; color: #0f0f0f;">
              ${otp}
            </div>
            <p style="font-size: 0.85rem; color: #666;">This code is valid for 5 minutes. If you did not request this, please ignore this email.</p>
          </div>
        `
      })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Resend API returned an error');
    }

    console.log(`\n==================================================`);
    console.log(`[RESEND EMAIL SENT] OTP for ${email}: ${otp}`);
    console.log(`Message ID: ${data.id}`);
    console.log(`==================================================\n`);
    return data;
  } catch (err) {
    console.error('Error sending email via Resend:', err);
    throw err;
  }
};

module.exports = {
  sendOtpEmail
};
