# Reproduction: Error Reporting Outside of Tracing

This repo demonstrates that errors end up in Studio only if they occur during
field resolution.

In the [missions code][code] I'm collecting errors on the context object and
adding them to the response in `formatResponse`. These errors don't end up in
Studio, so it appears that the Gateway doesn't instrument the `errors` array
in responses from downstream services.

[code]:https://github.com/lennyburdette/apollo-studio-error-trace-repro/blob/main/services/missions/index.js#L30

It does appear possible to avoid sending errors instrumented during field resolution
to Studio by using `rewriteError` in the `ApolloServerPluginInlineTrace` plugin in subgraphs.

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

Note that "Vehicle error to be added later" does not appear. You can get "Crew
error to be removed" to appear in Studio if you remove the [options passed][options]
to the inline tracing plugin.

[options]:https://github.com/lennyburdette/apollo-studio-error-trace-repro/blob/main/services/missions/index.js#L51-L55
