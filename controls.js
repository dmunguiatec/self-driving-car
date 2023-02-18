class Controls {
    constructor() {
        this.forward = false;
        this.left = false;
        this.right = false;
        this.reverse = false;
    }

    turnLeft() {
        this.left = true;
    }

    stopTurningLeft() {
        this.left = false;
    }

    turnRight() {
        this.right = true;
    }

    stopTurningRight() {
        this.right = false;
    }

    goForward() {
        this.forward = true;
    }

    stop() {
        this.forward = false;
        this.reverse = false;
    }

    goReverse() {
        this.reverse = true;
    }
}