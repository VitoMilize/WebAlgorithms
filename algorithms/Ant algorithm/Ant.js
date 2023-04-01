let antTarget = {home: 'home', food: 'food'};
let sniffRange = 2;

function angleVectors(vec1, vec2)
{
    let scalar = vec1.x * vec2.x + vec1.y * vec2.y;
    let angle = Math.acos(scalar/Math.sqrt(vec2.x*vec2.x + vec2.y*vec2.y));
    return angle;
}

function transitionProbability(x, y, dir, tileX, tileY, marker)
{
    let vec1 = {x:Math.cos(dir), y:Math.sin(dir)};
    let vec2 = {x:tileX - x, y:tileY - y};
    let angle = angleVectors(vec1, vec2);
    return angle/180 + marker/255;
}


export class Ant{
    constructor(dir)
    {
        this.pos = {x: 500, y:200};
        this.speed = 3;
        this.target = antTarget.home;
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
        //this.dir += Math.sin(x*y+1)*Math.random()*1 + Math.cos(x+y+1)*0;

        let maxProb = 0;
        let tile;
        for (let i = x - sniffRange; i < x + sniffRange; i++) {
            for (let j = y - sniffRange; j < y + sniffRange; j++) {
                if(0 <= i && i < fieldSizeX && 0 <= j < fieldSizeY)
                {
                    let prob = transitionProbability(x, y, this.dir, i, j,  field[(y*fieldSizeX+x)*3+2]);
                    if(prob > maxProb)
                    {
                        maxProb = prob;
                        tile = {x:i, y:j};
                    }
                }
            }
        }
        
        this.dir = angleVectors({x:1, y:0}, {x: tile.x - x, y: tile.y - y});
        //if(tile.y - y < 0) this.dir = - this.dir;

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

        this.dir = this.dir % (Math.PI * 2);
        console.log(this.dir);
    }
}