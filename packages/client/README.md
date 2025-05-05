# Client SDK

The Client SDK provides a high-level abstraction over the Core SDK to enable secure, bidirectional communication between a client
application (running inside an iframe) and the host application. Inspired by React Query, the SDK implements a query/mutation API where:

- **Queries** support one-off data requests as well as subscriptions for live updates.
- **Mutations** trigger state changes or HTTP requests on the host side (with user tokens attached by the Host SDK).

The SDK automatically handles internal state and error management via callbacks (`onSuccess` and `onError`) so that developers
receive an API similar to React Query's, complete with properties like `data`, `status`, `isLoading`, and a `refetch` function.

## Installation

```bash
npm install @sitecore-marketplace-sdk/client
```

## Initialization

Before you use queries or mutations, you must initialize the Client SDK. The Client SDK internally creates an instance of the Core SDK
using your configuration. This configuration includes details such as the trusted origin of the host application, timeout settings,
or encryption keys. Your client application (running in an iframe) only needs to supply the configuration; all Core SDK logic is hidden.

Example initialization code:

```typescript
import { createClientSDK } from "@sitecore-mkp/client-sdk";

// Create a configuration object.
// For example:
const config = {
  origin: "https://your-host-app.com",
  // ... additional configuration such as timeouts or encryption settings
};

// Create a Client SDK instance using the configuration.
// The returned SDK provides a type-safe API based on your resource schema.
const client = createClientSDK(config);
```

## Usage

### Query Example

The `query` method supports one-off data requests and live subscriptions. The keys follow a dot-notated format derived from your
static JSON schema (for example, `"xmc.publishing.status"`). You can also pass `variables` needed for the query.

```typescript
(async () => {
  // One-off query example: Request host state once.
  const queryResult = await client.query("host.state", {
    variables: { id: "123" },
  });

  console.log(queryResult.data); // Displays the host state data
  console.log(queryResult.isLoading); // false once the request is complete

  // Subscription query example: Request data once and subscribe for future updates.
  const subscribedResult = await client.query("host.state", {
    variables: { id: "123" },
    subscribe: true,
    onSuccess: (data) => {
      console.log("Received updated host state:", data);
    },
    onError: (error) => {
      console.error("Error during subscription:", error);
    },
  });

  // Manual re-fetching of data (e.g., on user action)
  const updatedResult = await subscribedResult.refetch();
  console.log("Refetched data:", updatedResult.data);

  // Unsubscribe from updates when they are no longer required.
  subscribedResult.unsubscribe?.();
})();
```

### Mutation Example

Use the `mutate` method to trigger changes on the host side. The Host SDK (integrated via the internal Core SDK) will attach the required
user token and perform the HTTP request on behalf of the client application.

```typescript
(async () => {
  try {
    const mutationResponse = await client.mutate(
      "host.state.mutate",
      { newState: "active" },
      {
        onSuccess: (data) => {
          console.log("Mutation applied successfully:", data);
        },
        onError: (error) => {
          console.error("Mutation failed:", error);
        },
      }
    );
    console.log("Mutation response:", mutationResponse);
  } catch (error) {
    console.error("Error during mutation:", error);
  }
})();
```

### Application Context

This application context provides information about the application, such as its ID, URL, name, type, icon URL, installation ID, and associated resources.

Here is the ApplicationContext data example:

```typescript
{
   id: 'my-app-id',
   name: 'My App',
   type: 'portal',
   url: 'https://my-app.com/app',
   iconUrl: 'https://my-app.com/assets/icon.png',
   installationId: '1234567890',
   resources: [
     {
       resourceId: 'resource-1',
       tenantId: 'tenant-1',
       tenantName: 'Example Tenant',
       context: {
         live: '6Tt0eyd321kUNUkc1zt1YK',
         preview: '5o9XlKyOHdr7CAWw3pZbN2'
       }
     }
   ]
}
```

To request the application context, you can use the query method with the key 'application.context'. This will return data of type ApplicationContext.

```typescript
(async () => {
  const queryResult = await client.query("application.context");
  console.log(queryResult.data); // Displays the application context data
})();
```

## Communication Flow

The communication route for the Client SDK is as follows:

```
Client SDK → Core SDK (client side) → iframe → Core SDK (host side) → Host SDK → (process request and attach token) → external API →
Host SDK → Core SDK (host side) → iframe → Core SDK (client side) → Client SDK
```

During initialization, the Core SDK completes a handshake between the host and client applications. Once the handshake is complete,
the client SDK can safely issue queries and mutations.

## Generated Types & Namespace Mapping

The Client SDK heavily relies on a generated static contract (based on a JSON schema such as `resources.schema.json`) that defines
available resource namespaces and methods. For example, with a schema structured like:

```json
{
  "resources": {
    "xmc": {
      "publishing": {
        "status": { "type": "query", ... },
        "publish": { "type": "mutation", ... }
      }
    }
  }
}
```

The generated client types provide a type-safe interface:

- `client.xmc.publishing.status(params)` returns a `Promise<QueryResult<...>>`
- `client.xmc.publishing.publish(params)` returns a `Promise<MutationResult<...>>`

The keys passed to `query` and `mutate` are dot-notated (e.g., `"xmc.publishing.status"`), ensuring that they map directly
to the generated methods and resource definitions.

## Additional Information

- **State Management:** The SDK automatically manages query state (`data`, `status`, `isLoading`) and error handling behind the scenes.
- **Error Handling:** Use the provided `onError` and `onSuccess` callbacks to hook into error and success events, ensuring that the UI can respond appropriately.
- **Extendability:** Future versions of the SDK may include React hooks (e.g., `useQuery` and `useMutation`) to integrate more naturally with React applications.

For more details, please refer to the full documentation in the `/docs` folder or the project documentation.

## Contributing

If you have any improvements or bug fixes, feel free to open an issue or submit a pull request.

A patch changes
Another patch change
