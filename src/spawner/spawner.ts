interface Population
{
    [type: string]: number;
    TOTAL: number;
}

export function spawnCreeps(room: Room): void
{
    /*
    const spawns = _.filter(room.myActiveStructures, (s) => s.isSpawn()) as Spawn[];
    const pop = countCreepsByType(room.myCreeps);
    const missing = listMissingTypes(spawns.length, pop);
    displayPop(room, pop, missing.length);
    if (missing.length > 0)
    {
        const maxSize = Math.max(1, Math.ceil(pop.TOTAL / missing.length));
        spawnMissingCreeps(room, missing, maxSize, spawns);
    }
    */
}

function countCreepsByType(creeps: Creep[]): Population
{
    const pop: Population = { TOTAL: 0 };
    /*
    for (const type in BODY_TYPES)
        pop[type] = 0;
    for (const creep of creeps)
    {
        const type = creep.memory.type;
        if (!type || !(type in pop))
        {
            creep.suicide();
            continue;
        }
        pop[type]++;
        pop.TOTAL++;
    }
    */
    return pop;

}
