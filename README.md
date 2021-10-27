# Event-Source (SSE) Server

A server using the EventSource API to stream data to a web client (as an alternative to streaming via WebSockets)

---

## Running in localhost

Launch server:

```
node index
```

There is currently no client application so just use curl as shown below to see basic SSE data streamed to client:

```
curl -H Accept:text/event-stream http://localhost:5000/random
```
