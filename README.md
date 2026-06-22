# CM Macro-Governance Dashboard: System Overview & Architecture

**Context:** The JanaNayagam Chief Minister (CM) Dashboard is a high-level, macro-governance command center designed for state-level executives. It specifically avoids individual ticket-level details and financial metrics (budgets/costs/funds), focusing entirely on aggregate intelligence, resolution efficiency, and systemic bottlenecks.

---

## 1. Core Architecture & Navigation
The dashboard uses a secure, minimal Sidebar navigation menu consisting of four primary command modules:
*   **State Command:** The main KPI and heatmap overview.
*   **Grievances (Constituencies):** A full 234 Assembly Constituency data grid.
*   **Cabinet Rankings:** Departmental performance summaries for the state cabinet.
*   **CM Announcements:** A broadcast tool to communicate directly with citizens.

---

## 2. Module 1: State Command (Macro Dashboard)
This module provides a bird's-eye view of state performance using top-down filtering.

*   **Dynamic Breadcrumb Scope:** Allows the CM to drill down the data context (`Statewide` → `Department` → `District`) by clicking interactive elements.
*   **KPI Summary Cards (Top Row):**
    *   **Total Grievances:** Aggregate volume of issues.
    *   **Resolution Rate:** Percentage of issues fully resolved.
    *   **Avg. Resolution Time:** Real-time calculation of response speed (e.g., "48 hrs").
    *   **Total Pending:** The raw backlog count.
    *   **Aging:** The number of long-unresolved, critical issues.
*   **District Performance League (Middle):** A sorted ranking list of all districts based on their *Unresolved Load* (highest pending volume at the top). It includes a visual progress bar comparing resolution rates to pending rates.
*   **Pending Intensity Heatmap (Bottom):** A dense cross-matrix with Departments on the Y-axis and Districts on the X-axis. Cells are color-coded (from light orange to dark red) indicating the severity of the pending backlog, allowing instant identification of failing regions or departments.

---

## 3. Module 2: Grievances (Constituency Matrix)
A highly structured, exhaustive 234-row grid mapping grievances across every single Assembly Constituency in Tamil Nadu.

*   **Zero-Exclusion Principle:** Constituencies with no recorded grievances explicitly display `0` rather than being hidden.
*   **Global Controls:** Features a "District Filter" dropdown and a "Search Matrix" input to quickly locate specific constituencies.
*   **Dynamic Data Table:** Sortable columns for AC Number, Constituency Name, District, Total, Pending (Red), Resolved (Green), and Resolution % (with an inline visual progress bar).
*   **Departmental Drill-Down:** Clicking any constituency row gracefully expands a sub-panel showing the exact departmental breakdown (e.g., Electricity: 12 Pending, Sanitation: 4 Pending) strictly at the aggregate level.

---

## 4. Module 3: Cabinet Rankings
A performance evaluation tool designed to generate automated efficiency reports for cabinet ministers.

*   **Algorithmic Ranking:** Automatically audits all departments based on their civic grievance resolution rates.
*   **Report Generation:** Generates a clean, text-based audit report identifying the Minister-in-Charge, their department, and their respective resolution percentage. 
*   **Purpose:** Intended to be exported for cabinet meetings to hold department heads accountable for civic delays.

---

## 5. Module 4: CM Announcements Broadcast
A direct communication pipeline from the CM's office to the public.

*   **Targeted Scoping:** Allows the CM to broadcast a message to the entire state (`Statewide`) or restrict it to citizens of a specific `District`.
*   **Instant Dispatch:** Upon submission, the announcement is dispatched to the system.
*   **Citizen Integration:** Any citizen logging into the `Citizen Dashboard` immediately receives the CM's broadcast as a dismissible, high-priority blue alert banner at the top of their screen, complete with the timestamp and "CM Office Broadcast" insignia.

---

## Key Design Principles Implemented:
1.  **No Ticket Details:** It is impossible to read an individual citizen's complaint from this dashboard. It is strictly for macro-intelligence.
2.  **No Financials:** No rupees, budgets, or costs are displayed. The currency of this dashboard is "Resolution Speed" and "Pending Backlogs".
3.  **High-Signal Aesthetics:** Built using `lucide-react` icons, `framer-motion` transitions, and a clean, high-contrast Tailwind color palette (reds for alerts, emeralds for success) to immediately draw executive attention to failures.
