import os
import re
import json
import uuid
import hashlib
import logging
from datetime import datetime, date
from decimal import Decimal
from werkzeug.utils import secure_filename

ALLOWED_EXTENSIONS = {'pdf', 'png', 'jpg', 'jpeg', 'webp'}
ALLOWED_MIMETYPES = {
    'application/pdf',
    'image/png',
    'image/jpeg',
    'image/webp'
}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB

logger = logging.getLogger(__name__)

def get_upload_dir(user_id: int) -> str:
    """Returns absolute path to user-specific private uploads directory."""
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'uploads', 'bills', str(user_id)))
    os.makedirs(base_dir, exist_ok=True)
    return base_dir


def validate_file(file) -> tuple[bool, str, str, str]:
    """
    Validates uploaded file extension, size, and mime type.
    Returns: (is_valid, error_message, extension, mimetype)
    """
    if not file or not file.filename:
        return False, "No file selected", "", ""

    filename = file.filename
    if '.' not in filename:
        return False, "File lacks an extension", "", ""

    ext = filename.rsplit('.', 1)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        return False, f"Unsupported file format '.{ext}'. Allowed formats: PDF, PNG, JPG, JPEG, WEBP", "", ""

    mime = getattr(file, 'mimetype', '')
    if mime and mime.lower() not in ALLOWED_MIMETYPES and not ('application/octet-stream' in mime.lower()):
        # Some clients send octet-stream, check extension as fallback
        pass

    return True, "", ext, mime or f"image/{ext}" if ext != 'pdf' else 'application/pdf'


def compute_file_hash(data: bytes) -> str:
    """Computes SHA-256 hash of file content."""
    hasher = hashlib.sha256()
    hasher.update(data)
    return hasher.hexdigest()


def save_bill_file(user_id: int, original_filename: str, file_bytes: bytes, ext: str) -> tuple[str, str]:
    """
    Saves file bytes to private directory with a non-guessable UUID filename.
    Returns: (stored_filename, absolute_path)
    """
    upload_dir = get_upload_dir(user_id)
    safe_name = secure_filename(original_filename)
    stored_filename = f"{uuid.uuid4().hex}_{safe_name}"
    abs_path = os.path.join(upload_dir, stored_filename)

    with open(abs_path, 'wb') as f:
        f.write(file_bytes)

    return stored_filename, abs_path


def parse_pdf_text_heuristically(file_bytes: bytes) -> dict:
    """Extracts raw text from PDF using pdfplumber and searches for common invoice patterns."""
    text_content = ""
    try:
        import pdfplumber
        import io
        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            for page in pdf.pages[:5]:  # Read first 5 pages max
                page_text = page.extract_text()
                if page_text:
                    text_content += "\n" + page_text
    except Exception as e:
        logger.warning(f"pdfplumber text extraction failed: {e}")
        return {}

    if not text_content.strip():
        return {}

    result = {
        "merchant": None,
        "date": None,
        "amount": None,
        "tax": None,
        "currency": "INR",
        "invoice_number": None,
        "suggested_category": "Bills & Utilities",
        "line_items": [],
        "confidence": {"overall": 0.5}
    }

    # 1. Merchant: Look for top non-empty lines
    lines = [l.strip() for l in text_content.split('\n') if l.strip()]
    if lines:
        result["merchant"] = lines[0][:80]

    # 2. Amount: Look for Total / Grand Total / Amount / Net Payable
    amount_match = re.search(r'(?:total|grand\s*total|net\s*payable|amount\s*due|amount)[\s\:\₹\Rs\.]*([0-9]+(?:[\,\.][0-9]{2,3})*(?:\.[0-9]{2})?)', text_content, re.IGNORECASE)
    if amount_match:
        raw_amt = amount_match.group(1).replace(',', '')
        try:
            val = float(raw_amt)
            if val > 0:
                result["amount"] = val
                result["confidence"]["amount"] = 0.75
        except ValueError:
            pass

    # 3. Date pattern: DD/MM/YYYY, YYYY-MM-DD, DD-MM-YYYY
    date_match = re.search(r'(?:date|invoice\s*date)?[\s\:\-]*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}|\d{4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2})', text_content, re.IGNORECASE)
    if date_match:
        raw_date = date_match.group(1).replace('/', '-').replace('.', '-')
        for fmt in ('%Y-%m-%d', '%d-%m-%Y', '%d-%m-%y'):
            try:
                parsed_dt = datetime.strptime(raw_date, fmt).date()
                result["date"] = parsed_dt.isoformat()
                result["confidence"]["date"] = 0.8
                break
            except ValueError:
                continue

    # 4. Invoice Number:
    inv_match = re.search(r'(?:invoice|receipt|bill)\s*(?:no|number|#)?[\s\:\.]*([A-Za-z0-9\-\/]+)', text_content, re.IGNORECASE)
    if inv_match and len(inv_match.group(1)) > 2:
        result["invoice_number"] = inv_match.group(1).strip()

    # 5. Tax (GST / Tax / VAT)
    tax_match = re.search(r'(?:gst|cgst\s*\+\s*sgst|tax|vat)[\s\:\₹\Rs\.]*([0-9]+(?:\.[0-9]{2})?)', text_content, re.IGNORECASE)
    if tax_match:
        try:
            result["tax"] = float(tax_match.group(1))
        except ValueError:
            pass

    return result


