export {};
// import {role} from "."

export enum role
{
    PMINER      = 'Primitive_Miner',
    MINER       = 'Miner',
    CARRIER     = 'Carrier',
    MCARRIER    = 'Miner_Carrier',
    ECARRIER    = 'Extension_Carrier',
    CONSTRUCTOR = 'Constructor',
}

declare global {


    export interface CreepMemory
    {
        role: role;
        // Home room
        room: string;
    }
/*
    export const PMINER      = role.PMINER     ;
    export const MINER       = role.MINER      ;
    export const CARRIER     = role.CARRIER    ;
    export const MCARRIER    = role.MCARRIER   ;
    export const ECARRIER    = role.ECARRIER   ;
    export const CONSTRUCTOR = role.CONSTRUCTOR;

    export const role = {PMINER: role.PMINER};
    */
}


export class MyCreep extends Creep
{
    // memory: CreepMemory;

    constructor(id: Id<Creep>)
    {
        super(id);
        //this.memory = memory;
    }
}

export interface EnergyCreepMemory extends CreepMemory
{
    scavenging: boolean; // If creep is collecting energy
    resourceStack: Id<Resource> | Id<Tombstone> | Id<Ruin> | null;  // Stack to pick up from
    retrieve: boolean;   // If creep is retrieving from storage
    storing: boolean;    // If creep state is storing in storage, spawn etc.

}

export class EnergyCreep extends Creep
{
    // EnergyCreeps MUST have CARRY parts
    // @ts-ignore
    memory: EnergyCreepMemory;

    constructor(id: Id<Creep>)
    {
        super(id);
        //this.memory = memory;
    }

    /**
     * Put resource into storage, spawn or central container etc.
     * @returns: bool; If doing: true. If done: false
     */
    putAway(resource=RESOURCE_ENERGY): boolean
    {
        if (this.store.getUsedCapacity() == 0)
        {
            this.memory.storing = false;
            return false;
        }
        let store = Game.rooms[this.memory.room].getStore();
        console.log(store?.id);
        if (store && this.transfer(store, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE)
            this.moveTo(store);
        return true;
    }

    checkResourceStack(): boolean
    {
        if (this.memory.resourceStack)
            if (Game.getObjectById(this.memory.resourceStack))
                return true;
            this.memory.resourceStack = null;
        return false;
    }

    clearResourceStack()
    {
        this.memory.resourceStack = null;
    }

    /**
     * Pick up Energy from dropped, Tombstone, Ruin or dropped, set in memory: resourceStack
     * @param resource: Resource const which to pick up.
     * @returns: boolean; if doing: true. If done: false
     */
    scavenge(resource=RESOURCE_ENERGY): boolean
    {
        if (this.store.getFreeCapacity() < 10)
        {
            this.memory.scavenging = false;
            return false;
        }
        if (!this.checkResourceStack())
            this.setResourceStack(resource);
        if (this.memory.resourceStack && this.memory.scavenging)
        {
            let obj = Game.getObjectById(this.memory.resourceStack)
            if (obj instanceof Tombstone || obj instanceof Ruin)
            {
                if (this.withdraw(obj, resource) == ERR_NOT_IN_RANGE)
                    this.moveTo(obj);
                else
                    this.clearResourceStack();
                return true;
            }
            else if (obj instanceof Resource)
            {
                if (obj.resourceType != RESOURCE_ENERGY)
                {
                    this.clearResourceStack();
                    return false;
                }
                if (this.pickup(obj) == ERR_NOT_IN_RANGE)
                    this.moveTo(obj);
                else
                    this.clearResourceStack();
                return true;
            }
        }
        else if (!this.memory.resourceStack && this.memory.scavenging)
        {
            this.memory.scavenging = false;
        }
        if (this.store.getFreeCapacity() > 10)
            return this.setResourceStack(resource);
        else
            this.memory.scavenging = false;

        return false;
    }

    retrieveMineral(resource: MineralConstant)
    {
        // TODO: implement
    }

    setResourceStack(resource: ResourceConstant): boolean
    {
        let fcs: FindConstant[] = [FIND_DROPPED_RESOURCES, FIND_TOMBSTONES, FIND_RUINS]
        for (let i in fcs)
            if (this.findResourceStack(fcs[i], resource))
                return true;
        return false;
    }

    findResourceStack(find: FindConstant, resource: ResourceConstant): boolean
    {
        if (find != FIND_DROPPED_RESOURCES)
        {
            let finds: (Ruin | Tombstone)[] = this.room.find(find);
            for (let i in finds)
                if (finds[i]?.store.getUsedCapacity(resource) > 5)
                {
                    this.memory.resourceStack = finds[i].id;
                    return true;
                }
        }
        else
        {
            let finds: Resource[] = this.room.find(find);
            for (let i in finds)
                if (finds[i]?.resourceType === resource && finds[i]?.amount > 50)
                {
                    this.memory.resourceStack = finds[i].id;
                    return true;
                }
        }
        return false;
    }
}

export interface MinerCreepMemory extends EnergyCreepMemory
{
    sourceId?: Id<Source> | null;
    mining: boolean;
}

declare global {
    interface MinerCreep extends EnergyCreep {
        memory: MinerCreepMemory;
        setRandomSource(): boolean;
        mine(): boolean;
    }
}

export class MinerCreep extends EnergyCreep
{
    // @ts-ignore
    memory: MinerCreepMemory;

