// src/services/mockData.js

export const MOCK_CUSTOMERS = [
    { id: 1, name: "Ahmed Al-Mansoori", mobile: "050-1234567", email: "ahmed.m@example.com", type: "Individual", status: "Active" },
    { id: 2, name: "Tech Solutions LLC", mobile: "04-8889999", email: "contact@techsolutions.ae", type: "Corporate", status: "Active" },
    { id: 3, name: "Sarah Jones", mobile: "055-9876543", email: "sarah.j@example.com", type: "Individual", status: "Inactive" },
    { id: 4, name: "Blue Sky Trading", mobile: "056-1112222", email: "info@bluesky.ae", type: "Corporate", status: "Active" },
    { id: 5, name: "Mohammed Ali", mobile: "052-3334444", email: "m.ali@example.com", type: "Individual", status: "Pending" },
];

export const getCustomers = () => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve([...MOCK_CUSTOMERS]);
        }, 800);
    });
};

// Services with Service Fee (our charge) and Government Fee (pass-through)
export const MOCK_SERVICES = [
    { id: 1, name: "Family Visa Opening", serviceFee: 100, govtFee: 150, price: 250, category: "Immigration" },
    { id: 2, name: "Medical Test Application", serviceFee: 50, govtFee: 100, price: 150, category: "Health" },
    { id: 3, name: "Emirates ID Typing - New", serviceFee: 70, govtFee: 300, price: 370, category: "EID" },
    { id: 4, name: "Emirates ID Typing - Renewal", serviceFee: 70, govtFee: 200, price: 270, category: "EID" },
    { id: 5, name: "Traffic File Opening", serviceFee: 50, govtFee: 150, price: 200, category: "Traffic" },
    { id: 6, name: "Sponsorship Transfer", serviceFee: 150, govtFee: 400, price: 550, category: "Immigration" },
];

export const getServices = () => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve([...MOCK_SERVICES]);
        }, 600);
    });
};

export const MOCK_INVOICES = [
    {
        id: 1001,
        date: "2025-12-28",
        customerName: "Ahmed Al-Mansoori",
        serviceFee: 150,
        govtFee: 250,
        total: 400,
        amountReceived: 400,
        change: 0,
        status: "Paid",
        paymentType: "Cash",
        items: [{ name: "Family Visa Opening", serviceFee: 100, govtFee: 150, price: 250 }]
    },
    {
        id: 1002,
        date: "2025-12-29",
        customerName: "Tech Solutions LLC",
        serviceFee: 340,
        govtFee: 860,
        total: 1200,
        amountReceived: 1200,
        change: 0,
        status: "Paid",
        paymentType: "Cash",
        items: [
            { name: "Emirates ID Typing - New", serviceFee: 70, govtFee: 300, price: 370 },
            { name: "Emirates ID Typing - Renewal", serviceFee: 70, govtFee: 200, price: 270 },
            { name: "Sponsorship Transfer", serviceFee: 150, govtFee: 400, price: 550 }
        ]
    },
    {
        id: 1003,
        date: "2025-12-30",
        customerName: "Mohammed Ali",
        serviceFee: 50,
        govtFee: 150,
        total: 200,
        amountReceived: 0,
        change: 0,
        status: "Pending",
        paymentType: "Credit",
        items: [{ name: "Traffic File Opening", serviceFee: 50, govtFee: 150, price: 200 }]
    },
];

export const getInvoices = () => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve([...MOCK_INVOICES]);
        }, 800);
    });
};
