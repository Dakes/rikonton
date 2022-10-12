
// lut to decide order, in which construction sites will be built
const BuildPriority =
{
    [STRUCTURE_EXTENSION]: 0,
    [STRUCTURE_CONTAINER]: 1,
    [STRUCTURE_TOWER]: 2,
    [STRUCTURE_STORAGE]: 3,
}

export function sortConstructionSites(cSites: ConstructionSite[])
{
    return sortAnyStructures(cSites) as unknown[] as ConstructionSite[];
}

export function sortStructures(struc: Structure[])
{
    return sortAnyStructures(struc) as unknown[] as Structure[];
}

function sortAnyStructures(sites: ConstructionSite[]|Structure[])
{
    //@ts-ignore
    return _.sortByOrder(sites, [
        function(c: ConstructionSite) {
            if (c.structureType in BuildPriority)
            {
                //@ts-ignore
                return BuildPriority[c.structureType];
            }
            return 100;
        }
    ]);
}

export function destroyRoad(pos: RoomPosition)
{
    let room = Game.rooms[pos.roomName];
    room.destroyRoadAt(pos.x, pos.y);
}
