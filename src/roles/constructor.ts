import { EnergyCreep, Role, task, WorkerCreep } from "../augmentations/creep"

/**
 * * -> scavenge -> pickup -> build* -> repair*
 * @param creep Creep
 * @param r Room
 * @returns
 */
export function run(creep: Creep, r: Room)
{
   let c: WorkerCreep = new WorkerCreep(creep.id);

    if (c.scavenge())
        return;

    if (!c.memory.task && c.isEmty())
        c.task(task.RETRIEVING);

    if (c.retrieve())
        return;

    if (!c.memory.task)
        c.task(task.CONSTRUCTING);
    if (c.construct())
        return;

    if (!c.memory.task)
        c.task(task.REPAIRING);
    if (c.repairStructures())
        return;

    if (!c.memory.task && c.hasSpace())
        c.task(task.SCAVENGING);


}
