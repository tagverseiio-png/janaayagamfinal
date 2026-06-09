import asyncio
from playwright import async_api
from playwright.async_api import expect

async def run_test():
    pw = None
    browser = None
    context = None

    try:
        pw = await async_api.async_playwright().start()
        print("Connecting to Chrome on port 9222 over CDP...")
        browser = await pw.chromium.connect_over_cdp("http://localhost:9222")
        
        # Get the default context or create one
        context = browser.contexts[0] if browser.contexts else await browser.new_context()
        page = await context.new_page()
        
        print("Navigating to http://localhost:5173/...")
        await page.goto("http://localhost:5173/")
        await page.wait_for_load_state("domcontentloaded")
        
        title = await page.title()
        print(f"Page title: {title}")
        
        # Test 1: Invalid Phone Number Validation
        print("Running Test 1: Invalid Phone Number Validation...")
        phone_input = page.locator("input[type='tel']").nth(0)
        await phone_input.fill("12345")
        
        send_otp_btn = page.locator("button:has-text('Send OTP')").nth(0)
        await send_otp_btn.click()
        
        error_msg = page.locator("text=Please enter a valid 10-digit Mobile Number").nth(0)
        await expect(error_msg).to_be_visible(timeout=5000)
        print("✓ Verified toast error: 'Please enter a valid 10-digit Mobile Number'")
        
        # Test 2: Incomplete OTP Validation
        print("Running Test 2: Incomplete OTP Validation...")
        await phone_input.fill("")
        await phone_input.fill("9876543210")
        await send_otp_btn.click()
        
        otp_input = page.locator("input[placeholder='e.g. 123456']").nth(0)
        await otp_input.wait_for(state="visible", timeout=5000)
        await otp_input.fill("123")
        
        verify_otp_btn = page.locator("button:has-text('Verify OTP')").nth(0)
        await verify_otp_btn.click()
        
        otp_error_msg = page.locator("text=Please enter the 6-digit OTP").nth(0)
        await expect(otp_error_msg).to_be_visible(timeout=5000)
        print("✓ Verified toast error: 'Please enter the 6-digit OTP'")
        
        # Test 3: Employee Aadhaar validation
        print("Running Test 3: Employee Aadhaar validation...")
        await page.goto("http://localhost:5173/employee-login")
        await page.wait_for_load_state("domcontentloaded")
        
        aadhaar_input = page.locator("input[placeholder='e.g. 12 or 16 digit number']").nth(0)
        await aadhaar_input.wait_for(state="visible", timeout=5000)
        await aadhaar_input.fill("12345")
        
        req_otp_btn = page.locator("button:has-text('Request OTP Verification')").nth(0)
        await req_otp_btn.click()
        
        aadhaar_error = page.locator("text=Please enter a valid 12 or 16-digit Aadhaar Number").nth(0)
        await expect(aadhaar_error).to_be_visible(timeout=5000)
        print("✓ Verified toast error: 'Please enter a valid 12 or 16-digit Aadhaar Number'")
        
        # Test 4: Complete Employee Login and Scoping to Minister Dashboard
        print("Running Test 4: Complete Employee Login and Scoping to Minister Dashboard...")
        await aadhaar_input.fill("")
        await aadhaar_input.fill("1234567890123456")
        await req_otp_btn.click()
        
        employee_otp_input = page.locator("input[placeholder='Enter 6-digit verification code']").nth(0)
        await employee_otp_input.wait_for(state="visible", timeout=5000)
        await employee_otp_input.fill("123456")
        
        verify_emp_btn = page.locator("button:has-text('Confirm Identity')").nth(0)
        await verify_emp_btn.click()
        
        # Select Scoping Categories
        category_select = page.locator("select").nth(0)
        await category_select.wait_for(state="visible", timeout=5000)
        await category_select.select_option(value="Elected Representative")
        
        role_select = page.locator("select").nth(1)
        await role_select.wait_for(state="visible", timeout=5000)
        await role_select.select_option(value="Minister")
        
        portfolio_select = page.locator("select").nth(2)
        await portfolio_select.wait_for(state="visible", timeout=5000)
        await portfolio_select.select_option(index=1) # select first available department portfolio
        
        save_btn = page.locator("button:has-text('Save Scope & Access Dashboard')").nth(0)
        await save_btn.click()
        
        # Verify Minister Dashboard redirects
        await page.wait_for_url("**/minister-dashboard", timeout=10000)
        print(f"✓ Redirected to Minister Dashboard: {page.url}")
        
        print("All CDP E2E checks passed successfully!")

    except Exception as e:
        print(f"Error during CDP test: {e}")
    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
