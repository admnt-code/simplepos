import asyncio
from app.db.session import AsyncSessionLocal
from app.db.init_db import init_db

async def main():
    async with AsyncSessionLocal() as db:
        await init_db(db)

if __name__ == "__main__":
    asyncio.run(main())
