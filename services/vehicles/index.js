import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { readFileSync } from "fs";

import { ApolloServer, gql } from "apollo-server";
import { ApolloServerPluginUsageReportingDisabled, ApolloServerPluginInlineTrace } from "apollo-server-core";
import { buildFederatedSchema } from "@apollo/federation";

import { vehicles } from "./data.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

const typeDefs = gql(
  readFileSync(resolve(__dirname, "./schema.graphql"), "utf-8")
);

const resolvers = {
  Vehicle: {
    __resolveReference(reference, context, info) {
      return vehicles.find(vehicle => vehicle.id === reference.id);
    }
  },
  Query: {
    vehicle(root, { id }, context, info) {
      return vehicles.find(vehicle => vehicle.id === id);
    },
    vehicles(root, args, context, info) {
      return vehicles;
    }
  }
};

const server = new ApolloServer({
  schema: buildFederatedSchema([{ typeDefs, resolvers }]),
  plugins: [ApolloServerPluginUsageReportingDisabled(), ApolloServerPluginInlineTrace()]
});

server.listen({ port: process.env.PORT ?? 4000 }).then(({ url }) => {
  console.log(`Vehicles service ready at ${url}`);
});
