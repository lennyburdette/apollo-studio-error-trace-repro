import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { readFileSync } from "fs";

import { ApolloServer, gql } from "apollo-server";
import { ApolloServerPluginUsageReportingDisabled, ApolloServerPluginInlineTrace } from "apollo-server-core";
import { buildFederatedSchema } from "@apollo/federation";

import { astronauts } from "./data.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

const typeDefs = gql(
  readFileSync(resolve(__dirname, "./schema.graphql"), "utf-8")
);

const resolvers = {
  Astronaut: {
    __resolveReference(reference, context, info) {
      return astronauts.find(astronaut => astronaut.id === reference.id);
    }
  },
  Query: {
    astronaut(root, { id }, context, info) {
      return astronauts.find(astronaut => astronaut.id === id);
    },
    astronauts(root, args, context, info) {
      return astronauts;
    }
  }
};

const server = new ApolloServer({
  schema: buildFederatedSchema([{ typeDefs, resolvers }]),
  plugins: [
    ApolloServerPluginUsageReportingDisabled(),
    ApolloServerPluginInlineTrace()
  ]
});

server.listen({ port: process.env.PORT ?? 4000 }).then(({ url }) => {
  console.log(`Astronauts service ready at ${url}`);
});
