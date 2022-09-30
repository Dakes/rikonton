/**
 * Mines energy from a random source, or picks up from ground.
 * Brings it to Spawn/storage and upgrades the RC if they are full.
 * Only used at the very beginning of the game.
 */

import { MinerCreep, task } from "../augmentations/creep"


/**
 * ->* ->Scavenging -> Mining -> storing* -> upgrading*
 *
 * @param creep
 * @param r Room
 * @returns
 */
export function run(creep: Creep, r: Room)
{
    let c: MinerCreep = new MinerCreep(creep.id);//creep as MinerCreep;
    c.setRandomSource();
    c.checkResourceStack();

    if (c.scavenge())
        return;

    if (!c.memory.task && c.freeCapacity() > 0)
        c.task(task.MINING);

    if (c.mine())
        return;

    if (c.freeCapacity() == 0 && r.getStore()?.store.getFreeCapacity(RESOURCE_ENERGY))
        c.task(task.STORING);
    else
        c.task(task.UPGRADING);

    if (c.putAway())
        return;

    if (c.payload() > 0)
        c.task(task.UPGRADING);
    else
        c.task(task.SCAVENGING);


    if (c.upgradeCont())
        return;

    c.task(task.SCAVENGING);
    // c.say("Now going scavenging");
}

