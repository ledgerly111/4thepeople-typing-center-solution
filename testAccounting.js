import { MOCK_SERVICES } from './src/services/mockData.js';

function calculateTotals(lineItems) {
    const totalServiceFee = lineItems.reduce((sum, item) => sum + Number(item.serviceFee || 0), 0);
    const totalGovtFee = lineItems.reduce((sum, item) => sum + Number(item.govtFee || 0), 0);
    const grandTotal = totalServiceFee + totalGovtFee;
    return { totalServiceFee, totalGovtFee, grandTotal };
}

function testScenario() {
    // pick a couple of services
    const services = [MOCK_SERVICES[0], MOCK_SERVICES[2]]; // Family Visa Opening and Emirates ID Typing - New
    const lineItems = services.map(s => ({
        serviceId: s.id,
        serviceFee: s.serviceFee,
        govtFee: s.govtFee,
        price: s.price,
        name: s.name
    }));
    const { totalServiceFee, totalGovtFee, grandTotal } = calculateTotals(lineItems);
    console.log('Line Items:', lineItems);
    console.log('Service Fee total:', totalServiceFee);
    console.log('Govt Fee total:', totalGovtFee);
    console.log('Grand Total (should equal sum of both):', grandTotal);
    const amountReceived = 500; // cash payment example
    const change = Math.max(0, amountReceived - grandTotal);
    console.log('Amount Received:', amountReceived);
    console.log('Change to return:', change);
}

testScenario();
