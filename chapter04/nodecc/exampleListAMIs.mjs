import {EC2Client} from '@aws-sdk/client-ec2';
import {getAMIs} from './exampleLib.mjs';

const ec2 = new EC2Client({
  region: 'us-east-1'
});

async function main() {
  const amis = await getAMIs(ec2);
  console.log(JSON.stringify(amis, null, 2));
}

main().catch(console.error);
