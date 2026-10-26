import {
  DescribeImagesCommand,
  DescribeInstancesCommand,
  DescribeSubnetsCommand,
  DescribeVpcsCommand,
  RunInstancesCommand,
  TerminateInstancesCommand,
  waitUntilInstanceRunning,
} from '@aws-sdk/client-ec2';

/**
 * Lists the Amazon Linux 2 AMIs.
 *
 * @param {import('@aws-sdk/client-ec2').EC2Client} ec2 - EC2 client used to send the request
 * @returns {Promise<{id: string, description: string}[]>} AMI ids and descriptions
 */
export async function getAMIs(ec2) {
  const data = await ec2.send(new DescribeImagesCommand({
    Filters: [{
      Name: 'name',
      Values: ['amzn2-ami-hvm-2.0.202*-x86_64-gp2']
    }]
  }));
  return data.Images.map(image => ({amiId: image.ImageId, amiDescription: image.Description}));
}

/**
 * Launches a single t3.micro instance with the ec2-ssm-core instance profile.
 *
 * @param {import('@aws-sdk/client-ec2').EC2Client} ec2 - EC2 client used to send the request
 * @param {string} amiId - ID of the AMI to launch
 * @param {string} subnetId - ID of the subnet to launch the instance in
 * @returns {Promise<void>}
 */
export async function createVM(ec2, amiId, subnetId) {
  await ec2.send(new RunInstancesCommand({
    IamInstanceProfile: {
      Name: 'ec2-ssm-core'
    },
    ImageId: amiId,
    MinCount: 1,
    MaxCount: 1,
    InstanceType: 't3.micro',
    SubnetId: subnetId
  }));
}

/**
 * Lists the subnets of the default VPC.
 *
 * @param {import('@aws-sdk/client-ec2').EC2Client} ec2 - EC2 client used to send the requests
 * @returns {Promise<string[]>} subnet IDs
 */
export async function getSubnets(ec2) {
  // Get default VPC
  const vpcs = await ec2.send(new DescribeVpcsCommand({
    Filters: [{
      Name: 'isDefault',
      Values: ['true']
    }]
  }));
  const vpcId = vpcs.Vpcs[0].VpcId;
  const subnets = await ec2.send(new DescribeSubnetsCommand({
    Filters: [{
      Name: 'vpc-id',
      Values: [vpcId]
    }]
  }));
  return subnets.Subnets.map(subnet => subnet.SubnetId);
}

/**
 * Launches a single t3.micro instance with the ec2-ssm-core instance profile.
 *
 * @param {import('@aws-sdk/client-ec2').EC2Client} ec2 - EC2 client used to send the request
 * @param {string} amiId - ID of the AMI to launch
 * @param {string} subnetId - ID of the subnet to launch the instance in
 * @returns {Promise<string>} ID of the launched instance
 */
export async function launchInstance(ec2, amiId, subnetId) {
  const data = await ec2.send(new RunInstancesCommand({
    IamInstanceProfile: {
      Name: 'ec2-ssm-core'
    },
    ImageId: amiId,
    MinCount: 1,
    MaxCount: 1,
    InstanceType: 't3.micro',
    SubnetId: subnetId
  }));
  return data.Instances[0].InstanceId;
}

/**
 * Lists the IDs of pending and running instances (at most 10).
 *
 * @param {import('@aws-sdk/client-ec2').EC2Client} ec2 - EC2 client used to send the request
 * @returns {Promise<string[]>} instance IDs
 */
export async function getInstances(ec2) {
  const data = await ec2.send(new DescribeInstancesCommand({
    Filters: [{
      Name: 'instance-state-name',
      Values: ['pending', 'running']
    }],
    MaxResults: 10
  }));
  return data.Reservations.map(reservation => reservation.Instances.map(instance => instance.InstanceId)).flat();
}

/**
 * Gets the details of a single instance.
 *
 * @param {import('@aws-sdk/client-ec2').EC2Client} ec2 - EC2 client used to send the request
 * @param {string} instanceId - ID of the instance to describe
 * @returns {Promise<import('@aws-sdk/client-ec2').Instance>} the instance
 */
export async function getInstance(ec2, instanceId) {
  const data = await ec2.send(new DescribeInstancesCommand({
    InstanceIds: [instanceId]
  }));
  return data.Reservations[0].Instances[0];
}

/**
 * Waits until an instance passes its status checks (status "ok"), for up to 8 minutes.
 * Rejects if the instance does not become ok within that time.
 *
 * @param {import('@aws-sdk/client-ec2').EC2Client} ec2 - EC2 client used to send the requests
 * @param {string} instanceId - ID of the instance to wait for
 * @returns {Promise<void>}
 */
export async function waitForInstanceRunning(ec2, instanceId) {
  await waitUntilInstanceRunning(
    {
      client: ec2,
      maxWaitTime: 60, // 1 minute
    },
    {
      InstanceIds: [instanceId],
    });
}

/**
 * Terminates an instance.
 *
 * @param {import('@aws-sdk/client-ec2').EC2Client} ec2 - EC2 client used to send the request
 * @param {string} instanceId - ID of the instance to terminate
 * @returns {Promise<void>}
 */
export async function terminateInstance(ec2, instanceId) {
  await ec2.send(new TerminateInstancesCommand({
    InstanceIds: [instanceId]
  }));
}
