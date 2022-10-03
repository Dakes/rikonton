/**
 * File for all carriers.
 * Carrier, ExtensionCarrier and Miner Carrier
 */

import { updateCreepNumber } from "spawner/population";
import { isReturnStatement } from "typescript";
import { EnergyCreep, MinerCreep, Role, task } from "../augmentations/creep"

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

    if (c.freeCapacity() < 50 && r.getStore()?.store.getUsedCapacity(RESOURCE_ENERGY) == 0)
        c.task(task.SCAVENGING);
    else if (c.freeCapacity() < 50)
        c.task(task.RETRIEVING);
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
    c.setRoleSource(Role.MCARRIER, Math.round(updateCreepNumber(r, c.memory.role)/2)); // <-- TODO: Scale with number of creeps
    if (!c.memory.sourceId)
        return;

    c.setContainerPos(c.memory.sourceId);

    //if (c.memory.task == task.NONE)
    //    c.task(task.SCAVENGING)

    if (c.scavenge())
        return;

    if (c.memory.task == task.NONE && c.isEmty())
        c.task(task.RETRIEVING);
    else if (c.memory.task == task.NONE && c.usedCapacity())
        c.task(task.STORING);


    if (c.memory.task == task.RETRIEVING && c.memory.pos)
    {
        const contFind: Structure | undefined = r.lookAt(c.memory.pos.x, c.memory.pos.y).filter(
            (c) => c.type === LOOK_STRUCTURES)[0]?.structure;

        if (contFind)
        {
            const cont: StructureContainer = contFind as StructureContainer;
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
        c.task(task.NONE);

}
