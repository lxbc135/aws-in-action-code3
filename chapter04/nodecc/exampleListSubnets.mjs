import {EC2Client} from '@aws-sdk/client-ec2';
import {getSubnets} from './exampleLib.mjs';

const ec2 = new EC2Client({
  region: 'us-east-1'
});

async function main() {
  const subnets = await getSubnets(ec2);
  console.log(JSON.stringify(subnets, null, 2));
}

main().catch(console.error);
