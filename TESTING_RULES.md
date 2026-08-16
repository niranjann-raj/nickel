PLAYWRIGHT MCP SAFETY RULES FOR NICKEL

When using Playwright MCP to test Nickel:

1. Never read, display, modify, search, print, or inspect:
   - .env files
   - API keys
   - encryption keys
   - PASSWORD_PEPPER
   - NICKEL_ENCRYPTION_KEY
   - JWT secrets
   - SMTP credentials
   - Gemini API keys
   - database password hashes
   - other application secrets

2. Never query the database directly for credentials, password hashes, API keys, encryption keys, or other secrets.

3. Do not generate JWT tokens manually or bypass the normal application authentication flow unless I explicitly ask you to do so.

4. Use the application's normal UI and authentication flow whenever possible.

5. Do not modify existing user data.

6. Do not delete, edit, pause, complete, or trigger AutoPay on existing goals unless explicitly requested.

7. Do not modify:
   - XP
   - coins
   - streaks
   - Easy/Medium/Hard savings logic
   - Normal AutoPay
   - Goal AutoPay
   - Dummy Bank logic
   - authentication logic
   - encryption/security implementation

8. If test data is required, use a dedicated test account and clearly identify any test records created.

9. If test data is required, use a dedicated test account whenever possible.
   Clearly identify any test records created.
   Do not create persistent test data unless I explicitly authorize it
   or the testing task clearly requires it.

10. Testing means browser-level interaction and verification unless I explicitly request source-code or database inspection.

11. Never automatically fix issues discovered during testing.
    Only report them unless I explicitly ask you to fix them.

12. After testing, provide:
    - PASS/FAIL for each test
    - functional issues
    - UI issues
    - console errors/warnings
    - unexpected behavior
    - test data created
    - recommended priority for any issue found.