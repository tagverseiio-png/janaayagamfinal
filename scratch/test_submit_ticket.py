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
        
        context = browser.contexts[0] if browser.contexts else await browser.new_context()
        page = await context.new_page()
        
        print("Navigating to Citizen Portal at http://localhost:5173/...")
        await page.goto("http://localhost:5173/")
        await page.wait_for_load_state("domcontentloaded")
        
        # Clear localStorage and cookies to force logout
        print("Clearing session data to ensure we are on the login page...")
        await page.evaluate("localStorage.clear(); sessionStorage.clear();")
        await page.goto("http://localhost:5173/")
        await page.wait_for_load_state("domcontentloaded")
        
        title = await page.title()
        print(f"Page title: {title}")
        
        # Step 1: Login Phone
        print("Logging in citizen: filling phone number...")
        phone_input = page.locator("input[type='tel']").nth(0)
        await phone_input.fill("9876543210")
        
        send_otp_btn = page.locator("button:has-text('Send OTP')").nth(0)
        await send_otp_btn.click()
        
        # Step 2: Verification code
        print("Filling OTP...")
        otp_input = page.locator("input[placeholder='e.g. 123456']").nth(0)
        await otp_input.wait_for(state="visible", timeout=5000)
        await otp_input.fill("123456")
        
        verify_otp_btn = page.locator("button:has-text('Verify OTP')").nth(0)
        await verify_otp_btn.click()
        
        # Step 3: Enter Full Name and Pincode
        print("Filling Citizen Name and Pincode...")
        name_input = page.locator("input[placeholder='Enter your full name']").nth(0)
        await name_input.wait_for(state="visible", timeout=5000)
        await name_input.fill("Verified Citizen")
        
        pincode_input = page.locator("input[placeholder='e.g. 600001']").nth(0)
        await pincode_input.fill("600001")
        await pincode_input.press("Tab") # trigger lookup blur
        
        # Wait for pincode lookup to load
        print("Waiting for pincode lookup...")
        await asyncio.sleep(2)
        
        # Step 4: Dropdowns for Area and Ward
        print("Selecting Area and Ward...")
        area_select = page.locator("select").nth(0)
        await area_select.wait_for(state="visible", timeout=5000)
        await area_select.select_option(index=1) # select first available option
        
        ward_select = page.locator("select").nth(1)
        await ward_select.wait_for(state="visible", timeout=5000)
        await ward_select.select_option(index=1)
        
        # Step 5: Enter Command Center
        print("Clicking Enter Command Center...")
        enter_btn = page.locator("button:has-text('Enter Command Center')").nth(0)
        await enter_btn.click()
        
        # Wait for redirect to citizen dashboard
        print("Waiting for citizen dashboard redirect...")
        await page.wait_for_url("**/citizen", timeout=10000)
        print("Successfully logged in! URL:", page.url)

        # Check for welcome location modal and skip it
        skip_btn = page.locator("button:has-text('Skip for Now')").nth(0)
        try:
            await skip_btn.wait_for(state="visible", timeout=3000)
            print("Welcome location modal detected, clicking 'Skip for Now'...")
            await skip_btn.click()
        except Exception:
            print("No welcome location modal detected or it loaded after skip.")
        
        # Navigate to Submit Ticket
        print("Navigating to File Grievance page...")
        file_issue_btn = page.locator("button:has-text('File Issue')").nth(0)
        await file_issue_btn.click()
        await page.wait_for_url("**/citizen/submit", timeout=5000)

        
        # Location choice screen
        print("Selecting Home Ward Location Mode...")
        home_mode_btn = page.locator("text=My Home Ward Residence").nth(0)
        await home_mode_btn.click()
        
        # Main form screen
        print("Filling the Grievance form...")
        # Let's select Water Supply & Sewerage category (should match code CAT-WTR)
        water_category_btn = page.locator("text=Water Supply").nth(0)
        await water_category_btn.wait_for(state="visible", timeout=5000)
        await water_category_btn.click()
        
        # Fill description
        desc_input = page.locator("textarea").nth(0)
        await desc_input.fill("Grave water pipeline leakage in our main street. Water is getting wasted for last 2 days.")
        
        # Submit
        print("Submitting Grievance...")
        submit_btn = page.locator("button:has-text('Submit Verified Grievance')").nth(0)
        await submit_btn.click()
        
        # Wait for success screen
        print("Waiting for success screen...")
        success_title = page.locator("text=Complaint Filed Successfully").nth(0)
        await expect(success_title).to_be_visible(timeout=10000)
        
        ticket_id_locator = page.locator("span:has-text('TN-2026-')").nth(0)
        ticket_id = await ticket_id_locator.text_content()
        print(f"✓ Grievance submitted successfully! Ticket ID: {ticket_id}")
        
    except Exception as e:
        print(f"Error during E2E ticket submit test: {e}")
    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
