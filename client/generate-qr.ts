import qrcode from 'qrcode-terminal';
import os from 'os';

// Get local IP address
const networkInterfaces = os.networkInterfaces();
let ipAddress: string = '';

const ifaces = networkInterfaces['Ethernet'];
if (ifaces) {
  for (let i = 0; i < ifaces.length; i++) {
    const iface = ifaces[i];
    if (iface.family === 'IPv4' && !iface.internal) {
      ipAddress = iface.address;
      break;
    }
  }
}

if (ipAddress) {
  const url = `http://${ipAddress}:3000`;
  console.log(`Your app is running at: ${url}`);
  console.log('Scan this QR code to access from your phone:');
  qrcode.generate(url, { small: true });
} else {
  console.log('Could not find a local IP address.');
}