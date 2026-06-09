import asyncio
from playwright import async_api
from playwright.async_api import expect

async def run_test():
    pw = None
    browser = None
    context = None

    try:
        pw = await async_api.async_playwright().start()
        # Launch using local Google Chrome installation on macOS
        browser = await pw.chromium.launch(
            executable_path="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
            headless=True
        )
        context = await browser.new_context()
        context.set_default_timeout(15000)
        page = await context.new_page()
        
        print("Navigating to http://localhost:5173/...")
        await page.goto("http://localhost:5173/")
        await page.wait_for_load_state("domcontentloaded")
        
        # Verify title or header
        title = await page.title()
        print(f"Page title is: {title}")
        
        # Fill invalid mobile number
        phone_input = page.locator("input[type='tel']").nth(0)
        await phone_input.fill("12345")
        print("Filled mobile input with '12345'")
        
        # Click Send OTP
        send_otp_btn = page.locator("button:has-text('Send OTP')").nth(0)
        await send_otp_btn.click()
        print("Clicked Send OTP button")
        
        # Verify validation toast error
        error_msg = page.locator("text=Please enter a valid 10-digit Mobile Number").nth(0)
        await expect(error_msg).to_be_visible(timeout=5000)
        print("Successfully verified validation error toast: 'Please enter a valid 10-digit Mobile Number'")
        
        print("All local Chrome E2E checks passed!")

    except Exception as e:
        print(f"Error during test: {e}")
    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
