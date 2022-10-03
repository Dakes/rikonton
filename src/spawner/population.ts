import { Role } from "augmentations/creep";
import { Body, bodyTypes } from "./body";

// stats representing one creep type
export interface CreepPopulation
{
    role: Role;
    live: number;  // creeps of this type that are alive
}

export interface Population
{
    population: CreepPopulation[];
    total: number;
}


// Initial values written to memory. Number of creeps, that can be alive in one room
export const populationPermit: {[key in Role]: number} = {
    [Role.PMINER]      : 3,
    [Role.MINER]       : 2,
    [Role.MCARRIER]    : 2,
    [Role.CARRIER]     : 1,
    [Role.ECARRIER]    : 1,
    [Role.CONSTRUCTOR] : 1,
    [Role.UPGRADER]    : 1,
};


export function updateCreepNumber(room: Room, role: Role): number
{
    let num:number = populationPermit[role];
    const sources = room.find(FIND_SOURCES);

    switch (role)
    {
        case Role.PMINER:
            num += sources.length;
            if (room.myCreeps().length >= 5+num)
                if (room.controller?.level)
                    num -= room.controller?.level
            num += Math.floor(room.droppedResources()/2000);
            break;
        case Role.MINER:
        case Role.MCARRIER:
            num = sources.length;
            if (role == Role.MINER)
                break;
            num += Math.floor(room.droppedResources()/2000);
            break;
        case Role.ECARRIER:
            let ext = room.myExtensions();
            num += Math.floor(ext.length/20)
            break;
        case Role.CARRIER:
            break
        case Role.CONSTRUCTOR:
            break;
        case Role.UPGRADER:
            num += Math.floor(room.droppedResources()/3000);
            break;

    }
    if (num < 0)
        num = 0;
    // console.log("updateCreepNumber: ", role, num);
    room.memory.populationNumber[role] = num;
    return num;
}

// initial BODIES to write to room memory
export const BODIES: { readonly [type: string]: Body } = {
    [Role.PMINER]:   new Body(Role.PMINER,   0, bodyTypes.PMINER),
    [Role.MINER]:    new Body(Role.MINER,    1, bodyTypes.MINER),
    [Role.UPGRADER]: new Body(Role.UPGRADER, 2, bodyTypes.WORKER),
    [Role.ECARRIER]: new Body(Role.ECARRIER, 3, bodyTypes.CARRIER),  // scale num to num of e's
    [Role.MCARRIER]: new Body(Role.MCARRIER, 3, bodyTypes.CARRIER),
};
