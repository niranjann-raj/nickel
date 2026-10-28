import MatrixLoader from '../../../components/ui/MatrixLoader';
import { useState, useRef, type ChangeEvent, type DragEvent, type FormEvent } from 'react';
import {
    X, Upload, FileText, CheckCircle2, AlertTriangle, AlertCircle, Sparkles,
    Loader2, Check, ArrowRight
} from 'lucide-react';
import { api } from '../../api';

interface BillUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (savedDate?: string) => void;
    categories: { id: number; name: string }[];
}

interface ExtractedData {
    merchant: string;
    date: string;
    amount: number;
    tax?: number;
    currency?: string;
    invoice_number?: string;
    suggested_category?: string;
    line_items?: { description: string; amount: number }[];
    confidence?: {
        merchant?: number;
        date?: number;
        amount?: number;
        overall?: number;
    };
    uncertain_fields?: string[];
    extraction_method?: string;
}

interface DuplicateWarning {
    is_duplicate: boolean;
    reason: string;
    match_info?: any;
}

export default function BillUploadModal({ isOpen, onClose, onSuccess, categories }: BillUploadModalProps) {
    const [step, setStep] = useState<'upload' | 'review' | 'success'>('upload');
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [confirming, setConfirming] = useState(false);
    const [error, setError] = useState('');

    // Extracted & review state
    const [uploadId, setUploadId] = useState<number | null>(null);
    const [extracted, setExtracted] = useState<ExtractedData | null>(null);
    const [duplicateWarning, setDuplicateWarning] = useState<DuplicateWarning | null>(null);

    // Form inputs during review
    const [merchant, setMerchant] = useState('');
    const [amount, setAmount] = useState('');
    const [txDate, setTxDate] = useState('');
    const [categoryName, setCategoryName] = useState('Bills & Utilities');
    const [paymentMethod, setPaymentMethod] = useState('UPI');
    const [description, setDescription] = useState('');
    const [invoiceNumber, setInvoiceNumber] = useState('');

    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    const resetState = () => {
        setStep('upload');
        setFile(null);
        setUploading(false);
        setConfirming(false);
        setError('');
        setUploadId(null);
        setExtracted(null);
        setDuplicateWarning(null);
        setMerchant('');
        setAmount('');
        setTxDate('');
        setCategoryName('Bills & Utilities');
        setPaymentMethod('UPI');
        setDescription('');
        setInvoiceNumber('');
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            validateAndSelectFile(e.target.files[0]);
        }
    };

    const handleDrop = (e: DragEvent) => {
        e.preventDefault();
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            validateAndSelectFile(e.dataTransfer.files[0]);
        }
    };

    const validateAndSelectFile = (selectedFile: File) => {
        setError('');
        const ext = selectedFile.name.split('.').pop()?.toLowerCase();
        if (!['pdf', 'png', 'jpg', 'jpeg', 'webp'].includes(ext || '')) {
            setError('Please upload a valid document or image (PDF, PNG, JPG, WEBP).');
            return;
        }

        if (selectedFile.size > 10 * 1024 * 1024) {
            setError('File exceeds maximum size limit of 10 MB.');
            return;
        }

        setFile(selectedFile);
    };

    const handleUploadAndScan = async () => {
        if (!file) return;
        setUploading(true);
        setError('');

        try {
            const res = await api.tracker.uploadBill(file);
            setUploadId(res.upload_id);
            setExtracted(res.extracted_data);
            setDuplicateWarning(res.duplicate_warning);

            // Populate editable review fields
            const data: ExtractedData = res.extracted_data || {};
            setMerchant(data.merchant || '');
            setAmount(data.amount ? String(data.amount) : '');
            setTxDate(data.date || new Date().toISOString().split('T')[0]);
            setCategoryName(data.suggested_category || 'Bills & Utilities');
            setInvoiceNumber(data.invoice_number || '');
            setDescription(`Bill: ${file.name}${data.invoice_number ? ` (#${data.invoice_number})` : ''}`);

            setStep('review');
        } catch (err: any) {
            setError(err.message || 'Failed to scan and extract document data.');
        } finally {
            setUploading(false);
        }
    };

    const handleConfirmTransaction = async (e: FormEvent) => {
        e.preventDefault();
        if (!uploadId) return;

        const numAmount = parseFloat(amount);
        if (isNaN(numAmount) || numAmount <= 0) {
            setError('Please enter a valid amount greater than ₹0.');
            return;
        }

        if (!categoryName) {
            setError('Please select a category.');
            return;
        }

        setConfirming(true);
        setError('');

        try {
            await api.tracker.confirmBill(uploadId, {
                amount: numAmount,
                category_name: categoryName,
                merchant: merchant.trim(),
                transaction_date: txDate,
                payment_method: paymentMethod,
                description: description.trim(),
                tags: ['bill', 'scanned', ...(invoiceNumber ? [`inv-${invoiceNumber}`] : [])]
            });

            setStep('success');
            onSuccess(txDate);
        } catch (err: any) {
            setError(err.message || 'Failed to save confirmed transaction.');
        } finally {
            setConfirming(false);
        }
    };

    const isUncertain = (fieldName: string) => {
        return extracted?.uncertain_fields?.includes(fieldName);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="bg-[#141416] border border-white/10 rounded-2xl max-w-xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-[#18181b]">
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center">
                            <Sparkles className="w-4 h-4" />
                        </div>
                        <h3 className="font-bold text-white text-base">
                            {step === 'upload' && 'Upload Bill / Receipt'}
                            {step === 'review' && 'Review & Verify Extracted Bill'}
                            {step === 'success' && 'Transaction Recorded!'}
                        </h3>
                    </div>
                    <button
                        onClick={() => {
                            resetState();
                            onClose();
                        }}
                        className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* STEP 1: FILE DROPZONE */}
                {step === 'upload' && (
                    <div className="p-6 space-y-5 text-xs">
                        {error && (
                            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        <div
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                            className="border-2 border-dashed border-white/15 hover:border-white/30 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer bg-[#18181b]/50 hover:bg-[#18181b] transition-all group"
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".pdf,.png,.jpg,.jpeg,.webp"
                                className="hidden"
                                onChange={handleFileChange}
                            />
                            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 text-gray-400 group-hover:text-white group-hover:scale-105 transition-all flex items-center justify-center mb-3">
                                <Upload className="w-6 h-6" />
                            </div>
                            <h4 className="text-sm font-bold text-white mb-1">
                                {file ? file.name : 'Choose a file or drag & drop here'}
                            </h4>
                            <p className="text-gray-500 text-[11px] max-w-xs leading-relaxed">
                                Supports invoices, dining receipts, and utility bills in PDF, PNG, JPG, or WEBP (Max 10 MB).
                            </p>
                            {file && (
                                <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-semibold text-[11px] border border-emerald-500/20">
                                    <FileText className="w-3.5 h-3.5" />
                                    <span>{(file.size / 1024).toFixed(0)} KB • Ready to scan</span>
                                </div>
                            )}
                        </div>

                        <div className="bg-[#18181b] p-3.5 rounded-xl border border-white/5 text-[11px] text-gray-400 space-y-1">
                            <span className="font-semibold text-gray-300 block">🔒 Privacy & Data Verification:</span>
                            <span>
                                Nickel runs automated OCR extraction. You will always inspect and verify the extracted totals and date before anything is saved.
                            </span>
                        </div>

                        <div className="flex items-center justify-end gap-2.5 pt-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 rounded-xl text-gray-400 hover:text-white font-semibold transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleUploadAndScan}
                                disabled={!file || uploading}
                                className="px-5 py-2 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors shadow-lg disabled:opacity-50 flex items-center gap-2"
                            >
                                {uploading ? (
                                    <>
                                        <MatrixLoader size="sm" variant="orbit" rounded baseColor="#666" activeColor="#000" />
                                        <span>Analyzing Document...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Scan & Review Bill</span>
                                        <ArrowRight className="w-4 h-4" />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP 2: REVIEW & VERIFY FORM */}
                {step === 'review' && (
                    <form onSubmit={handleConfirmTransaction} className="p-6 overflow-y-auto space-y-4 text-xs scrollbar-none">
                        {error && (
                            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        {/* Duplicate Warning Banner */}
                        {duplicateWarning?.is_duplicate && (
                            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 space-y-1">
                                <div className="flex items-center gap-2 font-bold text-amber-200">
                                    <AlertTriangle className="w-4 h-4" />
                                    <span>Possible Duplicate Bill Detected</span>
                                </div>
                                <p className="text-[11px] text-amber-300/90 leading-relaxed">
                                    {duplicateWarning.reason}
                                </p>
                                <span className="text-[10px] text-amber-400/80 block mt-1">
                                    Please verify if this was already paid or recorded. You may still proceed if this is a separate expense.
                                </span>
                            </div>
                        )}

                        <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-gray-300">
                                <FileText className="w-4 h-4 text-sky-400" />
                                <span className="font-semibold truncate max-w-xs">{file?.name}</span>
                            </div>
                            {extracted?.confidence?.overall && (
                                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 font-semibold">
                                    Confidence: {Math.round(extracted.confidence.overall * 100)}%
                                </span>
                            )}
                        </div>

                        {/* Amount & Date */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className="text-gray-400 font-semibold">Total Amount (INR)</label>
                                    {isUncertain('amount') && (
                                        <span className="text-[10px] text-amber-400 font-medium">Verify Amount</span>
                                    )}
                                </div>
                                <div className="relative">
                                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">₹</span>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0.01"
                                        required
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        className={`w-full bg-[#18181b] border rounded-xl pl-9 pr-4 py-2.5 text-white font-bold text-base focus:outline-none ${
                                            isUncertain('amount') ? 'border-amber-500/50 focus:border-amber-400' : 'border-white/10 focus:border-white/30'
                                        }`}
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className="text-gray-400 font-semibold">Bill / Transaction Date</label>
                                    {isUncertain('date') && (
                                        <span className="text-[10px] text-amber-400 font-medium">Verify Date</span>
                                    )}
                                </div>
                                <input
                                    type="date"
                                    required
                                    value={txDate}
                                    onChange={(e) => setTxDate(e.target.value)}
                                    className={`w-full bg-[#18181b] border rounded-xl px-3.5 py-2.5 text-white focus:outline-none cursor-pointer ${
                                        isUncertain('date') ? 'border-amber-500/50 focus:border-amber-400' : 'border-white/10 focus:border-white/30'
                                    }`}
                                />
                            </div>
                        </div>

                        {/* Merchant & Suggested Category */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className="text-gray-400 font-semibold">Merchant / Store Name</label>
                                    {isUncertain('merchant') && (
                                        <span className="text-[10px] text-amber-400 font-medium">Verify Merchant</span>
                                    )}
                                </div>
                                <input
                                    type="text"
                                    placeholder="e.g. Reliance Retail, BESCOM"
                                    value={merchant}
                                    onChange={(e) => setMerchant(e.target.value)}
                                    className={`w-full bg-[#18181b] border rounded-xl px-3.5 py-2 text-white focus:outline-none ${
                                        isUncertain('merchant') ? 'border-amber-500/50 focus:border-amber-400' : 'border-white/10 focus:border-white/30'
                                    }`}
                                />
                            </div>

                            <div>
                                <label className="text-gray-400 font-semibold mb-1.5 block">Category</label>
                                <select
                                    value={categoryName}
                                    onChange={(e) => setCategoryName(e.target.value)}
                                    className="w-full bg-[#18181b] border border-white/10 rounded-xl px-3.5 py-2 text-white focus:outline-none cursor-pointer"
                                >
                                    {categories.map((c) => (
                                        <option key={c.id} value={c.name}>
                                            {c.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Payment Method & Invoice Number */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                                <label className="text-gray-400 font-semibold mb-1.5 block">Payment Method</label>
                                <select
                                    value={paymentMethod}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                    className="w-full bg-[#18181b] border border-white/10 rounded-xl px-3.5 py-2 text-white focus:outline-none cursor-pointer"
                                >
                                    <option value="UPI">UPI (GPay, PhonePe, Paytm)</option>
                                    <option value="Credit Card">Credit Card</option>
                                    <option value="Debit Card">Debit Card</option>
                                    <option value="Net Banking">Net Banking</option>
                                    <option value="Cash">Cash</option>
                                    <option value="Auto-Debit">Auto-Debit</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-gray-400 font-semibold mb-1.5 block">Invoice / Receipt #</label>
                                <input
                                    type="text"
                                    placeholder="Optional invoice number"
                                    value={invoiceNumber}
                                    onChange={(e) => setInvoiceNumber(e.target.value)}
                                    className="w-full bg-[#18181b] border border-white/10 rounded-xl px-3.5 py-2 text-white focus:outline-none"
                                />
                            </div>
                        </div>

                        {/* Line Items snippet if found */}
                        {extracted?.line_items && extracted.line_items.length > 0 && (
                            <div className="bg-[#18181b] p-3 rounded-xl border border-white/5 space-y-1.5">
                                <span className="font-semibold text-gray-400 block text-[11px]">Detected Items:</span>
                                <div className="space-y-1 max-h-24 overflow-y-auto scrollbar-none pr-1">
                                    {extracted.line_items.map((item, idx) => (
                                        <div key={idx} className="flex justify-between text-[11px] text-gray-300">
                                            <span>{item.description}</span>
                                            <span className="font-medium text-white">₹{item.amount}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                            <button
                                type="button"
                                onClick={() => setStep('upload')}
                                className="px-3.5 py-2 rounded-xl text-gray-400 hover:text-white transition-colors font-semibold"
                            >
                                Back to Upload
                            </button>
                            <button
                                type="submit"
                                disabled={confirming}
                                className="px-5 py-2 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors shadow-lg disabled:opacity-50 flex items-center gap-2"
                            >
                                {confirming ? (
                                    <>
                                        <MatrixLoader size="sm" variant="orbit" rounded baseColor="#666" activeColor="#000" />
                                        <span>Finalizing...</span>
                                    </>
                                ) : (
                                    <>
                                        <Check className="w-4 h-4" />
                                        <span>Confirm & Record Expense</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                )}

                {/* STEP 3: SUCCESS STATE */}
                {step === 'success' && (
                    <div className="p-8 flex flex-col items-center justify-center text-center space-y-4">
                        <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                            <CheckCircle2 className="w-8 h-8" />
                        </div>
                        <div>
                            <h4 className="text-base font-bold text-white mb-1">Expense Recorded Successfully</h4>
                            <div className="p-3 my-2 rounded-xl bg-white/5 border border-white/10 text-left max-w-sm mx-auto space-y-1">
                                <div className="flex justify-between text-xs">
                                    <span className="text-gray-400">Merchant:</span>
                                    <span className="font-bold text-white">{merchant || 'Vendor'}</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span className="text-gray-400">Amount:</span>
                                    <span className="font-bold text-emerald-400">₹{parseFloat(amount || '0').toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span className="text-gray-400">Date on Bill:</span>
                                    <span className="font-semibold text-white">{txDate}</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span className="text-gray-400">Category:</span>
                                    <span className="text-gray-300">{categoryName}</span>
                                </div>
                            </div>
                            <p className="text-[11px] text-gray-400 max-w-sm leading-relaxed mt-2">
                                Your bill was securely linked and the transaction has been added to your Expense Tracker records.
                            </p>
                        </div>
                        <div className="pt-2 flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => {
                                    resetState();
                                    onClose();
                                }}
                                className="px-5 py-2 bg-white text-black font-bold rounded-xl text-xs hover:bg-gray-200 transition-colors shadow-lg"
                            >
                                Done & View
                            </button>
                            <button
                                type="button"
                                onClick={() => resetState()}
                                className="px-4 py-2 bg-[#18181b] border border-white/10 text-gray-300 font-semibold rounded-xl text-xs hover:bg-white/10 transition-colors"
                            >
                                Upload Another Bill
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
