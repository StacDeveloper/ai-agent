create table if not exists agents (
    id bigint generated always as identity primary key,
    email text not null unique,
    name text not null,
    password_hash text not null,
    created_at timestamptz not null default now()
);

create table if not exists customers (
    id bigint generated always as identity primary key,
    external_id text not null unique,
    name text not null,
    phone text not null,
    created_at timestamptz not null default now()
);

create table if not exists conversations (
    id bigint generated always as identity primary key,
    customer_id bigint not null references customers(id),
    status text not null default 'open' check (status in ('open', 'closed')),
    last_message_at timestamptz not null default now(),
    created_at timestamptz not null default now()
);

create unique index if not exists one_open_conversation_per_customer
    on conversations (customer_id) where status = 'open';
create index if not exists conversations_recent_idx
    on conversations (last_message_at desc);

create table if not exists messages (
    id bigint generated always as identity primary key,
    conversation_id bigint not null references conversations(id),
    external_id text unique,
    sender text not null check (sender in ('customer', 'agent')),
    agent_id bigint references agents(id),
    text text not null,
    sent_at timestamptz,
    created_at timestamptz not null default now()
);

create index if not exists messages_conversation_idx on messages (conversation_id, id);

create table if not exists drafts (
    id bigint generated always as identity primary key,
    message_id bigint not null unique references messages(id),
    conversation_id bigint not null references conversations(id),
    status text not null default 'pending'
        check (status in ('pending', 'generating', 'ready', 'failed', 'used')),
    text text,
    needs_human boolean not null default false,
    reason text,
    attempts int not null default 0,
    error text,
    model text,
    edited boolean,
    reply_message_id bigint references messages(id),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index if not exists drafts_open_idx on drafts (status) where status in ('pending', 'generating');
create index if not exists drafts_conversation_idx on drafts (conversation_id);

create table if not exists webhook_events (
    id bigint generated always as identity primary key,
    event_id text not null unique,
    brand_id text,
    raw_body text not null,
    status text not null default 'received'
        check (status in ('received', 'processed', 'ignored', 'failed')),
    attempts int not null default 1,
    error text,
    received_at timestamptz not null default now(),
    processed_at timestamptz
);

create index if not exists webhook_events_failed_idx
    on webhook_events (received_at desc) where status = 'failed';