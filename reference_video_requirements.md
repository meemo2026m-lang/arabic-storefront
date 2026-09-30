# Reference ERP Video Requirements

Source: uploaded walkthrough video at `/home/ubuntu/erp_reference_walkthrough.mp4`, analyzed on 2026-08-19. The extracted visual analysis is saved at `/home/ubuntu/video_erp_reference_walkthrough_analysis_20260819_152457.md`, with speech transcript at `/home/ubuntu/erp_video_transcript.txt`.

## Confirmed Core Workflows

The walkthrough describes a networked, offline-first ERP where one main device serves cashier, manager, accountant, and additional devices on the same local network. Users are created with roles such as system administrator, accountant, cashier, and stock manager; role selection preconfigures access, and individual permissions can extend the role. Accounts can be suspended.

Branches can also represent departments. Each branch has its own products, invoices, customers, financial operations, and staff, while the administrator can switch between branches and manage them centrally. The branch setup includes a display name, color, and logo.

The settings area covers store identity (logo, address, tax number), VAT activation and rate, a promotional QR destination for invoices, customer loyalty configuration, invoice defaults and return terms, minimum-stock notifications, UI theme/font choices, barcode/drawer/warning sounds, users and permissions, network configuration, and data maintenance.

The financial area establishes cashboxes, bank accounts, and wallets with opening balances. It supports internal transfers, account statements, and reconciliations. Product creation includes name, auto barcode or SKU, category/unit, purchase/retail/wholesale prices, per-item commission, minimum stock, production/expiry dates, image, and receipt description.

The POS flow starts a cashier shift with opening cash, adds products by scanner or manually, manages a cart, selects or creates a customer, and issues a receipt. The video also refers to customer types and account balances.

## Confirmed UI Language

The reference uses RTL navigation, a right quick-action rail, dense desktop tables, modals for creation and permissions, strong status colors, and screen-specific filters for date, branch, user, and operation type. It includes dark/light/navy theme choices, responsive browser use, and thermal/A4 receipt print formats.

## Confirmed Operational Details

Customers have an individual/company type, contact and tax fields, opening balance, address, notes, and a credit limit. The credit limit prevents a deferred sale that exceeds the permitted outstanding balance. The POS supports discount, automatic VAT, cash payment, payment into a network/wallet account, and splitting a single payment across cashbox and wallet destinations.

The receipt includes transaction time, cashier, product lines, invoice number, product/receipt barcodes, and a promotional QR destination. It can be printed in 58 mm, 80 mm, or A4 formats, reprinted from the invoice list, and sent to WhatsApp. The POS also contains printer selection, a calculator, optional immediate printing, and controls that hide receipt elements such as the logo, signature, barcode, and QR code.

The reporting view combines sales, purchases, invoice count, discounts, returns, net sales, cost of goods sold, gross profit, profit margin, operating expenses, profit/loss, VAT, and cash flow. Its filter presets include today, yesterday, last seven days, current month, and custom date range. It also contains movements, stock expiry/low-stock/damaged reports, and a per-branch management report with sales, purchases, returns, net revenue, cash flow, inventory value, low-stock counts, and movement count.

Purchasing requires supplier selection, quantities, cost, payment method, discount, VAT, and freight/service cost before saving or printing a purchase invoice. Invoices support WhatsApp resend, print, and return. A return may be located by invoice number or invoice barcode; each returned line has a quantity and reason, restores inventory, removes the refunded amount from the cashbox, and updates financial reports.

Employees are linked to an optional user account and carry a job title, phone, basic salary, national ID, bonuses, deductions, sales commissions, and attendance/departure records. The walkthrough also demonstrates installment schedules linked to customers/invoices and WhatsApp reminder messages for due or overdue installments.