    constructor(id: Id<Creep>)
    {
        super(id);
        //this.memory = memory;
    }

    setRandomSource(): boolean
    {
        // Set source in memory, if unset
        if (!this.memory.sourceId)
        {
            let sources = this.room.find(FIND_SOURCES);
            let n = Game.time%sources.length;
            this.memory.sourceId = sources[n].id;
            return true
        }
        return false
    }

    mine(): boolean
    {
        if (!this.memory.resourceStack && this.store.getUsedCapacity() == 0)
            this.memory.mining = true;
        if (this.memory.sourceId && this.memory.mining)
        {
            let source = Game.getObjectById(this.memory.sourceId);
            if (source && this.harvest(source) == ERR_NOT_IN_RANGE)
                this.moveTo(source);
            if (this.store.getFreeCapacity() == 0)
                this.memory.mining = false
            return true
        }
        return false;
    }

    moveToMiningPos(): boolean
    {
        return false;
    }

    /**
     * Set a source per role. Only one Source can be served by each role.
     */
    setRoleSource()
    {

    }



}

    /*
    interface EnergyCreep extends Creep
    {
        memory: EnergyCreepMemory
    }
    */
//}

Object.defineProperties(MinerCreep.prototype, {


});

Object.defineProperties(Creep.prototype, {
  /*
  color: {
    configurable: true,
    get(this: Creep): string { return '#' + this.id.substr(18, 6); }
  },*/
  energy: {
    configurable: true,
    get(this: Creep): number { return this.store[RESOURCE_ENERGY]; }
  },
  energyCapacity: {
    configurable: true,
    get(this: Creep): number { return this.store.getFreeCapacity(RESOURCE_ENERGY); }
  },
  payload: {
    configurable: true,
    get(this: Creep): number { return this.store.getCapacity() - this.store.getFreeCapacity() || 0; }
  },

});


/*
Creep.prototype.isEmpty = function(this: Creep) {
  return this.store.getFreeCapacity() > 0 && this.payload === 0;
};

Creep.prototype.isFull = function(this: Creep) {
  return this.payload === this.carryCapacity;
};

Creep.prototype.toString = function(this: Creep) {
  return `<font color="${this.color}">${this.name}</font>`;
};

Creep.prototype.canMoveTo = function(this: Creep, xOrPos: number|RoomPosition, y?: number, roomName?: string): boolean {
  if (xOrPos instanceof RoomPosition) {
    return canMoveTo(xOrPos);
  }
  if (typeof y === 'number') {
    return canMoveTo(new RoomPosition(xOrPos, y, roomName || this.pos.roomName));
  }
  throw new TypeError(`Invalid arguments to Creep.prototype.canMoveTo: ${JSON.stringify(arguments)}`);
};

Creep.prototype.moveOneTo = function(this: Creep, xOrPos: number|RoomPosition, y?: number, roomName?: string): ResultCode {
  if (xOrPos instanceof RoomPosition) {
    return moveOneTo(this, xOrPos);
  }
  if (typeof y === 'number') {
    return moveOneTo(this, new RoomPosition(xOrPos, y, roomName || this.pos.roomName));
  }
  throw new TypeError(`Invalid arguments to Creep.prototype.moveOneTo: ${JSON.stringify(arguments)}`);
};

Creep.prototype.moveToGoal = function(
  this: Creep,
  xOrPosOrGoal: number|RoomPosition|{ pos: RoomPosition, range?: number },
  yOrRange?: number,
  range?: number,
  roomName?: string
): ResultCode {
  if (xOrPosOrGoal instanceof RoomPosition) {
    return moveToGoal(this, xOrPosOrGoal, yOrRange || 0);
  }
  if (typeof xOrPosOrGoal === 'number' && typeof yOrRange === 'number') {
    return moveToGoal(this, new RoomPosition(xOrPosOrGoal, yOrRange, roomName || this.pos.roomName), range || 0);
  }
  if (typeof xOrPosOrGoal === 'object') {
    return moveToGoal(this, xOrPosOrGoal.pos, xOrPosOrGoal.range || range || 0);
  }
  throw new TypeError(`Invalid arguments for Creep.prototype.moveToGoal: ${JSON.stringify(arguments)}`);
};

function moveToGoal(creep: Creep, pos: RoomPosition, range: number): ResultCode {
  if (creep.pos.inRangeTo(pos, range)) {
    return OK;
  }
  const result = moveOneTo(creep, pos);
  if (result === OK || result === ERR_TIRED) {
    return result;
  }
  return moveByPathTo(creep, pos, range);
}

interface Path {
  roomName: string;
  target: { x: number, y: number };
  steps: Array<[number, number]>;
}

function moveByPathTo(creep: Creep, pos: RoomPosition, range: number): ResultCode {
  let result: ResultCode = ERR_NO_PATH;

  let path: Path | undefined = creep.memory.path;
  if (path) {
    result = tryPath(creep, pos, path);
    if (result === OK || result === ERR_TIRED) {
      return result;
    }
    delete creep.memory.path;
  }

  const pathInfo = PathFinder.search(
    creep.pos,
    { pos, range },
    {
      maxCost: 2000,
      maxRooms: 1,
      plainCost: 2,
      roomCallback: getRoomCostMatrix,
      swampCost: 10
    }
  );
  if (pathInfo.path.length === 0) {
    log.debug(`_moveByPathTo: could not find path to (${pos},${range})`);
    return ERR_NO_PATH;
  }

  path = {
    roomName: pos.roomName,
    steps: _.map(pathInfo.path, ({x, y}) => [x, y] as [number, number]),
    target: { x: pos.x, y: pos.y }
  };
  result = tryPath(creep, pos, path);
  if (result === OK || result === ERR_TIRED) {
    creep.memory.path = path;
  }
  return result;
}

function getRoomCostMatrix(name: string): CostMatrix|boolean {
  const room = Game.rooms[name];
  if (!room) {
    return false;
  }
  return room.costMatrix;
}

function tryPath(creep: Creep, pos: RoomPosition, { target, steps, roomName }: Path): ResultCode {
  if (!pos.isEqualTo(target.x, target.y)) {
    return ERR_NOT_FOUND;
  }
  const n = steps.length;
  addPathVisual(creep, steps);
  for (let i = 0; i < n; i++) {
    const [x, y] = steps[i]!;
    const result = moveOneTo(creep, new RoomPosition(x, y, roomName));
    if (result === OK || result === ERR_TIRED) {
      if (result === OK) {
        i++;
      }
      steps.splice(0, i);
      return result;
    }
  }
  return ERR_NOT_FOUND;
}

function addPathVisual(creep: Creep, steps: Array<[number, number]>): void {
  creep.room.visual.poly(
    steps,
    {
      lineStyle: 'dotted',
      opacity: 0.7,
      stroke: creep.color,
      strokeWidth: 0.1
    }
  );
}

function moveOneTo(creep: Creep, pos: RoomPosition): ResultCode {
  if (creep.pos.isEqualTo(pos)) {
    return OK;
  }
  if (!creep.pos.isNearTo(pos)) {
    return ERR_NOT_FOUND;
  }
  if (!canMoveTo(pos)) {
    log.debug(`_moveOneTo: no space on ${pos} for ${creep}${creep.pos}`);
    return ERR_NO_PATH;
  }
  return creep.move(creep.pos.getDirectionTo(pos));
}

function canMoveTo(pos: RoomPosition): boolean {
  return _.all(pos.look(), (res) => {
    switch (res.type) {
      case 'terrain':
        return res.terrain !== 'wall';
      case 'structure':
        return res.structure!.isTraversable();
      case 'creep':
      case 'source':
      case 'mineral':
        return false;
      default:
        return true;
    }
  });
}
*/
