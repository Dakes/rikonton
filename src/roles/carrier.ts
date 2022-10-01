/**
 * File for all carriers.
 * Carrier, ExtensionCarrier and Miner Carrier
 */

import { isReturnStatement } from "typescript";
import { EnergyCreep, MinerCreep, role, task } from "../augmentations/creep"

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

/**
 * Check container if energy >= carryCap. -> pickup from cont.
 * else scavenge
 * -> deliver to store. If Store is full look to deliver to extensions
 * @param creep
 * @param r
 */
export function runMinerCarrier(creep: Creep, r: Room)
{
    let c: MinerCreep = new MinerCreep(creep.id);
    c.setRoleSource(role.MCARRIER, 1);
    if (!c.memory.sourceId)
        return;

    c.setContainerPos(c.memory.sourceId);

    if (c.scavenge())
        return;

    if (c.memory.task == task.NONE)
        c.task(task.RETRIEVING)

    if (c.memory.task == task.RETRIEVING)
    {
        // @ts-ignore
        const cont: StructureContainer | undefined = r.lookAt(c.memory.pos).filter(
            (c) => c.type === LOOK_STRUCTURES)[0];

        if (cont != undefined)
        {
            if (c.withdraw(cont, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE)
                c.moveTo(cont);
        }
        else
        {
            c.task(task.SCAVENGING);
        }
    }


    if (c.freeCapacity() == 0)
        if (r.getStore()?.store.getFreeCapacity(RESOURCE_ENERGY) == 0)
            c.task(task.FILLING);
        else
            c.task(task.STORING)

    if (c.fillExtension())
        return;

    c.putAway();
    if (c.isEmty())
        c.task(task.RETRIEVING);

}
