export const currentUser = {
    id: 'u1',
    firstName: 'Xavier',
    lastName: 'Garnica',
    email: 'xavier@example.com',
    avatar: 'https://ui-avatars.com/api/?name=Xavier+Garnica&background=6366f1&color=fff',
    location: 'Madrid, Spain'
};

export const initialPersons = [
    {
        id: 'p_andrea',
        firstName: 'Andrea',
        lastName: 'Pérez',
        docType: 'CEDULA',
        docNumber: '0912345678',
        phone: '+593 991234567',
        email: 'andrea.perez@example.com'
    },
    {
        id: 'p_marco',
        firstName: 'Marco',
        lastName: 'Rodríguez',
        docType: 'CEDULA',
        docNumber: '0987654321',
        phone: '+593 998765432',
        email: 'marco.rod@example.com'
    },
    {
        id: 'p_carlos',
        firstName: 'Carlos',
        lastName: 'Mendoza',
        docType: 'CEDULA',
        docNumber: '1102938475',
        phone: '+593 987654321',
        email: 'carlos.m@example.com'
    },
    {
        id: 'p_sofia',
        firstName: 'Sofía',
        lastName: 'Luna',
        docType: 'PASAPORTE',
        docNumber: 'A12345678',
        phone: '+593 999888777',
        email: 'sofia.luna@example.com'
    },
    {
        id: 'p_don_pepe',
        firstName: 'Tienda',
        lastName: 'Don Pepe',
        docType: 'RUC',
        docNumber: '1790011223001',
        phone: '+593 22334455',
        email: 'pedidos@donpepe.com'
    },
    {
        id: 'p_gym',
        firstName: 'Gimnasio',
        lastName: 'Iron Fitness',
        docType: 'RUC',
        docNumber: '1799999999001',
        phone: '+593 2222222',
        email: 'suscripciones@ironfitness.com'
    },
    {
        id: 'p_lucia',
        firstName: 'Lucía',
        lastName: 'García',
        docType: 'CEDULA',
        docNumber: '1718293041',
        phone: '+593 995544332',
        email: 'lucia.g@example.com'
    },
    {
        id: 'p_juan',
        firstName: 'Juan',
        lastName: 'Sánchez',
        docType: 'CEDULA',
        docNumber: '1723456789',
        phone: '+593 990011223',
        email: 'juan.sanchez@example.com'
    }
];

export const initialDebts = [
    {
        id: 'd1',
        type: 'borrowed',
        personId: 'p_andrea',
        counterparty: 'Andrea Pérez',
        amount: 150.00,
        paidAmount: 150.00,
        currency: '$',
        reason: 'Cena de negocios en Nobu',
        medium: 'Transferencia',
        dueDate: '2024-11-01',
        status: 'settled',
        date: '2024-10-15',
        evidence: [],
        payments: [
            { id: 'p1', amount: 75.00, date: '2024-10-20', note: 'Primer abono cena', medium: 'Transferencia' },
            { id: 'p2', amount: 75.00, date: '2024-10-28', note: 'Saldo final cena', medium: 'Transferencia' }
        ]
    },
    {
        id: 'd2',
        type: 'lent',
        personId: 'p_marco',
        counterparty: 'Marco Rodríguez',
        amount: 320.50,
        paidAmount: 0.00,
        currency: '$',
        reason: 'Entradas Concierto Coldplay',
        medium: 'Efectivo',
        dueDate: '2024-12-05',
        status: 'active',
        date: '2024-10-18',
        evidence: [],
        payments: []
    },
    {
        id: 'd3',
        type: 'borrowed',
        personId: 'p_gym',
        counterparty: 'Gimnasio Iron Fitness',
        amount: 120.00,
        paidAmount: 60.00,
        currency: '$',
        reason: 'Membresía Trimestral',
        medium: 'Tarjeta',
        dueDate: '2024-12-10',
        status: 'active',
        date: '2024-10-01',
        evidence: [],
        payments: [
            { id: 'p3', amount: 60.00, date: '2024-10-05', note: 'Primer mes pagado', medium: 'Tarjeta' }
        ]
    },
    {
        id: 'd4',
        type: 'lent',
        personId: 'p_carlos',
        counterparty: 'Carlos Mendoza',
        amount: 500.00,
        paidAmount: 300.00,
        currency: '$',
        reason: 'Préstamo para emergencia médica',
        medium: 'Transferencia',
        dueDate: '2025-01-15',
        status: 'active',
        date: '2024-10-25',
        evidence: [],
        payments: [
            { id: 'p4', amount: 150.00, date: '2024-11-10', note: 'Abono noviembre', medium: 'Transferencia' },
            { id: 'p5', amount: 150.00, date: '2024-12-10', note: 'Abono diciembre', medium: 'Transferencia' }
        ]
    },
    {
        id: 'd5',
        type: 'borrowed',
        personId: 'p_sofia',
        counterparty: 'Sofía Luna',
        amount: 45.00,
        paidAmount: 45.00,
        currency: '$',
        reason: 'Regalo compartido cumpleaños',
        medium: 'Efectivo',
        dueDate: '2024-10-28',
        status: 'settled',
        date: '2024-10-20',
        evidence: [],
        payments: [
            { id: 'p6', amount: 45.00, date: '2024-10-25', note: 'Pago total del regalo', medium: 'Efectivo' }
        ]
    },
    {
        id: 'd6',
        type: 'borrowed',
        personId: 'p_don_pepe',
        counterparty: 'Tienda Don Pepe',
        amount: 25.50,
        paidAmount: 10.00,
        currency: '$',
        reason: 'Víveres de la semana',
        medium: 'Efectivo',
        dueDate: '2024-11-20',
        status: 'active',
        date: '2024-11-05',
        evidence: [],
        payments: [
            { id: 'p7', amount: 10.00, date: '2024-11-12', note: 'Abono parcial de víveres', medium: 'Efectivo' }
        ]
    },
    {
        id: 'd7',
        type: 'lent',
        personId: 'p_lucia',
        counterparty: 'Lucía García',
        amount: 80.00,
        paidAmount: 0.00,
        currency: '$',
        reason: 'Reserva de hotel viaje grupal',
        medium: 'Transferencia',
        dueDate: '2024-12-20',
        status: 'archived',
        date: '2024-11-15',
        evidence: [],
        payments: []
    },
    {
        id: 'd8',
        type: 'lent',
        personId: 'p_juan',
        counterparty: 'Juan Sánchez',
        amount: 1000.00,
        paidAmount: 600.00,
        currency: '$',
        reason: 'Inversión inicial equipo técnico',
        medium: 'Transferencia',
        dueDate: '2025-03-01',
        status: 'active',
        date: '2024-11-01',
        evidence: [],
        payments: [
            { id: 'p8', amount: 200.00, date: '2024-11-15', note: 'Retorno cuota 1', medium: 'Transferencia' },
            { id: 'p9', amount: 200.00, date: '2024-12-15', note: 'Retorno cuota 2', medium: 'Transferencia' },
            { id: 'p10', amount: 200.00, date: '2025-01-15', note: 'Retorno cuota 3', medium: 'Transferencia' }
        ]
    }
];

export const summaryStats = {
    totalLent: 1000.50,
    totalBorrowed: 185.50,
    percentPaid: 45
};
