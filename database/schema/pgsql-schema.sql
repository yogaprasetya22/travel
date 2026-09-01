--
-- PostgreSQL database dump
--

\restrict bGtCzv2ggk9cGgn7JN70vJV0o8jlULL9uwyTTewu0UmmM1whZe1xKkl89R0IgH0

-- Dumped from database version 16.15 (Ubuntu 16.15-1.pgdg24.04+2)
-- Dumped by pg_dump version 16.15 (Ubuntu 16.15-1.pgdg24.04+2)

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: cache; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cache (
    key character varying(255) NOT NULL,
    value text NOT NULL,
    expiration bigint NOT NULL
);


--
-- Name: cache_locks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cache_locks (
    key character varying(255) NOT NULL,
    owner character varying(255) NOT NULL,
    expiration bigint NOT NULL
);


--
-- Name: crm_stages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.crm_stages (
    id bigint NOT NULL,
    tenant_id bigint NOT NULL,
    nama_tahap character varying(255) NOT NULL,
    urutan integer NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: crm_stages_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.crm_stages_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: crm_stages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.crm_stages_id_seq OWNED BY public.crm_stages.id;


--
-- Name: failed_jobs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.failed_jobs (
    id bigint NOT NULL,
    uuid character varying(255) NOT NULL,
    connection character varying(255) NOT NULL,
    queue character varying(255) NOT NULL,
    payload text NOT NULL,
    exception text NOT NULL,
    failed_at timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: failed_jobs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.failed_jobs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: failed_jobs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.failed_jobs_id_seq OWNED BY public.failed_jobs.id;


--
-- Name: inventaris; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.inventaris (
    id bigint NOT NULL,
    tenant_id bigint NOT NULL,
    nama_barang character varying(255) NOT NULL,
    stok_tersedia integer DEFAULT 0 NOT NULL,
    stok_minimum integer DEFAULT 0 NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: inventaris_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.inventaris_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: inventaris_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.inventaris_id_seq OWNED BY public.inventaris.id;


--
-- Name: inventaris_transaksi; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.inventaris_transaksi (
    id bigint NOT NULL,
    tenant_id bigint NOT NULL,
    inventaris_id bigint NOT NULL,
    jamaah_id bigint,
    qty integer NOT NULL,
    tipe character varying(255) NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    CONSTRAINT inventaris_transaksi_tipe_check CHECK (((tipe)::text = ANY ((ARRAY['IN'::character varying, 'OUT'::character varying])::text[])))
);


--
-- Name: inventaris_transaksi_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.inventaris_transaksi_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: inventaris_transaksi_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.inventaris_transaksi_id_seq OWNED BY public.inventaris_transaksi.id;


--
-- Name: jamaah; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.jamaah (
    id bigint NOT NULL,
    tenant_id bigint NOT NULL,
    agen_id bigint,
    crm_stage_id bigint NOT NULL,
    nama_lengkap character varying(255) NOT NULL,
    nik character varying(255),
    no_hp character varying(255) NOT NULL,
    email character varying(255),
    paket_id bigint NOT NULL,
    catatan_admin text,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: jamaah_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.jamaah_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: jamaah_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.jamaah_id_seq OWNED BY public.jamaah.id;


--
-- Name: job_batches; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.job_batches (
    id character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    total_jobs integer NOT NULL,
    pending_jobs integer NOT NULL,
    failed_jobs integer NOT NULL,
    failed_job_ids text NOT NULL,
    options text,
    cancelled_at integer,
    created_at integer NOT NULL,
    finished_at integer
);


--
-- Name: jobs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.jobs (
    id bigint NOT NULL,
    queue character varying(255) NOT NULL,
    payload text NOT NULL,
    attempts smallint NOT NULL,
    reserved_at integer,
    available_at integer NOT NULL,
    created_at integer NOT NULL
);


--
-- Name: jobs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.jobs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: jobs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.jobs_id_seq OWNED BY public.jobs.id;


--
-- Name: komisi_agen; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.komisi_agen (
    id bigint NOT NULL,
    tenant_id bigint NOT NULL,
    agen_id bigint NOT NULL,
    jamaah_id bigint NOT NULL,
    nominal_komisi numeric(15,2) NOT NULL,
    status_pencairan character varying(255) DEFAULT 'Pending'::character varying NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    CONSTRAINT komisi_agen_status_pencairan_check CHECK (((status_pencairan)::text = ANY ((ARRAY['Pending'::character varying, 'Ready_to_Pay'::character varying, 'Paid'::character varying])::text[])))
);


--
-- Name: komisi_agen_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.komisi_agen_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: komisi_agen_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.komisi_agen_id_seq OWNED BY public.komisi_agen.id;


--
-- Name: menus; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.menus (
    id bigint NOT NULL,
    parent_id bigint,
    title character varying(255) NOT NULL,
    url character varying(255) NOT NULL,
    icon character varying(255),
    roles json NOT NULL,
    urutan integer DEFAULT 0 NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: menus_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.menus_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: menus_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.menus_id_seq OWNED BY public.menus.id;


--
-- Name: migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.migrations (
    id integer NOT NULL,
    migration character varying(255) NOT NULL,
    batch integer NOT NULL
);


--
-- Name: migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.migrations_id_seq OWNED BY public.migrations.id;


--
-- Name: override_komisi_agen; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.override_komisi_agen (
    id bigint NOT NULL,
    tenant_id bigint NOT NULL,
    paket_id bigint NOT NULL,
    agen_id bigint NOT NULL,
    komisi_flat numeric(15,2),
    komisi_persentase numeric(5,2),
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: override_komisi_agen_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.override_komisi_agen_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: override_komisi_agen_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.override_komisi_agen_id_seq OWNED BY public.override_komisi_agen.id;


--
-- Name: paket; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.paket (
    id bigint NOT NULL,
    tenant_id bigint NOT NULL,
    nama_paket character varying(255) NOT NULL,
    harga numeric(15,2) NOT NULL,
    komisi_flat numeric(15,2) DEFAULT '0'::numeric NOT NULL,
    komisi_persentase numeric(5,2) DEFAULT '0'::numeric NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: paket_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.paket_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: paket_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.paket_id_seq OWNED BY public.paket.id;


--
-- Name: paket_inventaris; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.paket_inventaris (
    id bigint NOT NULL,
    paket_id bigint NOT NULL,
    inventaris_id bigint NOT NULL,
    qty integer NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: paket_inventaris_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.paket_inventaris_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: paket_inventaris_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.paket_inventaris_id_seq OWNED BY public.paket_inventaris.id;


--
-- Name: password_reset_tokens; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.password_reset_tokens (
    email character varying(255) NOT NULL,
    token character varying(255) NOT NULL,
    created_at timestamp(0) without time zone
);


--
-- Name: pembayaran; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pembayaran (
    id bigint NOT NULL,
    tenant_id bigint NOT NULL,
    jamaah_id bigint NOT NULL,
    rekening_tenant_id bigint NOT NULL,
    tipe_pembayaran character varying(255) NOT NULL,
    nominal numeric(15,2) NOT NULL,
    bukti_transfer character varying(255),
    status_verifikasi character varying(255) DEFAULT 'Pending'::character varying NOT NULL,
    verified_by bigint,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    CONSTRAINT pembayaran_status_verifikasi_check CHECK (((status_verifikasi)::text = ANY ((ARRAY['Pending'::character varying, 'Verified'::character varying, 'Rejected'::character varying])::text[]))),
    CONSTRAINT pembayaran_tipe_pembayaran_check CHECK (((tipe_pembayaran)::text = ANY ((ARRAY['DP'::character varying, 'Cicilan'::character varying, 'Lunas'::character varying])::text[])))
);


--
-- Name: pembayaran_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.pembayaran_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: pembayaran_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.pembayaran_id_seq OWNED BY public.pembayaran.id;


--
-- Name: rekening_tenant; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.rekening_tenant (
    id bigint NOT NULL,
    tenant_id bigint NOT NULL,
    nama_bank character varying(255) NOT NULL,
    nomor_rekening character varying(255) NOT NULL,
    atas_nama character varying(255) NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: rekening_tenant_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.rekening_tenant_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: rekening_tenant_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.rekening_tenant_id_seq OWNED BY public.rekening_tenant.id;


--
-- Name: sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sessions (
    id character varying(255) NOT NULL,
    user_id bigint,
    ip_address character varying(45),
    user_agent text,
    payload text NOT NULL,
    last_activity integer NOT NULL
);


--
-- Name: tenants; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tenants (
    id bigint NOT NULL,
    nama_travel character varying(255) NOT NULL,
    domain_atau_subdomain character varying(255) NOT NULL,
    logo character varying(255),
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: tenants_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.tenants_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: tenants_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.tenants_id_seq OWNED BY public.tenants.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id bigint NOT NULL,
    tenant_id bigint,
    name character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    email_verified_at timestamp(0) without time zone,
    password character varying(255) NOT NULL,
    role character varying(255) NOT NULL,
    remember_token character varying(100),
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    CONSTRAINT users_role_check CHECK (((role)::text = ANY ((ARRAY['super_admin_master'::character varying, 'owner_travel'::character varying, 'admin_travel'::character varying, 'agen'::character varying])::text[])))
);


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: crm_stages id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.crm_stages ALTER COLUMN id SET DEFAULT nextval('public.crm_stages_id_seq'::regclass);


--
-- Name: failed_jobs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.failed_jobs ALTER COLUMN id SET DEFAULT nextval('public.failed_jobs_id_seq'::regclass);


--
-- Name: inventaris id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventaris ALTER COLUMN id SET DEFAULT nextval('public.inventaris_id_seq'::regclass);


--
-- Name: inventaris_transaksi id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventaris_transaksi ALTER COLUMN id SET DEFAULT nextval('public.inventaris_transaksi_id_seq'::regclass);


--
-- Name: jamaah id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.jamaah ALTER COLUMN id SET DEFAULT nextval('public.jamaah_id_seq'::regclass);


--
-- Name: jobs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.jobs ALTER COLUMN id SET DEFAULT nextval('public.jobs_id_seq'::regclass);


--
-- Name: komisi_agen id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.komisi_agen ALTER COLUMN id SET DEFAULT nextval('public.komisi_agen_id_seq'::regclass);


--
-- Name: menus id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.menus ALTER COLUMN id SET DEFAULT nextval('public.menus_id_seq'::regclass);


--
-- Name: migrations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.migrations ALTER COLUMN id SET DEFAULT nextval('public.migrations_id_seq'::regclass);


--
-- Name: override_komisi_agen id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.override_komisi_agen ALTER COLUMN id SET DEFAULT nextval('public.override_komisi_agen_id_seq'::regclass);


--
-- Name: paket id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.paket ALTER COLUMN id SET DEFAULT nextval('public.paket_id_seq'::regclass);


--
-- Name: paket_inventaris id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.paket_inventaris ALTER COLUMN id SET DEFAULT nextval('public.paket_inventaris_id_seq'::regclass);


--
-- Name: pembayaran id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pembayaran ALTER COLUMN id SET DEFAULT nextval('public.pembayaran_id_seq'::regclass);


--
-- Name: rekening_tenant id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rekening_tenant ALTER COLUMN id SET DEFAULT nextval('public.rekening_tenant_id_seq'::regclass);


--
-- Name: tenants id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tenants ALTER COLUMN id SET DEFAULT nextval('public.tenants_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: cache_locks cache_locks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cache_locks
    ADD CONSTRAINT cache_locks_pkey PRIMARY KEY (key);


--
-- Name: cache cache_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cache
    ADD CONSTRAINT cache_pkey PRIMARY KEY (key);


--
-- Name: crm_stages crm_stages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.crm_stages
    ADD CONSTRAINT crm_stages_pkey PRIMARY KEY (id);


--
-- Name: failed_jobs failed_jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.failed_jobs
    ADD CONSTRAINT failed_jobs_pkey PRIMARY KEY (id);


--
-- Name: failed_jobs failed_jobs_uuid_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.failed_jobs
    ADD CONSTRAINT failed_jobs_uuid_unique UNIQUE (uuid);


--
-- Name: inventaris inventaris_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventaris
    ADD CONSTRAINT inventaris_pkey PRIMARY KEY (id);


--
-- Name: inventaris_transaksi inventaris_transaksi_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventaris_transaksi
    ADD CONSTRAINT inventaris_transaksi_pkey PRIMARY KEY (id);


--
-- Name: jamaah jamaah_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.jamaah
    ADD CONSTRAINT jamaah_pkey PRIMARY KEY (id);


--
-- Name: job_batches job_batches_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_batches
    ADD CONSTRAINT job_batches_pkey PRIMARY KEY (id);


--
-- Name: jobs jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_pkey PRIMARY KEY (id);


--
-- Name: komisi_agen komisi_agen_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.komisi_agen
    ADD CONSTRAINT komisi_agen_pkey PRIMARY KEY (id);


--
-- Name: menus menus_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.menus
    ADD CONSTRAINT menus_pkey PRIMARY KEY (id);


--
-- Name: migrations migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (id);


--
-- Name: override_komisi_agen override_komisi_agen_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.override_komisi_agen
    ADD CONSTRAINT override_komisi_agen_pkey PRIMARY KEY (id);


--
-- Name: paket_inventaris paket_inventaris_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.paket_inventaris
    ADD CONSTRAINT paket_inventaris_pkey PRIMARY KEY (id);


--
-- Name: paket paket_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.paket
    ADD CONSTRAINT paket_pkey PRIMARY KEY (id);


--
-- Name: password_reset_tokens password_reset_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_pkey PRIMARY KEY (email);


--
-- Name: pembayaran pembayaran_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pembayaran
    ADD CONSTRAINT pembayaran_pkey PRIMARY KEY (id);


--
-- Name: rekening_tenant rekening_tenant_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rekening_tenant
    ADD CONSTRAINT rekening_tenant_pkey PRIMARY KEY (id);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: tenants tenants_domain_atau_subdomain_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tenants
    ADD CONSTRAINT tenants_domain_atau_subdomain_unique UNIQUE (domain_atau_subdomain);


--
-- Name: tenants tenants_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tenants
    ADD CONSTRAINT tenants_pkey PRIMARY KEY (id);


--
-- Name: users users_email_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_unique UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: cache_expiration_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX cache_expiration_index ON public.cache USING btree (expiration);


--
-- Name: cache_locks_expiration_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX cache_locks_expiration_index ON public.cache_locks USING btree (expiration);


--
-- Name: crm_stages_tenant_id_urutan_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX crm_stages_tenant_id_urutan_index ON public.crm_stages USING btree (tenant_id, urutan);


--
-- Name: failed_jobs_connection_queue_failed_at_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX failed_jobs_connection_queue_failed_at_index ON public.failed_jobs USING btree (connection, queue, failed_at);


--
-- Name: inventaris_tenant_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX inventaris_tenant_id_index ON public.inventaris USING btree (tenant_id);


--
-- Name: inventaris_transaksi_tenant_id_inventaris_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX inventaris_transaksi_tenant_id_inventaris_id_index ON public.inventaris_transaksi USING btree (tenant_id, inventaris_id);


--
-- Name: jamaah_tenant_id_agen_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX jamaah_tenant_id_agen_id_index ON public.jamaah USING btree (tenant_id, agen_id);


--
-- Name: jamaah_tenant_id_crm_stage_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX jamaah_tenant_id_crm_stage_id_index ON public.jamaah USING btree (tenant_id, crm_stage_id);


--
-- Name: jobs_queue_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX jobs_queue_index ON public.jobs USING btree (queue);


--
-- Name: komisi_agen_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX komisi_agen_idx ON public.komisi_agen USING btree (tenant_id, agen_id, status_pencairan);


--
-- Name: override_komisi_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX override_komisi_idx ON public.override_komisi_agen USING btree (tenant_id, paket_id, agen_id);


--
-- Name: paket_inventaris_paket_id_inventaris_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX paket_inventaris_paket_id_inventaris_id_index ON public.paket_inventaris USING btree (paket_id, inventaris_id);


--
-- Name: paket_tenant_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX paket_tenant_id_index ON public.paket USING btree (tenant_id);


--
-- Name: pembayaran_tenant_id_status_verifikasi_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX pembayaran_tenant_id_status_verifikasi_index ON public.pembayaran USING btree (tenant_id, status_verifikasi);


--
-- Name: rekening_tenant_tenant_id_is_active_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX rekening_tenant_tenant_id_is_active_index ON public.rekening_tenant USING btree (tenant_id, is_active);


--
-- Name: sessions_last_activity_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX sessions_last_activity_index ON public.sessions USING btree (last_activity);


--
-- Name: sessions_user_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX sessions_user_id_index ON public.sessions USING btree (user_id);


--
-- Name: users_tenant_id_role_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX users_tenant_id_role_index ON public.users USING btree (tenant_id, role);


--
-- Name: users 1; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "1" FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: crm_stages crm_stages_tenant_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.crm_stages
    ADD CONSTRAINT crm_stages_tenant_id_foreign FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: inventaris inventaris_tenant_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventaris
    ADD CONSTRAINT inventaris_tenant_id_foreign FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: inventaris_transaksi inventaris_transaksi_inventaris_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventaris_transaksi
    ADD CONSTRAINT inventaris_transaksi_inventaris_id_foreign FOREIGN KEY (inventaris_id) REFERENCES public.inventaris(id) ON DELETE CASCADE;


--
-- Name: inventaris_transaksi inventaris_transaksi_jamaah_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventaris_transaksi
    ADD CONSTRAINT inventaris_transaksi_jamaah_id_foreign FOREIGN KEY (jamaah_id) REFERENCES public.jamaah(id) ON DELETE SET NULL;


--
-- Name: inventaris_transaksi inventaris_transaksi_tenant_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventaris_transaksi
    ADD CONSTRAINT inventaris_transaksi_tenant_id_foreign FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: jamaah jamaah_agen_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.jamaah
    ADD CONSTRAINT jamaah_agen_id_foreign FOREIGN KEY (agen_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: jamaah jamaah_crm_stage_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.jamaah
    ADD CONSTRAINT jamaah_crm_stage_id_foreign FOREIGN KEY (crm_stage_id) REFERENCES public.crm_stages(id) ON DELETE RESTRICT;


--
-- Name: jamaah jamaah_paket_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.jamaah
    ADD CONSTRAINT jamaah_paket_id_foreign FOREIGN KEY (paket_id) REFERENCES public.paket(id) ON DELETE RESTRICT;


--
-- Name: jamaah jamaah_tenant_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.jamaah
    ADD CONSTRAINT jamaah_tenant_id_foreign FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: komisi_agen komisi_agen_agen_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.komisi_agen
    ADD CONSTRAINT komisi_agen_agen_id_foreign FOREIGN KEY (agen_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: komisi_agen komisi_agen_jamaah_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.komisi_agen
    ADD CONSTRAINT komisi_agen_jamaah_id_foreign FOREIGN KEY (jamaah_id) REFERENCES public.jamaah(id) ON DELETE CASCADE;


--
-- Name: komisi_agen komisi_agen_tenant_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.komisi_agen
    ADD CONSTRAINT komisi_agen_tenant_id_foreign FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: menus menus_parent_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.menus
    ADD CONSTRAINT menus_parent_id_foreign FOREIGN KEY (parent_id) REFERENCES public.menus(id) ON DELETE CASCADE;


--
-- Name: override_komisi_agen override_komisi_agen_agen_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.override_komisi_agen
    ADD CONSTRAINT override_komisi_agen_agen_id_foreign FOREIGN KEY (agen_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: override_komisi_agen override_komisi_agen_paket_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.override_komisi_agen
    ADD CONSTRAINT override_komisi_agen_paket_id_foreign FOREIGN KEY (paket_id) REFERENCES public.paket(id) ON DELETE CASCADE;


--
-- Name: override_komisi_agen override_komisi_agen_tenant_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.override_komisi_agen
    ADD CONSTRAINT override_komisi_agen_tenant_id_foreign FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: paket_inventaris paket_inventaris_inventaris_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.paket_inventaris
    ADD CONSTRAINT paket_inventaris_inventaris_id_foreign FOREIGN KEY (inventaris_id) REFERENCES public.inventaris(id) ON DELETE CASCADE;


--
-- Name: paket_inventaris paket_inventaris_paket_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.paket_inventaris
    ADD CONSTRAINT paket_inventaris_paket_id_foreign FOREIGN KEY (paket_id) REFERENCES public.paket(id) ON DELETE CASCADE;


--
-- Name: paket paket_tenant_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.paket
    ADD CONSTRAINT paket_tenant_id_foreign FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: pembayaran pembayaran_jamaah_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pembayaran
    ADD CONSTRAINT pembayaran_jamaah_id_foreign FOREIGN KEY (jamaah_id) REFERENCES public.jamaah(id) ON DELETE CASCADE;


--
-- Name: pembayaran pembayaran_rekening_tenant_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pembayaran
    ADD CONSTRAINT pembayaran_rekening_tenant_id_foreign FOREIGN KEY (rekening_tenant_id) REFERENCES public.rekening_tenant(id) ON DELETE RESTRICT;


--
-- Name: pembayaran pembayaran_tenant_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pembayaran
    ADD CONSTRAINT pembayaran_tenant_id_foreign FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: pembayaran pembayaran_verified_by_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pembayaran
    ADD CONSTRAINT pembayaran_verified_by_foreign FOREIGN KEY (verified_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: rekening_tenant rekening_tenant_tenant_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rekening_tenant
    ADD CONSTRAINT rekening_tenant_tenant_id_foreign FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict bGtCzv2ggk9cGgn7JN70vJV0o8jlULL9uwyTTewu0UmmM1whZe1xKkl89R0IgH0

--
-- PostgreSQL database dump
--

\restrict 3Rg0XXPWzq7byTLIRvOWhpSVnc7YLR1TfwMvlGQp07yhkzbaGpLg4QvGGTOxSbi

-- Dumped from database version 16.15 (Ubuntu 16.15-1.pgdg24.04+2)
-- Dumped by pg_dump version 16.15 (Ubuntu 16.15-1.pgdg24.04+2)

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
-- Data for Name: migrations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.migrations (id, migration, batch) FROM stdin;
1	0000_00_00_000000_create_tenants_table	1
2	0001_01_01_000000_create_users_table	1
3	0001_01_01_000001_create_cache_table	1
4	0001_01_01_000002_create_jobs_table	1
5	2026_08_31_000001_create_system_tables	1
6	2026_08_31_080901_create_menus_table	1
\.


--
-- Name: migrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.migrations_id_seq', 6, true);


--
-- PostgreSQL database dump complete
--

\unrestrict 3Rg0XXPWzq7byTLIRvOWhpSVnc7YLR1TfwMvlGQp07yhkzbaGpLg4QvGGTOxSbi

