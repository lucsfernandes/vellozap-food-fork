-- Adicionar novas colunas na tabela employees para controle de pagamentos
ALTER TABLE employees
ADD COLUMN payment_type text CHECK (
    payment_type IN ('daily', 'hourly', 'monthly')
),
ADD COLUMN payment_value numeric(10, 2),
ADD COLUMN pix_key text,
ADD COLUMN bank_name text,
ADD COLUMN agency text,
ADD COLUMN account text;

-- Criar tabela para registrar trabalho realizado
CREATE TABLE employee_work_records (
    id uuid DEFAULT gen_random_uuid () PRIMARY KEY,
    employee_id uuid REFERENCES employees (id) ON DELETE CASCADE NOT NULL,
    work_date date NOT NULL,
    hours_worked numeric(4, 2),
    days_worked integer,
    created_at timestamp
    with
        time zone DEFAULT now (),
        updated_at timestamp
    with
        time zone DEFAULT now ()
);

-- Criar tabela para controle de pagamentos
CREATE TABLE employee_payments (
    id uuid DEFAULT gen_random_uuid () PRIMARY KEY,
    employee_id uuid REFERENCES employees (id) ON DELETE CASCADE NOT NULL,
    period_start date NOT NULL,
    period_end date NOT NULL,
    total_days numeric(5, 2),
    total_hours numeric(8, 2),
    total_amount numeric(10, 2) NOT NULL,
    payment_status text DEFAULT 'pending' CHECK (
        payment_status IN ('pending', 'paid')
    ),
    payment_date timestamp
    with
        time zone,
        created_at timestamp
    with
        time zone DEFAULT now (),
        updated_at timestamp
    with
        time zone DEFAULT now ()
);

-- Habilitar RLS nas novas tabelas
ALTER TABLE employee_work_records ENABLE ROW LEVEL SECURITY;

ALTER TABLE employee_payments ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para employee_work_records
CREATE POLICY "Restaurant owners can manage work records" ON employee_work_records FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM
            employees e
            JOIN restaurant_profiles rp ON e.restaurant_id = rp.id
        WHERE
            e.id = employee_work_records.employee_id
            AND rp.user_id = auth.uid ()
    )
);

-- Políticas RLS para employee_payments
CREATE POLICY "Restaurant owners can manage payments" ON employee_payments FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM
            employees e
            JOIN restaurant_profiles rp ON e.restaurant_id = rp.id
        WHERE
            e.id = employee_payments.employee_id
            AND rp.user_id = auth.uid ()
    )
);