def extract_with_gemini(file_bytes: bytes, mime_type: str, ext: str) -> dict:
    """Uses Gemini multimodal model to extract structured receipt data."""
    api_key = os.environ.get('GEMINI_API_KEY')
    if not api_key or api_key == 'your_google_gemini_api_key_here':
        return {}

    try:
        from google import genai
        from google.genai import types

        client = genai.Client(api_key=api_key)

        prompt = (
            "You are an expert OCR receipt and financial invoice parser. "
            "Analyze this uploaded document/image and extract the following details with high precision. "
            "Return STRICTLY a JSON object without markdown code blocks, backticks, or explanatory text. "
            "If a field cannot be identified with high confidence, return null for it. "
            "The JSON must have these exact keys:\n"
            "{\n"
            '  "merchant": "name of store/vendor/company or null",\n'
            '  "date": "YYYY-MM-DD formatted date or null",\n'
            '  "amount": numeric total amount (e.g. 1250.50) or null,\n'
            '  "tax": numeric tax amount or null,\n'
            '  "currency": "INR",\n'
            '  "invoice_number": "string invoice or receipt id or null",\n'
            '  "suggested_category": "one of: Food & Dining, Groceries, Transportation, Shopping, Entertainment, Bills & Utilities, Rent & Housing, Healthcare, Education, Travel, Personal Care, Subscriptions, Investments, Other",\n'
            '  "line_items": [{"description": "item name", "amount": 100.0}],\n'
            '  "confidence": {\n'
            '    "merchant": 0.95,\n'
            '    "date": 0.90,\n'
            '    "amount": 0.95,\n'
            '    "overall": 0.92\n'
            '  }\n'
            "}\n"
            "Currency defaults to INR if Indian Rupee (₹, Rs) or ambiguous."
        )

        part = types.Part.from_bytes(data=file_bytes, mime_type=mime_type)
        contents = [prompt, part]

        # Use gemini-2.5-flash or models in fallback
        preferred_model = os.environ.get('GEMINI_MODEL', 'gemini-flash-lite-latest')
        candidate_models = [
            preferred_model,
            'gemini-flash-lite-latest',
            'gemini-3.5-flash-lite',
            'gemini-flash-latest',
        ]
        seen = set()
        models = [m for m in candidate_models if not (m in seen or seen.add(m))]

        raw_text = None
        for m in models:
            try:
                resp = client.models.generate_content(
                    model=m,
                    contents=contents,
                    config=types.GenerateContentConfig(
                        temperature=0.1,
                        response_mime_type="application/json"
                    )
                )
                if resp and resp.text:
                    raw_text = resp.text.strip()
                    break
            except Exception as e:
                logger.warning(f"Gemini OCR model {m} failed: {e}")

        if not raw_text:
            return {}

        # Clean JSON if needed
        if raw_text.startswith("```json"):
            raw_text = raw_text[7:]
        if raw_text.startswith("```"):
            raw_text = raw_text[3:]
        if raw_text.endswith("```"):
            raw_text = raw_text[:-3]

        parsed = json.loads(raw_text.strip())
        return parsed

    except Exception as e:
        logger.warning(f"Gemini OCR extraction failed: {e}")
        return {}


