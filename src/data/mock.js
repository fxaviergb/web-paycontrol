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
        lastName: 'P.',
        docType: 'CEDULA',
        docNumber: '0912345678',
        phone: '+593 991234567',
        email: 'andrea@example.com'
    },
    {
        id: 'p_marco',
        firstName: 'Marco',
        lastName: 'R.',
        docType: 'CEDULA',
        docNumber: '0987654321',
        phone: '+593 998765432',
        email: 'marco@example.com'
    },
    {
        id: 'p_carlos',
        firstName: 'Carlos',
        lastName: 'M.',
        docType: 'CEDULA',
        docNumber: '1102938475',
        phone: '+593 987654321',
        email: 'carlos@example.com'
    },
    {
        id: 'p_sofia',
        firstName: 'Sofía',
        lastName: 'L.',
        docType: 'PASAPORTE',
        docNumber: 'A12345678',
        phone: '+593 999888777',
        email: 'sofia@example.com'
    },
    {
        id: 'p_tienda',
        firstName: 'Tienda',
        lastName: 'Don Pepe',
        docType: 'RUC',
        docNumber: '1790011223001',
        phone: '+593 22334455',
        email: 'contact@donpepe.com'
    },
    {
        id: 'p_gimnasio',
        firstName: 'Gimnasio',
        lastName: 'Central',
        docType: 'RUC',
        docNumber: '1799999999001',
        phone: '+593 2222222',
        email: 'info@gym.com'
    },
    {
        id: 'p_lucia',
        firstName: 'Lucía',
        lastName: 'G.',
        docType: 'CEDULA',
        docNumber: '1718293041',
        phone: '+593 995544332',
        email: 'lucia@example.com'
    }
];

