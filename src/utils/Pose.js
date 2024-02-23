class PoseCalculator {
  constructor(keypoints) {
    this.keypoints = keypoints;
    console.log({ keypoints });
  }

  keypointsExist() {
    return this.keypoints;
    // &&
    // this.keypoints.every((point) => point && typeof point === 'object' && 'x' in point && 'y' in point)
  }

  calculateAngle(point1, point2) {
    // return Math.atan2(point2.y - point1.y, point2.x - point1.x);
    const angle =
      ((Math.atan2(point2.y - point1.y, point2.x - point1.x) * 180) / Math.PI +
        360) %
      360;
    return angle;
  }

  calculateDistance(point1, point2) {
    return Math.sqrt(
      Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2)
    );
  }

  scaleDistance(distance, scalingFactor) {
    return distance * scalingFactor;
  }

  handle2DLimitations() {
    // Your implementation to handle 2D limitations
    // This could involve predicting occluded keypoints or correcting for perspective distortion
  }

  calculatePose() {
    if (!this.keypointsExist()) {
      console.error("Keypoints do not exist or are not valid.");
      return null;
    }

    const { leftshoulder, rightshoulder, leftelbow, rightelbow, waist, neck } =
      this.keypoints;

    const LSA = this.calculateAngle(leftshoulder, neck);
    const RSA = this.calculateAngle(rightshoulder, neck);
    const LEA = this.calculateAngle(leftelbow, leftshoulder);
    const REA = this.calculateAngle(rightelbow, rightshoulder);
    const WHA = this.calculateAngle(waist, neck);

    const LSLED = this.calculateDistance(leftshoulder, leftelbow);
    const RSRED = this.calculateDistance(rightshoulder, rightelbow);

    const scalingFactor = 1.0;

    const scaledLSLED = this.scaleDistance(LSLED, scalingFactor);
    const scaledRSRED = this.scaleDistance(RSRED, scalingFactor);

    this.handle2DLimitations();

    const posture_name = this.createPostureName({
      LSA,
      RSA,
      LEA,
      REA,
      WHA,
      LSLED,
      RSRED,
      scaledLSLED,
      scaledRSRED,
    });

    return {
      LSA,
      RSA,
      LEA,
      REA,
      WHA,
      LSLED,
      RSRED,
      scaledLSLED,
      scaledRSRED,
      posture_name,
    };
  }

  createPostureName(calculatedPose) {
    const lsa = `Left shoulder angle is ${
      calculatedPose?.LSA || "could not be calculated"
    }`;
    const rsa = `Right shoulder angle is ${
      calculatedPose?.RSA || "could not be calculated"
    }`;
    const lea = `Left Elbow angle is ${
      calculatedPose?.LEA || "could not be calculated"
    }`;
    const rea = `Right Elbow angle is ${
      calculatedPose?.REA || "could not be calculated"
    }`;
    const wha = `Left shoulder angle is ${
      calculatedPose?.WHA || "could not be calculated"
    }`;
    const posture_name = `
            Posture: ${wha}, ${lsa}, ${rsa}, ${lea} and ${rea}.
        `;
    return posture_name;
  }
}

const exampleKeypoints = {
  leftshoulder: { x: 10, y: 20 },
  rightshoulder: { x: 30, y: 20 },
  leftelbow: { x: 5, y: 15 },
  rightelbow: { x: 35, y: 15 },
  waist: { x: 20, y: 40 },
  neck: { x: 20, y: 10 },
};

const poseCalculator = new PoseCalculator(exampleKeypoints);
const calculatedPose = poseCalculator.calculatePose();
console.log({ calculatedPose });

module.exports = PoseCalculator;