def process_bill_document(file_bytes: bytes, original_filename: str, mime_type: str, ext: str) -> dict:
    """
    Full extraction pipeline:
    1. Tries Gemini Multimodal extraction.
    2. If PDF and Gemini fails/empty, runs pdfplumber regex extraction.
    3. Normalizes fields and computes uncertain fields.
    """
    extracted = {}
    method = "MANUAL_FALLBACK"

    # Step 1: Try Gemini Multimodal
    gemini_result = extract_with_gemini(file_bytes, mime_type, ext)
    if gemini_result and (gemini_result.get('amount') is not None or gemini_result.get('merchant') is not None):
        extracted = gemini_result
        method = "GEMINI_MULTIMODAL"

    # Step 2: Fallback to local PDF extraction if applicable
    if not extracted and ext == 'pdf':
        local_result = parse_pdf_text_heuristically(file_bytes)
        if local_result:
            extracted = local_result
            method = "LOCAL_PDF_HEURISTIC"

    # Step 3: Normalize and identify uncertain fields
    merchant = extracted.get("merchant") or ""
    date_val = extracted.get("date") or date.today().isoformat()
    amount_val = extracted.get("amount")
    try:
        amount_val = float(amount_val) if amount_val is not None else 0.0
    except (ValueError, TypeError):
        amount_val = 0.0

    tax_val = extracted.get("tax")
    try:
        tax_val = float(tax_val) if tax_val is not None else 0.0
    except (ValueError, TypeError):
        tax_val = 0.0

    currency = extracted.get("currency") or "INR"
    invoice_number = extracted.get("invoice_number") or ""
    suggested_category = extracted.get("suggested_category") or "Bills & Utilities"
    line_items = extracted.get("line_items") or []
    confidence = extracted.get("confidence") or {}

    uncertain_fields = []
    if not merchant:
        uncertain_fields.append("merchant")
    if amount_val <= 0:
        uncertain_fields.append("amount")
    if not extracted.get("date"):
        uncertain_fields.append("date")

    normalized = {
        "merchant": merchant,
        "date": date_val,
        "amount": amount_val,
        "tax": tax_val,
        "currency": currency,
        "invoice_number": invoice_number,
        "suggested_category": suggested_category,
        "line_items": line_items,
        "confidence": {
            "merchant": confidence.get("merchant", 0.7 if merchant else 0.2),
            "amount": confidence.get("amount", 0.9 if amount_val > 0 else 0.2),
            "date": confidence.get("date", 0.8 if extracted.get("date") else 0.3),
            "overall": confidence.get("overall", 0.8 if (merchant and amount_val > 0) else 0.4)
        },
        "uncertain_fields": uncertain_fields,
        "extraction_method": method
    }

    return normalized


def check_for_duplicate(user_id: int, file_hash: str, merchant: str, date_str: str, amount: float, invoice_number: str = None) -> tuple[bool, str, dict]:
    """
    Checks for likely duplicate uploads:
    1. Exact file hash match in BillUpload.
    2. Similar transaction match in TrackerTransaction (same user, amount, date, and merchant/invoice).
    Returns: (is_duplicate, duplicate_reason, matching_record)
    """
    from models import BillUpload, TrackerTransaction

    # 1. Exact file hash
    existing_upload = BillUpload.query.filter_by(user_id=user_id, file_hash=file_hash).first()
    if existing_upload:
        return True, f"This document has already been uploaded previously ({existing_upload.original_filename}).", {
            "type": "file_hash",
            "upload_id": existing_upload.id,
            "filename": existing_upload.original_filename,
            "date": existing_upload.created_at.strftime('%Y-%m-%d') if existing_upload.created_at else None
        }

    # 2. Duplicate transaction signal
    if amount and amount > 0 and date_str:
        try:
            target_date = datetime.strptime(date_str, '%Y-%m-%d').date()
            query = TrackerTransaction.query.filter_by(
                user_id=user_id,
                transaction_date=target_date,
                amount=amount
            )
            if merchant:
                query = query.filter(TrackerTransaction.merchant.ilike(f"%{merchant.strip()}%"))

            existing_tx = query.first()
            if existing_tx:
                return True, f"A matching transaction of ₹{amount:,.2f} on {date_str} for '{existing_tx.merchant}' already exists.", {
                    "type": "transaction_match",
                    "transaction_id": existing_tx.id,
                    "merchant": existing_tx.merchant,
                    "amount": float(existing_tx.amount),
                    "date": existing_tx.transaction_date.isoformat()
                }
        except Exception:
            pass

    return False, "", {}
