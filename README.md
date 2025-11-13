# AllAir-ManagementSystem

A full-stack management system for a vehicle A/C workshop, built with FastAPI, PostgreSQL, and React. It allows users to manage clients, vehicles, work orders, and payments efficiently.

## Table of Contents
- [Setup Instructions](#setup-instructions)
- [Database Migration with Alembic](#database-migration-with-alembic)
- [Favorite Quotes](#favorite-quotes)

## Setup Instructions

### Prerequisites
- Python 3.8+
- PostgreSQL database
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/ElRodFe/AllAir-ManagementSystem.git
cd AllAir-ManagementSystem
```

### 2. Create Virtual Environment
```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Configure Environment Variables
Create a `.env` file in the root directory with your database credentials:
```env
DB_URL=postgresql://username:password@host:port/database_name
```

Example for local PostgreSQL:
```env
DB_URL=postgresql://postgres:yourpassword@localhost:5432/allair_db
```

## Database Migration with Alembic

### Initial Setup (First Time)

After cloning the repository and setting up your `.env` file:

```bash
# Apply all existing migrations to your database
alembic upgrade head
```

This will create all the necessary tables in your database:
- Users (with role-based access control)
- Clients (customer information)
- Vehicles (client vehicles)
- work_orders (service/repair jobs)

### Check Migration Status
```bash
# View current migration version
alembic current

# View migration history
alembic history
```

### Creating New Migrations (For Developers)

When you modify the SQLAlchemy models in `app/models/`:

```bash
# 1. Auto-generate migration from model changes
alembic revision --autogenerate -m "Description of your changes"

# 2. Review the generated migration file in alembic/versions/

# 3. Apply the migration
alembic upgrade head
```

### Rolling Back Migrations

```bash
# Rollback one migration
alembic downgrade -1

# Rollback to a specific revision
alembic downgrade <revision_id>

# Rollback all migrations
alembic downgrade base
```

### Common Alembic Commands

| Command | Description |
|---------|-------------|
| `alembic upgrade head` | Apply all pending migrations |
| `alembic downgrade -1` | Rollback the last migration |
| `alembic current` | Show current migration version |
| `alembic history` | Show migration history |
| `alembic revision --autogenerate -m "message"` | Create new migration |

### Database Models

The project includes the following SQLAlchemy models:

- **User** (`app/models/user.py`) - System users with roles (admin/employee)
- **Client** (`app/models/client.py`) - Customer information
- **Vehicle** (`app/models/vehicle.py`) - Client vehicles
- **WorkOrder** (`app/models/work_order.py`) - Service/repair jobs

All models are exported from `app/models/__init__.py` for easy importing.

## Running the Application

```bash
# Start the FastAPI server
uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`

## Favorite Quotes

    Elias's --> "It isn't over until it's over" - Jeffrey R. Holland
    Dicmary's --> "I have not failed. I've just found 10,000 ways that won't work," Thomas A. Edison
    Nico's --> "No matter how bad it is, or how bad it gets" - Unknown
    Steven's --> "Waste no more time arguing what a good man should be. Be One.” – Marcus Aurelius
