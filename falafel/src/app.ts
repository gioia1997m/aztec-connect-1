import { ApolloServer } from 'apollo-server-koa';
import { Block, BlockServerResponse, GetBlocksServerResponse } from 'barretenberg/block_source';
import {
  RollupServerResponse,
  TxServerResponse,
  Proof,
  ProofServerResponse,
  RollupProviderStatusServerResponse,
  RollupProviderStatus,
} from 'barretenberg/rollup_provider';
import { WorldStateDb } from 'barretenberg/world_state_db';
import graphqlPlayground from 'graphql-playground-middleware-koa';
import Koa from 'koa';
import compress from 'koa-compress';
import Router from 'koa-router';
import { PromiseReadable } from 'promise-readable';
import { buildSchemaSync } from 'type-graphql';
import { Container } from 'typedi';
import { Connection } from 'typeorm';
import { DefaultState, Context } from 'koa';
import { RollupDao } from './entity/rollup';
import { TxDao } from './entity/tx';
import { BlockResolver, RollupResolver, TxResolver, ServerStatusResolver } from './resolver';
import { Server } from './server';

// eslint-disable-next-line
const cors = require('@koa/cors');

const toBlockResponse = (block: Block): BlockServerResponse => ({
  ...block,
  txHash: block.txHash.toString('hex'),
  rollupProofData: block.rollupProofData.toString('hex'),
  viewingKeysData: block.viewingKeysData.toString('hex'),
  created: block.created.toISOString(),
});

const toRollupResponse = ({
  id,
  status,
  dataRoot,
  proofData,
  txs,
  ethTxHash,
  created,
}: RollupDao): RollupServerResponse => ({
  id,
  status,
  dataRoot: dataRoot.toString('hex'),
  proofData: proofData ? proofData.toString('hex') : undefined,
  txHashes: txs.map(tx => tx.txId.toString('hex')),
  ethTxHash: ethTxHash ? ethTxHash.toString('hex') : undefined,
  created: created.toISOString(),
});

const toTxResponse = ({ txId, rollup, proofData, viewingKey1, viewingKey2, created }: TxDao): TxServerResponse => ({
  txHash: txId.toString('hex'),
  rollup: !rollup
    ? undefined
    : {
        id: rollup.id,
        status: rollup.status,
      },
  proofData: proofData.toString('hex'),
  viewingKeys: [viewingKey1, viewingKey2].map(vk => vk.toString('hex')),
  created: created.toISOString(),
});

export function appFactory(
  server: Server,
  prefix: string,
  connection: Connection,
  worldStateDb: WorldStateDb,
  serverStatus: RollupProviderStatus,
  serverAuthToken: string,
) {
  const router = new Router<DefaultState, Context>({ prefix });

  const validateAuth = async (ctx: Koa.Context, next: () => Promise<void>) => {
    const authToken = ctx.request.headers['server-auth-token'];

    if (authToken !== serverAuthToken) {
      ctx.status = 401;
      ctx.body = { error: 'Invalid server auth token.' };
    } else {
      await next();
    }
  };

  const exceptionHandler = async (ctx: Koa.Context, next: () => Promise<void>) => {
    try {
      await next();
    } catch (err) {
      console.log(err);
      ctx.status = 400;
      ctx.body = { error: err.message };
    }
  };

  router.get('/', async (ctx: Koa.Context) => {
    ctx.body = 'OK\n';
  });

  router.post('/tx', async (ctx: Koa.Context) => {
    const stream = new PromiseReadable(ctx.req);
    const { proofData, viewingKeys, depositSignature } = JSON.parse((await stream.readAll()) as string);
    const tx: Proof = {
      proofData: Buffer.from(proofData, 'hex'),
      viewingKeys: viewingKeys.map((v: string) => Buffer.from(v, 'hex')),
      depositSignature: depositSignature ? Buffer.from(depositSignature, 'hex') : undefined,
    };
    const txDao = await server.receiveTx(tx);
    const response: ProofServerResponse = {
      txHash: txDao.txId.toString('hex'),
    };
    ctx.body = response;
    ctx.status = 200;
  });

  router.get('/get-blocks', async (ctx: Koa.Context) => {
    const blocks = await server.getBlocks(+ctx.query.from);
    const response: GetBlocksServerResponse = {
      latestRollupId: await server.getLatestRollupId(),
      blocks: blocks.map(toBlockResponse),
    };
    ctx.body = response;
    ctx.status = 200;
  });

  router.get('/get-rollups', async (ctx: Koa.Context) => {
    const rollups = await server.getLatestRollups(+ctx.query.count);
    ctx.body = rollups.map(toRollupResponse);
    ctx.status = 200;
  });

  router.get('/get-rollup', async (ctx: Koa.Context) => {
    const rollup = await server.getRollup(+ctx.query.id);
    ctx.body = rollup ? toRollupResponse(rollup) : undefined;
    ctx.status = 200;
  });

  router.get('/get-txs', async (ctx: Koa.Context) => {
    let txs;
    if (ctx.query.txIds) {
      const txIds = (ctx.query.txIds as string).split(',').map(txId => Buffer.from(txId, 'hex'));
      txs = await server.getTxs(txIds);
    } else {
      txs = await server.getLatestTxs(+ctx.query.count);
    }
    ctx.body = txs.map(toTxResponse);
    ctx.status = 200;
  });

  router.get('/get-tx', async (ctx: Koa.Context) => {
    const tx = await server.getTx(Buffer.from(ctx.query.txHash, 'hex'));
    ctx.body = tx ? toTxResponse(tx) : undefined;
    ctx.status = 200;
  });

  router.get('/remove-data', validateAuth, async (ctx: Koa.Context) => {
    await server.removeData();
    ctx.status = 200;
  });

  router.get('/flush', validateAuth, async (ctx: Koa.Context) => {
    await server.flushTxs();
    ctx.status = 200;
  });

  router.get('/status', async (ctx: Koa.Context) => {
    const status = await server.getStatus();
    const { rollupContractAddress, tokenContractAddresses, dataRoot, nullRoot, rootRoot } = status;
    const response: RollupProviderStatusServerResponse = {
      ...status,
      rollupContractAddress: rollupContractAddress.toString(),
      tokenContractAddresses: tokenContractAddresses.map(a => a.toString()),
      dataRoot: dataRoot.toString('hex'),
      nullRoot: nullRoot.toString('hex'),
      rootRoot: rootRoot.toString('hex'),
    };
    ctx.set('content-type', 'application/json');
    ctx.body = response;
    ctx.status = 200;
  });

  router.all('/playground', graphqlPlayground({ endpoint: `${prefix}/graphql` }));

  const app = new Koa();
  app.proxy = true;
  app.use(compress());
  app.use(cors());
  app.use(exceptionHandler);
  app.use(router.routes());
  app.use(router.allowedMethods());

  Container.set({ id: 'connection', factory: () => connection });
  Container.set({ id: 'worldStateDb', factory: () => worldStateDb });
  Container.set({ id: 'serverStatus', factory: () => serverStatus });
  Container.set({ id: 'server', factory: () => server });
  const schema = buildSchemaSync({
    resolvers: [BlockResolver, RollupResolver, TxResolver, ServerStatusResolver],
    container: Container,
  });
  const appServer = new ApolloServer({ schema, introspection: true });
  appServer.applyMiddleware({ app, path: `${prefix}/graphql` });

  return app;
}
