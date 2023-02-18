const BEST_CAR_KEY = "bestBrain";
let bestCar;

function setup() {
    const canvas = document.getElementById("mainCanvas");
    const context = canvas.getContext("2d");

    canvas.width = 200;

    const annCanvas = document.getElementById("annCanvas");
    const annContext = annCanvas.getContext("2d");

    annCanvas.width = 300;

    const carCount = 300;
    const road = new Road(canvas.width / 2, canvas.width * 0.9);
    const cars = generateCars(carCount, road);
    const traffic = [
        new Car(road.getLaneCenter(1), -100, 30, 50, isControllable = false, maxSpeed = 2, selfDrive = false),
        new Car(road.getLaneCenter(0), -300, 30, 50, isControllable = false, maxSpeed = 2, selfDrive = false),
        new Car(road.getLaneCenter(2), -250, 30, 50, isControllable = false, maxSpeed = 2, selfDrive = false),
        new Car(road.getLaneCenter(0), -100, 30, 50, isControllable = false, maxSpeed = 2, selfDrive = false),
        new Car(road.getLaneCenter(1), -500, 30, 50, isControllable = false, maxSpeed = 2, selfDrive = false),
        new Car(road.getLaneCenter(1), -650, 30, 50, isControllable = false, maxSpeed = 2, selfDrive = false),
        new Car(road.getLaneCenter(2), -800, 30, 50, isControllable = false, maxSpeed = 2, selfDrive = false),
        new Car(road.getLaneCenter(0), -750, 30, 50, isControllable = false, maxSpeed = 2, selfDrive = false),
        new Car(road.getLaneCenter(2), -870, 30, 50, isControllable = false, maxSpeed = 2, selfDrive = false),
        new Car(road.getLaneCenter(0), -1650, 30, 50, isControllable = false, maxSpeed = 2, selfDrive = false),
        new Car(road.getLaneCenter(1), -1300, 30, 50, isControllable = false, maxSpeed = 2, selfDrive = false),
        new Car(road.getLaneCenter(2), -900, 30, 50, isControllable = false, maxSpeed = 2, selfDrive = false),
        new Car(road.getLaneCenter(0), -910, 30, 50, isControllable = false, maxSpeed = 2, selfDrive = false),
        new Car(road.getLaneCenter(1), -1100, 30, 50, isControllable = false, maxSpeed = 2, selfDrive = false),
    ]

    bestCar = cars[0];
    if (localStorage.getItem(BEST_CAR_KEY)) {
        cars.forEach((car, index) => {
            car.brain = JSON.parse(localStorage.getItem(BEST_CAR_KEY));
            if (index > 0) {
                NeuralNetwork.mutate(car.brain, percentage=0.35);
            }
        });
    }

    addKeyboardListeners(cars[0]);
    traffic.forEach(trafficCar => trafficCar.controls.goForward());

    const animate = (time) => {
        traffic.forEach(trafficCar => trafficCar.update(road.borders, []))
        cars.forEach(car => car.update(road.borders, traffic));
        canvas.height = window.innerHeight;
        annCanvas.height = window.innerHeight;

        bestCar = cars.find(car => car.y == Math.min(...cars.map(car => car.y)));

        context.save();
        context.translate(0, -bestCar.y + canvas.height * 0.7);

        drawRoad(context, road);
        traffic.forEach(trafficCar => drawCar(context, trafficCar));

        context.globalAlpha = 0.4;
        bestCar.drawSensor = true;
        cars.forEach(car => drawCar(context, car));
        context.globalAlpha = 1;

        context.restore();

        annContext.lineDashOffset = -time / 50;
        Visualizer.drawNetwork(annContext, bestCar.brain);
        requestAnimationFrame(animate)
    }

    animate();
}

function drawRoad(context, road) {
    context.lineWidth = 5;
    context.strokeStyle = "white";

    for (let i = 1; i < road.laneCount; i++) {
        const x = linearInterpolation(
            road.left,
            road.right,
            i / road.laneCount
        );

        context.setLineDash([20, 20]);
        context.beginPath();
        context.moveTo(x, road.top);
        context.lineTo(x, road.bottom);
        context.stroke();
    }

    context.setLineDash([]);
    road.borders.forEach(border => {
        context.beginPath();
        context.moveTo(border[0].x, border[0].y);
        context.lineTo(border[1].x, border[1].y);
        context.stroke();
    });
}

function drawCar(context, car) {
    if (car.damaged) {
        context.fillStyle = "red";
    } else {
        context.fillStyle = "black";
    }

    context.beginPath();
    context.moveTo(car.polygon[0].x, car.polygon[0].y);
    for (let i = 1; i < car.polygon.length; i++) {
        context.lineTo(car.polygon[i].x, car.polygon[i].y)
    }
    context.fill();

    if (car.sensor && car.drawSensor)
        drawSensor(context, car.sensor);
}

function drawSensor(context, sensor) {
    for (let i = 0; i < sensor.rayCount; i++) {
        let end = sensor.rays[i][1];
        if (sensor.readings[i])
            end = sensor.readings[i];

        context.beginPath();
        context.lineWidth = 2;
        context.strokeStyle = "lightgreen";
        context.moveTo(
            sensor.rays[i][0].x,
            sensor.rays[i][0].y
        );
        context.lineTo(end.x, end.y);
        context.stroke();

        context.beginPath();
        context.lineWidth = 2;
        context.strokeStyle = "red";
        context.moveTo(
            sensor.rays[i][1].x,
            sensor.rays[i][1].y
        );
        context.lineTo(end.x, end.y);
        context.stroke();
    }
}

function addKeyboardListeners(car) {
    if (car.isControllable && !car.selfDrive) {
        document.onkeydown = (event) => {
            switch (event.key) {
                case "ArrowLeft":
                    car.controls.turnLeft(); break;
                case "ArrowRight":
                    car.controls.turnRight(); break;
                case "ArrowUp":
                    car.controls.goForward(); break;
                case "ArrowDown":
                    car.controls.goReverse(); break;
            }
        }

        document.onkeyup = (event) => {
            switch (event.key) {
                case "ArrowLeft":
                    car.controls.stopTurningLeft(); break;
                case "ArrowRight":
                    car.controls.stopTurningRight(); break;
                case "ArrowUp":
                    car.controls.stop(); break;
                case "ArrowDown":
                    car.controls.stop(); break;
            }
        }
    }
}

function generateCars(n, road) {
    const cars = [];
    for (let i = 0; i < n; i++) {
        cars.push(new Car(road.getLaneCenter(1), 100, 30, 50,
            isControllable=true, maxSpeed=3, selfDrive=true))
    }

    return cars;
}

function saveBestCar() {
    localStorage.setItem(BEST_CAR_KEY, JSON.stringify(bestCar.brain));
}

function discardBestCar() {
    localStorage.removeItem(BEST_CAR_KEY);
}


setup();