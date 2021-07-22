# Error Reporting Outside of Tracing Reproduction

This repo demonstrates that errors end up in Studio only if they occur during
field resolution. Altering errors in `formatResponse` does not affect how Studio
records errors.

It's a bit surprising that errors in the `errors` array of the GraphQL response
doesn't end up in Studio. Especially since the Gateway sees errors from
downstream subgraph services and could instrument them for error reporting.

It seems to be possible to not send errors from Studio by using `rewriteError`
in the `ApolloServerPluginInlineTrace` plugin in subgraphs.

```
export APOLLO_KEY=<your api key>
export APOLLO_GRAPH_REF=yourgraph@current
npx github:apollosolutions/roverx \
  supergraph publish $APOLLO_GRAPH_REF \
  --config supergraph-config.yaml --convert
docker compose up
```

```graphql
query ExampleQuery($astronautId: ID!) {
  astronaut(id: $astronautId) {
    id
    missions {
      id
      crew { # throws an error that's stripped out (should be traced)
        id
      }
      vehicle { # doesn't throw, but adds an error later
        id
      }
    }
  }
}
```

View errors in studio:

```
open https://studio.apollographql.com/graph/$GRAPH_NAME/operations?tab=errors&variant=current
```

Note that "Crew error to be removed" appears, whereas "Vehicle error to be added
later" does not appear.
