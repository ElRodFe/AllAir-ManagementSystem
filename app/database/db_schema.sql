BEGIN;
-- ================================
-- DROP TABLES
-- ================================
DROP TABLE IF EXISTS public.work_orders CASCADE;
DROP TABLE IF EXISTS public.vehicles CASCADE;
DROP TABLE IF EXISTS public.clients CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
-- ================================
-- ENUM TYPES
-- ================================
DROP TYPE IF EXISTS user_role CASCADE;
CREATE TYPE user_role AS ENUM ('admin', 'employee');
DROP TYPE IF EXISTS work_status CASCADE;
CREATE TYPE work_status AS ENUM ('pending', 'completed');
DROP TYPE IF EXISTS payment_status CASCADE;
CREATE TYPE payment_status AS ENUM ('not_paid', 'paid', 'bill_sent', 'not_requested');
-- ================================
-- USERS TABLE
-- ================================
CREATE TABLE IF NOT EXISTS public.users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(25) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'employee'
);
-- ================================
-- CLIENTS TABLE
-- ================================
CREATE TABLE IF NOT EXISTS public.clients (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    email VARCHAR(50)
);
-- ================================
-- VEHICLES TABLE
-- ================================
CREATE TABLE IF NOT EXISTS public.vehicles (
    id SERIAL PRIMARY KEY,
    vehicle_type VARCHAR(25) NOT NULL,
    brand_model VARCHAR(50) NOT NULL,
    kilometers INTEGER NOT NULL,
    plate_number VARCHAR(25) NOT NULL UNIQUE,
    owner_id INTEGER NOT NULL,
    CONSTRAINT fk_owner_id FOREIGN KEY (owner_id) REFERENCES public.clients (id) ON UPDATE CASCADE ON DELETE CASCADE
);
-- ================================
-- WORK ORDERS TABLE
-- ================================
CREATE TABLE IF NOT EXISTS public.work_orders (
    id SERIAL PRIMARY KEY,
    entry_date DATE NOT NULL,
    egress_date DATE,
    client_id INTEGER NOT NULL,
    vehicle_id INTEGER NOT NULL,
    work_status work_status NOT NULL DEFAULT 'pending',
    payment_status payment_status NOT NULL DEFAULT 'not_paid',
    refrigerant_gas_retrieved INTEGER,
    refrigerant_gas_injected INTEGER,
    oil_retrieved INTEGER,
    oil_injected INTEGER,
    detector BOOLEAN DEFAULT FALSE,
    spare_parts TEXT,
    details TEXT,
    workers VARCHAR(50) NOT NULL,
    hours INTEGER,
    CONSTRAINT fk_workorder_client_id FOREIGN KEY (client_id) REFERENCES public.clients (id) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_workorder_vehicle_id FOREIGN KEY (vehicle_id) REFERENCES public.vehicles (id) ON UPDATE CASCADE ON DELETE CASCADE
);
COMMIT;