let hyphae = [];
const maxHyphae = 2000;
const initialHyphae = 10;
const sensorAngle = Math.PI / 4;
const sensorDistance = 20;
const branchProb = 0.02;
const growthRate = 1;
const petriDishRadius = 280;

function setup() {
  createCanvas(600, 600);
  background("#50614b");

  // Initialize hyphae at the center, growing in random directions
  for (let i = 0; i < initialHyphae; i++) {
    let angle = random(TWO_PI);
    hyphae.push(new Hypha(width / 2, height / 2, angle));
  }
}

function draw() {
  translate(width / 2, height / 2);  // Center the coordinate system

  for (let i = 0; i < hyphae.length; i++) {
    hyphae[i].grow();
    hyphae[i].display();
  }
}

class Hypha {
  constructor(x, y, angle) {
    this.pos = createVector(x - width / 2, y - height / 2);  // Adjust for centered coordinate system
    this.angle = angle;
    this.color = color("#efebe3")
  }

  grow() {
    // Check neighbors
    let leftSensor = this.sense(-sensorAngle);
    let centerSensor = this.sense(0);
    let rightSensor = this.sense(sensorAngle);

    // Adjust growth direction
    if (!leftSensor && !centerSensor && !rightSensor) {
      // No neighbors, adjust towards the edge of the petri dish
      let angleToEdge = atan2(this.pos.y, this.pos.x);
      this.angle = lerp(this.angle, angleToEdge, 0.1);
    } else if (leftSensor && !rightSensor) {
      this.angle += random(0.1);
    } else if (!leftSensor && rightSensor) {
      this.angle -= random(0.1);
    }

    // Calculate new position
    let newPos = p5.Vector.fromAngle(this.angle).mult(growthRate);
    let potentialPos = p5.Vector.add(this.pos, newPos);

    // Check if the new position is within the petri dish
    if (potentialPos.mag() <= petriDishRadius) {
      this.pos = potentialPos;
    } else {
      // If not, adjust the angle to grow along the boundary
      this.angle = this.pos.heading() + HALF_PI;
    }

    // Branch
    if (random() < branchProb && hyphae.length < maxHyphae) {
      let branchAngle = this.angle + random(-PI/4, PI/4);
      hyphae.push(new Hypha(this.pos.x + width / 2, this.pos.y + height / 2, branchAngle));
    }
  }

  sense(angleOffset) {
    let sensorAngle = this.angle + angleOffset;
    let sensorPos = p5.Vector.fromAngle(sensorAngle).mult(sensorDistance).add(this.pos);

    // Check if sensor is outside the petri dish
    if (sensorPos.mag() > petriDishRadius) {
      return true;  // Treat boundary as an obstacle
    }

    // Check if any hypha is near the sensor position
    for (let hypha of hyphae) {
      if (p5.Vector.dist(sensorPos, hypha.pos) < sensorDistance) {
        return true;
      }
    }
    return false;
  }

  display() {
    stroke(this.color);
    point(this.pos.x, this.pos.y);
  }
}