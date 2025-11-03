const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

// Your Apple Developer Account details
const teamId = 'VMZ7JTG4TU'; // Team ID
const clientId = 'localhost:3000'; // Services ID (APPLE_CLIENT_ID)
const keyId = 'H6CDL247XS'; // Key ID

// You need to place your AuthKey_H6CDL247XS.p8 file in the same directory as this script
// Download it from Apple Developer Portal > Keys
const privateKeyPath = path.join(__dirname, `AuthKey_${keyId}.p8`);

// Check if private key file exists
if (!fs.existsSync(privateKeyPath)) {
  console.error('❌ ERROR: Private key file not found!');
  console.error(`Expected location: ${privateKeyPath}`);
  console.error('\nPlease download your private key (.p8 file) from Apple Developer Portal:');
  console.error('1. Go to https://developer.apple.com/account/resources/authkeys/list');
  console.error('2. Find your key with ID: H6CDL247XS');
  console.error('3. Download the .p8 file');
  console.error('4. Place it in the frontend directory as: AuthKey_H6CDL247XS.p8');
  process.exit(1);
}

try {
  // Read the private key
  const privateKey = fs.readFileSync(privateKeyPath, 'utf8');

  // Create the JWT token
  const token = jwt.sign(
    {
      iss: teamId,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 15777000, // 6 months (approximately)
      aud: 'https://appleid.apple.com',
      sub: clientId,
    },
    privateKey,
    {
      algorithm: 'ES256',
      header: {
        alg: 'ES256',
        kid: keyId,
      },
    }
  );

  console.log('✅ Apple Client Secret Generated Successfully!\n');
  console.log('Copy this secret to your .env.local file:\n');
  console.log('APPLE_CLIENT_ID=localhost:3000');
  console.log(`APPLE_CLIENT_SECRET=${token}\n`);
  console.log('⚠️  Important Notes:');
  console.log('- This secret is valid for 6 months');
  console.log('- You will need to regenerate it before expiration');
  console.log('- For production, use your production domain instead of localhost:3000');
  console.log('\n📝 Configuration Details:');
  console.log(`Team ID: ${teamId}`);
  console.log(`Client ID: ${clientId}`);
  console.log(`Key ID: ${keyId}`);
  console.log(`Private Key: ${privateKeyPath}`);
  console.log(`\nExpiration: ${new Date(Math.floor(Date.now() / 1000 + 15777000) * 1000).toLocaleString()}`);

} catch (error) {
  console.error('❌ Error generating Apple client secret:', error.message);
  console.error('\nCommon issues:');
  console.error('- Make sure the .p8 file is in the correct format');
  console.error('- Verify the Team ID, Client ID, and Key ID are correct');
  console.error('- Check that jsonwebtoken is installed: npm install jsonwebtoken');
  process.exit(1);
}
