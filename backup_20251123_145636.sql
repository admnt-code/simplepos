--
-- PostgreSQL database dump
--

\restrict glVytPkYN9efI7fYNBp7Ceu618nhSlcswBUdUrPLU0BL88poYtceVPUmYWl18Xy

-- Dumped from database version 15.15
-- Dumped by pg_dump version 15.15

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: productcategory; Type: TYPE; Schema: public; Owner: vereinskasse
--

CREATE TYPE public.productcategory AS ENUM (
    'DRINKS',
    'SNACKS',
    'FOOD',
    'OTHER'
);


ALTER TYPE public.productcategory OWNER TO vereinskasse;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: products; Type: TABLE; Schema: public; Owner: vereinskasse
--

CREATE TABLE public.products (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    variant character varying(50),
    category public.productcategory NOT NULL,
    member_price double precision NOT NULL,
    guest_price double precision NOT NULL,
    tax_rate double precision NOT NULL,
    stock_quantity integer DEFAULT 0,
    track_stock boolean DEFAULT false,
    is_available boolean DEFAULT true NOT NULL,
    sort_order integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.products OWNER TO vereinskasse;

--
-- Name: products_id_seq; Type: SEQUENCE; Schema: public; Owner: vereinskasse
--

CREATE SEQUENCE public.products_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.products_id_seq OWNER TO vereinskasse;

--
-- Name: products_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: vereinskasse
--

ALTER SEQUENCE public.products_id_seq OWNED BY public.products.id;


--
-- Name: transactions; Type: TABLE; Schema: public; Owner: vereinskasse
--

CREATE TABLE public.transactions (
    id integer NOT NULL,
    transaction_reference character varying(50),
    user_id integer,
    transaction_type character varying(50) NOT NULL,
    status character varying(50) NOT NULL,
    amount double precision NOT NULL,
    balance_before double precision,
    balance_after double precision,
    payment_method character varying(50),
    sumup_checkout_id character varying(100),
    sumup_transaction_code character varying(100),
    transfer_to_user_id integer,
    description text,
    created_by_admin_id integer,
    created_at timestamp without time zone DEFAULT now(),
    completed_at timestamp without time zone
);


ALTER TABLE public.transactions OWNER TO vereinskasse;

--
-- Name: transactions_id_seq; Type: SEQUENCE; Schema: public; Owner: vereinskasse
--

CREATE SEQUENCE public.transactions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.transactions_id_seq OWNER TO vereinskasse;

--
-- Name: transactions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: vereinskasse
--

ALTER SEQUENCE public.transactions_id_seq OWNED BY public.transactions.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: vereinskasse
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying(50) NOT NULL,
    email character varying(100) NOT NULL,
    hashed_password character varying(255) NOT NULL,
    rfid_token character varying(100),
    first_name character varying(100) NOT NULL,
    last_name character varying(100) NOT NULL,
    balance double precision DEFAULT 0.0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    is_admin boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now(),
    last_login timestamp without time zone
);


ALTER TABLE public.users OWNER TO vereinskasse;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: vereinskasse
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.users_id_seq OWNER TO vereinskasse;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: vereinskasse
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: products id; Type: DEFAULT; Schema: public; Owner: vereinskasse
--

ALTER TABLE ONLY public.products ALTER COLUMN id SET DEFAULT nextval('public.products_id_seq'::regclass);


--
-- Name: transactions id; Type: DEFAULT; Schema: public; Owner: vereinskasse
--

