const CustomError = require("./custom-error");

class PoseCalculator {
  constructor(keypoints) {
    this.keypoints = keypoints;
    return this;
  }

  async getPosture(bodyparts, width, height) {
    const requiredParts = [
      "leftshoulders",
      "leftarm",
      "rightarm",
      "rightshoulders",
      "lefthand",
      "righthand",
    ];

    const missingParts = requiredParts.filter(
      (part) => !bodyparts.some((bp) => bp.label === part)
    );

    await Promise.all(
      missingParts.map(async (part) => {
        const foundPart = part.startsWith("left")
          ? await this.detectLeft(part, bodyparts, width, height)
          : await this.detectRight(part, bodyparts, width, height);
        if (foundPart) bodyparts.push(foundPart);
      })
    );

    console.log({ bodyparts });
    return bodyparts;
  }

  detectRight(findpart, body, width, height) {
    const centerX = width / 2;
    const leftSide = "left" + findpart.substring(5);
    console.log("Detecting " + findpart + " with " + leftSide);

    let findLeftside = body?.filter((part) => part["label"] == leftSide);

    if (!Array.isArray(findLeftside)) {
      findLeftside = findLeftside ? [findLeftside] : [];
    }

    const findpartResult = findLeftside.filter((part) => part.x > centerX);
    return findpartResult.length > 0
      ? { ...findpartResult[0], label: findpart }
      : null;
  }

  detectLeft(findpart, body, width, height) {
    const centerX = width / 2;
    const rightSide = "right" + findpart.substring(4);
    console.log("Detecting " + findpart + " with " + rightSide);

    let findrightside = body?.filter((part) => part["label"] == rightSide);

    if (!Array.isArray(findrightside)) {
      findrightside = findrightside ? [findrightside] : [];
    }

    const findpartResult = findrightside.filter((part) => part.x < centerX);
    return findpartResult.length > 0
      ? { ...findpartResult[0], label: findpart }
      : null;
  }

  calculateCenter(bb) {
    console.log({
      center: "CENTER",
      x: bb.x + bb.width / 2,
      y: bb.y + bb.height / 2,
    });
    return { x: bb.x + bb.width / 2, y: bb.y + bb.height / 2 };
  }

  calculateAngle(p1, p2) {
    const vectorX = p2.x - p1.x;
    const vectorY = p2.y - p1.y;

    // Calculate dot product of the vectors
    const dotProduct = vectorX * vectorX + vectorY * vectorY;

    // Calculate magnitudes of the vectors
    const magnitude1 = Math.sqrt(p1.x * p1.x + p1.y * p1.y);
    const magnitude2 = Math.sqrt(p2.x * p2.x + p2.y * p2.y);

    // Calculate cosine of the angle between the vectors
    const cosAngle = dotProduct / (magnitude1 * magnitude2);

    // Calculate angle in radians
    const angleRadians = Math.acos(cosAngle);

    // Convert angle to degrees
    const angleDegrees = angleRadians * (180 / Math.PI);

    return angleDegrees;
    // return (Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180.0) / Math.PI;
  }

  async finalPosture(posture_json, width, height) {
    const postures_bounding_box = await this.getPosture(
      posture_json,
      width,
      height
    );
    const postures_keypoints = postures_bounding_box.map((bb) => {
      const { x, y } = this.calculateCenter(bb);
      return { ...bb, x, y };
    });

    const getAngle = (label1, label2) => {
      const point1 = postures_keypoints.find((x) => x?.label === label1);
      const point2 = postures_keypoints.find((x) => x?.label === label2);
      return point1 && point2 ? this.calculateAngle(point1, point2) : null;
    };

    const angles = {
      neckAngle: getAngle("head", "neck"),
      leftShoulderAngle: getAngle("neck", "leftshoulders"),
      rightShoulderAngle: getAngle("neck", "rightshoulders"),
      leftArmAngle: getAngle("leftshoulders", "leftarm"),
      rightArmAngle: getAngle("rightshoulders", "rightarm"),
      leftHandAngle: getAngle("leftarm", "lefthand"),
      rightHandAngle: getAngle("rightarm", "righthand"),
      waistAngle: getAngle("neck", "waist"),
    };

    console.log({ angles });

    const formatAngle = (angle) => (angle ? `${angle} degrees` : "No detected");

    const posture_name = `
    neckAngle => ${formatAngle(angles.neckAngle)},
    leftShoulderAngle => ${formatAngle(angles.leftShoulderAngle)},
    rightShoulderAngle => ${formatAngle(angles.rightShoulderAngle)},
    leftArmAngle => ${formatAngle(angles.leftArmAngle)},
    rightArmAngle => ${formatAngle(angles.rightArmAngle)},
    leftHandAngle => ${formatAngle(angles.leftHandAngle)},
    rightHandAngle => ${formatAngle(angles.rightHandAngle)},
    waistAngle => ${formatAngle(angles.waistAngle)},
    `;

    return {
      new_json: postures_keypoints,
      posture_name,
    };
  }
}

const poseCalculator = new PoseCalculator({});

module.exports = PoseCalculator;
