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
    return 1 - angle/Math.PI + marker/255 * (Math.random()*0.25 - 0.03) * 1.5;
}


export class Ant{
    constructor(pos)
    {
        //this.pos = {x: 500, y:200};
        this.pos = pos;
        this.speed = 1;
        this.target = antTarget.food;
        this.randDir();
    }
    randDir = function()
    {
        this.dir = Math.random() * 2 * Math.PI;
    }
    doStep = function(field, fieldSizeX, fieldSizeY, objId)
    {   
        
        let x = Math.ceil(this.pos.x)
        let y = Math.ceil(this.pos.y)
        //if(field[(y*fieldSizeX+x)*3+1] == objId.food) this.target = antTarget.home;
        //if(field[(y*fieldSizeX+x)*3+1] == objId.home) this.target = antTarget.food;

        console.log(x,y);
        field[(y*fieldSizeX+x)*3] += 50;

        // if(this.target == antTarget.food) 
        // {
        //     field[(y*fieldSizeX+x)*3] += 50;
        //     if(field[(y*fieldSizeX+x)*3] > 255) field[(y*fieldSizeX+x)*3] = 255;
        // }
        // else 
        // {
        //     field[(y*fieldSizeX+x)*3 + 2] += 50;
        //     if(field[(y*fieldSizeX+x)*3 + 2] > 255) field[(y*fieldSizeX+x)*3 + 2] = 255;
        // }
        

        // let maxProb = 0;
        // let tile// = {x:0, y:0};
        // for (let i = x - sniffRange; i <= x + sniffRange; i++) {
        //     for (let j = y - sniffRange; j <= y + sniffRange; j++) {
        //         if(i == x && j == y) 
        //         {
        //             continue;
        //         }
        //         if(0 <= i && i < fieldSizeX && 0 <= j < fieldSizeY)
        //         {
        //             let marker;
        //             if(this.target == antTarget.food) marker = field[(j*fieldSizeX+i)*3+2];
        //             else marker = field[(j*fieldSizeX+i)*3];
        //             marker = 0;
        //             //console.log(marker);
        //             let prob = transitionProbability(x, y, this.dir, i, j,  marker);
        //             if(prob > maxProb)
        //             {
        //                 maxProb = prob;
        //                 tile = {x:i, y:j};
        //             }
        //         }
        //     }
        // }
        // this.dir = angleVectors({x:1, y:0}, {x: (tile.x - x), y: (tile.y - y)});
        // if(tile.y - y < 0) this.dir = - this.dir;

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
            this.doStep(field, fieldSizeX, fieldSizeY, objId);
        }
        if(0 <= newPosY && newPosY < fieldSizeY)
        {
            this.pos.y = newPosY;
        }
        else
        {
            this.dir = -this.dir;
            this.doStep(field, fieldSizeX, fieldSizeY, objId);
        }

        this.dir += Math.sin(x+y+1)*Math.random()*0.3 + Math.cos(x+y+1)*0;

        //this.dir = this.dir % (Math.PI * 2);
    }
    // doStep = function(field, fieldSizeX, fieldSizeY)
    // {   
    //     let x = Math.ceil(this.pos.x)
    //     let y = Math.ceil(this.pos.y)
    //     field[(y*fieldSizeX+x)*3] += 50;

    //     let newPosX = this.pos.x + Math.cos(this.dir) * this.speed;
    //     let newPosY = this.pos.y + Math.sin(this.dir) * this.speed;

    //     if(0 <= newPosX && newPosX < fieldSizeX)
    //     {
    //         this.pos.x = newPosX;
    //     }
    //     else
    //     {
    //         if(Math.sin(this.dir) < 0)
    //             this.dir = Math.PI*2 - Math.acos(-Math.cos(this.dir));
    //         else
    //             this.dir = Math.acos(-Math.cos(this.dir));
    //         this.doStep(field, fieldSizeX, fieldSizeY);
    //     }
    //     if(0 <= newPosY && newPosY < fieldSizeY)
    //     {
    //         this.pos.y = newPosY;
    //     }
    //     else
    //     {
    //         this.dir = -this.dir;
    //         this.doStep(field, fieldSizeX, fieldSizeY);
    //     }

    //     this.dir += Math.sin(x+y+1)*Math.random()*0.3 + Math.cos(x+y+1)*0;
    // }
}