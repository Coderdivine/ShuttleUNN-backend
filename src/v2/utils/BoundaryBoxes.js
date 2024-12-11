class BoundaryBoxes {
    
    constructor() {
        return true;
    }

    convertToKeypoints(boundaryBoxes) {
        const keypoints = [];
    
        // Iterate through each boundary box
        for (const box of boundaryBoxes) {
          // Calculate the center of the box
          const centerX = (box.x1 + box.x2) / 2;
          const centerY = (box.y1 + box.y2) / 2;
    
          // Create a keypoint object with x, y coordinates
          const keypoint = { x: centerX, y: centerY };
    
          // Add the keypoint to the keypoints array
          keypoints.push(keypoint);
        }
    
        return keypoints;
    }

    mapBodyParts(keypoints) {
        return keypoints;
      }
    
      // Method to calculate angles for each keypoint
      calculateAngles(keypoints) {
        const angles = [];
    
        // Assuming keypoints represent joints in the body
        for (let i = 0; i < keypoints.length; i++) {
          const currentPoint = keypoints[i];
          const nextPointIndex = (i + 1) % keypoints.length;
          const nextPoint = keypoints[nextPointIndex];
    
          // Calculate the angle between current and next points
          const angle = Math.atan2(nextPoint.y - currentPoint.y, nextPoint.x - currentPoint.x);
    
          // Convert radians to degrees
          const angleDegrees = angle * (180 / Math.PI);
    
          // Add the angle to the angles array
          angles.push(angleDegrees);
        }
    
        return angles;
      }
}

module.exports = new BoundaryBoxes();