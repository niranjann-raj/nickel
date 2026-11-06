import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface SplitRoomPDFData {
    room: {
        name: string;
        code: string;
        currency: string;
        description?: string;
        start_date?: string;
        end_date?: string;
    };
    financials: {
        total_spent: number;
        total_settled_amount: number;
        total_outstanding_debt: number;
        settlement_progress_percentage: number;
        is_fully_settled: boolean;
        members_balances: Array<{
            user_name: string;
            role: string;
            total_paid: number;
            total_share: number;
            net_expense_balance: number;
            outstanding_balance: number;
            status_label: string;
        }>;
        settlement_plan: Array<{
            from_user_name: string;
            to_user_name: string;
            amount: number;
            status: string;
        }>;
        payments: Array<{
            payer: { full_name: string };
            recipient: { full_name: string };
            amount: number;
            status: string;
            created_at: string;
        }>;
    };
    expenses: Array<{
        title: string;
        category: string;
        expense_date: string;
        amount: number;
        split_method: string;
        payers: Array<{ user_name: string; amount_paid: number }>;
    }>;
}

export function generateSplitRoomPDF(data: SplitRoomPDFData) {
    const doc = new jsPDF();
    const primaryColor: [number, number, number] = [17, 17, 19]; // Nickel Onyx Black
    const textColor: [number, number, number] = [31, 41, 55]; // Gray-800
    const lightText: [number, number, number] = [107, 114, 128]; // Gray-500
    const currency = data.room.currency || 'INR';

    let yPos = 20;

    const addText = (text: string, x: number, y: number, size: number, color: [number, number, number], isBold = false, align: 'left' | 'center' | 'right' = 'left') => {
        doc.setFontSize(size);
        doc.setTextColor(color[0], color[1], color[2]);
        doc.setFont("helvetica", isBold ? "bold" : "normal");
        if (align === 'center') {
            doc.text(text, x, y, { align: "center" });
        } else if (align === 'right') {
            doc.text(text, x, y, { align: "right" });
        } else {
            doc.text(text, x, y);
        }
    };

    // Header
    addText("NICKEL", 105, yPos, 22, primaryColor, true, "center");
    yPos += 8;
    addText("Split Expense & Settlement Summary", 105, yPos, 13, textColor, false, "center");
    yPos += 10;

    doc.setDrawColor(220, 220, 225);
    doc.line(14, yPos, 196, yPos);
    yPos += 8;

    // Room Overview Box
    addText(`Room: ${data.room.name}`, 14, yPos, 14, textColor, true);
    addText(`Code: ${data.room.code}`, 196, yPos, 12, primaryColor, true, 'right');
    yPos += 6;

    if (data.room.description) {
        addText(data.room.description, 14, yPos, 10, lightText);
        yPos += 6;
    }

    addText(`Generated: ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`, 14, yPos, 9, lightText);
    if (data.room.start_date || data.room.end_date) {
        const dateRange = `Trip Dates: ${data.room.start_date || 'N/A'} to ${data.room.end_date || 'N/A'}`;
        addText(dateRange, 196, yPos, 9, lightText, false, 'right');
    }
    yPos += 10;

    // Summary Cards (Row of 4 metrics)
    const cardWidth = 43;
    const cardGap = 2;
    const startX = 14;

    const summaryCards = [
        { label: "Total Spent", val: `${currency} ${data.financials.total_spent.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` },
        { label: "Total Settled", val: `${currency} ${data.financials.total_settled_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` },
        { label: "Outstanding", val: `${currency} ${data.financials.total_outstanding_debt.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` },
        { label: "Progress", val: `${data.financials.settlement_progress_percentage}%` }
    ];

    summaryCards.forEach((c, idx) => {
        const x = startX + idx * (cardWidth + cardGap);
        doc.setFillColor(245, 247, 250);
        doc.roundedRect(x, yPos, cardWidth, 16, 2, 2, 'F');
        addText(c.label, x + cardWidth / 2, yPos + 6, 8, lightText, false, 'center');
        addText(c.val, x + cardWidth / 2, yPos + 13, 10, textColor, true, 'center');
    });
    yPos += 24;

    // Table 1: Member Balances
    addText("1. MEMBER BALANCES", 14, yPos, 11, primaryColor, true);
    yPos += 4;

    autoTable(doc, {
        startY: yPos,
        head: [['Member', 'Role', 'Total Paid', 'Total Share', 'Net Balance', 'Status']],
        body: data.financials.members_balances.map(m => [
            m.user_name,
            m.role.toUpperCase(),
            `${currency} ${m.total_paid.toFixed(2)}`,
            `${currency} ${m.total_share.toFixed(2)}`,
            `${currency} ${m.net_expense_balance > 0 ? '+' : ''}${m.net_expense_balance.toFixed(2)}`,
            m.status_label
        ]),
        theme: 'grid',
        headStyles: { fillColor: [24, 24, 27], textColor: 255, fontSize: 9, fontStyle: 'bold' },
        bodyStyles: { fontSize: 8.5, textColor: [31, 41, 55] },
        alternateRowStyles: { fillColor: [249, 250, 251] },
        margin: { left: 14, right: 14 }
    });

    yPos = (doc as any).lastAutoTable.finalY + 12;

    // Table 2: Suggested Settlement Transfers
    if (yPos > 240) {
        doc.addPage();
        yPos = 20;
    }

    addText("2. SIMPLIFIED SETTLEMENT PLAN", 14, yPos, 11, primaryColor, true);
    yPos += 4;

    if (data.financials.settlement_plan.length === 0) {
        addText("All recorded obligations in this room are completely settled! No payments pending.", 14, yPos + 6, 9.5, [16, 185, 129], true);
        yPos += 14;
    } else {
        autoTable(doc, {
            startY: yPos,
            head: [['Debtor (Who Pays)', 'Recipient (Who Receives)', 'Suggested Amount', 'Status']],
            body: data.financials.settlement_plan.map(s => [
                s.from_user_name,
                s.to_user_name,
                `${currency} ${s.amount.toFixed(2)}`,
                s.status
            ]),
            theme: 'grid',
            headStyles: { fillColor: [39, 39, 42], textColor: 255, fontSize: 9, fontStyle: 'bold' },
            bodyStyles: { fontSize: 8.5, textColor: [31, 41, 55] },
            alternateRowStyles: { fillColor: [249, 250, 251] },
            margin: { left: 14, right: 14 }
        });
        yPos = (doc as any).lastAutoTable.finalY + 12;
    }

    // Table 3: Recorded Expenses
    if (yPos > 230) {
        doc.addPage();
        yPos = 20;
    }

    addText("3. RECORDED EXPENSES", 14, yPos, 11, primaryColor, true);
    yPos += 4;

    autoTable(doc, {
        startY: yPos,
        head: [['Date', 'Title', 'Category', 'Paid By', 'Split Method', 'Amount']],
        body: data.expenses.map(e => [
            e.expense_date,
            e.title,
            e.category,
            e.payers.map(p => `${p.user_name} (${currency} ${p.amount_paid.toFixed(2)})`).join(', ') || 'N/A',
            e.split_method,
            `${currency} ${e.amount.toFixed(2)}`
        ]),
        theme: 'grid',
        headStyles: { fillColor: [55, 65, 81], textColor: 255, fontSize: 9, fontStyle: 'bold' },
        bodyStyles: { fontSize: 8.5, textColor: [31, 41, 55] },
        alternateRowStyles: { fillColor: [249, 250, 251] },
        margin: { left: 14, right: 14 }
    });

    yPos = (doc as any).lastAutoTable.finalY + 12;

    // Table 4: Settlement Payments History
    if (data.financials.payments && data.financials.payments.length > 0) {
        if (yPos > 240) {
            doc.addPage();
            yPos = 20;
        }

        addText("4. SETTLEMENT PAYMENTS HISTORY", 14, yPos, 11, primaryColor, true);
        yPos += 4;

        autoTable(doc, {
            startY: yPos,
            head: [['Date', 'Payer', 'Recipient', 'Amount', 'Status']],
            body: data.financials.payments.map(p => [
                p.created_at ? new Date(p.created_at).toLocaleDateString() : 'N/A',
                p.payer.full_name,
                p.recipient.full_name,
                `${currency} ${p.amount.toFixed(2)}`,
                p.status
            ]),
            theme: 'grid',
            headStyles: { fillColor: [16, 185, 129], textColor: 255, fontSize: 9, fontStyle: 'bold' },
            bodyStyles: { fontSize: 8.5, textColor: [31, 41, 55] },
            alternateRowStyles: { fillColor: [249, 250, 251] },
            margin: { left: 14, right: 14 }
        });
    }

    // Save PDF
    const filename = `Nickel_Split_${data.room.code}_${data.room.name.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
    doc.save(filename);
}
