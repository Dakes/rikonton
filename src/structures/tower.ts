// "Borrowed" from: https://github.com/Adirelle/typescreeps

export function constructTowers(room: Room)
{
    console.log(`Constructing Towers in Room: ${room.name}`);
    let tp: RoomPosition[] = room.getTowerPositions();
    for (let i in tp)
        room.createConstructionSite(tp[i].x, tp[i].y, STRUCTURE_TOWER);
}

export function manageTowers(room: Room)
{
    _.each(
        _.filter(
            room.myActiveStructures(),
            (t: Structure) => t instanceof StructureTower && t.store.energy > 0
        ),
        manageTower
    );
}

function manageTower(tower: StructureTower)
{
    if (attackHostiles(tower))
        return;
    if (healFriends(tower))
        return;
    if (repairStructs(tower))
        return;
}

function attackHostiles(tower: StructureTower)
{
    const hostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
    if (!hostile)
        return false;
    return tower.attack(hostile) === OK;
}

function healFriends(tower: StructureTower)
{
    // TODO: heal only whitelisted creeps
    // return false;

    const friend = tower.pos.findClosestByRange<Creep>(tower.room.myCreeps(), {
        filter: (c: Creep) => c.hits < c.hitsMax });
    if (!friend)
        return false;
    return tower.heal(friend) === OK;
}

function repairStructs(tower: StructureTower): boolean
{
    const struct = tower.room.find(FIND_STRUCTURES, {
        filter: (s: Structure) => s.hits < s.hitsMax }
    );
    if (!struct || struct.length == 0)
        return false;
    return tower.repair(struct[0]) === OK;
}

function isMine(struct: Structure): boolean
{
    return (struct as OwnedStructure).my;
}
