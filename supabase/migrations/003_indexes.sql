-- 003_indexes_updated.sql
-- Indexes for High Performance Queries on Active Tables

-- Indexes for audit logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON public.audit_logs(created_at DESC);

-- Indexes for students lookup and optimization
CREATE INDEX IF NOT EXISTS idx_students_class_roll ON public.students(class_id, roll_no);