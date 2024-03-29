import {Role as Role} from "../augmentations/creep"
import * as creepy from "../augmentations/creep"


// Basic Body Types. Multiple roles can have the same body type.
enum BodyTypeName
{
    MINER=  "MINER"    ,
    PMINER= "PMINER"   ,
    CARRIER="CARRIER"  ,
    WORKER= "WORKER"   ,
    FIGHTER="FIGHTER"  ,
    HEALER= "HEALER"   ,
    CLAIMER="CLAIMER"  ,
}

export const bodyTypes: {[key in BodyTypeName]: [BodyPartConstant[], BodyPartConstant[]]} = {
    [BodyTypeName.MINER]   : [[MOVE, WORK, WORK], [WORK]],
    [BodyTypeName.PMINER]  : [[MOVE, WORK, CARRY, CARRY, CARRY], []],
    [BodyTypeName.CARRIER] : [[MOVE, CARRY, CARRY, CARRY, CARRY, CARRY], [MOVE, CARRY]],
    [BodyTypeName.WORKER]  : [[MOVE, CARRY, CARRY, CARRY, WORK], [MOVE, CARRY, WORK]],
    [BodyTypeName.FIGHTER] : [[TOUGH, TOUGH, TOUGH, TOUGH, ATTACK, ATTACK, MOVE, MOVE], [TOUGH, TOUGH, ATTACK, MOVE]],
    [BodyTypeName.HEALER]  : [[TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, MOVE, HEAL], [TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, MOVE, HEAL]],
    [BodyTypeName.CLAIMER] : [[], []],
};

const bodyPartEnergy: {[key in BodyPartConstant]: number} = {
    [MOVE]:          50,
    [WORK]:          100,
    [CARRY]:         50,
    [ATTACK]:        80,
    [RANGED_ATTACK]: 150,
    [HEAL]:          250,
    [CLAIM]:         600,
    [TOUGH]:         10,
}

export class Body
{

    constructor(
        public readonly role: string,
        // priority/order in which to spawn: lower=higher
        public readonly priority: number,
        // Base parts, that creep has to have
        public readonly body: [BodyPartConstant[], BodyPartConstant[]],
        // parts, that will repeatedly be added, if more energy is available
        // public readonly bodyAdd: BodyPartConstant[],
    )
    {
    }


    public toString()
    {
        return `${this.role}(${this.body})`;
    }

    public getBody(energy: number): BodyPartConstant[]
    {
        let newBody: BodyPartConstant[] = [];
        newBody = this.body[0];
        energy -= this.getEnergyDemand(newBody);
        if (energy < 0)
            return [];

        const appendEnergy = this.getEnergyDemand(this.body[1]);
        while (energy >= appendEnergy && energy > 0 && appendEnergy > 0)
        {
            newBody.push(...this.body[1]);
            energy -= appendEnergy;
        }

        console.log("Body: ", newBody);
        console.log("Energy Demand: ", this.getEnergyDemand(newBody));
        return newBody;
    }

    public getSpawnableBody(baseBody: BodyPartConstant, extBody: BodyPartConstant, energy: number)
    {

    }

    getEnergyDemand(body: BodyPartConstant[]): number
    {
        let en: number = 0;
        for (let i in body)
        {
            en += bodyPartEnergy[body[i]];
        }
        return en;
    }

    public getCost(size: number = 1): number
    {
        const body = this.getBody(size);
        return _.sum(body, (t) => BODYPART_COST[t]);
    }
}



