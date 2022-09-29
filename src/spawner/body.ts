import {role} from "../augmentations/creep"
import * as creepy from "../augmentations/creep"


// Basic Body Types. Multiple roles can have the same body type.
/*
enum BodyTypeName
{
    MINER  ,  //= "Miner",
    PMINER ,  //= "Primitive_Miner",
    CARRIER,  //= "Carrier",
    WORKER ,  //= "Worker",
    FIGHTER,  //= "Fighter",
    HEALER ,  //= "Healer",
    CLAIMER,  //= "Claimer",
}
*/


/*
interface bodyTypes
{
    [key: string]: [BodyPartConstant[], BodyPartConstant[]]
}
*/
//const bodyTypes: {[key in keyof typeof BodyTypeName]: [BodyPartConstant[], BodyPartConstant[]]} = {
const bodyTypes: {[key: string]: [BodyPartConstant[], BodyPartConstant[]]} = {
    MINER: [[MOVE, WORK, WORK], [WORK]],
    PMINER: [[MOVE, WORK, CARRY, CARRY, CARRY], []],
    CARRIER: [[MOVE, CARRY, CARRY, CARRY, CARRY, CARRY], [MOVE, CARRY]],
    WORKER: [[MOVE, CARRY, CARRY, CARRY, WORK], [MOVE, CARRY, WORK]],
    FIGHTER: [[TOUGH, TOUGH, TOUGH, TOUGH, ATTACK, ATTACK, MOVE, MOVE], [TOUGH, TOUGH, ATTACK, MOVE]],
    HEALER: [[TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, MOVE, HEAL], [TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, MOVE, HEAL]],
    CLAIMER: [[], []],

};


export class Body
{

    constructor(
        public readonly role: string,
        // how many creeps are allowed
        public readonly num: number,
        // priority/order in which to spawn: lower=higher
        public readonly priority: number,
        // Base parts, that creep has to have
        public readonly body: [BodyPartConstant[], BodyPartConstant[]],
        // parts, that will repeatedly be added, if more energy is available
        // public readonly bodyAdd: BodyPartConstant[],
    )
    {
        console.log("Body Constructor:");
        console.log("here:", role);

    }

    public toString()
    {
        return `${this.role}(${this.body})`;
    }

    // TODO: redo (availableEnergy)
    public getBody(energy: Number): BodyPartConstant[]
    {
        return this.body[0];
        /*
        const body: BodyPartConstant[] = [];
        for (const part of this.body)
        {
            for (let i = 0; i < size; i++)
            {
                body.push(part);
            }
        }
        body.push(MOVE);
        return body;
        */
    }

    public getCost(size: number = 1): number
    {
        const body = this.getBody(size);
        return _.sum(body, (t) => BODYPART_COST[t]);
    }
}


export const BODIES: { readonly [type: string]: Body } = {
    [role.PMINER]: new Body(role.PMINER, 5, 0, bodyTypes.PMINER),
    // TODO: set dynamically depending on source
    [role.MINER]: new Body(role.MINER, 4, 1, bodyTypes.MINER),
    [role.UPGRADER]: new Body(role.UPGRADER, 1, 1, bodyTypes.WORKER),
};
