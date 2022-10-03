import { positionSquare } from "helpers/positions";

export {};
// import {role} from "."

export enum Role
{
    PMINER      = 'Primitive_Miner',
    MINER       = 'Miner',
    CARRIER     = 'Carrier',
    MCARRIER    = 'Miner_Carrier',
    ECARRIER    = 'Extension_Carrier',
    CONSTRUCTOR = 'Constructor',
    UPGRADER    = 'Upgrader',
}

// Which task to save in memory
export enum task
{
    NONE,          // 0, Spiritual Support
    STORING,       // 1, Creep is storing in storage, spawn etc
    RETRIEVING,    // 2, Creep is retrieving from storage
    SCAVENGING,    // 3, Creep is collecting energy
    FILLING,       // 4, Fill buildings with energy
    MINING,        // 5,
    UPGRADING,     // 6,
    CONSTRUCTING,  // 7,
    REPAIRING,     // 8,
}


const taskToStr: { [key in task]: string} = {
    [task.NONE]:         "虚",
    [task.STORING]:      "入庫に行きます",
    [task.RETRIEVING]:   "引出す",
    [task.SCAVENGING]:   "ゴミ漁りに行きます",
    [task.FILLING]:      "いっぱいにする",
    [task.MINING]:       "採掘に行きます",
    [task.UPGRADING]:    "アップグレードする",
    [task.CONSTRUCTING]: "工事する",
    [task.REPAIRING]:    "直す",
};

declare global {
    export interface CreepMemory
    {
        role: Role;
        // Home room
        room: string;
        task: task;  // current task creep is working on
    }
}

export class MyCreep extends Creep
{
    constructor(id: Id<Creep>)
    {
        super(id);
        //this.memory = memory;
    }
}

export interface EnergyCreepMemory extends CreepMemory
{
    resourceStack: Id<Resource> | Id<Tombstone> | Id<Ruin> | null;  // Stack to pick up from
}

export class EnergyCreep extends MyCreep
{
    // EnergyCreeps should have CARRY parts
    // @ts-ignore
    memory: EnergyCreepMemory;

    constructor(id: Id<Creep>)
    {
        super(id);
    }

    /**
     * Update task. Also says what task was switched to.
     * @param tsk: task to update memory to.
     */
    task(tsk:task=task.NONE)
    {
        if (this.memory.task != tsk)
        {
            this.memory.task = tsk;
            this.say(taskToStr[tsk]);
        }
    }

    /**
     * Put resource into storage, spawn or central container etc.
     * @returns: bool; If doing: true. If done: false
     */
    putAway(resource=RESOURCE_ENERGY): boolean
    {
        if (this.memory.task != task.STORING)
            return false;
        let centralStore = Game.rooms[this.memory.room].getStore();

        if (this.isEmty() || centralStore?.store.getFreeCapacity(resource) == 0)
        {
            this.memory.task = task.NONE;
            return false;
        }
        if (centralStore && this.transfer(centralStore, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE)
            this.moveTo(centralStore);
        return true;
    }

    freeCapacity(resource=RESOURCE_ENERGY)
    {
        return this.store.getFreeCapacity(resource);
    }

    usedCapacity(resource:ResourceConstant|null=null)
    {
        if (resource == null)
            return this.store.getCapacity() - this.store.getFreeCapacity();
        else
            return this.store.getUsedCapacity(resource);
    }

    /**
     * @deprecated
     * @param resource. If null: combined capacity. If ResourceConstant, just of that type.
     * @returns payload number.
     */
    payload(resource: ResourceConstant | null = null)
    {
        return this.usedCapacity(resource);
    }

    /**
     * Check, if creep has space in its store
     * @returns boolean
     */
    hasSpace(): boolean
    {
        return this.freeCapacity() > 0;
    }

    /**
     * Check if a creeps store is empty
     */
    isEmty(): boolean
    {
        return this.store.getUsedCapacity() == 0;
    }

    isFull(): boolean
    {
        return !this.hasSpace();
    }


    totalCapacity()
    {
        return this.store.getCapacity() - this.store.getFreeCapacity() || 0;
    }


    /**
     * Clears the Resource Stack, if Invalid.
     * @returns true if Resource Stack exists. Else false.
     */
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
        if (this.memory.task != task.SCAVENGING)
            return false;

        if (this.store.getFreeCapacity() == 0)
        {
            this.memory.task = task.NONE;
            return false;
        }
        if (!this.checkResourceStack())
            this.setResourceStack(resource);
        if (this.memory.resourceStack)
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
                if (obj.resourceType != resource)
                {
                    this.clearResourceStack();
                    this.memory.task = task.NONE;
                    return false;
                }
                if (this.pickup(obj) == ERR_NOT_IN_RANGE)
                    this.moveTo(obj);
                else
                    this.clearResourceStack();
                return true;
            }
        }
        else
        {
            this.memory.task = task.NONE;
        }

        if (this.store.getFreeCapacity() != 0)
            this.setResourceStack(resource);

        if (this.checkResourceStack())
            return true;

        this.memory.task = task.NONE;
        return false;
    }

    /**
     * Get Resources from central storage.
     * @param resource
     * @returns True if doing. False if done.
     */
    retrieve(resource: MineralConstant | ResourceConstant = RESOURCE_ENERGY): boolean
    {
        if (this.memory.task != task.RETRIEVING)
            return false;
        let store = this.room.getStore(false);
        if (store)
        {
            if (store.store.getUsedCapacity(resource) == 0)
                return true;
            // if (store.structureType == STRUCTURE_SPAWN &&
            //     // @ts-ignore
            //     store.store.getUsedCapacity(resource) < 250)
            //     return true;
            if (store && this.withdraw(store, resource) == ERR_NOT_IN_RANGE)
            {
                this.moveTo(store);
                return true;
            }
        }
        if (this.isFull())
            this.memory.task = task.NONE;
        return false;
    }

    setResourceStack(resource: ResourceConstant): boolean
    {
        let fcs: FindConstant[] = [FIND_DROPPED_RESOURCES, FIND_RUINS, FIND_TOMBSTONES]
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
            // without shuffle creeps always prefer the same stack
            finds = _.shuffle(finds);
            for (let i in finds)
                if (finds[i]?.resourceType === resource && finds[i]?.amount > 50)
                {
                    this.memory.resourceStack = finds[i].id;
                    return true;
                }
        }
        return false;
    }

    /**
     * Fill thes given structures.
     * @param struct structureConstant to search and then fill.
     * @returns true if doing. false if done
     */
    fillExtension(): boolean
    {
        if (this.memory.task != task.FILLING)
            return false;
        if (this.totalCapacity() < 50)
        {
            this.memory.task = task.NONE;
            return false;
        }

        let exts: StructureExtension[] =
            this.room.myStructures(STRUCTURE_EXTENSION) as StructureExtension[];
        let ext: StructureExtension|null = null;
        let nearExt: StructureExtension|null = null;
        for (let i in exts)
        {
            if (exts[i].store.getFreeCapacity(RESOURCE_ENERGY) == 0)
                continue;
            if (nearExt == null && this.pos.isNearTo(exts[i]))
            {
                nearExt = exts[i];
                break;
            }
            if (ext == null)
                ext = exts[i];
        }
        if (nearExt)
            ext = nearExt;
        if (ext == null)
            return true;
        if (this.transfer(ext, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE)
            this.moveTo(ext);

        return true;
    }

    /**
     * Check extensions around creep and fill them, it they have space.
     * @returns true, if one was filled. false if there is none.
     */
    fillAdjadentExtensions(): boolean
    {
        let adjPos = positionSquare(this.pos);
        return false;
    }
}

