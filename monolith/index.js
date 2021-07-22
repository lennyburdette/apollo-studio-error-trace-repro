import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { readFileSync } from "fs";

import { ApolloServer, gql } from "apollo-server";
import { ApolloServerPluginUsageReporting } from "apollo-server-core";

import { missions } from "./data.js";
import { GraphQLError } from "graphql";

const __dirname = dirname(fileURLToPath(import.meta.url));

const typeDefs = gql(
  readFileSync(resolve(__dirname, "./schema.graphql"), "utf-8")
);

const resolvers = {
  Astronaut: {
    missions(astronaut, args, context, info) {
      return missions.filter(({ crew }) => crew.includes(astronaut.id));
    },
  },
  Mission: {
    crew(mission, args, context, info) {
      throw new GraphQLError(
        "Crew error to be removed",
        null,
        null,
        null,
        null,
        null,
        { code: "INTERNAL_ONLY" }
      );
      // return mission.crew.map(id => ({ __typename: "Astronaut", id }));
    },
    vehicle(mission, args, context, info) {
      (context.errors = context.errors ?? []).push(
        new GraphQLError("Vehicle error to be added later")
      );
      return { __typename: "Vehicle", id: mission.vehicleID };
    },
  },
  Query: {
    mission(root, { id }, context, info) {
      return missions.find((mission) => mission.id === id);
    },
    missions(root, args, context, info) {
      return missions;
    },
  },
};

const server = new ApolloServer({
  debug: true,
  typeDefs,
  resolvers,
  plugins: [
    ApolloServerPluginUsageReporting({
      rewriteError(err) {
        if (err.extensions.code === "INTERNAL_ONLY") {
          return null;
        }
        return err;
      },
    }),
  ],

  formatResponse(resp, { context }) {
    // don't include certain errors in response
    const errors = (resp.errors ?? []).filter(
      (e) => e.extensions.code !== "INTERNAL_ONLY"
    );

    return {
      ...resp,
      errors: [...errors, ...(context.errors ?? [])],
    };
  },
});

server.listen({ port: process.env.PORT ?? 4000 }).then(({ url }) => {
  console.log(`Missions service ready at ${url}`);
});
