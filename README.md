# Shopping Cart API

## Setup

- This is a Node.js typescript server app
- Make sure your Node version is comply with `engines.node` from `package.json`
- Install dependencies with `npm i`
- Create a `.env` file from the `.env.template`
- Start the server with `npm run start:dev`

## Testing

- Run unit tests with `npm run test:unit`

## Build

- Build **with docker**:

  Run `docker build -t shopping-cart-api .`

  To run the container api: `docker run -p 3001:3001 shopping-cart-api`;

- Build **without docker**:

  Run `npm run build` and `npm run start` to test the build version locally.

## Making API Requests

After starting the server, you can interact with the API endpoints. Here are some example commands using curl:

- **Get server env and timestamp**:

```bash
curl http://localhost:3001
```

- **Get total price from the provided shopping cart**:

```bash
curl --location 'http://localhost:3001/shopping_cart/' \
--header 'Content-Type: application/json' \
--data '{
	"items": [
		{
			"sku": "43N23P",
			"quantity": 1
		}
	]
}'
```

# TODO

This is an exaustive list of features to implement into the application to make it more robust:

### Documentation

- Add automated API documentation with Swagger
- Serve documentation into a public view

### Quality Assurance

- Add 100% unit/integration testing coverage
- Add E2E tests for user workflows (e.g., a user validating its cart)
- Add testing coverage rules for CI
- Benchmark modules with `autocannon`

### Observability/Performance

- Implement an proper in-memory or persistent database
- Collect Service Level Indicators (SLIs), including:
  - API latency
  - Request counts
  - CPU usage
  - Memory usage
- Apply log segmentation (e.g., shopping cart logs, global logs)

### Security

- Add authentication and support for multiple users
- Implement dynamic rate-limiting for endpoints
- Add local HTTPS support via Docker
- Redact sensitive data in logs and API responses

### Business Features

- Include UI view
- Include A/B testing tools for feature-flagging
- Add continuous deployment
