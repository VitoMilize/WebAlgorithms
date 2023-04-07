let antTarget = {home: 'home', food: 'food'};
export class Ant{
    constructor(x, y)
    {
        this.pos = {x:x, y:y};
        this.speed = 1;
        this.freedom = 0.5 + Math.random()*0.5;
        this.sniffRange = 15;
        this.markerIntensity = 255;
        this.target = antTarget.food;
        this.clock = 0;
        this.dir = Math.random() * 2 * Math.PI;
    }
}