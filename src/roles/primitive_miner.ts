/**
 * Mines energy from a random source, or picks up from ground.
 * Brings it to Spawn/storage and upgrades the RC if they are full.
 * Only used at the very beginning of the game.
 */

import { MinerCreep } from "../augmentations/creep"
// import {CreepMemory} from "../augmentations/creep"

/*
interface PminerMemory extends EnergyCreepMemory
{
    sourceId?: Id<Source>;
}

interface Pminer extends EnergyCreep
{
    memory: PminerMemory;
}
*/

export default function run(creep: Creep, r: Room)
{
    let c: MinerCreep = new MinerCreep(creep.id)//creep as MinerCreep;
    c.setRandomSource();
    c.checkResourceStack();

    if (!c.memory.storing && c.store.getFreeCapacity(RESOURCE_ENERGY) == 0)
        c.memory.storing = true;

    if (c.memory.storing)
        if (c.putAway())
            return;

    if (!c.memory.scavenging && !c.memory.mining)
        c.memory.scavenging = true;

    if (c.scavenge())
        return;

    // TODO: upgrade
    c.mine();
}

