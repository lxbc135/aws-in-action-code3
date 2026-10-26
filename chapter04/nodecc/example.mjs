/**
 * Example - Launch EC2 instance, waits for user key, then terminates instance.
 */
import { EC2Client, waitUntilInstanceStatusOk } from '@aws-sdk/client-ec2';

import { launchInstance, getAMIs, getInstance, getInstances, getSubnets, terminateInstance, waitForInstanceRunning } from './exampleLib.mjs';

/**
 * Prints a prompt and resolves once the user presses any key.
 *
 * @param {string} prompt - text shown to the user
 * @returns {Promise<void>}
 */
function waitForKeyPress(prompt) {
  console.log(prompt);
  return new Promise((resolve) => {
    const {stdin} = process;
    const wasRaw = stdin.isRaw;
    stdin.setRawMode?.(true);
    stdin.resume();
    stdin.once('data', (key) => {
      stdin.setRawMode?.(wasRaw);
      stdin.pause();
      if (key[0] === 0x03) { // Ctrl+C is not delivered as SIGINT in raw mode
        process.exit(130);
      }
      resolve();
    });
  });
}

async function main() {
  const ec2 = new EC2Client({
    region: 'us-east-1'
  });

  const amis = await getAMIs(ec2);
  if (amis.length === 0) {
    console.error("No AMI found");
    return;
  }

  const {amiId, amiDescription} = amis[0];
  console.log(`Using AMI ${amiId} ${amiDescription}`);

  const subnets = await getSubnets(ec2);
  if (subnets.length === 0) {
    console.error("No subnet found");
    return;
  }
  const subnetId = subnets[0];
  console.log(`Using subnet ${subnetId}`);

  const instanceId = await launchInstance(ec2, amiId, subnetId);
  console.log(`Launched instance ${instanceId}`);

  console.log(`Waiting for instance to be running`);
  await waitForInstanceRunning(ec2, instanceId);

  const instances = await getInstances(ec2,);
  console.log(`Instances: ${JSON.stringify(instances, null, 2)}`);

  await waitForKeyPress('Press any key to terminate the instance...');

  await terminateInstance(ec2, instanceId);
  console.log(`Terminating instance ${instanceId}`);
}

main().catch(console.error);
