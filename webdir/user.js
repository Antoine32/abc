class user {
    constructor() {
        this.drawLines = [];
        this.color = color('#fff700');
        this.size = 5;
        this.drawing = false;

        this.min = createVector(width, height);
        this.max = createVector(0, 0);
    }
}