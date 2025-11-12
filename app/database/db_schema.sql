BEGIN;

DROP TYPE IF EXISTS user_role CASCADE;
CREATE TYPE user_role AS ENUM ('admin', 'employee');

DROP TYPE IF EXISTS work_status CASCADE;
CREATE TYPE work_status AS ENUM ('pending', 'completed');

DROP TYPE IF EXISTS payment_status CASCADE;
CREATE TYPE payment_status AS ENUM ('not_paid', 'paid', 'bill_sent', 'not_requested');

CREATE TABLE IF NOT EXISTS public."Users"
(
    id serial NOT NULL,
    username character varying(25) NOT NULL,
    password character varying(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'employee',
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public."Clients"
(
    id serial NOT NULL,
    name character varying(50) NOT NULL,
    phone_number character varying(20) NOT NULL,
    email character varying(50),
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public."Vehicles"
(
    id serial NOT NULL,
    vehicle_type character varying(25) NOT NULL,
    brand_model character varying(50) NOT NULL,
    kilometers integer NOT NULL,
    plate_number character varying(25) NOT NULL,
    owner_id integer NOT NULL,
	PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.work_orders
(
    id serial NOT NULL,
    entry_date date NOT NULL,
    egress_date date,
    client_id integer NOT NULL,
    vehicle_id integer NOT NULL,
    work_status work_status NOT NULL DEFAULT 'pending',
    payment_status payment_status NOT NULL DEFAULT 'not_paid',
    refrigerant_gas_retrieved integer,
    refrigerant_gas_injected integer,
    oil_retrieved integer,
    oil_injected integer,
    detector boolean,
    spare_parts text,
    details text,
    workers character varying(50) NOT NULL,
    hours integer,
    PRIMARY KEY (id)
);

ALTER TABLE IF EXISTS public."Vehicles"
    ADD CONSTRAINT fk_owner_id FOREIGN KEY (owner_id)
    REFERENCES public."Clients" (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
    NOT VALID;


ALTER TABLE IF EXISTS public.work_orders
    ADD CONSTRAINT client_id FOREIGN KEY (client_id)
    REFERENCES public."Clients" (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
    NOT VALID;


ALTER TABLE IF EXISTS public.work_orders
    ADD CONSTRAINT vehicle_id FOREIGN KEY (vehicle_id)
    REFERENCES public."Vehicles" (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
    NOT VALID;

END;