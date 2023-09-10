import { R } from './deps.ts';

const uuids: Array<string> = [];

const getUuid = (): string => {
  const uuid = R.replace('.', '-', String(performance.now()));
  if (R.includes(uuid, uuids)) return getUuid();
  uuids.push(uuid);
  return uuid;
};

export default getUuid;
