import express from 'express';
import cors from 'cors';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { typeDefs } from './schema/typeDefs';
import { resolvers } from './resolvers';

async function startServer(): Promise<void> {
  const app = express();
  const port = parseInt(process.env.PORT ?? '4000', 10);

  const server = new ApolloServer({ typeDefs, resolvers });
  await server.start();

  app.use(cors());
  app.use('/graphql', express.json(), expressMiddleware(server));

  app.listen(port, () => {
    console.log(`Server ready at http://localhost:${port}/graphql`);
  });
}

startServer().catch(console.error);
