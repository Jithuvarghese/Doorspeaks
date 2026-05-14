import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo, useState } from "react";
const API_BASE = "http://localhost:4000";
export function App() {
    const [query, setQuery] = useState("");
    const [landlords, setLandlords] = useState([]);
    const [searchStatus, setSearchStatus] = useState("Search for a landlord by name or locality.");
    const [rent, setRent] = useState("");
    const [demand, setDemand] = useState("");
    const [depositResult, setDepositResult] = useState(null);
    const [rights, setRights] = useState([]);
    const [rightsLoaded, setRightsLoaded] = useState(false);
    const [reviewBody, setReviewBody] = useState("");
    const [reviewStatus, setReviewStatus] = useState("Write at least 100 characters and submit for moderation.");
    const reviewLength = useMemo(() => reviewBody.trim().length, [reviewBody]);
    async function handleLandlordSearch(event) {
        event.preventDefault();
        setSearchStatus("Searching...");
        const response = await fetch(`${API_BASE}/api/landlords?q=${encodeURIComponent(query)}`);
        const data = (await response.json());
        setLandlords(data.results);
        setSearchStatus(`${data.results.length} profile(s) found.`);
    }
    async function handleDepositCheck(event) {
        event.preventDefault();
        const payload = {
            monthlyRent: Number(rent),
            landlordDemand: demand ? Number(demand) : undefined
        };
        const response = await fetch(`${API_BASE}/api/deposit-check`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        const data = (await response.json());
        setDepositResult(data);
    }
    async function handleLoadRights() {
        const response = await fetch(`${API_BASE}/api/rights`);
        const data = (await response.json());
        setRights(data.guides);
        setRightsLoaded(true);
    }
    async function handleReviewSubmit(event) {
        event.preventDefault();
        const payload = {
            landlordId: "ll-001",
            reviewerType: "IT_PROFESSIONAL",
            locality: "Bengaluru",
            bhk: "2BHK",
            body: reviewBody,
            depositReturned: "PARTIAL",
            ratings: {
                fairness: 2,
                communication: 3,
                maintenance: 3,
                depositHandling: 1,
                privacy: 2
            },
            tags: ["Deposit demanded", "Surprise visits"]
        };
        const response = await fetch(`${API_BASE}/api/reviews`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        const data = await response.json();
        if (!response.ok) {
            setReviewStatus(`Submission failed: ${data.message ?? "Invalid data"}`);
            return;
        }
        setReviewStatus(`Submitted successfully. Review ID: ${data.reviewId}`);
        setReviewBody("");
    }
    return (_jsxs("main", { className: "page", children: [_jsxs("section", { className: "hero", children: [_jsx("h1", { children: "DoorSpeaks" }), _jsx("p", { children: "Know before you sign. Tenant-first rental transparency for Bangalore." }), _jsx("span", { className: "badge", children: "Phase 2 MVP scaffold" })] }), _jsxs("section", { className: "grid", "aria-label": "MVP modules", children: [_jsxs("article", { className: "card", children: [_jsx("h2", { children: "Landlord Search" }), _jsx("p", { children: "Find landlord profiles with community ratings." }), _jsxs("form", { onSubmit: handleLandlordSearch, children: [_jsx("label", { htmlFor: "query", children: "Landlord or locality" }), _jsx("input", { id: "query", value: query, onChange: (e) => setQuery(e.target.value), placeholder: "Example: HSR" }), _jsx("div", { style: { height: "0.6rem" } }), _jsx("button", { type: "submit", children: "Search" })] }), _jsx("p", { className: "mono", children: searchStatus }), _jsx("div", { className: "list", children: landlords.map((item) => (_jsxs("div", { className: "list-item", children: [_jsx("strong", { children: item.name }), _jsx("div", { children: item.locality }), _jsxs("small", { children: ["Rating ", item.avgRating, " / 5 from ", item.reviewCount, " review(s)"] })] }, item.id))) })] }), _jsxs("article", { className: "card", children: [_jsx("h2", { children: "Deposit Checker" }), _jsx("p", { children: "Instantly compare asked deposit against Karnataka legal cap." }), _jsxs("form", { onSubmit: handleDepositCheck, children: [_jsxs("div", { className: "form-grid", children: [_jsxs("div", { children: [_jsx("label", { htmlFor: "rent", children: "Monthly rent (INR)" }), _jsx("input", { id: "rent", type: "number", min: 1, value: rent, onChange: (e) => setRent(e.target.value), required: true })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "demand", children: "Landlord demand (optional)" }), _jsx("input", { id: "demand", type: "number", min: 0, value: demand, onChange: (e) => setDemand(e.target.value) })] })] }), _jsx("div", { style: { height: "0.6rem" } }), _jsx("button", { type: "submit", children: "Check legality" })] }), depositResult ? (_jsxs("div", { style: { marginTop: "0.8rem" }, children: [_jsxs("div", { className: depositResult.overLimit ? "alert bad" : "alert good", children: ["Legal max: INR ", depositResult.legalMax.toLocaleString(), " | Asked: INR ", depositResult.landlordDemand.toLocaleString()] }), _jsx("p", { className: "mono", children: depositResult.legalReference }), _jsx("p", { children: depositResult.nextStepTemplate })] })) : null] }), _jsxs("article", { className: "card", children: [_jsx("h2", { children: "Review Submission" }), _jsx("p", { children: "Draft a verified tenancy review for moderation." }), _jsxs("form", { onSubmit: handleReviewSubmit, children: [_jsx("label", { htmlFor: "review", children: "Review text" }), _jsx("textarea", { id: "review", value: reviewBody, onChange: (e) => setReviewBody(e.target.value), placeholder: "Describe communication, maintenance, and deposit behavior in detail...", required: true }), _jsxs("small", { className: "mono", children: [reviewLength, " / 100 minimum characters"] }), _jsx("div", { style: { height: "0.6rem" } }), _jsx("button", { type: "submit", disabled: reviewLength < 100, children: "Submit review" })] }), _jsx("p", { children: reviewStatus })] }), _jsxs("article", { className: "card", children: [_jsx("h2", { children: "Tenant Rights Hub" }), _jsx("p", { children: "Plain-language legal guidance in English, Kannada, and Hindi." }), _jsx("button", { type: "button", onClick: handleLoadRights, children: rightsLoaded ? "Refresh guides" : "Load rights guides" }), _jsx("div", { className: "list", style: { marginTop: "0.7rem" }, children: rights.map((guide) => (_jsxs("div", { className: "list-item", children: [_jsx("strong", { children: guide.title }), _jsx("p", { children: guide.summary }), _jsxs("small", { children: ["Languages: ", guide.language.join(", ")] })] }, guide.id))) })] })] })] }));
}
