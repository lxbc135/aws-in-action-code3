const {EC2Client, DescribeImagesCommand} = require('@aws-sdk/client-ec2');
const ec2 = new EC2Client({
  region: 'us-east-1'
});

module.exports = (cb) => {
  ec2.send(new DescribeImagesCommand({
    Filters: [{
      Name: 'name',
      Values: ['amzn2-ami-hvm-2.0.202*-x86_64-gp2']
    }]
  })).then((data) => {
    const amiIds = data.Images.map(image => image.ImageId);
    const descriptions = data.Images.map(image => image.Description);
    cb(null, {amiIds: amiIds, descriptions: descriptions});
  }, cb);
};
