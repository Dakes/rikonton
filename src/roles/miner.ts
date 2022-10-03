import { MinerCreep, Role } from "../augmentations/creep"


export function run(creep: Creep, r: Room)
{
    let c: MinerCreep = new MinerCreep(creep.id);//creep as MinerCreep;

    c.setRoleSource(Role.MINER);
    if (c.moveToMiningPos())
        return;

    c.mine();
}


