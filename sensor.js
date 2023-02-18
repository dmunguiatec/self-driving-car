class Sensor {

    constructor(car) {
        this.car = car;
        this.rayCount = 5;
        this.rayLength = 100;
        this.raySpread = Math.PI / 2; // 45 degrees

        this.rays = [];
        this.readings = [];
    }

    update(roadBorders, traffic) {
        this.#castRays();
        this.readings = this.rays.map(ray => this.#getReading(ray, roadBorders, traffic))
    }

    #castRays() {
        this.rays = [];

        for (let i = 0; i < this.rayCount; i++) {
            const rayAngle = this.car.angle + linearInterpolation(
                this.raySpread / 2,
                -this.raySpread / 2,
                this.rayCount == 1 ? 0.5 : i / (this.rayCount - 1)
            )

            const start = { x: this.car.x, y: this.car.y };
            const end = {
                x: this.car.x - Math.sin(rayAngle) * this.rayLength,
                y: this.car.y - Math.cos(rayAngle) * this.rayLength
            }

            this.rays.push([start, end]);
        }
    }

    #getReading(ray, roadBorders, traffic) {
        let collisions = roadBorders.map(roadBorder =>
            getIntersection(ray[0], ray[1], roadBorder[0], roadBorder[1])).filter(
                collision => collision != null);

        traffic.forEach(trafficCar => {
            const poly = trafficCar.polygon;
            for (let j = 0; j < poly.length; j++) {
                const intersection = getIntersection(ray[0], ray[1], 
                    poly[j], poly[(j + 1) % poly.length]);
                if (intersection)
                    collisions.push(intersection);
            }
        });
        
        if (collisions.length == 0)
            return null;
        else {
            const offsets = collisions.map(collision => collision.offset)
            const minOffset = Math.min(...offsets);
            return collisions.find(collision => collision.offset = minOffset);
        }

    }
}