import {EC2Client} from '@aws-sdk/client-ec2';
import {getInstances} from './exampleLib.mjs';

const ec2 = new EC2Client({
  region: 'us-east-1'
});

async function main() {
  const instances = await getInstances(ec2);
  console.log(JSON.stringify(instances, null, 2));
}

main().catch(console.error);
