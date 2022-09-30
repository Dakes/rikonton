/**
 * File for all carriers.
 * Carrier, ExtensionCarrier and Miner Carrier
 */

import { EnergyCreep, task } from "../augmentations/creep"

/**
 * *-> scavenging -> retrieve -> fill Ext -> *
 * @param creep Creep
 * @param r Room
 * @returns
 */
export function runExtensionCarrier(creep: Creep, r: Room)
{
    let c: EnergyCreep = new EnergyCreep(creep.id);

    c.checkResourceStack();

    if (c.scavenge())
        return;

    if (!c.memory.task && c.freeCapacity() > 0)
        c.task(task.RETRIEVING);

    if (c.retrieve())
        return;

    if (c.freeCapacity() == 0)
        c.task(task.FILLING);

    if (c.fillExtension())
        return;

    if (c.freeCapacity() < 50)
        c.task(task.SCAVENGING);



}
