import {BODIES} from "./body"
import {role, task} from "../augmentations/creep"
// import {Room} from "../augmentations/room"
// import * as creepAug from "../augmentations/creep"
import * as myCreepTypes from "../augmentations/creep"
import { SlowBuffer } from "buffer";

// stats representing one creep type
interface CreepPopulation
{
    role: string;
    live: number;  // creeps of this type that are alive
}

interface Population
{
    population: CreepPopulation[];
    total: number;
}

export function spawnCreeps(room: Room): void
{
    const spawns: StructureSpawn[] = _.filter(room.myActiveStructures(), (s) =>
        s.structureType == STRUCTURE_SPAWN) as StructureSpawn[];
    let pop = getPopulation(room.myCreeps(null));
    pop = sortPopulationPriority(pop);
    removeCompleteCreepsFromPop(pop);
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
        cp?.role != role.PMINER &&
        cp?.role != role.MINER &&
        cp?.role != role.ECARRIER &&
        cp?.role != role.MCARRIER)
        return false;

    let memory: myCreepTypes.EnergyCreepMemory |
                myCreepTypes.MinerCreepMemory |
                myCreepTypes.WorkerCreepMemory |
                null = null;

    switch (cp?.role)
    {
        case role.PMINER:
            memory = <myCreepTypes.EnergyCreepMemory> {
                        role: cp.role,
                        room: spawn.room.name,
                        task: task.SCAVENGING,
                        resourceStack: null,
                    }
            break;
        case role.MINER:
            memory = <myCreepTypes.MinerCreepMemory> {
                        role: cp.role,
                        room: spawn.room.name,
                        task: task.MINING,
                        resourceStack: null,
                        sourceId: null,
                        pos: null,
                    }
            break;
        case role.UPGRADER:
            memory = <myCreepTypes.WorkerCreepMemory> {
                        role: cp.role,
                        room: spawn.room.name,
                        task: task.SCAVENGING,
                        resourceStack: null,
                    }
            break;
        case role.ECARRIER:
            memory = <myCreepTypes.EnergyCreepMemory> {
                        role: cp.role,
                        room: spawn.room.name,
                        task: task.SCAVENGING,
                        resourceStack: null,
                    }
            break;
        case role.MCARRIER:
            memory = <myCreepTypes.MinerCreepMemory> {
                        role: cp.role,
                        room: spawn.room.name,
                        task: task.RETRIEVING,
                        resourceStack: null,
                        sourceId: null,
                        pos: null,
                    }
            break;


        default:
            console.log("Got unknown role in spawner.spawnCreep():", cp?.role);
            break;
    }

    if (memory)
    {
        let body: BodyPartConstant[] = BODIES[cp.role].getBody(spawn.room.spawnEnergy());
        let name: string = genCreepName(cp.role, spawn);

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
            console.log(`${spawn.room.name}: Attemting to spawn ${cp.role}`);
    }

    return false;
}

function genCreepName(r:string, spawn: StructureSpawn)
{
    let sep = "-";
    return r + sep + spawn.name + sep + Game.time
}


function removeCompleteCreepsFromPop(pop: Population): Population
{
    _.remove(pop.population, function(cp: CreepPopulation) {
        if (BODIES[cp.role] == undefined)
            return true;
        return cp.live >= BODIES[cp.role].num;
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
    pop.population = _.sortBy(pop.population, ['live', function(cp: CreepPopulation) {
        return BODIES[cp.role].priority;
    }]);
    return pop;
}

function getPopulation(creeps: Creep[]): Population
{
    const roleValues = Object.values(myCreepTypes.role);
    let cpa: CreepPopulation[] = [];
    let total = 0;
    roleValues.forEach((rol, idx) => {
        let tCreeps: Creep[] = _.filter(creeps, (c) =>
        c.memory.role == rol);
        cpa[idx] = {role: rol, live: tCreeps.length};
        total += tCreeps.length;
    });

    const pop: Population = { total: total, population: cpa };

    return pop;
}
