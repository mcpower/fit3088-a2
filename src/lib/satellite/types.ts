export type OpMode = 'i' | 'a';

export interface InitLOptions {
  ecco: number;
  epoch: number;
  inclo: number;
  no: number;
  opsmode: OpMode;
}

export interface DSpaceOptions {
  irez: number;
  d2201: number;
  d2211: number;
  d3210: number;
  d3222: number;
  d4410: number;
  d4422: number;
  d5220: number;
  d5232: number;
  d5421: number;
  d5433: number;
  dedt: number;
  del1: number;
  del2: number;
  del3: number;
  didt: number;
  dmdt: number;
  dnodt: number;
  domdt: number;
  argpo: number;
  argpdot: number;
  t: number;
  tc: number;
  gsto: number;
  xfact: number;
  xlamo: number;
  no: number;
  atime: number;
  em: number;
  argpm: number;
  inclm: number;
  xli: number;
  mm: number;
  xni: number;
  nodem: number;
  nm: number;
}

export interface SGP4Options {
  opsmode: OpMode;
  satn: string;
  epoch: number;
  xbstar: number;
  xecco: number;
  xargpo: number;
  xinclo: number;
  xmo: number;
  xno: number;
  xnodeo: number;
}

export interface SatRec {
  ndot?: number;
  nddot?: number;
  nodeo?: number;

  a?: number;
  alta?: number;
  altp?: number;
  jdsatepoch?: number;
  epochdays?: number;
  epochyr?: number;
  // ???
  isimp?: 0 | 1;
  method?: 'n' | 'd';
  init?: 'y' | 'n';
  error?: 0 | 1 | 2 | 3 | 4 | 5 | 6;

  ecco?: number;
  inclo?: number;
  no?: number;
  operationmode?: OpMode;
  mo?: number;
  bstar?: number;
  argpo?: number;

  satnum?: string;



  aycof?: number;
  con41?: number;
  cc1?: number;
  cc4?: number;
  cc5?: number;
  d2?: number;
  d3?: number;
  d4?: number;
  delmo?: number;
  eta?: number;
  argpdot?: number;
  omgcof?: number;
  sinmao?: number;
  t?: number;
  t2cof?: number;
  t3cof?: number;
  t4cof?: number;
  t5cof?: number;
  x1mth2?: number;
  x7thm1?: number;
  mdot?: number;
  nodedot?: number;
  xlcof?: number;
  xmcof?: number;
  nodecf?: number;
  irez?: number;
  d2201?: number;
  d2211?: number;
  d3210?: number;
  d3222?: number;
  d4410?: number;
  d4422?: number;
  d5220?: number;
  d5232?: number;
  d5421?: number;
  d5433?: number;
  dedt?: number;
  del1?: number;
  del2?: number;
  del3?: number;
  didt?: number;
  dmdt?: number;
  dnodt?: number;
  domdt?: number;
  e3?: number;
  ee2?: number;
  peo?: number;
  pgho?: number;
  pho?: number;
  pinco?: number;
  plo?: number;
  se2?: number;
  se3?: number;
  sgh2?: number;
  sgh3?: number;
  sgh4?: number;
  sh2?: number;
  sh3?: number;
  si2?: number;
  si3?: number;
  sl2?: number;
  sl3?: number;
  sl4?: number;
  gsto?: number;
  xfact?: number;
  xgh2?: number;
  xgh3?: number;
  xgh4?: number;
  xh2?: number;
  xh3?: number;
  xi2?: number;
  xi3?: number;
  xl2?: number;
  xl3?: number;
  xl4?: number;
  xlamo?: number;
  zmol?: number;
  zmos?: number;
  atime?: number;
  xli?: number;
  xni?: number;
}
