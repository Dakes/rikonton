import { Position } from "source-map";

export {}

/**
 *
 * @param pos center Position
 * @param radius radius for the square to generage
 * @param fill If true: fill solid. If false: just layer radius
 * @returns
 */
export function positionSquare(pos:RoomPosition, radius:number=1, fill:boolean=false): RoomPosition[]
{
    let result_pos: RoomPosition[] = [];

    for (let x=-radius; x<radius; x++)
    {
        for (let y=-radius; y<radius; y++)
        {
            if (!fill && (Math.abs(x) != radius || Math.abs(y) != radius ))
                continue;
            result_pos.push(new RoomPosition(pos.x + x, pos.y + y, pos.roomName));
        }
    }
    return result_pos;
};

/**
 * Filter an RoomPosition array by structures existent on it
 * TODO: implement, if needed
 * @param positions
 * @param struct
 */
export function filterPosStructure(positions: RoomPosition[], struct: StructureConstant): RoomPosition[]
{
    return _.filter(positions, (p:RoomPosition) =>
        p.lookFor);
}
