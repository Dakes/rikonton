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

    // if (c.memory.task == task.NONE)
    //    c.task(task.FILLING);

    if (c.scavenge())
        return;

    if (!c.memory.task && c.usedCapacity() < 50)
    {
        let roomStore = r.getStore(false);
        if (roomStore && roomStore.store.getUsedCapacity(RESOURCE_ENERGY) >= 250)
            c.task(task.RETRIEVING);
        else
            c.task(task.SCAVENGING);
    }

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
    c.setRoleSource(role.MCARRIER, 1); // <-- TODO: Scale with number of creeps
    if (!c.memory.sourceId)
        return;

    c.setContainerPos(c.memory.sourceId);

    //if (c.memory.task == task.NONE)
    //    c.task(task.SCAVENGING)

    if (c.scavenge())
        return;

    if (c.memory.task == task.NONE && c.hasSpace())
        c.task(task.RETRIEVING);


    if (c.memory.task == task.RETRIEVING)
    {
        // @ts-ignore
        const cont: StructureContainer | undefined = r.lookAt(c.memory.pos).filter(
            (c) => c.type === LOOK_STRUCTURES)[0];

        if (cont)
        {
            if (c.withdraw(cont, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE)
            {
                c.moveTo(cont);
                return;
            }
        }
        else
        {
            c.task(task.SCAVENGING);
            return;
        }
    }


    if (c.usedCapacity() > 0)
    {
        if (r.getStore()?.store.getFreeCapacity(RESOURCE_ENERGY) == 0)
            c.task(task.FILLING);
        else
            c.task(task.STORING)
    }

    if (c.putAway())
        return;

    if (c.fillExtension())
        return;


    if (c.isEmty())
        c.task(task.SCAVENGING);

}
