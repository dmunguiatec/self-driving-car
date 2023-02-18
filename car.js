class Car {

    constructor(x, y, width, height, isControllable = false, maxSpeed = 3, selfDrive = false) {
        this.x = x;
        this.y = y;

        this.width = width;
        this.height = height;

        this.speed = 0;
        this.acceleration = 0.2;
        this.maxSpeed = maxSpeed;
        this.friction = 0.05;

        this.angle = 0;

        this.selfDrive = selfDrive;

        if (isControllable) {
            this.sensor = new Sensor(this);
            this.brain = new NeuralNetwork([this.sensor.rayCount, 6, 4]);
        }

        this.damaged = false;

        this.isControllable = isControllable;
        this.controls = new Controls();
    }

    update(roadBorders, traffic) {
        if (!this.damaged) {
            this.#move();
            this.polygon = this.#createPolygon();
            this.damaged = this.#assessDamage(roadBorders, traffic);
        }

        if (this.sensor) {
            this.sensor.update(roadBorders, traffic);

            const offsets = this.sensor.readings.map(reading => reading == null ? 0 : 1 - reading.offset);
            const outputs = NeuralNetwork.feedForward(offsets, this.brain);
            if (this.selfDrive) {
                this.controls.forward = outputs[0] == 1;
                this.controls.left = outputs[1] == 1;
                this.controls.right = outputs[2] == 1;
                this.controls.reverse = outputs[3] == 1;
            }
        }
    }

    #assessDamage(roadBorders, traffic) {
        for (let i = 0; i < roadBorders.length; i++) {
            if (polyIntersect(this.polygon, roadBorders[i])) {
                return true;
            }
        }

        for (let i = 0; i < traffic.length; i++) {
            if (polyIntersect(this.polygon, traffic[i].polygon)) {
                return true;
            }
        }

        return false;
    }

    #createPolygon() {
        const radius = Math.hypot(this.width, this.height) / 2;
        const alpha = Math.atan2(this.width, this.height);

        return [
            {
                x: this.x - Math.sin(this.angle - alpha) * radius,
                y: this.y - Math.cos(this.angle - alpha) * radius
            },
            {
                x: this.x - Math.sin(this.angle + alpha) * radius,
                y: this.y - Math.cos(this.angle + alpha) * radius
            },
            {
                x: this.x - Math.sin(Math.PI + this.angle - alpha) * radius,
                y: this.y - Math.cos(Math.PI + this.angle - alpha) * radius
            },
            {
                x: this.x - Math.sin(Math.PI + this.angle + alpha) * radius,
                y: this.y - Math.cos(Math.PI + this.angle + alpha) * radius
            }
        ];

    }

    #move() {
        const rotationAngle = 0.03;

        if (this.controls.forward)
            this.speed += this.acceleration;

        if (this.controls.reverse)
            this.speed -= this.acceleration;

        if (this.speed != 0) {
            const mirror = this.speed > 0 ? 1 : -1;

            if (this.controls.left)
                this.angle += rotationAngle * mirror;

            if (this.controls.right)
                this.angle -= rotationAngle * mirror;
        }

        if (this.speed > this.maxSpeed)
            this.speed = this.maxSpeed;

        if (this.speed < -this.maxSpeed / 2)
            this.speed = -this.maxSpeed / 2

        if (this.speed > 0)
            this.speed -= this.friction;

        if (this.speed < 0)
            this.speed += this.friction;

        if (Math.abs(this.speed) < this.friction)
            this.speed = 0;

        this.x -= Math.sin(this.angle) * this.speed;
        this.y -= Math.cos(this.angle) * this.speed;
    }
}