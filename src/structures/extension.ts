import { destroyRoad } from "./helpers";

const level_extensions: {[key: number]: number} = {
    1: 0,
    2: 5,
    3: 10,
    4: 20,
    5: 30,
    6: 40,
    7: 50,
    8: 60,
};


export function constructExtensions(room: Room)
{
    let rcLevel = room.controller?.level;
    if (!rcLevel)
        return;
    const extensions = room.myExtensions();

    // build extensions in clusters of 5 surrounded by streets in triangle shape to the left of Spawn
    let begin_coord = room.mySpawns()[0].pos;
    begin_coord.x = begin_coord.x - 2;

    // build extensions, if count is too low for rc level
    if (level_extensions[rcLevel] > extensions.length)
    {
        let cluster_count = level_extensions[rcLevel]/5;
        let level_count = Math.ceil((cluster_count-1) /2 ) ;
        buildDiaShape(level_count, rcLevel, begin_coord);
    }
}

/**
 * builds (expands) the bigger diamond shape for current level, each level has 2 more clusters
 * @param shellLevel The nth "shell" of the shape
 * @param startPos The starting position of the whole structure.
 */
function buildDiaShape(shellLevel: number, rcLevel: number, startPos: RoomPosition): number
{
    let cluster_built: number = 0;
    let cur_max_cluster = level_extensions[rcLevel] / 5
    if (shellLevel > 0)
    {
        cluster_built = buildDiaShape(shellLevel - 1, rcLevel, startPos);
    }
    else
    {
        cluster_built = 0;
    }

    // cluster count is level *2 + 1 if level starts at 0.
    let cluster_count = shellLevel * 2 + 1;

    let cur_pos = new RoomPosition(startPos.x, startPos.y, startPos.roomName);
    cur_pos.x = cur_pos.x - shellLevel * 2;
    cur_pos.y = cur_pos.y - shellLevel * 2;

    for (let i = 0; i < cluster_count; i++)
    {
        if (cluster_built >= cur_max_cluster)
        {
            break;
        }
        if (i === 0) { }
        else if (i < Math.round(cluster_count / 2))
        {
            cur_pos.x = cur_pos.x - 2;
            cur_pos.y = cur_pos.y + 2;
        }
        else
        {
            cur_pos.x = cur_pos.x + 2;
            cur_pos.y = cur_pos.y + 2;
        }

        // pass a copy
        let cur_pos_cpy = new RoomPosition(cur_pos.x, cur_pos.y, cur_pos.roomName);
        buildRoadDia(cur_pos_cpy);
        build_extensions(cur_pos_cpy);
        cluster_built += 1;
    }

    return cluster_built;

}

/**
 * Builds streets in a diamond shape of 3x3 to the left from start_pos
 * @param startPos Position of the first street structure of one cluster
 */
function buildRoadDia(startPos: RoomPosition)
{
    let street_positions = [];
    // street_positions.push(start_pos);
    // street_positions.push();
    for (let i = 0; i < 5; i++)
    {
        let new_street_high = new RoomPosition(startPos.x, startPos.y, startPos.roomName);
        let new_street_low = new RoomPosition(startPos.x, startPos.y, startPos.roomName);

        new_street_high.x = new_street_high.x - i;
        new_street_low.x = new_street_low.x - i;
        if (i === 1 || i === 3)
        {
            new_street_high.y = new_street_high.y + 1;
            new_street_low.y = new_street_low.y - 1;
        }
        else if (i === 2)
        {
            new_street_high.y = new_street_high.y + 2;
            new_street_low.y = new_street_low.y - 2;
        }

        street_positions.push(new_street_high);
        street_positions.push(new_street_low);
    }
    for (let i in street_positions)
    {
        let street_pos = street_positions[i];

        let found = street_pos.lookFor(LOOK_TERRAIN);
        if (found.length && found[0] !== "wall")
            street_pos.createConstructionSite(STRUCTURE_ROAD);

    }
}

/**
 * fills a street square with extensions
 * @param start_pos Position of the first street structure of one cluster
 */
function build_extensions(start_pos: RoomPosition)
{
    start_pos.x = start_pos.x - 1;
    destroyRoad(start_pos);
    start_pos.createConstructionSite(STRUCTURE_EXTENSION);
    start_pos.x = start_pos.x - 1;
    destroyRoad(start_pos);
    start_pos.createConstructionSite(STRUCTURE_EXTENSION);
    start_pos.y = start_pos.y - 1;
    destroyRoad(start_pos);
    start_pos.createConstructionSite(STRUCTURE_EXTENSION);
    start_pos.y = start_pos.y + 2;
    destroyRoad(start_pos);
    start_pos.createConstructionSite(STRUCTURE_EXTENSION);
    start_pos.y = start_pos.y - 1;
    start_pos.x = start_pos.x - 1;
    destroyRoad(start_pos);
    start_pos.createConstructionSite(STRUCTURE_EXTENSION);
}


