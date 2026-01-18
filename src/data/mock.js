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
        id: 'p_gimnasio',
        firstName: 'Gimnasio',
        lastName: 'Central',
        docType: 'RUC',
        docNumber: '1799999999001',
        phone: '+593 2222222',
        email: 'info@gym.com'
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
    }
];

export const summaryStats = {
    totalLent: 320.50,
    totalBorrowed: 150.00, // Total original amount
    percentPaid: 33, // Just a mock stat
};
