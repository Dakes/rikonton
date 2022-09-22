export const enum BodyTypeName
{
    PMINER = 'Primitive_Miner',
    MINER = 'Miner',
    CARRIER = 'Carrier',
    MCARRIER = 'Miner_Carrier',
    ECARRIER = 'Extension_Carrier',
    CONSTRUCTOR = 'Constructor',
}

export class BodyType
{

    constructor(
        public readonly type: BodyTypeName,
        // how many creeps are allowed
        public readonly num: number,
        // priority/order in which to spawn: lower=higher
        public readonly priority: number,
        // Base parts, that creep has to have
        public readonly body: BodyPartConstant[],
        // parts, that will repeatedly be added, if more energy is available
        public readonly bodyAdd: BodyPartConstant[],
    ) { }

    public toString()
    {
        return `${this.type}(${this.body})`;
    }

    // TODO: redo (availableEnergy)
    public getBody(size: number = 1): BodyPartConstant[]
    {
        const body: BodyPartConstant[] = [];
        for (const part of this.body)
        {
            for (let i = 0; i < size; i++)
            {
                body.push(part);
            }
        }
        body.push(MOVE);
        return body;
    }

    public getCost(size: number = 1): number
    {
        const body = this.getBody(size);
        return _.sum(body, (t) => BODYPART_COST[t]);
    }
}

export const BODY_TYPES: { readonly [type: string]: BodyType } = {
    // [BodyTypeName.MULE]: new BodyType(BodyTypeName.MULE, 2, 90, [MOVE, CARRY]),
    [BodyTypeName.PMINER]: new BodyType(BodyTypeName.PMINER, 10, 0, [MOVE, CARRY, WORK], [])
};
