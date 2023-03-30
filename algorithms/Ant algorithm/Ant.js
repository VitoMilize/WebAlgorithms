export class Ant{
    constructor(dir)
    {
        this.pos = {x: 0, y:0};
        this.speed = 3;
        this.color = [0.4, 0.1, 0.1, 1.0];
        this.randDir();
    }
    randDir = function()
    {
        this.dir = Math.random() * 2 * Math.PI;
    }
    doStep = function(field, fieldSizeX, fieldSizeY)
    {   
        let x = Math.ceil(this.pos.x)
        let y = Math.ceil(this.pos.y)
        field[(y*fieldSizeX+x)*3] = 255;

        let newPosX = this.pos.x + Math.cos(this.dir) * this.speed;
        let newPosY = this.pos.y + Math.sin(this.dir) * this.speed;

        if(0 <= newPosX && newPosX < fieldSizeX)
        {
            this.pos.x = newPosX;
        }
        else
        {
            if(Math.sin(this.dir) < 0)
                this.dir = Math.PI*2 - Math.acos(-Math.cos(this.dir));
            else
            this.dir = Math.acos(-Math.cos(this.dir));
            this.doStep(field, fieldSizeX, fieldSizeY);
        }
        if(0 <= newPosY && newPosY < fieldSizeY)
        {
            this.pos.y = newPosY;
        }
        else
        {
            this.dir = -this.dir;
            this.doStep(field, fieldSizeX, fieldSizeY);
        }

        this.dir += Math.sin(x*y)*Math.random()*1 + Math.cos(x+y);
    }
}