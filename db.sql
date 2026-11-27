-- 1. Habilitar extensión para generación de UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Tabla de Anfitriones (Hosts)
CREATE TABLE hosts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    spotify_user_id VARCHAR(255) UNIQUE NOT NULL,
    display_name VARCHAR(255),
    access_token TEXT NOT NULL,
    refresh_token TEXT NOT NULL,
    token_expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabla de Salas / Fiestas (Rooms)
CREATE TABLE rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    host_id UUID NOT NULL REFERENCES hosts(id) ON DELETE CASCADE,
    code VARCHAR(10) NOT NULL,
    name VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    explicit_filter BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice único parcial: evita dos salas activas con el mismo código al mismo tiempo
CREATE UNIQUE INDEX idx_active_room_code ON rooms (code) WHERE (is_active = TRUE);

-- 4. Tabla de Invitados (Guests)
CREATE TABLE guests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    nickname VARCHAR(50),
    joined_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Tabla de Canciones en Cola (Queue Items)
CREATE TABLE queue_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    added_by_guest_id UUID REFERENCES guests(id) ON DELETE SET NULL,
    spotify_track_id VARCHAR(100) NOT NULL,
    spotify_uri VARCHAR(150) NOT NULL,
    title VARCHAR(255) NOT NULL,
    artist VARCHAR(255) NOT NULL,
    album_cover_url TEXT,
    duration_ms INT NOT NULL CHECK (duration_ms <= 420000), -- Regla: Máx 7 minutos
    votes_count INT DEFAULT 0 CHECK (votes_count >= 0),
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'QUEUED', 'PLAYED')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Regla: Evita canciones duplicadas en estado PENDING dentro de la misma sala
CREATE UNIQUE INDEX idx_no_duplicate_pending_tracks
ON queue_items (room_id, spotify_track_id)
WHERE (status = 'PENDING');

-- Índice de rendimiento para ordenar la cola rápido (Votos DESC, Orden de llegada ASC)
CREATE INDEX idx_queue_ordering
ON queue_items (room_id, status, votes_count DESC, created_at ASC);

-- 6. Tabla de Votos (Votes - Lista para la Fase 5)
CREATE TABLE votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    queue_item_id UUID NOT NULL REFERENCES queue_items(id) ON DELETE CASCADE,
    guest_id UUID NOT NULL REFERENCES guests(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    -- Regla: Un invitado solo puede votar 1 vez por canción
    UNIQUE (queue_item_id, guest_id)
);

-- 7. Trigger automático para actualizar votes_count en queue_items (Fase 5)
CREATE OR REPLACE FUNCTION update_votes_count()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE queue_items SET votes_count = votes_count + 1 WHERE id = NEW.queue_item_id;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE queue_items SET votes_count = votes_count - 1 WHERE id = OLD.queue_item_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_votes_count
AFTER INSERT OR DELETE ON votes
FOR EACH ROW EXECUTE FUNCTION update_votes_count();

-- 8. Habilitar Supabase Realtime para actualizaciones en vivo
ALTER PUBLICATION supabase_realtime ADD TABLE rooms, queue_items;