ALTER TABLE ONLY public.transactions ALTER COLUMN id SET DEFAULT nextval('public.transactions_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: vereinskasse
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: vereinskasse
--

COPY public.products (id, name, description, variant, category, member_price, guest_price, tax_rate, stock_quantity, track_stock, is_available, sort_order, created_at, updated_at) FROM stdin;
1	Bier	\N	0.5L	DRINKS	2.5	3.5	0.19	0	f	t	1	2025-11-20 19:17:37.065239	2025-11-20 19:17:37.065239
2	Cola	\N	0.33L	DRINKS	2	2.5	0.19	0	f	t	2	2025-11-20 19:17:37.065239	2025-11-20 19:17:37.065239
3	Wasser	\N	0.5L	DRINKS	1.5	2	0.07	0	f	t	3	2025-11-20 19:17:37.065239	2025-11-20 19:17:37.065239
\.


--
-- Data for Name: transactions; Type: TABLE DATA; Schema: public; Owner: vereinskasse
--

COPY public.transactions (id, transaction_reference, user_id, transaction_type, status, amount, balance_before, balance_after, payment_method, sumup_checkout_id, sumup_transaction_code, transfer_to_user_id, description, created_by_admin_id, created_at, completed_at) FROM stdin;
3	TXN-20251121101250-2	2	purchase	successful	5	42	37	balance	\N	\N	\N	Warenkorb: 2x Bier	\N	2025-11-21 10:12:50.556212	\N
4	TXN-20251121101259-2	2	purchase	successful	3	37	34	balance	\N	\N	\N	Warenkorb: 2x Wasser	\N	2025-11-21 10:12:59.374755	\N
5	TXN-20251121102759-2	2	purchase	successful	1.5	34	32.5	balance	\N	\N	\N	Warenkorb: 1x Wasser	\N	2025-11-21 10:27:59.601418	\N
1	TXN-20251121100931-2	2	purchase	successful	4	50	46	balance	\N	\N	\N	Warenkorb: 2x Cola	\N	2025-11-21 10:09:31.602765	\N
2	TXN-20251121101157-2	2	purchase	successful	4	46	42	balance	\N	\N	\N	Warenkorb: 2x Cola	\N	2025-11-21 10:11:57.184923	\N
6	TXN-20251121232133-2	2	purchase	successful	6	32.5	26.5	balance	\N	\N	\N	Warenkorb: 1x Bier, 1x Wasser, 1x Cola	\N	2025-11-21 23:21:33.902584	\N
7	TXN-20251122011455-2	2	purchase	successful	1.5	26.5	25	balance	\N	\N	\N	Warenkorb: 1x Wasser	\N	2025-11-22 01:14:55.65528	\N
8	TXN-20251122012348-2	2	purchase	successful	1.5	25	23.5	balance	\N	\N	\N	Warenkorb: 1x Wasser	\N	2025-11-22 01:23:48.321931	\N
9	TXN-20251122013125-2	2	purchase	successful	2	23.5	21.5	balance	\N	\N	\N	Warenkorb: 1x Cola	\N	2025-11-22 01:31:25.85051	\N
10	TXN-20251122013141-2	2	purchase	successful	5	21.5	16.5	balance	\N	\N	\N	Warenkorb: 2x Bier	\N	2025-11-22 01:31:41.960479	\N
11	TXN-20251122013211-2	2	purchase	successful	4	16.5	12.5	balance	\N	\N	\N	Warenkorb: 2x Cola	\N	2025-11-22 01:32:11.707526	\N
12	TXN-20251123131430-2	2	purchase	successful	4	12.5	8.5	balance	\N	\N	\N	Warenkorb: 2x Cola	\N	2025-11-23 13:14:30.708086	\N
13	TXN-20251123132235-2	2	purchase	successful	1.5	8.5	7	balance	\N	\N	\N	Warenkorb: 1x Wasser	\N	2025-11-23 13:22:35.496519	\N
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: vereinskasse
--

COPY public.users (id, username, email, hashed_password, rfid_token, first_name, last_name, balance, is_active, is_admin, created_at, updated_at, last_login) FROM stdin;
2	test	test@localhost.localdomain	$2b$12$bY1YB/cC3hYy9x.dUmdiqOSwrNI6OSrA/GIOWEHNjci0hKQQbfXw2	\N	Test	User	7	t	f	2025-11-20 19:17:37.065239	2025-11-23 13:22:35.496933	2025-11-23 13:17:13.697252
1	admin	admin@localhost.localdomain	$2b$12$438Z5TaKMoznkClA8fddzOd/T8aRYIumEQAaU4wr5Cc24Zixr4ooG	\N	Admin	User	0	t	t	2025-11-20 19:17:37.065239	2025-11-21 13:24:43.958117	2025-11-21 13:24:43.957352
\.


--
-- Name: products_id_seq; Type: SEQUENCE SET; Schema: public; Owner: vereinskasse
--

SELECT pg_catalog.setval('public.products_id_seq', 3, true);


--
-- Name: transactions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: vereinskasse
--

SELECT pg_catalog.setval('public.transactions_id_seq', 13, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: vereinskasse
--

SELECT pg_catalog.setval('public.users_id_seq', 2, true);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: vereinskasse
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: transactions transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: vereinskasse
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_pkey PRIMARY KEY (id);


--
-- Name: transactions transactions_transaction_reference_key; Type: CONSTRAINT; Schema: public; Owner: vereinskasse
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_transaction_reference_key UNIQUE (transaction_reference);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: vereinskasse
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: vereinskasse
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_rfid_token_key; Type: CONSTRAINT; Schema: public; Owner: vereinskasse
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_rfid_token_key UNIQUE (rfid_token);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: vereinskasse
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: idx_transactions_created_at; Type: INDEX; Schema: public; Owner: vereinskasse
--

CREATE INDEX idx_transactions_created_at ON public.transactions USING btree (created_at);


--
-- Name: idx_transactions_type; Type: INDEX; Schema: public; Owner: vereinskasse
--

CREATE INDEX idx_transactions_type ON public.transactions USING btree (transaction_type);


--
-- Name: idx_transactions_user_id; Type: INDEX; Schema: public; Owner: vereinskasse
--

CREATE INDEX idx_transactions_user_id ON public.transactions USING btree (user_id);


--
-- Name: transactions transactions_created_by_admin_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: vereinskasse
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_created_by_admin_id_fkey FOREIGN KEY (created_by_admin_id) REFERENCES public.users(id);


--
-- Name: transactions transactions_transfer_to_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: vereinskasse
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_transfer_to_user_id_fkey FOREIGN KEY (transfer_to_user_id) REFERENCES public.users(id);


--
-- Name: transactions transactions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: vereinskasse
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- PostgreSQL database dump complete
--

\unrestrict glVytPkYN9efI7fYNBp7Ceu618nhSlcswBUdUrPLU0BL88poYtceVPUmYWl18Xy

