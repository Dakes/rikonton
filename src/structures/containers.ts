
export function constructContainers(r: Room): boolean
{
    for (let i in r.memory.ContainerPos)
    {
        const contPos = r.memory.ContainerPos[i];
        r.createConstructionSite(contPos.pos.x, contPos.pos.y, STRUCTURE_CONTAINER);
    }
    console.log(`Construct containers in Room: ${r.name}`);
    return true;
}