export interface WorkerCreepMemory extends EnergyCreepMemory
{
    working: boolean;  // TODO: remove?
}

export class WorkerCreep extends EnergyCreep
{
    // @ts-ignore
    memory: WorkerCreepMemory;

    constructor(id: Id<Creep>)
    {
        super(id);
    }

    /**
     *
     * @returns True if doing. False if done.
     */
    upgradeCont()
    {
        if (this.memory.task != task.UPGRADING)
            return false;
        let cont = this.room.controller;
        if (cont && this.payload(RESOURCE_ENERGY) > 0)
        {
            if (this.upgradeController(cont) == ERR_NOT_IN_RANGE)
                this.moveTo(cont);
            return true;
        }
        this.memory.task = task.NONE;
        return false;
    }

}

export interface MinerCreepMemory extends WorkerCreepMemory
{
    sourceId?: Id<Source> | null;
    pos?: RoomPosition | null;
}


export class MinerCreep extends WorkerCreep
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
            return true;
        }
        return false
    }

    /**
     * Set a source per role. Only a set amount of creeps serve one source.
     * @returns true, if set. false on error, if not set.
     */
    setRoleSource(r: Role, num: number=1): boolean
    {
        if (this.memory.sourceId)
            return true;

        // TODO: make compatible with other creep types
        let filteredCreeps: MinerCreep[] = this.room.myCreeps(r) as MinerCreep[];
        const sources = this.room.find(FIND_SOURCES);

        for (let i in sources)
        {
            let sid: Id<Source> = sources[i].id;
            let snum = num;
            // check if id is used by other miners
            for (let m in filteredCreeps)
            {
                if (filteredCreeps[m].memory.sourceId == sid)
                {
                    snum--;
                }
            }
            if (snum > 0)
            {
                this.memory.sourceId = sid;
                return true;
            }
        }
        return false;
    }

    /**
     * Harvest from Source
     * @returns True if doing. False if done.
     */
    mine(): boolean
    {
        if (this.memory.task != task.MINING)
            return false;
        if (this.memory.sourceId)
        {
            let source = Game.getObjectById(this.memory.sourceId);
            if (source)
                if (this.harvest(source) == ERR_NOT_IN_RANGE)
                {
                    this.moveTo(source);
                    return true;
                }
            if (this.store.getFreeCapacity() == 0)
                this.memory.task = task.NONE;
            else
                return true;
        }
        return false;
    }

    /**
     * Move miner to their designated position
     * @returns true if moving. false if it arrived.
     */
    moveToMiningPos(): boolean
    {
        this.setContainerPos(this.memory.sourceId);
        if (this.memory.pos != null &&
            (this.pos.x != this.memory.pos.x ||
            this.pos.y != this.memory.pos.y))
        {
            this.moveTo(this.memory.pos.x, this.memory.pos.y);
            return true;
        }
        return false;
    }

    /**
     * Set por in creep memory of container which it will serve
     * @param parentId Id of parent structure. eg. Source of Miner Container
     * @returns true if set. False is unset.
     */
    setContainerPos(parentId: Id<Structure>|Id<Source>|null|undefined)
    {
        if (!this.memory.pos && parentId)
        {
            for(let i in this.room.memory.ContainerPos)
            {
                const contPos = this.room.memory.ContainerPos[i];
                if (contPos.parentId == parentId)
                {
                    this.memory.pos = contPos.pos;
                    return true;
                }
            }
        }
        if (this.memory.pos)
            return true;
        return false;
    }



}



/*

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
