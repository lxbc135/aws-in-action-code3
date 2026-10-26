import { EC2Client } from '@aws-sdk/client-ec2';
import { waitForInstance } from './exampleLib.mjs';

const ec2 = new EC2Client({
  region: 'us-east-1'
});

async function main() {
  if (process.argv.length < 2) {
    console.log('Usage: node exampleGetInstance.mjs <instance-id>');
    process.exit(1);
  }

  const instanceId = process.argv[2]
  await waitForInstance(ec2, instanceId);
  console.log('Done');
}

main().catch(console.error);
