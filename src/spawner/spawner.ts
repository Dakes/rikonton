import {Role, task}      from "../augmentations/creep"
import * as myCreepTypes from "../augmentations/creep"
// import {Room} from "../augmentations/room"
// import * as creepAug from "../augmentations/creep"
import { SlowBuffer } from "buffer";
import { BODIES, CreepPopulation, Population, updateCreepNumber } from "./population";

export function spawnCreeps(room: Room): void
{
    const spawns: StructureSpawn[] = _.filter(room.myActiveStructures(), (s) =>
        s.structureType == STRUCTURE_SPAWN) as StructureSpawn[];


    let pop: Population = getPopulation(room.myCreeps(null));
    pop = sortPopulationPriority(pop);
    removeCompleteCreepsFromPop(room, pop);

    // complete, no missing creeps
    if (pop.population.length == 0)
        return;

    let idx = 0;
    while (idx < spawns.length && !spawns[idx].spawning)
    {
        if (spawns[idx].spawning)
            continue
        spawnCreep(spawns[idx], pop.population[0]);
        idx++;
    }
}

/**
 * Spawn the miccing creep of this population.
 * @param spawn Spawn to spawn
 * @param cp CreepPopulation to fill
 * @returns true if spawning, false on failure (not enough energy etc.)
 */
function spawnCreep(spawn: StructureSpawn, cp: CreepPopulation): boolean
{
    // Pminer and Ecarrier are always allowed to spawn.
    // Everyone else, wait for Extensions to be full
    if (spawn.spawning)
        return true;
    if (!spawn.room.extensionsFull() &&
        cp?.role != Role.PMINER &&
        cp?.role != Role.MINER &&
        cp?.role != Role.ECARRIER &&
        cp?.role != Role.MCARRIER)
        return false;
    if (spawn.room.spawnEnergy() < 250)
        return false;

    // check if creep count is up to date and update for next try.
    if (spawn.room.memory.populationNumber[cp.role] != updateCreepNumber(spawn.room, cp.role))
        return false;

    let memory: myCreepTypes.EnergyCreepMemory |
                myCreepTypes.MinerCreepMemory |
                myCreepTypes.WorkerCreepMemory |
                null = null;

    switch (cp?.role)
    {
        case Role.PMINER:
            memory = <myCreepTypes.EnergyCreepMemory> {
                        role: cp.role,
                        room: spawn.room.name,
                        task: task.SCAVENGING,
                        resourceStack: null,
                    }
            break;
        case Role.MINER:
            memory = <myCreepTypes.MinerCreepMemory> {
                        role: cp.role,
                        room: spawn.room.name,
                        task: task.MINING,
                        resourceStack: null,
                        sourceId: null,
                        pos: null,
                    }
            break;
        case Role.UPGRADER:
            memory = <myCreepTypes.WorkerCreepMemory> {
                        role: cp.role,
                        room: spawn.room.name,
                        task: task.SCAVENGING,
                        resourceStack: null,
                    }
            break;
        case Role.ECARRIER:
            memory = <myCreepTypes.EnergyCreepMemory> {
                        role: cp.role,
                        room: spawn.room.name,
                        task: task.SCAVENGING,
                        resourceStack: null,
                    }
            break;
        case Role.MCARRIER:
            memory = <myCreepTypes.MinerCreepMemory> {
                        role: cp.role,
                        room: spawn.room.name,
                        task: task.RETRIEVING,
                        resourceStack: null,
                        sourceId: null,
                        pos: null,
                    }
            break;
        case Role.CARRIER:
            memory = <myCreepTypes.EnergyCreepMemory> {
                        role: cp.role,
                        room: spawn.room.name,
                        task: task.RETRIEVING,
                        resourceStack: null,
                    }
            break;
        case Role.CONSTRUCTOR:
            memory = <myCreepTypes.WorkerCreepMemory> {
                        role: cp.role,
                        room: spawn.room.name,
                        task: task.RETRIEVING,
                        resourceStack: null,
                        id: null,
                    }
            break;


        default:
            console.log("Got unknown role in spawner.spawnCreep():", cp?.role);
            return false;
    }

    if (memory)
    {
        let body: BodyPartConstant[] = BODIES[cp.role].getBody(spawn.room.spawnEnergy());
        let name: string = genCreepName(cp.role, spawn);
        if (body.length == 0)
            return false;

        let success = spawn.spawnCreep(
            body,
            name,
            { memory: memory, }
        );
        if (success == OK)
        {
            console.log(`${spawn.room.name}: Spawning ${cp.role}`);
            return true;
        }
        else
        {
            console.log(`${spawn.room.name}: Attemting to spawn ${cp.role}. Error Code: ${success}`);
            console.log("body: ", body);
            console.log("memory: ", memory);
            console.log("name: ", name);
            console.log("body[0]: ", body[0]);
            return false;
        }
    }

    return false;
}

function genCreepName(r:string, spawn: StructureSpawn)
{
    let sep = "-";
    return r + sep + spawn.name + sep + Game.time
}


function removeCompleteCreepsFromPop(room: Room, pop: Population): Population
{
    _.remove(pop.population, function(cp: CreepPopulation) {
        if (BODIES[cp.role] == undefined)
            return true;
        return cp.live >= room.memory.populationNumber[cp.role];
    });
    // TODO: update total (currently unused)
    return pop;
}

/**
 * Sort population by alive creeps & priority set in BODIES in body.ts
 * @param pop Sorted population
 */
function sortPopulationPriority(pop: Population): Population
{
    pop.population = _.sortByOrder(pop.population, ['live', function(cp: CreepPopulation) {
        return BODIES[cp.role].priority;
    }]);
    return pop;
}

function getPopulation(creeps: Creep[]): Population
{
    const roleValues = Object.values(Role);
    let cpa: CreepPopulation[] = [];
    let total = 0;
    roleValues.forEach((role, idx) => {
        let tCreeps: Creep[] = _.filter(creeps, (c) =>
        c.memory.role == role);
        cpa[idx] = {role: role, live: tCreeps.length};
        total += tCreeps.length;
    });

    const pop: Population = { total: total, population: cpa };

    return pop;
}
