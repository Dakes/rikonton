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
    [Role.PMINER]      : 1,
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
            if (sources.length > 1)
                num += sources.length;
            if (room.myCreeps().length >= 3+num)
                if (room.controller?.level)
                    num -= room.controller?.level
            if (room.droppedResources() > 500)
                num += 1;
            num += Math.floor(room.droppedResources()/2000);
            break;
        case Role.MINER:
            num = sources.length;
            break;
        case Role.MCARRIER:
            num = sources.length;
            num += Math.floor(room.droppedResources()/2000);
            break;
        case Role.ECARRIER:
            let ext = room.myExtensions();
            num += Math.floor(ext.length/20)
            if (ext.length == 0)
                num = 0;
            break;
        case Role.CARRIER:
            if (room.controller?.level && room.controller.level < 3)
                num = 0;
            break
        case Role.CONSTRUCTOR:
            let cs = room.myConstructionSites();
            if (cs.length > 1)
            {
                num += Math.floor(room.droppedResources()/2000);
                if (room.ruinResources() > 100_000)
                    num += 1;
                if (room.ruinResources() > 300_000)
                    num += 1;
                if (room.ruinResources() > 600_000)
                    num += 2;

            }
            break;
        case Role.UPGRADER:
            num += Math.floor(room.droppedResources()/1000);
            num += Math.floor(room.ruinResources()/150_000);
            break;

    }
    if (num < 0)
        num = 0;
    // console.log("updateCreepNumber: ", role, num);
    room.memory.populationNumber[role] = num;
    return num;
}

export function updateAllCreepNumbers(room: Room)
{
    const roleValues = Object.values(Role);
    roleValues.forEach((role, idx) => {
        updateCreepNumber(room, role);
    });
}

// initial BODIES to write to room memory
export const BODIES: { readonly [type: string]: Body } = {
    [Role.PMINER]:      new Body(Role.PMINER,      0, bodyTypes.PMINER),
    [Role.MINER]:       new Body(Role.MINER,       1, bodyTypes.MINER),
    [Role.ECARRIER]:    new Body(Role.ECARRIER,    2, bodyTypes.CARRIER),  // scale num to num of e's
    [Role.MCARRIER]:    new Body(Role.MCARRIER,    2, bodyTypes.CARRIER),
    [Role.UPGRADER]:    new Body(Role.UPGRADER,    3, bodyTypes.WORKER),
    [Role.CARRIER]:     new Body(Role.CARRIER,     3, bodyTypes.CARRIER),
    [Role.CONSTRUCTOR]: new Body(Role.CONSTRUCTOR, 4, bodyTypes.WORKER),
};
