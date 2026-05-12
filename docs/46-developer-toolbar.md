# Developer Toolbar (Asok Console)

Asok includes a premium built-in developer toolbar that appears in your browser when `DEBUG = True`. 

Designed with a modern, glassmorphic aesthetic, it allows you to monitor your application's state in real-time without ever leaving your UI.

## 1. Real-time SQL Profiler
The SQL Profiler is one of the most powerful tools in the console. It captures every query executed, even during complex workflows.

- **AJAX & SPA Support**: Unlike traditional toolbars, Asok's console updates dynamically during partial renders (`request.block`). New queries appear under an "AJAX BLOCK" banner.
- **Redirect Persistence**: If a form action redirects the user, the SQL logs from the previous request (the `POST`) are preserved and displayed with a visual warning.
- **Performance Alerts**: Queries are color-coded based on their duration:
    - <span style="color:#6ee7b7">Green</span>: Fast (< 50ms)
    - <span style="color:#fcd34d">Yellow</span>: Warning (> 50ms)
    - <span style="color:#fca5a5">Red</span>: Slow (> 100ms)

## 2. Session Inspector
Instantly view everything stored in the user's session (keys, data, flash messages). This is the perfect tool for debugging authentication flows or shopping cart states.

## 3. Request Analysis
See the details of the current HTTP request:
- **Method & Path**: Immediately identify the active route.
- **Payload**: View URL parameters, Form data (Body), and sent Cookies.
- **Auto-Wrap**: Large JSON objects are automatically formatted with line breaks to prevent horizontal scrolling.

## 4. Reactive Inspector
This module monitors the "Live" activity of your page:
- **Asok Directives**: Inspect the local state of elements using reactive directives (`asok-state`).
- **Live Components (WebSockets)**: View the synchronized state of real-time components and their unique IDs.
- **Auto-Refresh**: States are refreshed every second to reflect dynamic changes.

## 5. Rendering Pipeline
Understand exactly how your page was assembled. This tab lists all templates and fragments (`Partial Blocks`) that contributed to the final response.

## 6. Configuration

By default, the toolbar is enabled whenever `DEBUG = True`. However, you can control it independently:

- **Via `.env` file**:
    ```env
    TOOLBAR=False  # Disables the toolbar even in DEBUG mode
    ```
- **Via code**:
    ```python
    app.config["TOOLBAR"] = True
    ```
- **Environment Variables**: `ASOK_TOOLBAR` or `TOOLBAR`.

## 7. Security & Injection
- **Zero Dependencies**: The toolbar uses pure Vanilla JS and CSS.
- **Intelligent Injection**: It is automatically injected before the `</body>` tag. It detects and respects your security `nonce` for Content Security Policy (CSP).
- **Production**: It is **completely removed** in production mode (`DEBUG = False`) to ensure maximum performance and total security.

## 8. Shortcuts & UI
- **Floating Trigger**: A discrete button at the bottom right allows you to open/close the console. It is optimized for legibility even on pure white backgrounds.
- **Keyboard Navigation**: Use `Tab` and `Enter` to navigate between tabs for maximum accessibility.

---
[← Previous: Data Tables](45-data-tables.md) | [Documentation](README.md) | [Next: Utilities →](47-utilities.md)