export const initialDebts = [
    {
        id: 'd1',
        type: 'borrowed', // I owe money
        personId: 'p_andrea',
        counterparty: 'Andrea P.', // Keeping for legacy/snapshot
        amount: 150.00,
        paidAmount: 50.00,
        currency: '$',
        reason: 'Cena en Nobu',
        medium: 'Transferencia',
        dueDate: '2024-11-01',
        status: 'active', // active, settled
        date: '2024-10-15',
        evidence: [],
        payments: [
            { id: 'p1', amount: 50.00, date: '2024-10-20', evidence: null }
        ]
    },
    {
        id: 'd2',
        type: 'lent', // They owe me
        personId: 'p_marco',
        counterparty: 'Marco R.',
        amount: 320.50,
        paidAmount: 0,
        currency: '$',
        reason: 'Entradas Concierto',
        medium: 'Efectivo',
        dueDate: '2024-12-01',
        status: 'active',
        date: '2024-10-18',
        evidence: [],
        payments: []
    },
    {
        id: 'd3',
        type: 'borrowed',
        personId: 'p_gimnasio',
        counterparty: 'Gimnasio',
        amount: 45.00,
        paidAmount: 45.00,
        currency: '$',
        reason: 'Cuota Octubre',
        medium: 'Tarjeta',
        dueDate: '2024-10-05',
        status: 'settled',
        date: '2024-10-01',
        evidence: ['recibo.pdf'],
        payments: [
            { id: 'p2', amount: 45.00, date: '2024-10-05', evidence: null }
        ]
    },
    {
        id: 'd4',
        type: 'lent',
        personId: 'p_carlos',
        counterparty: 'Carlos M.',
        amount: 200.00,
        paidAmount: 100.00,
        currency: '$',
        reason: 'Préstamo Viaje',
        medium: 'Transferencia',
        dueDate: '2024-11-15',
        status: 'active',
        date: '2024-10-25',
        evidence: [],
        payments: [
            { id: 'p3', amount: 100.00, date: '2024-11-01', evidence: null }
        ]
    },
    {
        id: 'd5',
        type: 'borrowed',
        personId: 'p_sofia',
        counterparty: 'Sofía L.',
        amount: 60.00,
        paidAmount: 60.00,
        currency: '$',
        reason: 'Regalo Cumpleaños',
        medium: 'Efectivo',
        dueDate: '2024-10-28',
        status: 'settled',
        date: '2024-10-20',
        evidence: [],
        payments: [
            { id: 'p4', amount: 20.00, date: '2024-10-22', evidence: null },
            { id: 'p5', amount: 40.00, date: '2024-10-28', evidence: null }
        ]
    },
    {
        id: 'd6',
        type: 'borrowed',
        personId: 'p_tienda',
        counterparty: 'Tienda Don Pepe',
        amount: 25.50,
        paidAmount: 0,
        currency: '$',
        reason: 'Víveres Semana',
        medium: 'Fiado',
        dueDate: '2024-11-10',
        status: 'active',
        date: '2024-11-05',
        evidence: [],
        payments: []
    },
    {
        id: 'd7',
        type: 'lent',
        personId: 'p_marco',
        counterparty: 'Marco R.',
        amount: 50.00,
        paidAmount: 50.00,
        currency: '$',
        reason: 'Reparación Coche',
        medium: 'Transferencia',
        dueDate: '2024-09-15',
        status: 'settled',
        date: '2024-09-01',
        evidence: [],
        payments: [
            { id: 'p6', amount: 50.00, date: '2024-09-10', evidence: null }
        ]
    },
    {
        id: 'd8',
        type: 'lent',
        personId: 'p_marco',
        counterparty: 'Marco R.',
        amount: 15.00,
        paidAmount: 0.00,
        currency: '$',
        reason: 'Uber compartido',
        medium: 'App',
        dueDate: '2024-11-20',
        status: 'active',
        date: '2024-11-18',
        evidence: [],
        payments: []
    },
    {
        id: 'd9',
        type: 'borrowed',
        personId: 'p_lucia',
        counterparty: 'Lucía G.',
        amount: 200.00,
        paidAmount: 50.00,
        currency: '$',
        reason: 'Entradas Festival',
        medium: 'Transferencia',
        dueDate: '2024-12-10',
        status: 'active',
        date: '2024-11-15',
        evidence: [],
        payments: [
            { id: 'p7', amount: 50.00, date: '2024-11-20', evidence: null }
        ]
    },
    {
        id: 'd10',
        type: 'lent',
        personId: 'p_andrea',
        counterparty: 'Andrea P.',
        amount: 120.00,
        paidAmount: 120.00,
        currency: '$',
        reason: 'Cena Cumpleaños',
        medium: 'Tarjeta',
        dueDate: '2024-10-30',
        status: 'settled',
        date: '2024-10-01',
        evidence: [],
        payments: [
            { id: 'p8', amount: 120.00, date: '2024-10-05', evidence: null }
        ]
    },
    {
        id: 'd11',
        type: 'borrowed',
        personId: 'p_gimnasio',
        counterparty: 'Gimnasio',
        amount: 45.00,
        paidAmount: 0.00,
        currency: '$',
        reason: 'Cuota Noviembre',
        medium: 'Tarjeta',
        dueDate: '2024-11-05',
        status: 'active',
        date: '2024-11-01',
        evidence: [],
        payments: []
    },
    {
        id: 'd12',
        type: 'lent',
        personId: 'p_carlos',
        counterparty: 'Carlos M.',
        amount: 500.00,
        paidAmount: 150.00,
        currency: '$',
        reason: 'Emergencia Médica',
        medium: 'Transferencia',
        dueDate: '2024-12-30',
        status: 'active',
        date: '2024-11-10',
        evidence: [],
        payments: [
            { id: 'p9', amount: 150.00, date: '2024-11-15', evidence: null }
        ]
    }
];

export const summaryStats = {
    totalLent: 320.50,
    totalBorrowed: 150.00, // Total original amount
    percentPaid: 33, // Just a mock stat
};
