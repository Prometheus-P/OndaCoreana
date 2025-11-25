"""HallyuLatino Backend API - Placeholder for CI validation."""

from fastapi import FastAPI

app = FastAPI(
    title="HallyuLatino API",
    description="Korean content streaming platform for Latin America",
    version="0.1.0",
)


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}


@app.get("/")
async def root():
    """Root endpoint."""
    return {"message": "HallyuLatino API", "version": "0.1.0"}
