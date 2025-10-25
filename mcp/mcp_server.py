# MCP (My Custom Protocol) Server with SSE and Redis
#
# This script creates a simple web server using FastAPI that provides:
# 1. A Server-Sent Events (SSE) endpoint at `/stream` for real-time data streaming.
# 2. A connection to a Redis cache to fetch data from.
# 3. A test endpoint at `/data` to POST new data to Redis, which will then be streamed.
#
# == Prerequisites ==
# You must have a Redis server running.
#
# == Installation ==
# 1. Install Python 3.8+
# 2. Install the required libraries:
#    pip install "fastapi[all]" redis
#
# == How to Run ==
# 1. Save this file as `mcp_server.py`.
# 2. Make sure your Redis server is running on localhost:6379 (or update REDIS_HOST/PORT below).
# 3. Run the server using uvicorn:
#    uvicorn mcp_server:app --reload
#
# == How to Test ==
# 1. Connect to the stream. You can use a tool like `curl` in one terminal:
#    curl -N http://localhost:8000/stream
#
# 2. In a *second* terminal, POST some data to the server:
#    curl -X POST http://localhost:8000/data -H "Content-Type: application/json" -d "{\"message\": \"Hello from the agent!\"}"
#
# 3. You will see the JSON string appear in your first terminal (the one running `curl`).

import asyncio
import json
import logging
from contextlib import asynccontextmanager
from typing import AsyncGenerator

import redis.asyncio as redis
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse, StreamingResponse

# --- Configuration ---
REDIS_HOST = "localhost"
REDIS_PORT = 6379
REDIS_LATEST_DATA_KEY = "mcp:latest_data"  # Renamed key for clarity

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# --- Global Redis Connection Pool ---
# We use a global variable for the pool, initialized during startup
redis_pool = None

# --- FastAPI App Lifespan (Startup/Shutdown) ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Handle FastAPI startup and shutdown events.
    """
    global redis_pool
    logger.info("Server starting up...")
    try:
        # Create the Redis connection pool
        redis_pool = redis.ConnectionPool(
            host=REDIS_HOST, port=REDIS_PORT, decode_responses=True
        )
        logger.info(f"Redis connection pool created for {REDIS_HOST}:{REDIS_PORT}")

        # Test the connection
        async with redis.Redis(connection_pool=redis_pool) as r:
            await r.ping()
            logger.info("Successfully connected to Redis.")

    except Exception as e:
        logger.error(f"Failed to connect to Redis: {e}")
        # If Redis connection fails, we might want to stop the app
        # For this example, we'll log the error and continue
        redis_pool = None

    yield  # This is where the application runs

    # --- Shutdown ---
    logger.info("Server shutting down...")
    if redis_pool:
        await redis_pool.disconnect()
        logger.info("Redis connection pool disconnected.")

# --- Initialize FastAPI App ---
app = FastAPI(
    title="MCP Server",
    description="A server for Eleven Labs agents with SSE and Redis.",
    lifespan=lifespan
)

# --- SSE Event Generator ---
async def event_generator(request: Request) -> AsyncGenerator[str, None]:
    """
    The main SSE event generator.
    It polls Redis for new data on the `REDIS_LATEST_DATA_KEY` and streams it to the client.
    """
    if not redis_pool:
        logger.error("Redis pool not available. Cannot start stream.")
        yield "event: error\ndata: Redis connection not available.\n\n"
        return

    logger.info("Client connected to SSE stream.")

    # We will now poll the key for changes.
    # This is less efficient than BLPOP or Pub/Sub but matches the "latest state" requirement.

    last_data_sent = None

    try:
        async with redis.Redis(connection_pool=redis_pool) as r:

            # 1. Send the *current* data immediately on connection
            try:
                current_data = await r.get(REDIS_LATEST_DATA_KEY)
                if current_data:
                    logger.info(f"Sending initial data to client: {current_data}")
                    yield f"data: {current_data}\n\n"
                    last_data_sent = current_data
                else:
                    logger.info("No initial data to send.")

            except Exception as e:
                logger.error(f"Error getting initial data: {e}")
                error_data = json.dumps({"error": str(e)})
                yield f"event: error\ndata: {error_data}\n\n"

            # 2. Start polling for updates
            while True:
                # 2a. Check if the client is still connected
                if await request.is_disconnected():
                    logger.info("Client disconnected.")
                    break

                try:
                    # 2b. Get the current data from the Redis key
                    current_data = await r.get(REDIS_LATEST_DATA_KEY)

                    # 2c. Check if it's new data (and not None)
                    if current_data and current_data != last_data_sent:
                        logger.info(f"Sending updated data to client: {current_data}")

                        # Send the new data
                        yield f"data: {current_data}\n\n"
                        last_data_sent = current_data

                    # 2d. Wait for 1 second before polling again
                    await asyncio.sleep(1)

                except Exception as e:
                    logger.error(f"Error in SSE polling loop: {e}")
                    # Send an error to the client
                    error_data = json.dumps({"error": str(e)})
                    yield f"event: error\ndata: {error_data}\n\n"
                    await asyncio.sleep(5) # Wait before retrying

    except asyncio.CancelledError:
        logger.info("Stream cancelled (client disconnected).")
    except Exception as e:
        logger.error(f"An unexpected error occurred in event_generator: {e}")
    finally:
        logger.info("Closing SSE stream for client.")


# --- API Endpoints ---

@app.get("/")
async def get_root():
    """
    Root endpoint for health checks.
    """
    return {"status": "ok", "message": "MCP Server is running."}


@app.get("/stream")
async def sse_stream(request: Request):
    """
    The main SSE endpoint.
    Clients (like your Eleven Labs agent) connect here to receive real-time data.
    """
    return StreamingResponse(event_generator(request), media_type="text/event-stream")


@app.post("/data")
async def post_data(request: Request):
    """
    A test endpoint to add data to Redis, which will be picked up by the stream.
    This now OVERWRITES the latest data.

    Expects a JSON payload.
    """
    if not redis_pool:
        return JSONResponse(
            status_code=503,
            content={"error": "Redis connection not available."}
        )

    try:
        data = await request.json()
        data_str = json.dumps(data) # Serialize the JSON data to a string

        async with redis.Redis(connection_pool=redis_pool) as r:
            # We use SET to overwrite the value at the key.
            # The event_generator will poll for this change.
            await r.set(REDIS_LATEST_DATA_KEY, data_str)

        logger.info(f"Posted new data to Redis (overwrote): {data_str}")
        return {"status": "ok", "message": "Data updated for streaming."}

    except json.JSONDecodeError:
        return JSONResponse(
            status_code=400,
            content={"error": "Invalid JSON payload."}
        )
    except Exception as e:
        logger.error(f"Error posting data to Redis: {e}")
        return JSONResponse(
            status_code=500,
            content={"error": str(e)}
        )

# This block allows running the script directly with `python mcp_server.py`
# although `uvicorn mcp_server:app --reload` is preferred for development.
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
