import { MinerCreep, role } from "../augmentations/creep"


export function run(creep: Creep, r: Room)
{
    let c: MinerCreep = new MinerCreep(creep.id);//creep as MinerCreep;

    c.setRoleSource(role.MINER);
    if (c.moveToMiningPos())
        return;

    c.mine();
}


