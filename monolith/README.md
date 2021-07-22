Double-checking to see if errors added to the response are reported in a
monolithic graph as well. (They're not.)

```
rover graph publish yourgraph@monolith --schema schema.graphql
```

```
APOLLO_KEY=<your api key>
APOLLO_GRAPH_REF=yourgraph@current
node index.js
```

```
query ExampleQuery {
  missions {
    id
    crew {
      id
    }
    vehicle {
      id
    }
  }
}
```
