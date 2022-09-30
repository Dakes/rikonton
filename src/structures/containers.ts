
export function constructContainers(r: Room): boolean
{
    for (let i in r.memory.ContainerPos)
    {
        const contPos = r.memory.ContainerPos[i];
        if (r.createConstructionSite(contPos.pos.x, contPos.pos.y, STRUCTURE_CONTAINER) != OK)
            return false;
    }
    return true;
}
