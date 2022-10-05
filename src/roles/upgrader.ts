import { WorkerCreep, task } from "../augmentations/creep"


/**
 * ->* ->Scavenging -> Collecting -> upgrading*
 * @param creep
 * @param r
 */
export function run(creep: Creep, r: Room)
{
    let c: WorkerCreep = new WorkerCreep(creep.id);
    c.checkResourceStack();

    if (c.scavenge())
        return;

    if (!c.memory.task && c.usedCapacity() == 0)
        c.task(task.RETRIEVING);

    if (c.retrieve())
        return;

    c.task(task.UPGRADING);
    if (c.upgradeCont())
        return;

    c.task(task.SCAVENGING);

}
