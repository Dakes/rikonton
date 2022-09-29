import {BODIES} from "./body"
import {role, task} from "../augmentations/creep"
// import {Room} from "../augmentations/room"
// import * as creepAug from "../augmentations/creep"
import * as myCreepTypes from "../augmentations/creep"

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
    let pop = getPopulation(room.myCreeps());
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

function spawnCreep(spawn: StructureSpawn, cp: CreepPopulation): boolean
{
    if (!spawn.room.extensionsFull())
        return false;

    switch (cp?.role)
    {
        case role.PMINER:
            spawn.spawnCreep(
                BODIES[cp.role].getBody(spawn.room.spawnEnergy()),
                genCreepName(cp.role, spawn),
                {
                    memory: <myCreepTypes.EnergyCreepMemory>
                    {
                        role: cp.role,
                        room: spawn.room.name,
                        task: task.SCAVENGING,
                        resourceStack: null,
                    }
                }
            );
            break;
        case role.MINER:
            spawn.spawnCreep(
                BODIES[cp.role].getBody(spawn.room.spawnEnergy()),
                genCreepName(cp.role, spawn),
                {
                    memory: <myCreepTypes.MinerCreepMemory>
                    {
                        role: cp.role,
                        room: spawn.room.name,
                        task: task.MINING,
                        resourceStack: null,
                        sourceId: null,
                    }
                }
            );
        case role.UPGRADER:
            spawn.spawnCreep(
                BODIES[cp.role].getBody(spawn.room.spawnEnergy()),
                genCreepName(cp.role, spawn),
                {
                    memory: <myCreepTypes.WorkerCreepMemory>
                    {
                        role: cp.role,
                        room: spawn.room.name,
                        task: task.SCAVENGING,
                        resourceStack: null,
                    }
                }
            );

        default:
            console.log("Got unknown role in spawner.spawnCreep():", cp?.role);
            break;
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
